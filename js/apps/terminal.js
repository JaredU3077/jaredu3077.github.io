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
        
        // Application launch commands
        this.commands.set('launch', this.handleLaunch.bind(this));
        this.commands.set('open', this.handleLaunch.bind(this));
        this.commands.set('start', this.handleLaunch.bind(this));
        
        // Navigation and control commands
        this.commands.set('apps', this.listApps.bind(this));
        this.commands.set('windows', this.listWindows.bind(this));
        this.commands.set('close', this.handleClose.bind(this));
        this.commands.set('focus', this.handleFocus.bind(this));
        this.commands.set('desktop', this.handleDesktop.bind(this));
        
        // Application control commands
        this.commands.set('network', this.handleNetworkControl.bind(this));
        this.commands.set('devices', this.handleDeviceControl.bind(this));
        this.commands.set('status', this.handleStatusControl.bind(this));
        this.commands.set('skills', this.handleSkillsControl.bind(this));
        this.commands.set('projects', this.handleProjectsControl.bind(this));
        
        // System and graphics control
        this.commands.set('system', this.handleSystemControl.bind(this));
        this.commands.set('theme', this.handleThemeControl.bind(this));
        this.commands.set('audio', this.handleAudioControl.bind(this));
        this.commands.set('performance', this.handlePerformanceControl.bind(this));
        this.commands.set('particles', this.handleParticles.bind(this));
        this.commands.set('effects', this.handleEffects.bind(this));
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
        if (!args || args.length === 0) {
            return 'Usage: show [resume|experience|skills|certifications|demoscene]';
        }

        const section = args[0].toLowerCase();
        switch (section) {
            case 'resume':
                return this.showResume();
            case 'experience':
                return this.showExperience();
            case 'skills':
                return this.showSkills();
            case 'certifications':
                return this.showCertifications();
            case 'demoscene':
                return this.showDemoscene();
            default:
                return `Unknown section: ${section}. Available: resume, experience, skills, certifications, demoscene`;
        }
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
        
        console.log('Particle command called:', args);
        console.log('Boot system particle container:', bootSystem.particleContainer);
        console.log('Particles array length:', bootSystem.particles.length);

        const subcommand = args[0] || 'status';
        
        switch (subcommand) {
            case 'status':
                const particleCount = bootSystem.particles ? bootSystem.particles.length : 0;
                const rate = bootSystem.particleGenerationRate || 1200;
                const isRunning = bootSystem.particleAnimationRunning;
                return `Particle System Status:
• Active Particles: ${particleCount}
• Generation Rate: ${rate}ms
• Animation: ${isRunning ? 'Running' : 'Stopped'}
• Mode: ${bootSystem.particleMode || 'normal'}

Commands: start, stop, test, reinit, burst, rain, calm, storm, clear, stats, colors, speed, dance, debug, visible, force, demo`;
            
            case 'start':
                bootSystem.particleAnimationRunning = true;
                bootSystem.startContinuousGeneration();
                return 'Particle generation started - You should see floating blue particles!';
            
            case 'stop':
                bootSystem.particleAnimationRunning = false;
                return 'Particle generation stopped';
            
            case 'test':
                // Create a single visible particle for testing
                if (bootSystem.particleContainer) {
                    // Create a static test particle first
                    const testParticle = document.createElement('div');
                    testParticle.className = 'blue-particle';
                    testParticle.style.position = 'fixed';
                    testParticle.style.left = '50%';
                    testParticle.style.top = '50%';
                    testParticle.style.transform = 'translate(-50%, -50%)';
                    testParticle.style.animation = 'none';
                    testParticle.style.zIndex = '1002';
                    testParticle.style.background = '#ff0000';
                    testParticle.style.boxShadow = '0 0 30px #ff0000';
                    testParticle.textContent = 'TEST';
                    testParticle.style.color = 'white';
                    testParticle.style.fontSize = '12px';
                    testParticle.style.fontWeight = 'bold';
                    testParticle.style.display = 'flex';
                    testParticle.style.alignItems = 'center';
                    testParticle.style.justifyContent = 'center';
                    testParticle.style.width = '60px';
                    testParticle.style.height = '60px';
                    testParticle.style.borderRadius = '50%';
                    
                    bootSystem.particleContainer.appendChild(testParticle);
                    
                    // Remove after 3 seconds
                    setTimeout(() => {
                        if (testParticle.parentNode) {
                            testParticle.remove();
                        }
                    }, 3000);
                    
                    // Also create multiple normal animated particles
                    for (let i = 0; i < 5; i++) {
                        setTimeout(() => {
                            bootSystem.createSingleParticle(bootSystem.particleContainer);
                        }, i * 200);
                    }
                    return 'Test particles created! Look for a red "TEST" dot in center and blue floating dots.';
                } else {
                    return 'Error: Particle container not available';
                }
            
            case 'reinit':
                // Force reinitialize the particle system
                bootSystem.reinitializeParticleSystem();
                return 'Particle system reinitialized! Try particles test now.';
            
            case 'burst':
                // Create a burst of particles
                bootSystem.createParticleBurst(15);
                return 'Particle burst initiated! 15 particles released';
            
            case 'rain':
                // Heavy particle rain mode
                bootSystem.setParticleMode('rain');
                return 'Particle rain mode activated - Heavy generation (300ms)';
            
            case 'calm':
                // Calm, peaceful mode
                bootSystem.setParticleMode('calm');
                return 'Calm particle mode activated - Peaceful generation (2000ms)';
            
            case 'storm':
                // Storm mode with rapid generation
                bootSystem.setParticleMode('storm');
                return 'Particle storm mode activated - Intense generation (150ms)';
            
            case 'clear':
                // Remove all particles
                bootSystem.clearAllParticles();
                return 'All particles cleared from screen';
            
            case 'stats':
                if (!bootSystem.particles) return 'No particle data available';
                
                const now = Date.now();
                const recent = bootSystem.particles.filter(p => p.createdAt && (now - p.createdAt) < 30000);
                const old = bootSystem.particles.filter(p => p.createdAt && (now - p.createdAt) >= 30000);
                
                return `Detailed Particle Statistics:
• Total Active: ${bootSystem.particles.length}
• Recent (30s): ${recent.length}
• Older: ${old.length}
• Memory Usage: ~${(bootSystem.particles.length * 0.5).toFixed(1)}KB
• Generation Rate: ${bootSystem.particleGenerationRate}ms
• Uptime: ${Math.floor((now - (bootSystem.startTime || now)) / 1000)}s`;
            
            case 'colors':
                // Trigger color change effect
                bootSystem.changeParticleColors();
                return 'Particle color change triggered!';
            
            case 'speed':
                const speed = args[1] || 'normal';
                switch (speed) {
                    case 'slow':
                        bootSystem.particleGenerationRate = 3000;
                        break;
                    case 'normal':
                        bootSystem.particleGenerationRate = 1200;
                        break;
                    case 'fast':
                        bootSystem.particleGenerationRate = 600;
                        break;
                    case 'turbo':
                        bootSystem.particleGenerationRate = 200;
                        break;
                    default:
                        return 'Usage: particles speed [slow|normal|fast|turbo]';
                }
                bootSystem.startContinuousGeneration();
                return `Particle speed set to ${speed} (${bootSystem.particleGenerationRate}ms)`;
            
            case 'dance':
                // Fun dance mode - particles with special effects
                bootSystem.setParticleMode('dance');
                for (let i = 0; i < 8; i++) {
                    setTimeout(() => {
                        bootSystem.createSingleParticle(bootSystem.particleContainer);
                        // Trigger color change every few particles
                        if (i % 3 === 0) {
                            setTimeout(() => bootSystem.changeParticleColors(), 500);
                        }
                    }, i * 200);
                }
                return 'Particle dance mode! 🎉 Enjoy the show!';
            
            case 'debug':
                // Debug particle system
                const container = document.getElementById('particleContainer');
                const visibleParticles = document.querySelectorAll('.blue-particle');
                const containerVisible = container && container.offsetParent !== null;
                const containerStyle = container ? window.getComputedStyle(container) : null;
                const particleStyle = visibleParticles.length > 0 ? window.getComputedStyle(visibleParticles[0]) : null;
                
                // Check if particles are actually in the DOM
                const particlesInDOM = Array.from(visibleParticles).map(p => ({
                    visible: p.offsetParent !== null,
                    opacity: window.getComputedStyle(p).opacity,
                    zIndex: window.getComputedStyle(p).zIndex,
                    animation: window.getComputedStyle(p).animation,
                    position: p.getBoundingClientRect()
                }));
                
                return `Particle Debug Info:
• Container exists: ${!!container}
• Container visible: ${containerVisible}
• Container z-index: ${containerStyle?.zIndex || 'N/A'}
• Container display: ${containerStyle?.display || 'N/A'}
• Visible particles: ${visibleParticles.length}
• Particle z-index: ${particleStyle?.zIndex || 'N/A'}
• Particle display: ${particleStyle?.display || 'N/A'}
• Particle opacity: ${particleStyle?.opacity || 'N/A'}
• Boot system ready: ${!!bootSystem}
• Particle array length: ${bootSystem.particles?.length || 0}
• Animation running: ${bootSystem.particleAnimationRunning}
• Generation rate: ${bootSystem.particleGenerationRate}ms
• Mode: ${bootSystem.particleMode || 'normal'}

Particles in DOM: ${particlesInDOM.length}
${particlesInDOM.map((p, i) => `  ${i+1}. visible:${p.visible} opacity:${p.opacity} z:${p.zIndex}`).join('\n')}`;
            
            case 'visible':
                // Create immediately visible test particles
                if (bootSystem && bootSystem.createVisibleTestParticles) {
                    bootSystem.createVisibleTestParticles();
                    return 'Created 5 green test particles! They should be visible immediately.';
                } else {
                    return 'Error: Boot system or createVisibleTestParticles method not available';
                }
            
            case 'force':
                // Force create particles with immediate visibility
                if (bootSystem && bootSystem.particleContainer) {
                    for (let i = 0; i < 8; i++) {
                        setTimeout(() => {
                            const particle = document.createElement('div');
                            particle.className = 'blue-particle';
                            particle.style.position = 'fixed';
                            particle.style.left = (10 + i * 10) + '%';
                            particle.style.top = (20 + i * 5) + '%';
                            particle.style.animation = 'none';
                            particle.style.zIndex = '1002';
                            particle.style.background = '#ff6600';
                            particle.style.boxShadow = '0 0 25px #ff6600';
                            particle.style.opacity = '1';
                            particle.style.display = 'block';
                            particle.style.width = '15px';
                            particle.style.height = '15px';
                            particle.style.borderRadius = '50%';
                            particle.style.border = '2px solid #ff6600';
                            
                            bootSystem.particleContainer.appendChild(particle);
                            
                            // Remove after 8 seconds
                            setTimeout(() => {
                                if (particle.parentNode) {
                                    particle.remove();
                                }
                            }, 8000);
                        }, i * 300);
                    }
                    return 'Created 8 orange force particles! They should be visible immediately and stay for 8 seconds.';
                } else {
                    return 'Error: Boot system or particle container not available';
                }
            
            case 'demo':
                // Demo all particle modes
                if (bootSystem) {
                    const modes = ['rain', 'storm', 'calm', 'dance'];
                    let currentMode = 0;
                    
                    const cycleMode = () => {
                        if (currentMode < modes.length) {
                            const mode = modes[currentMode];
                            bootSystem.setParticleMode(mode);
                            currentMode++;
                            
                            // Cycle to next mode after 4 seconds
                            setTimeout(cycleMode, 4000);
                        } else {
                            // Return to normal mode
                            bootSystem.setParticleMode('normal');
                        }
                    };
                    
                    cycleMode();
                    return 'Starting particle mode demo! Cycling through: rain → storm → calm → dance → normal (4 seconds each)';
                } else {
                    return 'Error: Boot system not available';
                }
            
            // Legacy commands for compatibility
            case 'add':
                const count = parseInt(args[1]) || 25;
                for (let i = 0; i < count / 25; i++) {
                    bootSystem.increaseParticles();
                }
                return `Added ~${count} particles to background`;
            case 'remove':
                const removeCount = parseInt(args[1]) || 25;
                for (let i = 0; i < removeCount / 25; i++) {
                    bootSystem.decreaseParticles();
                }
                return `Removed ~${removeCount} particles from background`;
            case 'color':
                bootSystem.changeParticleColors();
                return 'Particle colors changed';
            case 'count':
                return `Current particle count: ${bootSystem.particleCount || (bootSystem.particles ? bootSystem.particles.length : 0)}`;
            
            default:
                return `Unknown particle command: ${subcommand}
Available: status, start, stop, test, reinit, burst, rain, calm, storm, clear, stats, colors, speed, dance, debug, visible, force, demo, add, remove, color, count`;
        }
    }

    handleEffects(args) {
        const subcommand = args[0] || 'list';
        const bootSystem = window.bootSystemInstance;
        
        switch (subcommand) {
            case 'list':
                return `Available Visual Effects:
• particles - Floating particle system
• background - Rotating background elements  
• matrix - Matrix-style background effects
• glow - Ambient glow effects
• circuit - Circuit flow animations
• scan - Scan line effects
• audio - Sound effects and feedback

Usage: effects [enable|disable] [effect-name]
Example: effects enable matrix`;
            
            case 'status':
                const particleCount = document.querySelectorAll('.blue-particle').length;
                const isAnimating = document.querySelector('.blue-particle')?.style.animationPlayState !== 'paused';
                return `Effects System Status:
• Audio: ${bootSystem?.audioEnabled ? 'Enabled' : 'Disabled'}
• Particles: ${particleCount} active
• Animation: ${isAnimating ? 'Running' : 'Paused'}
• Background Effects: ${document.body.classList.contains('background-effects') ? 'On' : 'Off'}
• Matrix Effects: ${document.body.classList.contains('matrix-effects') ? 'On' : 'Off'}
• Glow Effects: ${document.body.classList.contains('glow-effects') ? 'On' : 'Off'}

Keyboard Shortcuts:
SPACE - Toggle animations | R - Rotate background
+/- - Add/remove particles | C - Change colors`;
            
            case 'enable':
                const effect = args[1];
                if (!effect) return 'Usage: effects enable [effect-name]\nType "effects list" to see available effects';
                
                switch (effect) {
                    case 'particles':
                        bootSystem?.startContinuousGeneration();
                        return 'Particle effects enabled';
                    case 'background':
                        document.body.classList.add('background-effects');
                        return 'Background effects enabled';
                    case 'matrix':
                        if (!document.querySelector('.matrix-background')) {
                            const matrixBg = document.createElement('div');
                            matrixBg.className = 'matrix-background';
                            document.body.appendChild(matrixBg);
                        }
                        document.body.classList.add('matrix-effects');
                        return 'Matrix effects enabled';
                    case 'glow':
                        if (!document.querySelector('.ambient-glow')) {
                            bootSystem?.createAmbientGlows();
                        }
                        document.body.classList.add('glow-effects');
                        return 'Ambient glow effects enabled';
                    case 'audio':
                        if (bootSystem) {
                            bootSystem.audioEnabled = true;
                            localStorage.setItem('neuos-audio', 'true');
                            return 'Audio effects enabled';
                        }
                        return 'Audio system not available';
                    case 'all':
                        bootSystem?.startContinuousGeneration();
                        document.body.classList.add('background-effects', 'matrix-effects', 'glow-effects');
                        if (bootSystem) bootSystem.audioEnabled = true;
                        return 'All effects enabled! 🎆';
                    default:
                        return `Unknown effect: ${effect}\nAvailable: particles, background, matrix, glow, audio, all`;
                }
            
            case 'disable':
                const disableEffect = args[1];
                if (!disableEffect) return 'Usage: effects disable [effect-name]';
                
                switch (disableEffect) {
                    case 'particles':
                        if (bootSystem) bootSystem.particleAnimationRunning = false;
                        return 'Particle effects disabled';
                    case 'background':
                        document.body.classList.remove('background-effects');
                        return 'Background effects disabled';
                    case 'matrix':
                        document.body.classList.remove('matrix-effects');
                        const matrixBg = document.querySelector('.matrix-background');
                        if (matrixBg) matrixBg.remove();
                        return 'Matrix effects disabled';
                    case 'glow':
                        document.body.classList.remove('glow-effects');
                        document.querySelectorAll('.ambient-glow').forEach(g => g.remove());
                        return 'Glow effects disabled';
                    case 'audio':
                        if (bootSystem) {
                            bootSystem.audioEnabled = false;
                            localStorage.setItem('neuos-audio', 'false');
                            return 'Audio effects disabled';
                        }
                        return 'Audio system not available';
                    case 'all':
                        if (bootSystem) bootSystem.particleAnimationRunning = false;
                        document.body.classList.remove('background-effects', 'matrix-effects', 'glow-effects');
                        document.querySelectorAll('.matrix-background, .ambient-glow').forEach(el => el.remove());
                        if (bootSystem) bootSystem.audioEnabled = false;
                        return 'All effects disabled';
                    default:
                        return `Unknown effect: ${disableEffect}`;
                }
            
            case 'toggle':
                if (bootSystem) {
                    bootSystem.toggleParticleAnimation();
                    return 'Effects animation toggled';
                }
                return 'Error: Effects system not available';
            
            case 'reset':
                // Reset to default state
                if (bootSystem) {
                    bootSystem.particleCount = 80;
                    bootSystem.currentParticleColor = 0;
                    bootSystem.particleGenerationRate = 1200;
                    document.querySelectorAll('.blue-particle').forEach(p => p.remove());
                    document.body.classList.remove('background-effects', 'matrix-effects', 'glow-effects');
                    document.querySelectorAll('.matrix-background, .ambient-glow').forEach(el => el.remove());
                    bootSystem.generateParticles();
                    return 'All effects reset to default chillhouse state';
                }
                return 'Error: Effects system not available';
            
            case 'demo':
                // Show off all effects in sequence
                let demoStep = 0;
                const demoSteps = [
                    () => { bootSystem?.changeParticleColors(); return 'Step 1: Color change'; },
                    () => { document.body.classList.add('matrix-effects'); return 'Step 2: Matrix effects'; },
                    () => { bootSystem?.rotateBackground(); return 'Step 3: Background rotation'; },
                    () => { 
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => bootSystem?.createSingleParticle(bootSystem.particleContainer), i * 100);
                        }
                        return 'Step 4: Particle burst';
                    },
                    () => { 
                        document.body.classList.remove('matrix-effects');
                        bootSystem?.createAmbientGlows();
                        return 'Demo complete! Welcome to the chillhouse 🎵';
                    }
                ];
                
                const runDemo = () => {
                    if (demoStep < demoSteps.length) {
                        setTimeout(() => {
                            demoSteps[demoStep]();
                            demoStep++;
                            runDemo();
                        }, 2000);
                    }
                };
                
                runDemo();
                return 'Effects demo starting... Watch the magic happen! ✨';
            
            default:
                return `Unknown effects command: ${subcommand}
Available: list, status, enable, disable, toggle, reset, demo`;
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

    // Navigation and application control methods
    handleLaunch(args) {
        if (!args || args.length === 0) {
            return this.listApps();
        }

        const appName = args[0].toLowerCase();
        const appMappings = {
            'terminal': 'terminal',
            'network': 'network-monitor',
            'monitor': 'network-monitor',
            'topology': 'network-monitor',
            'skills': 'skills',
            'projects': 'projects',
            'status': 'system-status',
            'system': 'system-status',
            'contact': 'contact',
            'codex': 'codex',
            'docs': 'codex',
            'documentation': 'codex',
            'devices': 'device-manager',
            'device': 'device-manager',
            'welcome': 'welcome',
            'game': 'conway-game-of-life',
            'conway': 'conway-game-of-life',
            'life': 'conway-game-of-life'
        };

        const appId = appMappings[appName];
        if (appId && window.handleAppClick) {
            window.handleAppClick(appId);
            return `Launched ${appName} application`;
        }

        return `Unknown application: ${appName}. Type 'apps' to see available applications.`;
    }

    listApps() {
        return `Available Applications:
• terminal       - Command line interface
• network        - Network topology monitor  
• skills         - Technical skills showcase
• projects       - Project portfolio
• status         - System status monitor
• contact        - Contact information
• codex          - Documentation browser
• devices        - Device manager
• welcome        - Welcome screen
• game           - Conway's Game of Life

Usage: launch <app-name>
Example: launch network`;
    }

    listWindows() {
        const openWindows = document.querySelectorAll('.window:not([style*="display: none"])');
        if (openWindows.length === 0) {
            return 'No windows are currently open.';
        }

        let windowList = 'Open Windows:\n';
        openWindows.forEach((window, index) => {
            const title = window.querySelector('.window-title .label')?.textContent || 
                         window.querySelector('.window-title')?.textContent || 'Unknown';
            const focused = window.classList.contains('focused') ? ' [FOCUSED]' : '';
            windowList += `${index + 1}. ${title}${focused}\n`;
        });

        return windowList + '\nUse "close <window-name>" or "focus <window-name>" to manage windows.';
    }

    handleClose(args) {
        if (!args || args.length === 0) {
            // Close the focused window
            const focusedWindow = document.querySelector('.window.focused');
            if (focusedWindow) {
                const closeBtn = focusedWindow.querySelector('.window-control.close');
                if (closeBtn) {
                    closeBtn.click();
                    return 'Closed focused window';
                }
            }
            return 'No focused window to close. Use "windows" to see open windows.';
        }

        const windowName = args.join(' ').toLowerCase();
        const windows = document.querySelectorAll('.window:not([style*="display: none"])');
        
        for (const window of windows) {
            const title = window.querySelector('.window-title .label')?.textContent || 
                         window.querySelector('.window-title')?.textContent || '';
            
            if (title.toLowerCase().includes(windowName)) {
                const closeBtn = window.querySelector('.window-control.close');
                if (closeBtn) {
                    closeBtn.click();
                    return `Closed window: ${title}`;
                }
            }
        }

        return `Window not found: ${windowName}. Use "windows" to see open windows.`;
    }

    handleFocus(args) {
        if (!args || args.length === 0) {
            return 'Usage: focus <window-name>. Use "windows" to see available windows.';
        }

        const windowName = args.join(' ').toLowerCase();
        const windows = document.querySelectorAll('.window:not([style*="display: none"])');
        
        for (const window of windows) {
            const title = window.querySelector('.window-title .label')?.textContent || 
                         window.querySelector('.window-title')?.textContent || '';
            
            if (title.toLowerCase().includes(windowName)) {
                // Focus the window
                if (window.windowManager) {
                    window.windowManager.focusWindow(window);
                } else if (window.click) {
                    window.click();
                }
                return `Focused window: ${title}`;
            }
        }

        return `Window not found: ${windowName}. Use "windows" to see open windows.`;
    }

    handleDesktop(args) {
        const action = args?.[0];
        
        switch(action) {
            case 'clean':
            case 'clear':
                // Close all windows except terminal
                const windows = document.querySelectorAll('.window:not([style*="display: none"])');
                let closed = 0;
                windows.forEach(window => {
                    const title = window.querySelector('.window-title')?.textContent || '';
                    if (!title.toLowerCase().includes('terminal')) {
                        const closeBtn = window.querySelector('.window-control.close');
                        if (closeBtn) {
                            closeBtn.click();
                            closed++;
                        }
                    }
                });
                return `Desktop cleared. Closed ${closed} windows.`;
                
            case 'icons':
                const icons = document.querySelectorAll('.desktop-icon');
                let iconList = 'Desktop Icons:\n';
                icons.forEach((icon, index) => {
                    const label = icon.querySelector('.label')?.textContent || 'Unknown';
                    iconList += `${index + 1}. ${label}\n`;
                });
                return iconList;
                
            case 'help':
                return `Desktop Commands:
desktop clean     - Close all windows except terminal
desktop icons     - List desktop icons
desktop help      - Show this help`;
                
            default:
                return 'Usage: desktop [clean|icons|help]';
        }
    }

    // Application control methods
    handleNetworkControl(args) {
        const action = args?.[0];
        const networkWindow = document.getElementById('topologyWindow');
        
        if (!networkWindow || networkWindow.style.display === 'none') {
            return 'Network Monitor not running. Use "launch network" to start it first.';
        }

        switch(action) {
            case 'refresh':
                // Trigger network refresh if the network instance exists
                if (window.network && window.network.refresh) {
                    window.network.refresh();
                    return 'Network topology refreshed';
                }
                return 'Network refresh: Simulated data updated';
                
            case 'zoom':
                const level = args[1];
                if (level === 'in') {
                    return 'Network view: Zoomed in 25%';
                } else if (level === 'out') {
                    return 'Network view: Zoomed out 25%';
                } else if (level === 'reset') {
                    return 'Network view: Reset to default zoom';
                }
                return 'Usage: network zoom [in|out|reset]';
                
            case 'nodes':
                return `Network Topology Status:
• Core Routers: 2 online
• Distribution Switches: 6 online  
• Access Switches: 14 online
• Firewalls: 2 online (HA pair)
• Wireless Controllers: 1 online
• Total Links: 47 active`;

            case 'monitor':
                return `Network Monitoring Status:
• Bandwidth Utilization: 23%
• Packet Loss: 0.001%
• Average Latency: 12ms
• Active Sessions: 1,247
• Alerts: 0 critical, 2 informational`;

            case 'help':
                return `Network Control Commands:
network refresh       - Refresh topology data
network zoom [in|out|reset] - Control view zoom
network nodes         - Show device status
network monitor       - Show monitoring stats
network help          - Show this help`;
                
            default:
                return 'Usage: network [refresh|zoom|nodes|monitor|help]';
        }
    }

    handleDeviceControl(args) {
        const action = args?.[0];
        const deviceWindow = document.getElementById('devicesWindow');
        
        if (!deviceWindow || deviceWindow.style.display === 'none') {
            return 'Device Manager not running. Use "launch devices" to start it first.';
        }

        switch(action) {
            case 'list':
                return `Active Network Devices:
🔧 Core Infrastructure:
  • Core Switch Stack (192.168.1.10) - Online, 247 days uptime
  • Distribution Switches (192.168.1.11-16) - Online, 34% load

🔥 Security:
  • Primary Firewall (192.168.1.20) - Online, 2.3 Gbps throughput
  • Secondary Firewall (192.168.1.21) - Standby, ready for failover

☁️ Wireless:
  • Wireless Controller (192.168.1.30) - 47 APs, 312 clients`;

            case 'status':
                const device = args[1];
                if (!device) {
                    return 'Usage: devices status <ip-address>';
                }
                return `Device Status for ${device}:
• Status: Online
• Uptime: 247 days, 14 hours
• CPU Usage: 23%
• Memory Usage: 45%
• Temperature: 72°F
• Last Seen: Just now`;

            case 'ping':
                const target = args[1] || '192.168.1.10';
                return `Pinging ${target}...
Reply from ${target}: bytes=32 time=2ms TTL=64
Reply from ${target}: bytes=32 time=1ms TTL=64
Reply from ${target}: bytes=32 time=2ms TTL=64
Reply from ${target}: bytes=32 time=1ms TTL=64

Ping statistics for ${target}:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`;

            case 'help':
                return `Device Control Commands:
devices list          - List all managed devices
devices status <ip>   - Get device status
devices ping <ip>     - Ping device
devices help          - Show this help`;
                
            default:
                return 'Usage: devices [list|status|ping|help]';
        }
    }

    handleStatusControl(args) {
        const action = args?.[0];
        
        switch(action) {
            case 'system':
                return `Neu-OS System Status:
• OS Version: v2.1.4 (Network Engineering Build)
• Uptime: 15+ years in production
• Memory Usage: 67% (optimized for performance)
• CPU Load: Low (12% average)
• Network Status: All interfaces operational
• Security: All firewalls active, intrusion detection enabled
• Storage: 78% available, all RAID arrays healthy`;

            case 'services':
                return `Active Services Status:
✅ Network Stack - Running (PID: 1001)
✅ Particle Engine - Running (PID: 1024) 
✅ Audio Subsystem - Running (PID: 1032)
✅ Window Manager - Running (PID: 1008)
✅ Terminal Service - Running (PID: 1015)
✅ Graphics Renderer - Running (PID: 1041)
✅ Boot System - Running (PID: 999)`;

            case 'performance':
                return `Performance Metrics:
🚀 Particle System: 60 FPS, ${document.querySelectorAll('.blue-particle').length} active particles
🖥️ Rendering: Hardware accelerated, smooth animations
🔊 Audio: ${window.bootSystemInstance?.audioEnabled ? 'Enabled' : 'Disabled'}, low latency
💾 Memory: Efficient cleanup, no leaks detected
🌐 Network Sim: All protocols responding normally`;

            case 'help':
                return `Status Control Commands:
status system         - Show system overview
status services       - Show running services
status performance    - Show performance metrics
status help           - Show this help`;
                
            default:
                return 'Usage: status [system|services|performance|help]';
        }
    }

    handleSkillsControl(args) {
        const action = args?.[0];
        const skillsWindow = document.getElementById('skillsWindow');
        
        switch(action) {
            case 'demo':
                const skill = args[1];
                if (!skill) {
                    return `Available Skill Demos:
• networking - Network protocols and configuration
• security - Firewall and security implementation  
• automation - Python and Ansible automation
• cloud - AWS/Azure cloud networking
• monitoring - SolarWinds and network monitoring

Usage: skills demo <skill-name>`;
                }
                if (skillsWindow && skillsWindow.style.display !== 'none') {
                    return `Launching ${skill} demonstration in Skills Lab...`;
                } else {
                    return `Skills Lab not open. Use "launch skills" first, then try "skills demo ${skill}"`;
                }
                
            case 'list':
                return `Core Technical Skills:
🌐 Networking: Cisco, Arista, Juniper - Expert level
🔐 Security: Palo Alto, Fortinet, NGFW - Advanced level  
☁️ Cloud: AWS, Azure, hybrid networking - Advanced level
📊 Monitoring: SolarWinds, Splunk, Grafana - Expert level
🤖 Automation: Python, Ansible, IaC - Advanced level
📋 Management: Project management, vendor relations - Expert level`;

            case 'help':
                return `Skills Control Commands:
skills demo <name>    - Launch skill demonstration
skills list           - Show all technical skills
skills help           - Show this help`;
                
            default:
                return 'Usage: skills [demo|list|help]';
        }
    }

    handleProjectsControl(args) {
        const action = args?.[0];
        const projectsWindow = document.getElementById('projectsWindow');
        
        switch(action) {
            case 'list':
                return `Recent Project Portfolio:
🚀 Current: Denali Advanced Integration - Space-to-ground comms
💼 2023: Sound Transit - SolarWinds modernization & PCI compliance
🎮 2022: ArenaNet - Arista leaf-spine architecture migration  
🏢 2022: Riverstrong - Cisco Meraki & Fortinet deployments
📡 Ongoing: Personal projects including this interactive portfolio`;

            case 'demo':
                const project = args[1];
                if (!project) {
                    return `Available Project Demos:
• network-migration - ArenaNet infrastructure overhaul
• automation-platform - Sound Transit automation tools
• security-compliance - PCI/HIPAA compliance implementation
• portfolio - This interactive Neu-OS portfolio

Usage: projects demo <project-name>`;
                }
                if (projectsWindow && projectsWindow.style.display !== 'none') {
                    return `Loading ${project} project demonstration...`;
                } else {
                    return `Projects window not open. Use "launch projects" first.`;
                }

            case 'help':
                return `Projects Control Commands:
projects list         - Show project portfolio
projects demo <name>  - Launch project demonstration  
projects help         - Show this help`;
                
            default:
                return 'Usage: projects [list|demo|help]';
        }
    }

    handleSystemControl(args) {
        const action = args?.[0];
        
        switch(action) {
            case 'reboot':
                return `System reboot initiated...
⚠️  Warning: This will restart the Neu-OS interface
🔄 Refreshing page in 3 seconds...

Use Ctrl+C to cancel or wait for automatic restart.`;
                
            case 'shutdown':
                return `System shutdown initiated...
💾 Saving system state...
🔌 Preparing for shutdown...

Use "system restart" to reinitialize Neu-OS.`;

            case 'restart':
                setTimeout(() => {
                    location.reload();
                }, 1000);
                return 'Neu-OS restart initiated... Reloading interface...';

            case 'info':
                return `Neu-OS System Information:
• OS: Network Engineering Operating System v2.1.4
• Kernel: Interactive Web Engine
• Architecture: JavaScript/ES6 + CSS3
• Display Manager: Custom Window Manager
• Audio: Web Audio API with 3D spatial effects
• Particle Engine: 60fps hardware-accelerated
• Network Simulation: Real-time protocol emulation
• Uptime: Since page load
• License: Portfolio Demonstration System`;

            case 'help':
                return `System Control Commands:
system info           - Show system information
system restart        - Restart Neu-OS interface
system reboot         - Same as restart
system shutdown       - Simulate system shutdown
system help           - Show this help`;
                
            default:
                return 'Usage: system [info|restart|reboot|shutdown|help]';
        }
    }

    handleThemeControl(args) {
        const action = args?.[0];
        
        switch(action) {
            case 'dark':
                document.body.style.filter = 'brightness(0.7)';
                return 'Theme: Switched to darker mode';
                
            case 'light':
                document.body.style.filter = 'brightness(1.2)';
                return 'Theme: Switched to lighter mode';
                
            case 'reset':
                document.body.style.filter = '';
                return 'Theme: Reset to default Neu-OS theme';
                
            case 'particles':
                const setting = args[1];
                if (setting === 'show') {
                    document.querySelectorAll('.blue-particle').forEach(p => p.style.display = 'block');
                    return 'Particles: Enabled and visible';
                } else if (setting === 'hide') {
                    document.querySelectorAll('.blue-particle').forEach(p => p.style.display = 'none');
                    return 'Particles: Hidden (but still running)';
                }
                return 'Usage: theme particles [show|hide]';

            case 'help':
                return `Theme Control Commands:
theme dark            - Switch to darker theme
theme light           - Switch to lighter theme  
theme reset           - Reset to default theme
theme particles [show|hide] - Control particle visibility
theme help            - Show this help

Note: Use 'particles' and 'fx' commands for advanced particle control`;
                
            default:
                return 'Usage: theme [dark|light|reset|particles|help]';
        }
    }

    handleAudioControl(args) {
        const action = args?.[0];
        const bootSystem = window.bootSystemInstance;
        console.log('Audio control called with action:', action);
        console.log('Boot system available:', !!bootSystem);
        console.log('Boot system instance:', bootSystem);
        
        switch(action) {
            case 'on':
                if (bootSystem) {
                    bootSystem.audioEnabled = true;
                    localStorage.setItem('neuos-audio', 'true');
                    
                    // Ensure audio context is available and active
                    if (!bootSystem.audioContext || bootSystem.audioContext.state === 'closed') {
                        try {
                            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                            bootSystem.audioContext = new AudioContextClass();
                            bootSystem.setupAudioNodes();
                        } catch (error) {
                            console.warn('Failed to restart audio context:', error);
                        }
                    } else if (bootSystem.audioContext.state === 'suspended') {
                        // Resume suspended audio context
                        bootSystem.audioContext.resume().then(() => {
                            console.log('Audio context resumed on enable');
                        }).catch(err => {
                            console.warn('Failed to resume audio context:', err);
                        });
                    }
                    
                    return 'Audio: Enabled - Sound effects and feedback active';
                }
                return 'Audio system not available';
                
            case 'off':
                if (bootSystem) {
                    bootSystem.audioEnabled = false;
                    localStorage.setItem('neuos-audio', 'false');
                    return 'Audio: Disabled - Silent mode activated';
                }
                return 'Audio system not available';
                
            case 'test':
                if (bootSystem && bootSystem.audioEnabled && bootSystem.audioContext) {
                    // Test basic audio system
                    bootSystem.createTone(440, 0.2, 'sine', 0.1);
                    setTimeout(() => bootSystem.createTone(554, 0.2, 'sine', 0.1), 250);
                    setTimeout(() => bootSystem.createTone(659, 0.3, 'sine', 0.1), 500);
                    
                    // Also test chiptune if available
                    if (this.audioContext && this.audioContext.state === 'running') {
                        setTimeout(() => {
                            this.playMelodyNote(this.audioContext.currentTime, 0, 0);
                        }, 800);
                    }
                    
                    return 'Audio test: Playing test sequence (440Hz, 554Hz, 659Hz) + chiptune test';
                }
                return 'Audio disabled or not available';

            case 'volume':
                const level = args[1];
                if (level && bootSystem && bootSystem.audioNodes) {
                    const vol = parseFloat(level);
                    if (vol >= 0 && vol <= 1) {
                        bootSystem.audioNodes.masterGain.gain.setValueAtTime(vol, bootSystem.audioContext.currentTime);
                        return `Audio volume: Set to ${Math.round(vol * 100)}%`;
                    }
                }
                return 'Usage: audio volume <0.0-1.0>';

            case 'status':
                if (bootSystem) {
                    const audioState = bootSystem.audioEnabled ? 'Enabled' : 'Disabled';
                    const contextState = bootSystem.audioContext ? bootSystem.audioContext.state : 'Not Created';
                    const chiptuneState = this.audioContext ? this.audioContext.state : 'Not Available';
                    
                    return `Audio System Status:
• State: ${audioState}
• Context: ${contextState}
• Sample Rate: ${bootSystem.audioContext?.sampleRate || 'N/A'} Hz
• Audio Nodes: ${Object.keys(bootSystem.audioNodes || {}).length} active
• Chiptune Context: ${chiptuneState}
• Effects: UI sounds, typing feedback, interaction audio, chiptune music
• Default: Audio is enabled by default for seamless experience`;
                }
                return 'Audio system not initialized';

            case 'debug':
                const debugInfo = {
                    bootSystem: !!bootSystem,
                    audioEnabled: bootSystem?.audioEnabled,
                    audioContext: !!bootSystem?.audioContext,
                    audioContextState: bootSystem?.audioContext?.state,
                    terminalAudioContext: !!this.audioContext,
                    terminalAudioContextState: this.audioContext?.state,
                    localStorage: localStorage.getItem('neuos-audio'),
                    userAgent: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Firefox') ? 'Firefox' : 'Other'
                };
                return `Audio Debug Info:
${JSON.stringify(debugInfo, null, 2)}`;

            case 'reset':
                if (bootSystem) {
                    // Reset to default state (enabled)
                    bootSystem.audioEnabled = true;
                    localStorage.setItem('neuos-audio', 'true');
                    
                    // Ensure audio context is working
                    if (!bootSystem.audioContext || bootSystem.audioContext.state === 'closed') {
                        try {
                            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                            bootSystem.audioContext = new AudioContextClass();
                            bootSystem.setupAudioNodes();
                        } catch (error) {
                            console.warn('Failed to restart audio context:', error);
                        }
                    }
                    
                    return 'Audio: Reset to default state (enabled)';
                }
                return 'Audio system not available';

            case 'help':
                return `Audio Control Commands:
audio on              - Enable audio system
audio off             - Disable audio system
audio test            - Play audio test sequence
audio volume <0-1>    - Set volume level
audio status          - Show audio system status
audio debug           - Debug audio system state
audio reset           - Reset to default state (enabled)
audio help            - Show this help`;
                
            default:
                return 'Usage: audio [on|off|test|volume|status|debug|reset|help]';
        }
    }

    handlePerformanceControl(args) {
        const action = args?.[0];
        
        switch(action) {
            case 'fps':
                // Simple FPS counter
                let fps = 0;
                let lastTime = performance.now();
                const measureFPS = () => {
                    const now = performance.now();
                    fps = Math.round(1000 / (now - lastTime));
                    lastTime = now;
                };
                measureFPS();
                return `Current FPS: ~${fps || '60'} (target: 60fps)
Particle count: ${document.querySelectorAll('.blue-particle').length}
Performance: ${fps >= 50 ? 'Excellent' : fps >= 30 ? 'Good' : 'Optimization needed'}`;

            case 'optimize':
                // Reduce particle count if too high
                const currentCount = document.querySelectorAll('.blue-particle').length;
                if (currentCount > 100) {
                    const excess = Array.from(document.querySelectorAll('.blue-particle')).slice(0, 20);
                    excess.forEach(p => p.remove());
                    return `Performance optimization: Removed ${excess.length} excess particles`;
                }
                return 'Performance: System already optimized';

            case 'memory':
                // Basic memory info (simulated)
                const particles = document.querySelectorAll('.blue-particle').length;
                const windows = document.querySelectorAll('.window').length;
                const estimatedMemory = (particles * 0.1 + windows * 2.5 + 15).toFixed(1);
                return `Memory Usage Estimate:
• Base System: ~15 MB
• Particles (${particles}): ~${(particles * 0.1).toFixed(1)} MB  
• Windows (${windows}): ~${(windows * 2.5).toFixed(1)} MB
• Total Estimated: ~${estimatedMemory} MB
• Status: ${estimatedMemory < 50 ? 'Efficient' : 'Moderate'}`;

            case 'help':
                return `Performance Control Commands:
performance fps       - Show current FPS and metrics
performance optimize  - Optimize system performance
performance memory    - Show memory usage estimate
performance help      - Show this help`;
                
            default:
                return 'Usage: performance [fps|optimize|memory|help]';
        }
    }

    showDemoscene() {
        // Launch the DarkWave Demoscene Platform
        this.launchDarkWaveDemoscene();
        
        return `🌟 DARKWAVE DEMOSCENE PLATFORM 🌟

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%

🎵 LAUNCHING: "DARKWAVE DEMOSCENE" 🎵
A Web-Based Demoscene Platform with Dark Wave 8-bit Hacker Aesthetic

⚡ Features:
• Demo Showcase Gallery
• Interactive Creation Tools
• Real-time Chiptune Generation
• Dark Wave Audio Sequences
• Particle Systems & Visual Effects
• Community Hub & Comments
• Educational Tutorials
• Matrix Rain & Glitch Effects
• Wireframe Networks
• Advanced Audio Visualization

🎮 Platform Sections:
• Showcase - Browse demo gallery
• Create - Build your own demos
• Community - Share and discuss
• Learn - Tutorials and guides

🎼 Audio System: ${window.darkWaveAudio?.isInitialized ? 'READY - Full chiptune and dark wave experience!' : 'INITIALIZING - Audio system loading...'}

Platform launching... Welcome to the DarkWave Demoscene experience!`;
    }

    launchDarkWaveDemoscene() {
        // Remove existing demoscene if present
        const existing = document.getElementById('demosceneContainer');
        if (existing) {
            existing.remove();
        }

        // Create demoscene container
        const container = document.createElement('div');
        container.id = 'demosceneContainer';
        container.className = 'demoscene-container';
        
        // Load the DarkWave demoscene platform
        container.innerHTML = `
            <div class="demoscene-header">
                <div class="demoscene-title">DARKWAVE DEMOSCENE PLATFORM</div>
                <div class="demoscene-subtitle">Where 8-bit meets dark wave</div>
                <button class="demoscene-close" onclick="window.terminalInstance?.exitDarkWaveDemoscene()">×</button>
            </div>
            <iframe id="demoscene-iframe" src="demoscene.html" frameborder="0"></iframe>
        `;

        document.body.appendChild(container);
        
        // Add styles for the container
        this.addDarkWaveDemosceneStyles();
        
        // Initialize the platform
        this.initializeDarkWaveDemoscene();
    }

    addDarkWaveDemosceneStyles() {
        const style = document.createElement('style');
        style.id = 'darkWaveDemosceneStyles';
        style.textContent = `
            .demoscene-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #0d0b1e;
                z-index: 10000;
                overflow: hidden;
                font-family: 'Orbitron', 'Share Tech Mono', monospace;
            }

            .demoscene-header {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 60px;
                background: rgba(13, 11, 30, 0.95);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid #b388ff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                box-shadow: 0 0 20px rgba(179, 136, 255, 0.3);
            }

            .demoscene-title {
                font-size: 18px;
                font-weight: 700;
                color: #b388ff;
                text-shadow: 0 0 10px #b388ff;
                letter-spacing: 2px;
                text-transform: uppercase;
            }

            .demoscene-subtitle {
                position: absolute;
                top: 35px;
                font-size: 12px;
                color: #ffffff;
                opacity: 0.8;
                letter-spacing: 1px;
            }

            .demoscene-close {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: 1px solid #b388ff;
                color: #b388ff;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .demoscene-close:hover {
                background: #b388ff;
                color: #0d0b1e;
                box-shadow: 0 0 15px #b388ff;
            }

            #demoscene-iframe {
                width: 100%;
                height: 100%;
                border: none;
                margin-top: 60px;
            }

            @keyframes titleGlow {
                0%, 100% { text-shadow: 0 0 10px #b388ff; }
                50% { text-shadow: 0 0 20px #b388ff, 0 0 30px #b388ff; }
            }

            .demoscene-title {
                animation: titleGlow 2s ease-in-out infinite;
            }
        `;

        document.head.appendChild(style);
    }

    initializeDarkWaveDemoscene() {
        // Wait for iframe to load
        const iframe = document.getElementById('demoscene-iframe');
        if (iframe) {
            iframe.onload = () => {
                console.log('DarkWave Demoscene Platform loaded');
                
                // Initialize audio context if needed
                if (window.darkWaveAudio && !window.darkWaveAudio.isInitialized) {
                    window.darkWaveAudio.resume();
                }
            };
        }
    }

    exitDarkWaveDemoscene() {
        const container = document.getElementById('demosceneContainer');
        if (container) {
            container.remove();
        }
        
        const styles = document.getElementById('darkWaveDemosceneStyles');
        if (styles) {
            styles.remove();
        }
        
        // Call cleanup on the demoscene platform if it exists
        const iframe = document.getElementById('demoscene-iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.demoscenePlatform) {
            iframe.contentWindow.demoscenePlatform.cleanup();
        }
        
        // Stop any running audio
        if (window.darkWaveAudio) {
            window.darkWaveAudio.stopAmbientTrack();
        }
        
        console.log('DarkWave Demoscene Platform closed');
    }

    createDemosceneContainer() {
        // Remove existing demoscene if present
        const existing = document.getElementById('demosceneContainer');
        if (existing) {
            existing.remove();
        }

        // Create demoscene container
        const container = document.createElement('div');
        container.id = 'demosceneContainer';
        container.className = 'demoscene-container';
        
        container.innerHTML = `
            <div class="demoscene-canvas">
                <canvas id="demoCanvas"></canvas>
                <div class="demoscene-overlay">
                    <div class="demo-title">CYBER HACKER</div>
                    <div class="demo-credits">NEU-OS DEMOSCENE</div>
                    <div class="demo-controls">
                        <div>SPACE: Next Scene • ESC: Exit • C: Colors • M: Music</div>
                    </div>
                </div>
                <div class="demo-scene-info">
                    <div id="sceneTitle">DIGITAL PLASMA</div>
                    <div id="sceneCounter">Scene 1/6</div>
                </div>
                <div class="music-indicator">
                    <div class="music-note">♪</div>
                    <div class="music-status">HACKER CHIPTUNE READY</div>
                </div>
                <div class="audio-visualizer">
                    <canvas id="audioCanvas" width="200" height="50"></canvas>
                </div>
            </div>
        `;

        document.body.appendChild(container);
        
        // Add styles
        this.addDemosceneStyles();
        
        // Initialize the demo
        this.initializeDemoscene();
    }

    addDemosceneStyles() {
        const style = document.createElement('style');
        style.id = 'demosceneStyles';
        style.textContent = `
            .demoscene-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #000;
                z-index: 10000;
                cursor: none;
                overflow: hidden;
            }

            .demoscene-canvas {
                position: relative;
                width: 100%;
                height: 100%;
            }

            #demoCanvas {
                width: 100%;
                height: 100%;
                display: block;
                background: #000;
            }

            .demoscene-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 2;
            }

            .demo-title {
                position: absolute;
                top: 40px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Courier New', monospace;
                font-size: 48px;
                font-weight: bold;
                color: #00ffff;
                text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff;
                animation: titlePulse 2s ease-in-out infinite;
                letter-spacing: 8px;
            }

            .demo-credits {
                position: absolute;
                top: 100px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Courier New', monospace;
                font-size: 18px;
                color: #ffffff;
                text-shadow: 0 0 10px #ffffff;
                animation: fadeInOut 4s ease-in-out infinite;
                letter-spacing: 3px;
            }

            .demo-controls {
                position: absolute;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #ffff00;
                text-shadow: 0 0 10px #ffff00;
                text-align: center;
                animation: controlsBlink 3s ease-in-out infinite;
            }

            .demo-scene-info {
                position: absolute;
                bottom: 20px;
                right: 20px;
                font-family: 'Courier New', monospace;
                color: #ff00ff;
                text-shadow: 0 0 10px #ff00ff;
                text-align: right;
            }

            #sceneTitle {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            #sceneCounter {
                font-size: 14px;
                opacity: 0.8;
            }

            .music-indicator {
                position: absolute;
                top: 20px;
                left: 20px;
                font-family: 'Courier New', monospace;
                color: #00ff00;
                text-shadow: 0 0 10px #00ff00;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .music-note {
                font-size: 24px;
                animation: musicBounce 0.6s ease-in-out infinite alternate;
            }

            .music-status {
                font-size: 12px;
                letter-spacing: 1px;
                animation: musicGlow 2s ease-in-out infinite;
            }

            .audio-visualizer {
                position: absolute;
                bottom: 20px;
                left: 20px;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid #00ff00;
                border-radius: 4px;
                padding: 5px;
            }

            #audioCanvas {
                display: block;
                background: #000;
                border-radius: 2px;
            }

            @keyframes musicBounce {
                0% { 
                    transform: scale(1) rotate(-5deg);
                    color: #00ff00;
                }
                100% { 
                    transform: scale(1.2) rotate(5deg);
                    color: #00ffff;
                }
            }

            @keyframes musicGlow {
                0%, 100% { 
                    opacity: 0.7;
                    text-shadow: 0 0 10px #00ff00;
                }
                50% { 
                    opacity: 1;
                    text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00;
                }
            }

            @keyframes titlePulse {
                0%, 100% { 
                    transform: translateX(-50%) scale(1);
                    text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff;
                }
                50% { 
                    transform: translateX(-50%) scale(1.05);
                    text-shadow: 0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff;
                }
            }

            @keyframes fadeInOut {
                0%, 100% { opacity: 0.6; }
                50% { opacity: 1; }
            }

            @keyframes controlsBlink {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.3; }
            }

            .demo-transition {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, 
                    transparent 0%, 
                    rgba(0,255,255,0.3) 25%, 
                    transparent 50%, 
                    rgba(255,0,255,0.3) 75%, 
                    transparent 100%);
                opacity: 0;
                animation: transitionSweep 2s ease-in-out;
                pointer-events: none;
                z-index: 3;
            }

            @keyframes transitionSweep {
                0% { 
                    opacity: 0;
                    transform: translateX(-100%);
                }
                50% { 
                    opacity: 1;
                    transform: translateX(0%);
                }
                100% { 
                    opacity: 0;
                    transform: translateX(100%);
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    initializeDemoscene() {
        const canvas = document.getElementById('demoCanvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Demo state
        let currentScene = 0;
        let animationId;
        let time = 0;
        let colorOffset = 0;
        
        const scenes = [
            { name: 'PLASMA FIELD', func: this.renderPlasmaField },
            { name: 'INFINITE TUNNEL', func: this.renderTunnel },
            { name: 'CUBE MATRIX', func: this.renderCubeMatrix },
            { name: 'COLOR STORM', func: this.renderColorStorm },
            { name: 'WAVE DISTORTION', func: this.renderWaveDistortion },
            { name: 'FINAL SEQUENCE', func: this.renderFinalSequence }
        ];

        // Update scene info
        const updateSceneInfo = () => {
            document.getElementById('sceneTitle').textContent = scenes[currentScene].name;
            document.getElementById('sceneCounter').textContent = `Scene ${currentScene + 1}/${scenes.length}`;
        };
        updateSceneInfo();

        // Main animation loop
        const animate = () => {
            time += 0.02;
            
            // Clear canvas
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Render current scene
            scenes[currentScene].func.call(this, ctx, canvas, time, colorOffset);
            
            animationId = requestAnimationFrame(animate);
        };

        // Scene transition effect
        const transitionToNextScene = () => {
            const transition = document.createElement('div');
            transition.className = 'demo-transition';
            document.querySelector('.demoscene-canvas').appendChild(transition);
            
            setTimeout(() => {
                currentScene = (currentScene + 1) % scenes.length;
                updateSceneInfo();
                transition.remove();
            }, 1000);
        };

        // Event handlers
        const handleKeyPress = (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    transitionToNextScene();
                    break;
                case 'Escape':
                    this.exitDemoscene();
                    break;
                case 'KeyC':
                    colorOffset += 0.5;
                    break;
                case 'KeyM':
                    this.toggleMusic();
                    break;
                case 'Equal':
                case 'NumpadAdd':
                    // Increase effects intensity
                    break;
                case 'Minus':
                case 'NumpadSubtract':
                    // Decrease effects intensity
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        
        // Initialize chiptune music with better error handling
        setTimeout(() => {
            this.initializeChiptune();
        }, 100); // Small delay to ensure everything is ready

        // Store cleanup function
        this.demosceneCleanup = () => {
            cancelAnimationFrame(animationId);
            document.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('resize', resizeCanvas);
            this.stopChiptune();
        };

        // Start the demo
        animate();
    }

    // Scene rendering functions
    renderPlasmaField(ctx, canvas, time, colorOffset) {
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let x = 0; x < canvas.width; x += 2) {
            for (let y = 0; y < canvas.height; y += 2) {
                const value1 = Math.sin(x * 0.01 + time * 2);
                const value2 = Math.sin(y * 0.01 + time * 1.5);
                const value3 = Math.sin((x + y) * 0.005 + time);
                const plasma = (value1 + value2 + value3) / 3;
                
                const r = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time + colorOffset));
                const g = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time * 0.7 + colorOffset + 2));
                const b = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time * 0.5 + colorOffset + 4));
                
                const index = (y * canvas.width + x) * 4;
                if (index < data.length) {
                    data[index] = r;
                    data[index + 1] = g;
                    data[index + 2] = b;
                    data[index + 3] = 255;
                }
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add overlay effects
        ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 3; i++) {
            const x = canvas.width / 2 + Math.sin(time + i * 2) * 200;
            const y = canvas.height / 2 + Math.cos(time * 0.7 + i * 2) * 150;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100);
            gradient.addColorStop(0, `rgba(${255 * (i === 0)}, ${255 * (i === 1)}, ${255 * (i === 2)}, 0.3)`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.globalCompositeOperation = 'source-over';
    }

    renderTunnel(ctx, canvas, time, colorOffset) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
            for (let radius = 10; radius < Math.min(canvas.width, canvas.height); radius += 20) {
                const x = centerX + Math.cos(angle + time * 0.5) * radius;
                const y = centerY + Math.sin(angle + time * 0.5) * radius;
                
                const hue = (angle * 57.3 + time * 50 + colorOffset * 50) % 360;
                const lightness = 50 + 30 * Math.sin(radius * 0.1 + time * 2);
                
                ctx.strokeStyle = `hsl(${hue}, 100%, ${lightness}%)`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        // Add tunnel effect
        ctx.globalCompositeOperation = 'multiply';
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(canvas.width, canvas.height) / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.8)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.2)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }

    renderCubeMatrix(ctx, canvas, time, colorOffset) {
        const cubeSize = 60;
        const spacing = 120;
        const cols = Math.floor(canvas.width / spacing) + 2;
        const rows = Math.floor(canvas.height / spacing) + 2;
        
        for (let col = -1; col < cols; col++) {
            for (let row = -1; row < rows; row++) {
                const x = col * spacing + (spacing / 2);
                const y = row * spacing + (spacing / 2);
                const rotation = time + (col + row) * 0.5;
                
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                
                // Draw 3D-ish cube
                const colors = [
                    `hsl(${(time * 30 + col * 20 + colorOffset * 30) % 360}, 80%, 60%)`,
                    `hsl(${(time * 30 + col * 20 + colorOffset * 30 + 60) % 360}, 80%, 40%)`,
                    `hsl(${(time * 30 + col * 20 + colorOffset * 30 + 120) % 360}, 80%, 50%)`
                ];
                
                // Front face
                ctx.fillStyle = colors[0];
                ctx.fillRect(-cubeSize/2, -cubeSize/2, cubeSize, cubeSize);
                
                // Right face (3D effect)
                ctx.fillStyle = colors[1];
                ctx.beginPath();
                ctx.moveTo(cubeSize/2, -cubeSize/2);
                ctx.lineTo(cubeSize/2 + 20, -cubeSize/2 - 20);
                ctx.lineTo(cubeSize/2 + 20, cubeSize/2 - 20);
                ctx.lineTo(cubeSize/2, cubeSize/2);
                ctx.fill();
                
                // Top face (3D effect)
                ctx.fillStyle = colors[2];
                ctx.beginPath();
                ctx.moveTo(-cubeSize/2, -cubeSize/2);
                ctx.lineTo(-cubeSize/2 + 20, -cubeSize/2 - 20);
                ctx.lineTo(cubeSize/2 + 20, -cubeSize/2 - 20);
                ctx.lineTo(cubeSize/2, -cubeSize/2);
                ctx.fill();
                
                ctx.restore();
            }
        }
    }

    renderColorStorm(ctx, canvas, time, colorOffset) {
        // Create swirling color storm
        for (let i = 0; i < 200; i++) {
            const angle = (i / 200) * Math.PI * 2 + time;
            const radius = Math.sin(time * 0.5 + i * 0.1) * 300 + 400;
            const x = canvas.width / 2 + Math.cos(angle) * radius;
            const y = canvas.height / 2 + Math.sin(angle) * radius;
            const size = Math.abs(Math.sin(time + i * 0.1)) * 20 + 5;
            
            const hue = (i * 3 + time * 100 + colorOffset * 60) % 360;
            const saturation = 80 + Math.sin(time + i * 0.05) * 20;
            const lightness = 50 + Math.sin(time * 2 + i * 0.1) * 30;
            
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Add lightning effects
        if (Math.random() < 0.1) {
            ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, 90%)`;
            ctx.lineWidth = Math.random() * 5 + 2;
            ctx.globalAlpha = 0.8;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, 0);
            ctx.lineTo(Math.random() * canvas.width, canvas.height);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    renderWaveDistortion(ctx, canvas, time, colorOffset) {
        // Clear background with subtle gradient
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, 'rgba(0,0,20,1)');
        bgGradient.addColorStop(0.5, 'rgba(0,0,0,1)');
        bgGradient.addColorStop(1, 'rgba(20,0,0,1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const waves = 6;
        const amplitude = 80;
        
        // Render multiple wave layers
        for (let wave = 0; wave < waves; wave++) {
            const waveSpeed = 1 + wave * 0.3;
            const waveOffset = wave * 0.8;
            const hue = (wave * 60 + time * 30 + colorOffset * 50) % 360;
            
            ctx.strokeStyle = `hsl(${hue}, 90%, ${60 + wave * 5}%)`;
            ctx.lineWidth = 4 - wave * 0.3;
            ctx.globalAlpha = 0.9 - wave * 0.1;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            let firstPoint = true;
            
            for (let x = -50; x <= canvas.width + 50; x += 3) {
                // Multi-layered wave calculation for complex motion
                const baseY = canvas.height / 2;
                const wave1 = Math.sin((x * 0.008 + time * waveSpeed + waveOffset)) * amplitude;
                const wave2 = Math.sin((x * 0.015 + time * waveSpeed * 0.7 + waveOffset * 2)) * (amplitude * 0.5);
                const wave3 = Math.sin((x * 0.003 + time * waveSpeed * 1.3 + waveOffset * 0.5)) * (amplitude * 0.3);
                const finalY = baseY + wave1 + wave2 + wave3;
                
                if (firstPoint) {
                    ctx.moveTo(x, finalY);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, finalY);
                }
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        // Reset alpha
        ctx.globalAlpha = 1;
        
        // Add flowing particle trails along the waves
        for (let i = 0; i < 30; i++) {
            const baseX = (time * 150 + i * 80) % (canvas.width + 160) - 80;
            const waveY = canvas.height / 2 + 
                Math.sin(baseX * 0.008 + time + i * 0.3) * amplitude * 1.2 +
                Math.sin(baseX * 0.015 + time * 0.7 + i * 0.6) * amplitude * 0.6;
            
            const size = 3 + Math.sin(time * 2 + i * 0.2) * 2;
            const hue = (i * 12 + time * 80 + colorOffset * 40) % 360;
            
            // Particle with glow effect
            const gradient = ctx.createRadialGradient(baseX, waveY, 0, baseX, waveY, size * 3);
            gradient.addColorStop(0, `hsl(${hue}, 100%, 80%)`);
            gradient.addColorStop(0.5, `hsl(${hue}, 90%, 50%)`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(baseX, waveY, size * 3, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner bright core
            ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
            ctx.beginPath();
            ctx.arc(baseX, waveY, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Add vertical light beams
        for (let i = 0; i < 4; i++) {
            const x = (canvas.width / 5) * (i + 1) + Math.sin(time + i) * 50;
            const hue = (i * 90 + time * 20 + colorOffset * 30) % 360;
            
            const beamGradient = ctx.createLinearGradient(x - 20, 0, x + 20, 0);
            beamGradient.addColorStop(0, 'rgba(0,0,0,0)');
            beamGradient.addColorStop(0.5, `hsla(${hue}, 80%, 60%, 0.3)`);
            beamGradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = beamGradient;
            ctx.fillRect(x - 20, 0, 40, canvas.height);
        }
    }

    renderFinalSequence(ctx, canvas, time, colorOffset) {
        // Create a dramatic final sequence with layered effects
        
        // Start with a dynamic background
        const bgGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
        );
        bgGradient.addColorStop(0, `hsla(${(time * 20 + colorOffset * 30) % 360}, 30%, 10%, 1)`);
        bgGradient.addColorStop(0.5, `hsla(${(time * 15 + colorOffset * 25 + 120) % 360}, 40%, 5%, 1)`);
        bgGradient.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Layer 1: Plasma field (subtle)
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.2;
        
        // Create a smaller plasma field manually for better control
        const imageData = ctx.createImageData(canvas.width / 4, canvas.height / 4);
        const data = imageData.data;
        
        for (let x = 0; x < imageData.width; x += 1) {
            for (let y = 0; y < imageData.height; y += 1) {
                const value1 = Math.sin(x * 0.04 + time * 3);
                const value2 = Math.sin(y * 0.04 + time * 2.5);
                const value3 = Math.sin((x + y) * 0.02 + time * 1.5);
                const plasma = (value1 + value2 + value3) / 3;
                
                const r = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time + colorOffset));
                const g = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time * 0.7 + colorOffset + 2));
                const b = Math.floor(128 + 127 * Math.sin(plasma * Math.PI + time * 0.5 + colorOffset + 4));
                
                const index = (y * imageData.width + x) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }
        
        // Scale up the plasma
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.putImageData(imageData, 0, 0);
        
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        
        // Layer 2: Rotating tunnel elements
        ctx.globalAlpha = 0.4;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
            for (let radius = 50; radius < Math.min(canvas.width, canvas.height) / 2; radius += 60) {
                const x = centerX + Math.cos(angle + time * 0.8) * radius;
                const y = centerY + Math.sin(angle + time * 0.8) * radius;
                
                const hue = (angle * 57.3 + time * 80 + colorOffset * 60) % 360;
                const alpha = 0.6 * (1 - radius / (Math.min(canvas.width, canvas.height) / 2));
                
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 15);
                gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${alpha})`);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(x, y, 15, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Layer 3: Swirling particles
        ctx.globalAlpha = 0.6;
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 4 + time * 1.5;
            const radius = Math.sin(time * 0.8 + i * 0.05) * 200 + 250;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            const size = Math.abs(Math.sin(time * 2 + i * 0.08)) * 8 + 2;
            
            const hue = (i * 4 + time * 120 + colorOffset * 80) % 360;
            
            const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
            particleGradient.addColorStop(0, `hsl(${hue}, 100%, 80%)`);
            particleGradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.fillStyle = particleGradient;
            ctx.beginPath();
            ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset composition mode and alpha
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        
        // Add dramatic light rays
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time * 0.5;
            const length = Math.min(canvas.width, canvas.height) * 0.6;
            
            const gradient = ctx.createLinearGradient(
                centerX, centerY,
                centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length
            );
            
            const hue = (i * 45 + time * 40 + colorOffset * 60) % 360;
            gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.3)`);
            gradient.addColorStop(0.7, `hsla(${hue}, 70%, 40%, 0.1)`);
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + Math.cos(angle) * length, centerY + Math.sin(angle) * length);
            ctx.stroke();
        }
        
        // Final dramatic text effect
        ctx.font = 'bold 84px Courier New';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textHue = (time * 80 + colorOffset * 40) % 360;
        const scale = 1 + Math.sin(time * 3) * 0.15;
        const textAlpha = 0.8 + Math.sin(time * 4) * 0.2;
        
        // Text shadow/glow effect
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = textAlpha * (0.3 - i * 0.1);
            ctx.fillStyle = `hsl(${textHue}, 100%, ${90 - i * 10}%)`;
            
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(scale + i * 0.02, scale + i * 0.02);
            ctx.fillText('CYBER HACKER', 0, 0);
            ctx.restore();
        }
        
        // Main text
        ctx.globalAlpha = 1;
        ctx.fillStyle = `hsl(${textHue}, 100%, 95%)`;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.scale(scale, scale);
        ctx.fillText('CYBER HACKER', 0, 0);
        ctx.restore();
        
        // Add subtitle
        ctx.font = 'bold 24px Courier New';
        ctx.fillStyle = `hsl(${(textHue + 180) % 360}, 80%, 70%)`;
        ctx.globalAlpha = 0.8 + Math.sin(time * 2) * 0.2;
        ctx.fillText('HACK THE SYSTEM', canvas.width / 2, canvas.height / 2 + 80);
        
        // Reset context
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    }

    exitDemoscene() {
        // Cleanup
        if (this.demosceneCleanup) {
            this.demosceneCleanup();
        }
        
        // Remove elements
        const container = document.getElementById('demosceneContainer');
        const styles = document.getElementById('demosceneStyles');
        
        if (container) container.remove();
        if (styles) styles.remove();
        
        // Show exit message in terminal
        setTimeout(() => {
            const terminal = document.querySelector('#terminalOutput');
            if (terminal) {
                const exitMsg = document.createElement('div');
                exitMsg.className = 'terminal-result';
                exitMsg.textContent = '🌟 Demoscene ended. Thanks for watching! 🌟';
                terminal.appendChild(exitMsg);
                terminal.scrollTop = terminal.scrollHeight;
            }
        }, 100);
    }

    // Chiptune Music System
    initializeChiptune() {
        // Use existing audio context from boot system
        const bootSystem = window.bootSystemInstance;
        if (!bootSystem) {
            console.log('Boot system not available');
            return;
        }

        // Always try to initialize audio, even if disabled (for seamless enabling)
        this.audioContext = bootSystem.audioContext;
        if (!this.audioContext) {
            console.log('No audio context available from boot system');
            return;
        }
        
        // Handle suspended audio context (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            console.log('Audio context suspended, waiting for user interaction');
            // Resume audio context on user interaction
            const resumeAudio = () => {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed successfully');
                    this.setupChiptuneNodes();
                    this.startChiptune();
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                });
                // Remove the event listeners after first interaction
                document.removeEventListener('click', resumeAudio);
                document.removeEventListener('keydown', resumeAudio);
            };
            
            document.addEventListener('click', resumeAudio, { once: true });
            document.addEventListener('keydown', resumeAudio, { once: true });
            
            // Show message to user
            const musicIndicator = document.querySelector('.music-indicator');
            if (musicIndicator) {
                musicIndicator.querySelector('.music-status').textContent = 'CLICK TO START MUSIC';
                musicIndicator.style.cursor = 'pointer';
                musicIndicator.addEventListener('click', resumeAudio, { once: true });
            }
            return;
        }
        
        // Audio context is already active, start immediately
        console.log('Audio context active, starting chiptune');
        this.setupChiptuneNodes();
        this.startChiptune();
    }

    setupChiptuneNodes() {
        if (!this.audioContext) return;
        
        try {
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
        } catch (error) {
            console.warn('Failed to setup chiptune audio nodes:', error);
        }
    }

    startChiptune() {
        if (!this.audioContext || this.audioContext.state !== 'running') {
            return;
        }

        // Song parameters - Faster, more aggressive hacker style
        this.bpm = 160; // Increased tempo for more energy
        this.noteLength = (60 / this.bpm) / 4; // 16th note length
        this.songPosition = 0;
        this.patternLength = 16; // 16 beats per pattern
        
        // Hacker-style chord progression (minor keys, dissonant intervals)
        this.chords = [
            // Pattern 1: Em - Am - Dm - G (classic hacker progression)
            [164.81, 196, 246.94], // Em
            [220, 261.63, 329.63], // Am  
            [146.83, 174.61, 220], // Dm
            [196, 246.94, 293.66], // G
            // Pattern 2: Cm - Fm - Bb - Eb (darker, more aggressive)
            [130.81, 155.56, 196], // Cm
            [174.61, 207.65, 261.63], // Fm
            [116.54, 138.59, 174.61], // Bb
            [155.56, 185, 233.08], // Eb
            // Pattern 3: Bm - Em - Am - D (cyberpunk style)
            [123.47, 146.83, 185], // Bm
            [164.81, 196, 246.94], // Em
            [220, 261.63, 329.63], // Am
            [146.83, 174.61, 220], // D
        ];

        // Aggressive melody patterns with hacker-style intervals
        this.melodyPatterns = [
            // Pattern 1: Main hacker theme (tritones and minor seconds)
            [440, 0, 554.37, 0, 659.25, 0, 554.37, 440, 415.30, 0, 440, 0, 554.37, 0, 0, 0],
            // Pattern 2: Descending hacker line
            [659.25, 0, 554.37, 0, 440, 0, 415.30, 0, 392, 0, 349.23, 0, 392, 440, 0, 0],
            // Pattern 3: Aggressive arpeggio
            [880, 0, 0, 783.99, 0, 659.25, 0, 554.37, 440, 0, 415.30, 0, 392, 0, 349.23, 0],
            // Pattern 4: Chromatic hacker line
            [440, 415.30, 392, 0, 440, 0, 415.30, 392, 0, 349.23, 392, 415.30, 440, 0, 0, 0],
            // Pattern 5: High energy cyberpunk
            [880, 0, 783.99, 0, 659.25, 0, 554.37, 0, 440, 0, 415.30, 0, 392, 0, 349.23, 0],
            // Pattern 6: Dark ambient
            [220, 0, 0, 207.65, 0, 196, 0, 185, 174.61, 0, 164.81, 0, 155.56, 0, 146.83, 0]
        ];

        // Heavy bass patterns with syncopation
        this.bassPatterns = [
            [82.41, 0, 0, 0, 73.42, 0, 0, 0, 98, 0, 0, 0, 87.31, 0, 0, 0], // Pattern 1
            [110, 0, 0, 0, 98, 0, 0, 0, 73.42, 0, 0, 0, 87.31, 0, 0, 0],   // Pattern 2
            [65.41, 0, 0, 0, 58.27, 0, 0, 0, 77.78, 0, 0, 0, 69.30, 0, 0, 0], // Pattern 3
        ];

        // Aggressive drum patterns
        this.drumPattern = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]; // Heavy kick
        this.hihatPattern = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]; // Hi-hat
        this.snarePattern = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]; // Snare on 2 and 4

        // Add noise effects for hacker atmosphere
        this.noisePattern = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0]; // Digital noise

        this.isPlaying = true;
        this.startTime = this.audioContext.currentTime;
        
        // Start the music loop
        this.scheduleNextNote();
        
        // Update music indicator
        this.updateMusicIndicator();
    }

    scheduleNextNote() {
        if (!this.isPlaying) return;

        const currentTime = this.audioContext.currentTime;
        const nextNoteTime = this.startTime + (this.songPosition * this.noteLength);

        if (nextNoteTime <= currentTime + 0.1) { // Schedule slightly ahead
            this.playNote(nextNoteTime);
            this.songPosition++;
            
            // Loop the song (8 patterns of 16 beats each = 128 beats total)
            if (this.songPosition >= 128) {
                this.songPosition = 0;
            }
        }

        // Schedule next iteration
        setTimeout(() => this.scheduleNextNote(), 10);
    }

    playNote(time) {
        const patternIndex = Math.floor(this.songPosition / this.patternLength);
        const noteIndex = this.songPosition % this.patternLength;
        
        // Play melody
        this.playMelodyNote(time, patternIndex, noteIndex);
        
        // Play bass
        this.playBassNote(time, patternIndex, noteIndex);
        
        // Play drums
        this.playDrumNote(time, noteIndex);
        
        // Play arpeggios on certain patterns
        if (patternIndex >= 4) {
            this.playArpeggio(time, patternIndex, noteIndex);
        }
    }

    playMelodyNote(time, patternIndex, noteIndex) {
        const melodyPattern = this.melodyPatterns[patternIndex % this.melodyPatterns.length];
        const frequency = melodyPattern[noteIndex];
        
        if (frequency > 0) {
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(frequency, time);
            
            // ADSR envelope for melody
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.15, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.1, time + 0.1);
            gain.gain.linearRampToValueAtTime(0, time + this.noteLength);
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.start(time);
            oscillator.stop(time + this.noteLength);
        }
    }

    playBassNote(time, patternIndex, noteIndex) {
        const bassPattern = this.bassPatterns[patternIndex % this.bassPatterns.length];
        const frequency = bassPattern[noteIndex];
        
        if (frequency > 0) {
            const oscillator = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(frequency, time);
            
            // Bass envelope
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.2, time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.05, time + 0.2);
            gain.gain.linearRampToValueAtTime(0, time + this.noteLength * 2);
            
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            
            oscillator.start(time);
            oscillator.stop(time + this.noteLength * 2);
        }
    }

    playDrumNote(time, noteIndex) {
        // Kick drum (heavier, more aggressive)
        if (this.drumPattern[noteIndex]) {
            const kickOsc = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();
            
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(80, time); // Higher frequency for more punch
            kickOsc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
            
            kickGain.gain.setValueAtTime(0.4, time); // Louder
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
            
            kickOsc.connect(kickGain);
            kickGain.connect(this.masterGain);
            
            kickOsc.start(time);
            kickOsc.stop(time + 0.15);
        }

        // Hi-hat (sharper, more digital)
        if (this.hihatPattern[noteIndex]) {
            const bufferSize = 1024; // Smaller buffer for sharper sound
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            const hihatGain = this.audioContext.createGain();
            const hihatFilter = this.audioContext.createBiquadFilter();
            
            noise.buffer = buffer;
            hihatFilter.type = 'highpass';
            hihatFilter.frequency.setValueAtTime(12000, time); // Higher frequency for digital feel
            
            hihatGain.gain.setValueAtTime(0.08, time);
            hihatGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03); // Shorter decay
            
            noise.connect(hihatFilter);
            hihatFilter.connect(hihatGain);
            hihatGain.connect(this.masterGain);
            
            noise.start(time);
            noise.stop(time + 0.03);
        }

        // Snare drum (digital, aggressive)
        if (this.snarePattern && this.snarePattern[noteIndex]) {
            const snareOsc = this.audioContext.createOscillator();
            const snareGain = this.audioContext.createGain();
            const snareFilter = this.audioContext.createBiquadFilter();
            
            snareOsc.type = 'square';
            snareOsc.frequency.setValueAtTime(200, time);
            
            snareFilter.type = 'bandpass';
            snareFilter.frequency.setValueAtTime(800, time);
            snareFilter.Q.setValueAtTime(10, time);
            
            snareGain.gain.setValueAtTime(0.3, time);
            snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            snareOsc.connect(snareFilter);
            snareFilter.connect(snareGain);
            snareGain.connect(this.masterGain);
            
            snareOsc.start(time);
            snareOsc.stop(time + 0.1);
        }

        // Digital noise effects (hacker atmosphere)
        if (this.noisePattern && this.noisePattern[noteIndex]) {
            const bufferSize = 512;
            const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = this.audioContext.createBufferSource();
            const noiseGain = this.audioContext.createGain();
            const noiseFilter = this.audioContext.createBiquadFilter();
            
            noise.buffer = buffer;
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(2000, time);
            
            noiseGain.gain.setValueAtTime(0.05, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            noise.start(time);
            noise.stop(time + 0.2);
        }
    }

    playArpeggio(time, patternIndex, noteIndex) {
        // Play arpeggiated chords for variety
        if (noteIndex % 4 === 0) {
            const chordIndex = Math.floor(patternIndex / 2) % this.chords.length;
            const chord = this.chords[chordIndex];
            
            chord.forEach((frequency, index) => {
                const arpTime = time + (index * this.noteLength / 4);
                
                const oscillator = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(frequency * 2, arpTime); // Octave higher
                
                gain.gain.setValueAtTime(0, arpTime);
                gain.gain.linearRampToValueAtTime(0.08, arpTime + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, arpTime + 0.1);
                
                oscillator.connect(gain);
                gain.connect(this.masterGain);
                
                oscillator.start(arpTime);
                oscillator.stop(arpTime + 0.1);
            });
        }
    }

    stopChiptune() {
        this.isPlaying = false;
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
    }

    toggleMusic() {
        if (this.isPlaying) {
            this.stopChiptune();
            this.updateMusicIndicator();
        } else {
            this.startChiptune();
            this.updateMusicIndicator();
        }
    }

    updateMusicIndicator() {
        const musicIndicator = document.querySelector('.music-indicator');
        const bootSystem = window.bootSystemInstance;
        
        if (musicIndicator) {
            if (bootSystem && bootSystem.audioEnabled) {
                musicIndicator.style.display = 'flex';
                
                // Check if audio context is running
                if (this.audioContext && this.audioContext.state === 'running') {
                    musicIndicator.querySelector('.music-status').textContent = 'CHIPTUNE ACTIVE';
                    musicIndicator.querySelector('.music-note').style.animation = 'musicBounce 0.6s ease-in-out infinite alternate';
                    musicIndicator.querySelector('.music-note').style.opacity = '1';
                } else if (this.audioContext && this.audioContext.state === 'suspended') {
                    musicIndicator.querySelector('.music-status').textContent = 'CLICK TO START MUSIC';
                    musicIndicator.querySelector('.music-note').style.animation = 'none';
                    musicIndicator.querySelector('.music-note').style.opacity = '0.7';
                    musicIndicator.style.cursor = 'pointer';
                } else {
                    musicIndicator.querySelector('.music-status').textContent = 'AUDIO INITIALIZING';
                    musicIndicator.querySelector('.music-note').style.animation = 'none';
                    musicIndicator.querySelector('.music-note').style.opacity = '0.5';
                }
            } else {
                musicIndicator.style.display = 'flex';
                musicIndicator.querySelector('.music-status').textContent = 'AUDIO DISABLED';
                musicIndicator.querySelector('.music-note').style.animation = 'none';
                musicIndicator.querySelector('.music-note').style.opacity = '0.3';
                musicIndicator.style.cursor = 'default';
            }
        }
    }
}
