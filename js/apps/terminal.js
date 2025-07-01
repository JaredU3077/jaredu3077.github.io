/**
 * @file Handles terminal functionality, command parsing, and execution.
 * @author Jared U.
 */

import { ContentParser } from '../utils/parser.js';
import { AppError, ErrorTypes, performanceMonitor, eventEmitter } from '../utils/utils.js';
import { CONFIG } from '../config.js';

/**
 * Represents the terminal interface, handling user input, command execution, and output.
 * @class Terminal
 */
export class Terminal {
    /**
     * Creates an instance of Terminal.
     * @param {HTMLInputElement} inputElement - The input element for user commands.
     * @param {HTMLElement} outputElement - The element to display terminal output.
     * @memberof Terminal
     */
    constructor(inputElement, outputElement) {
        if (!inputElement || !outputElement) {
            throw new AppError('Input and output elements are required', ErrorTypes.VALIDATION);
        }
        inputElement.setAttribute('aria-label', 'Terminal input');
        outputElement.setAttribute('aria-label', 'Terminal output');

        this.inputElement = inputElement;
        this.outputElement = outputElement;
        this.commands = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.currentInput = '';
        this.isProcessing = false;
        this.commandQueue = [];
        this.maxHistorySize = 1000;
        this.maxOutputLength = 10000;
        
        this.initializeCommands();
        this.setupEventListeners();
        this.loadHistory();
        
        // Focus the input element after a brief delay to override autofocus blocking
        setTimeout(() => {
            this.inputElement.focus();
        }, 100);
        
        // Track performance metrics
        this.performanceMetrics = new Map();
    }

    /**
     * Sets up event listeners for the terminal input.
     * @private
     * @memberof Terminal
     */
    setupEventListeners() {
        // Use passive event listeners for better performance
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.inputElement.addEventListener('input', this.handleInput.bind(this), { passive: true });
        
        // Handle window resize for terminal resizing
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    }

