/**
 * @file Handles terminal functionality, command parsing, and execution.
 * @author Jared U.
 */

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

        this.setupEventListeners();
        this.loadHistory();
        this.initializeCommands();

        // Focus the input element after a brief delay
        setTimeout(() => this.inputElement.focus(), 100);

        // Track performance metrics
        this.performanceMetrics = new Map();
    }

    /**
     * Sets up event listeners for the terminal input and window resize.
     * @private
     * @memberof Terminal
     */
    setupEventListeners() {
        this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e), { capture: true });
        this.inputElement.addEventListener('input', () => this.handleInput(), { passive: true });
        window.addEventListener('resize', () => this.handleResize(), { passive: true });
    }

    /**
     * Handles keydown events in the terminal input.
     * @param {KeyboardEvent} e - The keyboard event.
     * @private
     * @memberof Terminal
     */
    handleKeyDown(e) {
        performanceMonitor.startMeasure('terminalKeyDown');
        try {
            this.playTypingSound(e.key);
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.executeCommand();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateHistory('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateHistory('down');
                    break;
                case 'Tab':
                    e.preventDefault();
                    this.handleTabCompletion();
                    break;
                default:
                    if (e.ctrlKey && e.key === 'l') {
                        e.preventDefault();
                        this.clear();
                    }
            }
        } finally {
            performanceMonitor.endMeasure('terminalKeyDown');
        }
    }

    /**
     * Plays typing sound using the boot system.
     * @param {string} key - The key that was pressed.
     * @private
     * @memberof Terminal
     */
    async playTypingSound(key) {
        if (window.bootSystemInstance && window.bootSystemInstance.mechvibesPlayer) {
            try {
                await window.bootSystemInstance.mechvibesPlayer.playKeySound(key);
            } catch (error) {
                console.warn('Failed to play mechvibes sound:', error);
            }
        }
    }

    /**
     * Updates the current input value.
     * @private
     * @memberof Terminal
     */
    handleInput() {
        this.currentInput = this.inputElement.value;
    }

    /**
     * Handles window resize.
     * @private
     * @memberof Terminal
     */
    handleResize() {
        this.scrollToBottom();
    }

    /**
     * Navigates through command history.
     * @param {'up' | 'down'} direction - Navigation direction.
     * @private
     * @memberof Terminal
     */
    navigateHistory(direction) {
        if (this.history.length === 0) return;
        performanceMonitor.startMeasure('historyNavigation');
        try {
            if (direction === 'up' && this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
            } else if (direction === 'down' && this.historyIndex > -1) {
                this.historyIndex--;
            }
            this.inputElement.value = this.historyIndex === -1
                ? this.currentInput
                : this.history[this.history.length - 1 - this.historyIndex];
        } finally {
            performanceMonitor.endMeasure('historyNavigation');
        }
    }

    /**
     * Handles tab completion.
     * @private
     * @memberof Terminal
     */
    handleTabCompletion() {
        performanceMonitor.startMeasure('tabCompletion');
        try {
            const input = this.inputElement.value.trim();
            if (!input) return;
            const matchingCommands = Array.from(this.commands.keys()).filter(cmd => cmd.startsWith(input));
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
     * Executes the current command.
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
            if (!command) return;
            this.addToHistory(command);
            this.displayCommand(command);
            const [cmd, ...args] = command.split(/\s+/).filter(Boolean);
            const sanitizedCmd = cmd.toLowerCase().replace(/[^a-z0-9-]/g, '');
            if (this.commands.has(sanitizedCmd)) {
                const result = await this.commands.get(sanitizedCmd)(args);
                await this.handleCommandResult(result, command);
            } else {
                throw new AppError(`Command not found: ${cmd}`, ErrorTypes.VALIDATION);
            }
        } catch (error) {
            this.handleCommandError(error);
        } finally {
            this.isProcessing = false;
            performanceMonitor.endMeasure('commandExecution');
            if (this.commandQueue.length > 0) {
                this.inputElement.value = this.commandQueue.shift();
                setTimeout(() => this.executeCommand(), 100);
            }
        }
    }

    /**
     * Displays the command in output.
     * @param {string} command - The command.
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
     * Handles command result.
     * @param {string | Promise<string>} result - Result.
     * @param {string} command - Command.
     * @private
     * @memberof Terminal
     */
    async handleCommandResult(result, command = '') {
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-result';
        let output = result instanceof Promise ? await result : result;
        this.formatOutput(output, resultElement);
        this.outputElement.appendChild(resultElement);
        if (this.isDocumentContent(command, output)) {
            this.scrollToTop();
        } else {
            this.scrollToBottom();
        }
    }

    /**
     * Handles command error.
     * @param {Error} error - Error.
     * @private
     * @memberof Terminal
     */
    handleCommandError(error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'terminal-error';
        errorElement.textContent = `Error: ${error.message}`;
        this.outputElement.appendChild(errorElement);
        this.scrollToBottom();
        eventEmitter.emit('terminalError', { error });
    }

    /**
     * Formats output.
     * @param {any} output - Output.
     * @param {HTMLElement} element - Element.
     * @private
     * @memberof Terminal
     */
    formatOutput(output, element) {
        if (typeof output === 'string') {
            element[/<\w+/.test(output) ? 'innerHTML' : 'textContent'] = output;
        } else if (Array.isArray(output)) {
            element.textContent = output.join('\n');
        } else if (typeof output === 'object' && output !== null) {
            element.textContent = JSON.stringify(output, null, 2);
        } else {
            element.textContent = String(output);
        }
    }

    /**
     * Adds to history.
     * @param {string} command - Command.
     * @private
     * @memberof Terminal
     */
    addToHistory(command) {
        this.history.push(command);
        if (this.history.length > this.maxHistorySize) this.history.shift();
        this.historyIndex = -1;
        this.saveHistory();
    }

    /**
     * Loads history from storage.
     * @private
     * @memberof Terminal
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('terminalHistory');
            if (saved) this.history = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load history:', e);
        }
    }

    /**
     * Saves history to storage.
     * @private
     * @memberof Terminal
     */
    saveHistory() {
        try {
            localStorage.setItem('terminalHistory', JSON.stringify(this.history));
        } catch (e) {
            console.error('Failed to save history:', e);
        }
    }

    /**
     * Writes output.
     * @param {string} content - Content.
     */
    writeOutput(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.outputElement.appendChild(div);
        this.trimOutput();
        this.scrollToBottom();
    }

    /**
     * Trims output if too long.
     * @private
     * @memberof Terminal
     */
    trimOutput() {
        while (this.outputElement.textContent.length > this.maxOutputLength) {
            this.outputElement.removeChild(this.outputElement.firstChild);
        }
    }

    /**
     * Scrolls to bottom.
     * @private
     */
    scrollToBottom() {
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    /**
     * Scrolls to top.
     * @private
     */
    scrollToTop() {
        this.outputElement.scrollTop = 0;
    }

    /**
     * Checks if content is document-like.
     * @param {string} command - Command.
     * @param {string} output - Output.
     * @returns {boolean}
     * @private
     */
    isDocumentContent(command, output) {
        return command.includes('show resume') || command.includes('show jared') || 
               (typeof output === 'string' && output.includes('terminal-heading'));
    }

    /**
     * Clears output.
     * @returns {string}
     */
    clear() {
        this.outputElement.innerHTML = '';
        return '';
    }

    /**
     * Clears input.
     * @private
     */
    clearInput() {
        this.inputElement.value = '';
        this.currentInput = '';
    }

    /**
     * Initializes commands.
     * @private
     * @memberof Terminal
     */
    initializeCommands() {
        const commandGroups = [
            this.getCoreCommands(),
            this.getNetworkCommands(),
            this.getResumeCommands(),
            this.getAudioCommands(),
            this.getEffectsCommands(),
            this.getAppControlCommands(),
            this.getSystemControlCommands(),
            this.getCiscoCommands()
        ];

        commandGroups.flat().forEach(({ name, handler }) => {
            this.commands.set(name, handler.bind(this));
        });
    }

    /**
     * Get core commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getCoreCommands() {
        return [
            { name: 'help', handler: this.showHelp },
            { name: 'ping', handler: this.handlePing },
            { name: 'show', handler: this.handleShow },
            { name: 'clear', handler: this.clear },
            { name: 'tracert', handler: this.handleTracert },
            { name: 'traceroute', handler: this.handleTracert },
            { name: 'nslookup', handler: this.handleNslookup },
            { name: 'dig', handler: this.handleNslookup },
            { name: 'arp', handler: this.handleArp },
            { name: 'route', handler: this.handleRoute },
            { name: 'ifconfig', handler: () => CONFIG.COMMANDS.IFCONFIG },
            { name: 'netstat', handler: () => CONFIG.COMMANDS.NETSTAT },
            { name: 'ls', handler: () => 'resume.txt  codex.txt  network-configs/  scripts/' },
            { name: 'pwd', handler: () => '/home/jared' },
            { name: 'whoami', handler: () => 'jared - Senior Network Engineer' },
            { name: 'date', handler: () => new Date().toString() },
            { name: 'uptime', handler: () => 'System uptime: 15+ years in networking' }
        ];
    }

    /**
     * Get network commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getNetworkCommands() {
        return [
            { name: 'ssh', handler: this.handleSSH },
            { name: 'telnet', handler: () => 'Telnet is disabled for security. Use SSH instead.' }
        ];
    }

    /**
     * Get resume commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getResumeCommands() {
        return [
            { name: 'resume', handler: this.showResume },
            { name: 'jared', handler: this.showResume }
        ];
    }

    /**
     * Get audio commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getAudioCommands() {
        return [
            { name: 'test-audio', handler: this.testAudio },
            { name: 'play-music', handler: this.playMusic },
            { name: 'pause-music', handler: this.pauseMusic },
            { name: 'mechvibes', handler: this.handleMechvibes },
            { name: 'keyboard', handler: this.handleMechvibes },
            { name: 'kb', handler: this.handleMechvibes },
            { name: 'mechvibes-status', handler: this.handleMechvibesStatus },
            { name: 'audio', handler: this.handleAudioControl }
        ];
    }

    /**
     * Get effects commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getEffectsCommands() {
        return [
            { name: 'bg', handler: this.handleBackground },
            { name: 'particles', handler: this.handleParticles },
            { name: 'fx', handler: this.handleEffects }
        ];
    }

    /**
     * Get app control commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getAppControlCommands() {
        return [
            { name: 'launch', handler: this.handleLaunch },
            { name: 'open', handler: this.handleLaunch },
            { name: 'start', handler: this.handleLaunch },
            { name: 'apps', handler: this.listApps },
            { name: 'windows', handler: this.listWindows },
            { name: 'close', handler: this.handleClose },
            { name: 'focus', handler: this.handleFocus },
            { name: 'desktop', handler: this.handleDesktop },
            { name: 'network', handler: this.handleNetworkControl },
            { name: 'devices', handler: this.handleDeviceControl },
            { name: 'status', handler: this.handleStatusControl },
            { name: 'skills', handler: this.handleSkillsControl },
            { name: 'projects', handler: this.handleProjectsControl }
        ];
    }

    /**
     * Get system control commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getSystemControlCommands() {
        return [
            { name: 'system', handler: this.handleSystemControl },
            { name: 'theme', handler: this.handleThemeControl },
            { name: 'performance', handler: this.handlePerformanceControl },
            { name: 'screensaver', handler: this.handleScreensaverControl },
            { name: 'ss', handler: this.handleScreensaverControl }
        ];
    }

    /**
     * Get Cisco-style commands.
     * @returns {Array<{name: string, handler: Function}>}
     * @private
     */
    getCiscoCommands() {
        return [
            { name: 'configure', handler: () => 'Entering configuration mode...\nType "exit" to return to privileged EXEC mode.' },
            { name: 'interface', handler: () => 'Interface configuration not available in demo mode.' },
            { name: 'vlan', handler: () => 'VLAN configuration not available in demo mode.' },
            { name: 'ospf', handler: () => 'OSPF configuration not available in demo mode.' },
            { name: 'bgp', handler: () => 'BGP configuration not available in demo mode.' },
            { name: 'eigrp', handler: () => 'EIGRP configuration not available in demo mode.' },
            { name: 'access-list', handler: () => 'Access list configuration not available in demo mode.' },
            { name: 'logging', handler: this.handleLogging },
            { name: 'monitor', handler: () => 'Monitoring not available in demo mode.' },
            { name: 'debug', handler: () => 'Debug mode not available in demo mode.' },
            { name: 'reload', handler: () => 'Reload not available in demo mode.' },
            { name: 'copy', handler: () => 'Copy command not available in demo mode.' },
            { name: 'write', handler: () => 'Write command not available in demo mode.' },
            { name: 'erase', handler: () => 'Erase command not available in demo mode.' },
            { name: 'terminal', handler: () => 'Terminal configuration not available in demo mode.' },
            { name: 'line', handler: () => 'Line configuration not available in demo mode.' },
            { name: 'username', handler: () => 'Username configuration not available in demo mode.' },
            { name: 'enable', handler: () => 'Already in privileged EXEC mode.' },
            { name: 'disable', handler: () => 'Disabling privileged mode...\nType "enable" to return to privileged EXEC mode.' },
            { name: 'exit', handler: () => 'Exiting...' },
            { name: 'end', handler: () => 'Exiting configuration mode...' }
        ];
    }

    // ===== COMMAND HANDLERS =====

    /**
     * Shows help information.
     * @returns {string}
     * @memberof Terminal
     */
    showHelp() {
        return `
<div class="terminal-heading">neuOS Terminal Help</div>

<b>Core Commands:</b>
• help - Show this help
• clear - Clear terminal output
• ls - List files
• pwd - Show current directory
• whoami - Show user info
• date - Show current date/time
• uptime - Show system uptime

<b>Network Commands:</b>
• ping [host] - Ping a host
• tracert [host] - Trace route to host
• nslookup [domain] - DNS lookup
• arp - Show ARP table
• route - Show routing table
• ifconfig - Show network interfaces
• netstat - Show network connections
• ssh [host] - SSH to host
• telnet [host] - Telnet to host (disabled)

<b>Resume Commands:</b>
• resume - Show resume
• jared - Show resume
• show resume - Show resume
• show jared - Show resume

<b>Audio Commands:</b>
• test-audio - Test audio system
• play-music - Play background music
• pause-music - Pause background music
• mechvibes - Toggle keyboard sounds
• keyboard - Toggle keyboard sounds
• kb - Toggle keyboard sounds
• audio - Audio control menu

<b>Effects Commands:</b>
• bg [type] - Change background
• particles [on/off] - Toggle particles
• fx [effect] - Apply visual effects

<b>App Control:</b>
• launch [app] - Launch application
• open [app] - Open application
• apps - List available apps
• windows - List open windows
• close [window] - Close window
• focus [window] - Focus window
• desktop - Show desktop

<b>System Control:</b>
• system - System control menu
• theme [theme] - Change theme
• performance - Performance metrics
• screensaver - Screensaver control
• ss - Screensaver control

<b>Cisco Commands:</b>
• configure - Enter config mode
• interface - Interface config
• vlan - VLAN config
• ospf - OSPF config
• bgp - BGP config
• eigrp - EIGRP config
• access-list - ACL config
• logging - Logging config
• monitor - Monitoring
• debug - Debug mode
• reload - Reload system
• copy - Copy files
• write - Write config
• erase - Erase config
• terminal - Terminal config
• line - Line config
• username - Username config
• enable - Enable mode
• disable - Disable mode
• exit - Exit current mode
• end - Exit config mode

<b>Special Commands:</b>
• show demoscene - Show demoscene
• show chiptune - Show chiptune
• show secret - Show secret website

Type any command followed by --help for detailed usage.
        `;
    }

    /**
     * Handles ping command.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handlePing(args) {
        const host = args[0] || 'localhost';
        return `Pinging ${host}...\nReply from ${host}: time=1ms\nReply from ${host}: time=2ms\nReply from ${host}: time=1ms\nReply from ${host}: time=3ms\n\nPing statistics for ${host}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`;
    }

    /**
     * Handles show command.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleShow(args) {
        const subcommand = args[0]?.toLowerCase();
        
        switch (subcommand) {
            case 'resume':
            case 'jared':
                return this.showResume();
            case 'demoscene':
                return this.showDemoscene();
            case 'chiptune':
                return this.showChiptune();
            case 'secret':
                return this.showSecret();
            default:
                return `Available show commands:\n• show resume - Show resume\n• show jared - Show resume\n• show demoscene - Show demoscene\n• show chiptune - Show chiptune\n• show secret - Show secret website`;
        }
    }

    /**
     * Handles traceroute command.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleTracert(args) {
        const host = args[0] || 'google.com';
        return `Tracing route to ${host}\n1  1ms  1ms  1ms  router.local\n2  2ms  2ms  2ms  isp-gateway.com\n3  3ms  3ms  3ms  backbone-router.net\n4  4ms  4ms  4ms  ${host}`;
    }

    /**
     * Handles nslookup command.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleNslookup(args) {
        const domain = args[0] || 'google.com';
        return `Server: 8.8.8.8\nAddress: 8.8.8.8#53\n\nNon-authoritative answer:\nName: ${domain}\nAddress: 142.250.190.78`;
    }

    /**
     * Handles ARP command.
     * @returns {string}
     * @memberof Terminal
     */
    handleArp() {
        return `Interface: 192.168.1.100 --- 0x2\nInternet Address      Physical Address      Type\n192.168.1.1           aa-bb-cc-dd-ee-ff     dynamic\n192.168.1.100         aa-bb-cc-dd-ee-ff     dynamic`;
    }

    /**
     * Handles route command.
     * @returns {string}
     * @memberof Terminal
     */
    handleRoute() {
        return `Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\ndefault         192.168.1.1     0.0.0.0         UG    0      0        0 eth0\n192.168.1.0     *               255.255.255.0   U     0      0        0 eth0`;
    }

    /**
     * Handles SSH command.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleSSH(args) {
        const host = args[0] || 'server.example.com';
        return `SSH to ${host}...\nConnecting to ${host}...\nAuthenticating...\nWelcome to ${host}!`;
    }

    /**
     * Shows resume.
     * @returns {string}
     * @memberof Terminal
     */
    showResume() {
        return `
<div class="terminal-heading">Jared U. - Senior Network Engineer</div>

<b>Contact Information:</b>
• Email: jared@example.com
• Phone: (555) 123-4567
• Location: San Francisco, CA
• LinkedIn: linkedin.com/in/jaredu

<b>Professional Summary:</b>
Senior Network Engineer with 15+ years of experience designing, implementing, and maintaining enterprise network infrastructure. Expert in Cisco technologies, network security, and cloud networking solutions.

<b>Technical Skills:</b>
• <b>Networking:</b> Cisco IOS/NX-OS, BGP, OSPF, EIGRP, MPLS, VLANs, VPNs
• <b>Security:</b> Firewalls, IDS/IPS, NAC, 802.1X, SSL/TLS, PKI
• <b>Cloud:</b> AWS, Azure, GCP, SD-WAN, Network Automation
• <b>Tools:</b> Wireshark, SolarWinds, PRTG, Ansible, Python
• <b>Protocols:</b> TCP/IP, HTTP/HTTPS, DNS, DHCP, SNMP, NetFlow

<b>Work Experience:</b>

<b>Senior Network Engineer</b> - TechCorp Inc. (2020-Present)
• Design and implement enterprise network solutions
• Manage 500+ network devices across 50+ locations
• Lead network security initiatives and compliance projects
• Mentor junior engineers and provide technical guidance

<b>Network Engineer</b> - NetSolutions Ltd. (2015-2020)
• Maintained and optimized corporate network infrastructure
• Implemented network monitoring and alerting systems
• Reduced network downtime by 40% through proactive maintenance
• Collaborated with security team on network hardening

<b>Network Administrator</b> - DataFlow Systems (2010-2015)
• Managed day-to-day network operations
• Implemented network automation scripts
• Provided technical support to end users
• Maintained network documentation and procedures

<b>Education:</b>
• <b>Bachelor of Science in Computer Science</b> - University of Technology
• <b>Cisco Certified Internetwork Expert (CCIE)</b> - Routing & Switching
• <b>Cisco Certified Network Professional (CCNP)</b> - Security
• <b>CompTIA Network+</b> Certification

<b>Certifications:</b>
• CCIE Routing & Switching
• CCNP Security
• AWS Certified Advanced Networking
• Azure Network Engineer Associate
• CompTIA Network+
• CompTIA Security+

<b>Projects:</b>
• <b>Enterprise Network Redesign:</b> Migrated 1000+ devices to new architecture
• <b>Security Implementation:</b> Deployed zero-trust network access
• <b>Cloud Migration:</b> Migrated on-premises infrastructure to hybrid cloud
• <b>Automation Initiative:</b> Reduced manual tasks by 60% through automation

<b>Languages:</b>
• English (Native)
• Spanish (Conversational)

<b>Interests:</b>
• Network Security
• Cloud Computing
• Network Automation
• Open Source Networking Tools
• Technology Blogging
• Mentoring Junior Engineers

For more detailed information, visit: <a href="#" onclick="window.open('resume.txt')">resume.txt</a>
        `;
    }

    /**
     * Tests audio system.
     * @returns {string}
     * @memberof Terminal
     */
    testAudio() {
        if (window.bootSystemInstance && window.bootSystemInstance.mechvibesPlayer) {
            window.bootSystemInstance.mechvibesPlayer.playKeySound('test');
            return 'Audio test completed. You should hear a typing sound.';
        }
        return 'Audio system not available.';
    }

    /**
     * Plays background music.
     * @returns {string}
     * @memberof Terminal
     */
    playMusic() {
        if (window.bootSystemInstance && window.bootSystemInstance.audioPlayer) {
            window.bootSystemInstance.audioPlayer.play();
            return 'Background music started.';
        }
        return 'Audio player not available.';
    }

    /**
     * Pauses background music.
     * @returns {string}
     * @memberof Terminal
     */
    pauseMusic() {
        if (window.bootSystemInstance && window.bootSystemInstance.audioPlayer) {
            window.bootSystemInstance.audioPlayer.pause();
            return 'Background music paused.';
        }
        return 'Audio player not available.';
    }

    /**
     * Handles mechvibes keyboard sounds.
     * @returns {string}
     * @memberof Terminal
     */
    handleMechvibes() {
        if (window.bootSystemInstance && window.bootSystemInstance.mechvibesPlayer) {
            const isEnabled = window.bootSystemInstance.mechvibesPlayer.toggle();
            return `Keyboard sounds ${isEnabled ? 'enabled' : 'disabled'}.`;
        }
        return 'Mechvibes not available.';
    }

    /**
     * Handles mechvibes status check.
     * @returns {string}
     * @memberof Terminal
     */
    handleMechvibesStatus() {
        if (window.bootSystemInstance && window.bootSystemInstance.mechvibesPlayer) {
            return window.bootSystemInstance.mechvibesPlayer.getStatus();
        }
        return 'Mechvibes not available.';
    }

    /**
     * Handles audio control.
     * @returns {string}
     * @memberof Terminal
     */
    handleAudioControl() {
        return `
<b>Audio Control Menu:</b>
• test-audio - Test audio system
• play-music - Play background music
• pause-music - Pause background music
• mechvibes - Toggle keyboard sounds
• keyboard - Toggle keyboard sounds
• kb - Toggle keyboard sounds
        `;
    }

    /**
     * Handles background effects.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleBackground(args) {
        const type = args[0]?.toLowerCase();
        // Implementation would go here
        return `Background changed to: ${type || 'default'}`;
    }

    /**
     * Handles particle effects.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleParticles(args) {
        const action = args[0]?.toLowerCase();
        // Implementation would go here
        return `Particles ${action === 'off' ? 'disabled' : 'enabled'}.`;
    }

    /**
     * Handles visual effects.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleEffects(args) {
        const effect = args[0]?.toLowerCase();
        // Implementation would go here
        return `Effect applied: ${effect || 'none'}`;
    }

    /**
     * Handles app launch.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleLaunch(args) {
        const app = args[0]?.toLowerCase();
        if (!app) {
            return 'Usage: launch [app_name]\nAvailable apps: codex, terminal, help';
        }
        
        // Implementation would go here
        return `Launching ${app}...`;
    }

    /**
     * Lists available apps.
     * @returns {string}
     * @memberof Terminal
     */
    listApps() {
        return `
<b>Available Applications:</b>
• codex - Financial knowledge base
• terminal - This terminal
• help - Help system
• demoscene - Demoscene experience
• chiptune - Chiptune music player
        `;
    }

    /**
     * Lists open windows.
     * @returns {string}
     * @memberof Terminal
     */
    listWindows() {
        return `
<b>Open Windows:</b>
• Terminal (Active)
• Codex (Minimized)
• Help (Minimized)
        `;
    }

    /**
     * Handles window close.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleClose(args) {
        const window = args[0]?.toLowerCase();
        if (!window) {
            return 'Usage: close [window_name]';
        }
        return `Closing ${window}...`;
    }

    /**
     * Handles window focus.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleFocus(args) {
        const window = args[0]?.toLowerCase();
        if (!window) {
            return 'Usage: focus [window_name]';
        }
        return `Focusing ${window}...`;
    }

    /**
     * Handles desktop control.
     * @returns {string}
     * @memberof Terminal
     */
    handleDesktop() {
        return `
<b>Desktop Control:</b>
• Show all windows
• Minimize all windows
• Show desktop
• Arrange windows
        `;
    }

    /**
     * Handles network control.
     * @returns {string}
     * @memberof Terminal
     */
    handleNetworkControl() {
        return `
<b>Network Control:</b>
• Show network status
• Configure interfaces
• Monitor traffic
• Security settings
        `;
    }

    /**
     * Handles device control.
     * @returns {string}
     * @memberof Terminal
     */
    handleDeviceControl() {
        return `
<b>Device Control:</b>
• List connected devices
• Configure devices
• Monitor device status
• Device diagnostics
        `;
    }

    /**
     * Handles status control.
     * @returns {string}
     * @memberof Terminal
     */
    handleStatusControl() {
        return `
<b>Status Control:</b>
• System status
• Network status
• Service status
• Performance metrics
        `;
    }

    /**
     * Handles skills control.
     * @returns {string}
     * @memberof Terminal
     */
    handleSkillsControl() {
        return `
<b>Skills Control:</b>
• Show skills
• Add skill
• Remove skill
• Update skill level
        `;
    }

    /**
     * Handles projects control.
     * @returns {string}
     * @memberof Terminal
     */
    handleProjectsControl() {
        return `
<b>Projects Control:</b>
• List projects
• Show project details
• Add project
• Update project status
        `;
    }

    /**
     * Handles system control.
     * @returns {string}
     * @memberof Terminal
     */
    handleSystemControl() {
        return `
<b>System Control:</b>
• System information
• Performance monitoring
• Log management
• Backup and restore
        `;
    }

    /**
     * Handles theme control.
     * @param {string[]} args - Command arguments.
     * @returns {string}
     * @memberof Terminal
     */
    handleThemeControl(args) {
        const theme = args[0]?.toLowerCase();
        if (!theme) {
            return 'Usage: theme [theme_name]\nAvailable themes: dark, light, auto';
        }
        return `Theme changed to: ${theme}`;
    }

    /**
     * Handles performance control.
     * @returns {string}
     * @memberof Terminal
     */
    handlePerformanceControl() {
        return `
<b>Performance Metrics:</b>
• CPU Usage: 15%
• Memory Usage: 45%
• Network I/O: 2.3 MB/s
• Disk I/O: 1.1 MB/s
• Active Connections: 127
        `;
    }

    /**
     * Handles screensaver control.
     * @returns {string}
     * @memberof Terminal
     */
    handleScreensaverControl() {
        return `
<b>Screensaver Control:</b>
• Enable screensaver
• Disable screensaver
• Set timeout
• Configure effects
        `;
    }

    /**
     * Handles logging.
     * @returns {string}
     * @memberof Terminal
     */
    handleLogging() {
        return `
<b>Logging Configuration:</b>
• Console logging: Enabled
• File logging: Enabled
• Syslog: Disabled
• Log level: INFO
• Log rotation: Daily
        `;
    }

    /**
     * Shows demoscene.
     * @returns {string}
     * @memberof Terminal
     */
    showDemoscene() {
        // Open the demoscene website in a new window/tab
        window.open('demoscene/index.html', '_blank');
        
        return `
<div class="terminal-heading">Demoscene Experience</div>

<b>Opening Demoscene Website...</b>

The demoscene website is now opening in a new tab/window.

<b>Features:</b>
• Retro visual effects
• Chiptune music
• Particle systems
• CRT-style filters
• Vintage computer aesthetics
• WebGL rendering
• Quantum vortex effects

<b>Controls:</b>
• Mouse: Navigate effects
• Keyboard: Control music
• Space: Toggle effects
• ESC: Exit demoscene

<b>Technical Details:</b>
• WebGL rendering
• Web Audio API
• Canvas animations
• Retro shaders
• Vintage color palettes
• Quantum computing effects

The demoscene website should now be open in a new tab. If it didn't open automatically, you can manually navigate to: demoscene/index.html
        `;
    }

    /**
     * Shows chiptune.
     * @returns {string}
     * @memberof Terminal
     */
    showChiptune() {
        return `
<div class="terminal-heading">Chiptune Music Player</div>

<b>Chiptune Music System</b>

A retro-style music player featuring classic chiptune tracks and vintage computer music.

<b>Available Tracks:</b>
• Track 1: "Digital Dreams" (2:34)
• Track 2: "Retro Wave" (3:12)
• Track 3: "8-bit Adventure" (2:58)
• Track 4: "Vintage Vibes" (3:45)
• Track 5: "Pixel Perfect" (2:21)

<b>Controls:</b>
• Play/Pause: Space
• Next Track: Right Arrow
• Previous Track: Left Arrow
• Volume: Up/Down Arrows
• Mute: M

<b>Features:</b>
• Retro visualizer
• Track information
• Volume control
• Playlist management
• Vintage UI design

<b>Technical Details:</b>
• Web Audio API
• Canvas visualizer
• Retro color schemes
• Vintage typography
• Classic UI elements

Type 'show demoscene' to return to the main demoscene area.
        `;
    }

    /**
     * Shows secret website.
     * @returns {string}
     * @memberof Terminal
     */
    showSecret() {
        return `
<div class="terminal-heading">Secret Website</div>

<b>Welcome to the Secret Area!</b>

This is a hidden section of the website accessible only through the terminal.

<b>Features:</b>
• Hidden content
• Easter eggs
• Secret commands
• Hidden functionality
• Developer tools

<b>Access:</b>
• Terminal commands
• Keyboard shortcuts
• Hidden URLs
• Developer console
• Network inspection

<b>Commands:</b>
• show demoscene - Show demoscene
• show chiptune - Show chiptune
• show secret - This page

<b>Technical Details:</b>
• Hidden routes
• Secret endpoints
• Developer tools
• Console logging
• Network monitoring

This area is for developers and power users who know how to find it.
        `;
    }
}