    /**
     * Handles keydown events in the terminal input.
     * Manages command execution, history navigation, and tab completion.
     * @param {KeyboardEvent} e - The keyboard event.
     * @private
     * @memberof Terminal
     */
    handleKeyDown(e) {
        performanceMonitor.startMeasure('terminalKeyDown');
        
        try {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.executeCommand();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateHistory('up');
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory('down');
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this.handleTabCompletion();
            } else if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.clear();
            }
        } finally {
            performanceMonitor.endMeasure('terminalKeyDown');
        }
    }

    /**
     * Updates the current input value when the user types.
     * @private
     * @memberof Terminal
     */
    handleInput() {
        this.currentInput = this.inputElement.value;
    }

    /**
     * Adjusts the terminal's output height on window resize.
     * @private
     * @memberof Terminal
     */
    handleResize() {
        // With flex layout, terminal automatically adjusts to container size
        // Force scroll position recalculation if needed
        this.scrollToBottom();
    }

    /**
     * Navigates through the command history.
     * @param {'up' | 'down'} direction - The direction to navigate.
     * @private
     * @memberof Terminal
     */
    navigateHistory(direction) {
        if (this.history.length === 0) return;

        performanceMonitor.startMeasure('historyNavigation');
        
        try {
            if (direction === 'up') {
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                }
            } else {
                if (this.historyIndex > -1) {
                    this.historyIndex--;
                }
            }

            if (this.historyIndex === -1) {
                this.inputElement.value = this.currentInput;
            } else {
                this.inputElement.value = this.history[this.history.length - 1 - this.historyIndex];
            }
        } finally {
            performanceMonitor.endMeasure('historyNavigation');
        }
    }

    /**
     * Handles tab completion for commands.
     * @private
     * @memberof Terminal
     */
    handleTabCompletion() {
        performanceMonitor.startMeasure('tabCompletion');
        
        try {
            const input = this.inputElement.value.trim();
            if (!input) return;

            const matchingCommands = Array.from(this.commands.keys())
                .filter(cmd => cmd.startsWith(input));

            if (matchingCommands.length === 1) {
                this.inputElement.value = matchingCommands[0] + ' ';
            } else if (matchingCommands.length > 1) {
                this.writeOutput('Possible completions:\n' + matchingCommands.join('\n'));
            }
        } finally {
            performanceMonitor.endMeasure('tabCompletion');
        }
    }

    /**
     * Executes the command currently in the input field.
     * @returns {Promise<void>}
     * @memberof Terminal
     */
    async executeCommand() {
        if (this.isProcessing) {
            this.commandQueue.push(this.inputElement.value);
            return;
        }

        this.isProcessing = true;
        performanceMonitor.startMeasure('commandExecution');

        try {
            const command = this.inputElement.value.trim();
            if (!command) {
                this.isProcessing = false;
                return;
            }

            // Add command to history
            this.addToHistory(command);

            // Display command in output
            this.displayCommand(command);

            // Execute command with input validation
            const [cmd, ...args] = command.split(' ').filter(arg => arg.length > 0);
            
            if (!cmd) {
                this.isProcessing = false;
                return;
            }

            // Sanitize command input
            const sanitizedCmd = cmd.toLowerCase().replace(/[^a-z0-9-]/g, '');
            
            if (this.commands.has(sanitizedCmd)) {
                try {
                    const result = await this.commands.get(sanitizedCmd)(args);
                    await this.handleCommandResult(result, command);
                } catch (error) {
                    this.handleCommandError(error);
                }
            } else {
                this.handleCommandError(new AppError(`Command not found: ${cmd}`, ErrorTypes.VALIDATION));
            }

        } catch (error) {
            this.handleCommandError(error);
        } finally {
            this.isProcessing = false;
            performanceMonitor.endMeasure('commandExecution');
            
            // Process queued commands
            if (this.commandQueue.length > 0) {
                const nextCommand = this.commandQueue.shift();
                this.inputElement.value = nextCommand;
                setTimeout(() => this.executeCommand(), 100);
            }
        }
    }

    /**
     * Displays the command prompt and command in the terminal output.
     * @param {string} command - The command to display.
     * @private
     * @memberof Terminal
     */
    displayCommand(command) {
        const commandElement = document.createElement('div');
        commandElement.className = 'terminal-command';
        commandElement.innerHTML = `<span class="prompt">$</span> ${command}`;
        this.outputElement.appendChild(commandElement);
        this.clearInput();
    }

    /**
     * Handles the result of a command execution, displaying it in the output.
     * @param {string | Promise<string>} result - The result of the command.
     * @param {string} command - The original command executed.
     * @private
     * @memberof Terminal
     */
    async handleCommandResult(result, command = '') {
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-result';
        
        let output;
        if (result instanceof Promise) {
            try {
                output = await result;
                this.formatOutput(output, resultElement);
            } catch (error) {
                this.handleCommandError(error);
                return;
            }
        } else {
            output = result;
            this.formatOutput(result, resultElement);
        }
        
        this.outputElement.appendChild(resultElement);
        
        // Scrolling behavior is now automatically handled by WindowManager
        // It will detect document content and scroll to top, or scroll to bottom for regular commands
    }

    /**
     * Handles errors that occur during command execution.
     * @param {Error} error - The error object.
     * @private
     * @memberof Terminal
     */
    handleCommandError(error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'terminal-error';
        errorElement.textContent = `Error: ${error.message}`;
        this.outputElement.appendChild(errorElement);
        // Auto-scroll is now handled by the WindowManager
        
        // Emit error event
        eventEmitter.emit('terminalError', { error });
    }

    /**
     * Formats and styles the output before displaying it.
     * @param {string | Array | object} output - The content to format.
     * @param {HTMLElement} element - The element to display the output in.
     * @private
     * @memberof Terminal
     */
    formatOutput(output, element) {
        if (typeof output === 'string') {
            if (/<\w+/.test(output)) {
                element.innerHTML = output;
            } else {
                element.textContent = output;
            }
        } else if (Array.isArray(output)) {
            element.textContent = output.join('\n');
        } else if (typeof output === 'object') {
            element.textContent = JSON.stringify(output, null, 2);
        } else {
            element.textContent = String(output);
        }
    }

    /**
     * Adds a command to the history.
     * @param {string} command - The command to add.
     * @private
     * @memberof Terminal
     */
    addToHistory(command) {
        this.history.push(command);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        this.historyIndex = -1;
        this.saveHistory();
    }

    /**
     * Loads command history from local storage.
     * @private
     * @memberof Terminal
     */
    loadHistory() {
        try {
            const savedHistory = localStorage.getItem('terminalHistory');
            if (savedHistory) {
                this.history = JSON.parse(savedHistory);
            }
        } catch (error) {
            console.error('Failed to load terminal history:', error);
        }
    }

    /**
     * Saves the command history to local storage.
     * @private
     * @memberof Terminal
     */
    saveHistory() {
        try {
            localStorage.setItem('terminalHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save terminal history:', error);
        }
    }

    /**
     * Writes content directly to the terminal output.
     * @param {string} content - The HTML content to write.
     * @memberof Terminal
     */
    writeOutput(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.outputElement.appendChild(div);
        // Auto-scroll is now handled by the WindowManager
        
        // Trim output if it gets too long
        this.trimOutput();
    }

    trimOutput() {
        while (this.outputElement.textContent.length > this.maxOutputLength) {
            this.outputElement.removeChild(this.outputElement.firstChild);
        }
    }

    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    scrollToTop() {
        this.outputElement.scrollTop = 0;
    }

    /**
     * Determines if content should be treated as a document (scroll to top)
     * @param {string} command - The command that was executed
     * @param {string} output - The output content
     * @returns {boolean} True if this is document content
     * @private
     * @memberof Terminal
     */
    isDocumentContent(command, output) {
        // Check if it's a show resume/jared command
        if (command.includes('show resume') || command.includes('show jared')) {
            return true;
        }
        
        // Check if output contains resume-like content (has terminal styling classes)
        if (typeof output === 'string' && output.includes('terminal-heading')) {
            return true;
        }
        
        return false;
    }

    /**
     * Clears the terminal output.
     * @returns {string} An empty string to signify success.
     * @memberof Terminal
     */
    clear() {
        this.outputElement.innerHTML = '';
        return '';
    }

    clearInput() {
        this.inputElement.value = '';
        this.currentInput = '';
    }

    reload() {
        // Future: implement terminal state restoration
    }

    /**
     * Initializes the available terminal commands.
     * @private
     * @memberof Terminal
     */
    initializeCommands() {
        this.commands.set('help', this.showHelp.bind(this));
        this.commands.set('ping', this.handlePing.bind(this));
        this.commands.set('show', this.handleShow.bind(this));
        this.commands.set('clear', this.clear.bind(this));
        this.commands.set('ifconfig', () => CONFIG.COMMANDS.IFCONFIG);
        this.commands.set('netstat', () => CONFIG.COMMANDS.NETSTAT);
        this.commands.set('tracert', this.handleTracert.bind(this));
        this.commands.set('traceroute', this.handleTracert.bind(this));
        this.commands.set('nslookup', this.handleNslookup.bind(this));
        this.commands.set('dig', this.handleNslookup.bind(this));
        this.commands.set('arp', () => this.handleArp());
        this.commands.set('route', () => this.handleRoute());
        this.commands.set('ls', () => 'resume.txt  codex.txt  network-configs/  scripts/');
        this.commands.set('pwd', () => '/home/jared');
        this.commands.set('whoami', () => 'jared - Senior Network Engineer');
        this.commands.set('date', () => new Date().toString());
        this.commands.set('uptime', () => 'System uptime: 15+ years in networking');
        
        // Background control commands
        this.commands.set('bg', this.handleBackground.bind(this));
        this.commands.set('particles', this.handleParticles.bind(this));
        this.commands.set('fx', this.handleEffects.bind(this));
    }

    /**
     * Handles the 'ping' command.
     * @param {string[]} args - The arguments for the command.
     * @returns {Promise<string>} The result of the ping.
     * @private
     * @memberof Terminal
     */
    async handlePing(args) {
        const host = args[0] || 'localhost';
        let pings = 0;
        this.writeOutput(`Pinging ${host}...`);

        return new Promise(resolve => {
            const interval = setInterval(() => {
                if (pings >= 4) {
                    clearInterval(interval);
                    resolve(`Ping complete.`);
                    return;
                }
                const time = Math.round(Math.random() * 100);
                this.writeOutput(`Reply from ${host}: time=${time}ms`);
                pings++;
            }, 1000);
        });
    }

    /**
     * Loads and displays the resume content.
     * @returns {Promise<string>} The resume content or a fallback message.
     * @memberof Terminal
     */
    async showResume() {
        try {
            const response = await fetch(CONFIG.PATHS.RESUME);
            if (!response.ok) {
                console.warn('Resume file not found, showing fallback content');
                return this.getFallbackResume();
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching resume:', error);
            return this.getFallbackResume();
        }
    }

    /**
     * Returns fallback resume content when the file is not available
     * @returns {string} Fallback resume content
     */
    getFallbackResume() {
        return `
JARED U. - SENIOR NETWORK ENGINEER
========================================

📧 Contact: Available on request
🌐 Portfolio: https://jaredu3077.github.io
💼 LinkedIn: https://linkedin.com/in/jaredu

PROFESSIONAL SUMMARY
====================
Senior Network Engineer with 15+ years of experience in enterprise network 
infrastructure, security, and automation. Proven track record in designing, 
implementing, and maintaining large-scale network environments.

CORE COMPETENCIES
=================
• Network Architecture & Design    • Python & Ansible Automation
• Cisco & Arista Technologies      • Network Security (PCI/HIPAA)
• BGP, OSPF, VLAN Management      • Cloud Networking (AWS/Azure)
• SolarWinds & Network Monitoring  • Disaster Recovery Planning
• Project Management & Leadership  • Documentation & Process Improvement

KEY ACHIEVEMENTS
================
• Led $2.3M network modernization project with 300% performance improvement
• Designed and implemented next-gen security infrastructure (99.8% threat detection)
• Built automation platform reducing manual tasks by 80%
• Achieved 99.99% network uptime across multiple facilities

RECENT EXPERIENCE
=================
Current: Senior Network Engineer - Denali Advanced Integration
• Architecting hybrid cloud connectivity for space-to-ground communications
• Multi-cloud network design (AWS/Azure) with <50ms latency requirements

Previous: Senior Network Engineer - Sound Transit (2022-2023)
• Developed comprehensive network automation platform
• Implemented GitLab CI/CD pipeline for network change management

Previous: Senior Network Engineer - ArenaNet (2019-2022)
• Complete network infrastructure modernization using Arista leaf-spine
• Zero-downtime migration of 500+ network endpoints

CERTIFICATIONS & EDUCATION
===========================
• Cisco Certified Network Associate (CCNA)
• CompTIA Security+
• Ongoing: Python & Ansible Automation Training

Type 'show experience' for detailed work history
Type 'show skills' for technical capabilities
Type 'show certifications' for complete certification list
        `.trim();
    }

    /**
     * Handles the 'show' command and its sub-commands.
     * @param {string[]} args - The arguments for the command.
     * @returns {string | Promise<string>} The result of the command.
     * @private
     * @memberof Terminal
     */
    handleShow(args) {
        const target = args[0];
        if (target === 'resume' || target === 'jared') {
            return this.showResume();
        } else if (target === 'experience') {
            return this.showExperience();
        } else if (target === 'skills') {
            return this.showSkills();
        } else if (target === 'certifications') {
            return this.showCertifications();
        }
        return `Error: Unknown 'show' command target: ${target}. Try 'show resume', 'show experience', 'show skills', or 'show certifications'.`;
    }

    showExperience() {
        return `<div class="terminal-section">
<div class="terminal-subheading">Professional Experience Summary</div>
<div class="terminal-detail">
🏢 <strong>Current:</strong> Senior Network Engineer @ Denali Advanced Integrations<br>
&nbsp;&nbsp;&nbsp;• Space-to-ground communications infrastructure<br>
&nbsp;&nbsp;&nbsp;• Mission-critical network deployments<br>
&nbsp;&nbsp;&nbsp;• Network segmentation for scientific environments<br><br>

🏢 <strong>Previous:</strong> Senior Technology Consultant @ Riverstrong<br>
&nbsp;&nbsp;&nbsp;• Cisco Meraki and Fortinet deployments<br>
&nbsp;&nbsp;&nbsp;• SMB infrastructure modernization<br><br>

🏢 <strong>Previous:</strong> Senior Network Engineer @ Sound Transit<br>
&nbsp;&nbsp;&nbsp;• SolarWinds infrastructure modernization<br>
&nbsp;&nbsp;&nbsp;• PCI compliance and security auditing<br>
&nbsp;&nbsp;&nbsp;• Statewide retail POS system refresh<br><br>

🏢 <strong>Previous:</strong> Senior Network Engineer @ ArenaNet<br>
&nbsp;&nbsp;&nbsp;• Arista leaf-spine architecture implementation<br>
&nbsp;&nbsp;&nbsp;• Palo Alto NGFW deployment<br>
&nbsp;&nbsp;&nbsp;• Team mentorship and technical leadership<br><br>

Use 'show resume' for complete details.
</div>
</div>`;
    }

    showSkills() {
        return `<div class="terminal-section">
<div class="terminal-subheading">Technical Skills</div>
<div class="terminal-detail">
🌐 <strong>Networking:</strong> Cisco, Arista, Juniper, Brocade, Meraki<br>
🔐 <strong>Security:</strong> Palo Alto, Fortinet, VPN, NGFW, Network Segmentation<br>
☁️ <strong>Cloud:</strong> AWS, Azure, VMware, Hyper-V<br>
📊 <strong>Monitoring:</strong> SolarWinds, Splunk, Grafana, Wireshark, NetFlow<br>
🤖 <strong>Automation:</strong> Python, Ansible, bash, PowerShell, IaC<br>
📋 <strong>Management:</strong> Project Management, Vendor Relations, Change Management<br>
🔧 <strong>Protocols:</strong> IPv4/IPv6, BGP, OSPF, EIGRP, MPLS, VLANs<br>
📡 <strong>Wireless:</strong> Enterprise Wi-Fi, Arista Cloud Vision, RF Planning
</div>
</div>`;
    }

    showCertifications() {
        return `<div class="terminal-section">
<div class="terminal-subheading">Professional Certifications</div>
<div class="terminal-detail">
✅ <strong>Cisco CCNA</strong> (Active)<br>
&nbsp;&nbsp;&nbsp;Certificate ID: e789b6372c2b4632ac9d485919e3e863<br><br>

✅ <strong>CompTIA Security+</strong> (Active)<br>
&nbsp;&nbsp;&nbsp;Information Security Fundamentals<br><br>

✅ <strong>CompTIA A+</strong> (Active)<br>
&nbsp;&nbsp;&nbsp;Hardware and Software Troubleshooting<br><br>

📚 <strong>Currently Studying:</strong><br>
&nbsp;&nbsp;&nbsp;• NEBIUS AI LLM 12 week course<br>
&nbsp;&nbsp;&nbsp;• Nvidia Cumulus Linux AI Networking<br>
&nbsp;&nbsp;&nbsp;• Advanced Python for Network Automation
</div>
</div>`;
    }

    handleTracert(args) {
        const target = args && args.length > 0 ? args[0] : '8.8.8.8';
        return `Tracing route to ${target}:

1    <1 ms    <1 ms    <1 ms  192.168.1.1
2    15 ms    12 ms    14 ms  10.0.0.1
3    25 ms    23 ms    26 ms  isp-gateway.net [203.0.113.1]
4    35 ms    33 ms    37 ms  backbone-1.net [198.51.100.1]
5    45 ms    43 ms    47 ms  ${target}

Trace complete.`;
    }

    handleNslookup(args) {
        const domain = args && args.length > 0 ? args[0] : 'example.com';
        return `Server:  192.168.1.1
Address: 192.168.1.1#53

Non-authoritative answer:
Name:    ${domain}
Address: 93.184.216.34
Address: 2606:2800:220:1:248:1893:25c8:1946`;
    }

    handleArp() {
        return `ARP Table:

Internet Address      Physical Address      Type
192.168.1.1          00-50-56-c0-00-01     dynamic
192.168.1.10         00-0c-29-a1-b2-c3     dynamic  
192.168.1.20         00-1b-21-d4-e5-f6     dynamic
192.168.1.100        08-00-27-4e-66-a1     dynamic`;
    }

    handleRoute() {
        return CONFIG.COMMANDS.ROUTE;
    }

    // Background control commands
    handleBackground(args) {
        const bootSystem = window.bootSystemInstance;
        if (!bootSystem) {
            return 'Error: Background system not available';
        }

        const action = args[0];
        switch(action) {
            case 'pause':
                bootSystem.toggleParticleAnimation();
                return 'Background animation paused/resumed';
            case 'rotate':
                bootSystem.rotateBackground();
                return 'Background rotated 90 degrees';
            case 'help':
                return `Background Control Commands:
bg pause    - Toggle animation pause/play
bg rotate   - Rotate background elements
bg help     - Show this help

Use 'particles' and 'fx' commands for more controls`;
            default:
                return 'Usage: bg [pause|rotate|help]';
        }
    }

    handleParticles(args) {
        const bootSystem = window.bootSystemInstance;
        if (!bootSystem) {
            return 'Error: Particle system not available';
        }

        const action = args[0];
        const value = args[1];
        
        switch(action) {
            case 'add':
                const count = parseInt(value) || 25;
                for (let i = 0; i < count / 25; i++) {
                    bootSystem.increaseParticles();
                }
                return `Added ~${count} particles to background`;
            case 'remove':
                const removeCount = parseInt(value) || 25;
                for (let i = 0; i < removeCount / 25; i++) {
                    bootSystem.decreaseParticles();
                }
                return `Removed ~${removeCount} particles from background`;
            case 'color':
                bootSystem.changeParticleColors();
                return 'Particle colors changed';
            case 'count':
                return `Current particle count: ${bootSystem.particleCount}`;
            case 'help':
                return `Particle Control Commands:
particles add [count]     - Add particles (default: 25)
particles remove [count]  - Remove particles (default: 25)
particles color          - Change particle colors
particles count          - Show current particle count
particles help           - Show this help`;
            default:
                return 'Usage: particles [add|remove|color|count|help] [value]';
        }
    }

    handleEffects(args) {
        const action = args[0];
        
        switch(action) {
            case 'status':
                return `Effects Status:
Audio: ${window.bootSystemInstance?.audioEnabled ? 'ON' : 'OFF'}
Particles: ${document.querySelectorAll('.blue-particle').length} active
Animation: ${document.querySelector('.blue-particle')?.style.animationPlayState !== 'paused' ? 'RUNNING' : 'PAUSED'}

Keyboard Shortcuts:
SPACE - Toggle animations
R - Rotate background
+/- - Add/remove particles
C - Change colors`;
            case 'toggle':
                if (window.bootSystemInstance) {
                    window.bootSystemInstance.toggleParticleAnimation();
                    return 'Effects animation toggled';
                }
                return 'Error: Effects system not available';
            case 'reset':
                // Reset to default state
                if (window.bootSystemInstance) {
                    window.bootSystemInstance.particleCount = 150;
                    window.bootSystemInstance.currentParticleColor = 0;
                    document.querySelectorAll('.blue-particle').forEach(p => p.remove());
                    window.bootSystemInstance.generateParticles();
                    return 'Effects reset to default state';
                }
                return 'Error: Effects system not available';
            case 'help':
                return `Effects Control Commands:
fx status    - Show current effects status
fx toggle    - Toggle all animations
fx reset     - Reset to default state
fx help      - Show this help

Tip: Use keyboard shortcuts for quick control!`;
            default:
                return 'Usage: fx [status|toggle|reset|help]';
        }
    }

    /**
     * Displays a list of available commands.
     * @returns {string} The help text.
     * @memberof Terminal
     */
    showHelp() {
        return CONFIG.COMMANDS.HELP;
    }
}
