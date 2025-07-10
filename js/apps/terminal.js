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
        // Use arrow functions to preserve 'this' context instead of bind()
        this.inputElement.addEventListener('keydown', (e) => this.handleKeyDown(e), { capture: true });
        this.inputElement.addEventListener('input', () => this.handleInput(), { passive: true });
        
        // Handle window resize for terminal resizing
        window.addEventListener('resize', () => this.handleResize(), { passive: true });
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
            // Play typing sounds for ALL keys
            this.playTypingSound(e.key);
            
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
     * Play typing sound using the boot system
     * @param {string} key - The key that was pressed
     * @private
     * @memberof Terminal
     */
    async playTypingSound(key) {
        // Get the boot system instance and play the appropriate sound
        if (window.bootSystemInstance && window.bootSystemInstance.mechvibesPlayer) {
            try {
                await window.bootSystemInstance.mechvibesPlayer.playKeySound(key);
            } catch (error) {
                console.warn('Failed to play mechvibes sound:', error);
            }
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
        // Core commands that exist
        this.commands.set('help', this.showHelp.bind(this));
        this.commands.set('ping', this.handlePing.bind(this));
        this.commands.set('show', this.handleShow.bind(this));
        this.commands.set('clear', this.clear.bind(this));
        this.commands.set('tracert', this.handleTracert.bind(this));
        this.commands.set('traceroute', this.handleTracert.bind(this));
        this.commands.set('nslookup', this.handleNslookup.bind(this));
        this.commands.set('dig', this.handleNslookup.bind(this));
        this.commands.set('arp', () => this.handleArp());
        this.commands.set('route', () => this.handleRoute());
        
        // Resume and personal commands
        this.commands.set('resume', this.showResume.bind(this));
        this.commands.set('jared', this.showResume.bind(this));
        
        // Audio test commands
        this.commands.set('test-audio', () => this.testAudio());
        this.commands.set('play-music', () => this.playMusic());
        this.commands.set('pause-music', () => this.pauseMusic());
        
        // Mechvibes keyboard sound commands
        this.commands.set('mechvibes', this.handleMechvibes.bind(this));
        this.commands.set('keyboard', this.handleMechvibes.bind(this));
        this.commands.set('kb', this.handleMechvibes.bind(this));
        
        // Simple commands
        this.commands.set('ifconfig', () => CONFIG.COMMANDS.IFCONFIG);
        this.commands.set('netstat', () => CONFIG.COMMANDS.NETSTAT);
        this.commands.set('ls', () => 'resume.txt  codex.txt  network-configs/  scripts/');
        this.commands.set('pwd', () => '/home/jared');
        this.commands.set('whoami', () => 'jared - Senior Network Engineer');
        this.commands.set('date', () => new Date().toString());
        this.commands.set('uptime', () => 'System uptime: 15+ years in networking');
        
        // Network commands that exist
        this.commands.set('ssh', this.handleSSH.bind(this));
        this.commands.set('telnet', () => 'Telnet is disabled for security. Use SSH instead.');
        
        // Background and effects commands that exist
        this.commands.set('bg', this.handleBackground.bind(this));
        this.commands.set('particles', this.handleParticles.bind(this));
        this.commands.set('fx', this.handleEffects.bind(this));
        
        // Application launch commands that exist
        this.commands.set('launch', this.handleLaunch.bind(this));
        this.commands.set('open', this.handleLaunch.bind(this));
        this.commands.set('start', this.handleLaunch.bind(this));
        
        // Navigation and control commands that exist
        this.commands.set('apps', this.listApps.bind(this));
        this.commands.set('windows', this.listWindows.bind(this));
        this.commands.set('close', this.handleClose.bind(this));
        this.commands.set('focus', this.handleFocus.bind(this));
        this.commands.set('desktop', this.handleDesktop.bind(this));
        
        // Application control commands that exist
        this.commands.set('network', this.handleNetworkControl.bind(this));
        this.commands.set('devices', this.handleDeviceControl.bind(this));
        this.commands.set('status', this.handleStatusControl.bind(this));
        this.commands.set('skills', this.handleSkillsControl.bind(this));
        this.commands.set('projects', this.handleProjectsControl.bind(this));
        
        // System and graphics control commands that exist
        this.commands.set('system', this.handleSystemControl.bind(this));
        this.commands.set('theme', this.handleThemeControl.bind(this));
        this.commands.set('audio', this.handleAudioControl.bind(this));
        this.commands.set('performance', this.handlePerformanceControl.bind(this));
        
        // Screensaver control commands
        this.commands.set('screensaver', this.handleScreensaverControl.bind(this));
        this.commands.set('ss', this.handleScreensaverControl.bind(this));
        
        // Cisco-style commands (placeholder responses)
        this.commands.set('configure', () => 'Entering configuration mode...\nType "exit" to return to privileged EXEC mode.');
        this.commands.set('interface', () => 'Interface configuration not available in demo mode.');
        this.commands.set('vlan', () => 'VLAN configuration not available in demo mode.');
        this.commands.set('ospf', () => 'OSPF configuration not available in demo mode.');
        this.commands.set('bgp', () => 'BGP configuration not available in demo mode.');
        this.commands.set('eigrp', () => 'EIGRP configuration not available in demo mode.');
        this.commands.set('access-list', () => 'Access list configuration not available in demo mode.');
        this.commands.set('logging', this.handleLogging.bind(this));
        this.commands.set('monitor', () => 'Monitoring not available in demo mode.');
        this.commands.set('debug', () => 'Debug mode not available in demo mode.');
        this.commands.set('reload', () => 'Reload not available in demo mode.');
        this.commands.set('copy', () => 'Copy command not available in demo mode.');
        this.commands.set('write', () => 'Write command not available in demo mode.');
        this.commands.set('erase', () => 'Erase command not available in demo mode.');
        this.commands.set('terminal', () => 'Terminal configuration not available in demo mode.');
        this.commands.set('line', () => 'Line configuration not available in demo mode.');
        this.commands.set('username', () => 'Username configuration not available in demo mode.');
        this.commands.set('enable', () => 'Already in privileged EXEC mode.');
        this.commands.set('disable', () => 'Disabling privileged mode...\nType "enable" to return to privileged EXEC mode.');
        this.commands.set('exit', () => 'Exiting...');
        this.commands.set('end', () => 'Exiting configuration mode...');
    }

    /**
     * Handles the 'ping' command.
     * @param {string[]} args - The arguments for the command.
     * @returns {Promise<string>} The result of the ping.
     * @private
     * @memberof Terminal
     */
    async handlePing(args) {
        const target = args[0];
        if (!target) {
            return `Usage: ping <target>
Examples:
• ping 192.168.1.1
• ping core-switch-01
• ping google.com`;
        }
        
        return `PING ${target} (${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}): 56 data bytes
64 bytes from ${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}: icmp_seq=0 ttl=64 time=1.234 ms
64 bytes from ${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}: icmp_seq=1 ttl=64 time=0.987 ms
64 bytes from ${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}: icmp_seq=2 ttl=64 time=1.456 ms
64 bytes from ${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}: icmp_seq=3 ttl=64 time=1.123 ms
64 bytes from ${target === '192.168.1.1' ? '192.168.1.1' : '8.8.8.8'}: icmp_seq=4 ttl=64 time=0.876 ms

--- ${target} ping statistics ---
5 packets transmitted, 5 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 0.876/1.135/1.456/0.234 ms`;
    }

    /**
     * Loads and displays the resume content.
     * @returns {Promise<string>} The resume content or a fallback message.
     * @memberof Terminal
     */
    async showResume() {
        try {
            console.log('Attempting to fetch resume from:', CONFIG.PATHS.RESUME);
            const response = await fetch(CONFIG.PATHS.RESUME);
            console.log('Resume fetch response:', response.status, response.ok);
            
            if (!response.ok) {
                console.warn('Resume file not found, showing fallback content');
                return this.formatResumeAsMarkdown(this.getFallbackResume());
            }
            
            const content = await response.text();
            console.log('Resume content loaded successfully, length:', content.length);
            return this.formatResumeAsMarkdown(content);
        } catch (error) {
            console.error('Error fetching resume:', error);
            return this.formatResumeAsMarkdown(this.getFallbackResume());
        }
    }

    /**
     * Formats resume content as beautiful markdown
     * @param {string} content - Raw resume content
     * @returns {string} Formatted markdown
     */
    formatResumeAsMarkdown(content) {
        // Convert the raw resume content to beautiful markdown
        const lines = content.split('\n');
        let markdown = '';
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('@')) {
                // Header line - make it a title
                markdown += `# ${line.substring(1)}\n\n`;
            } else if (line === 'Summary') {
                markdown += `## 📋 Summary\n\n`;
            } else if (line === 'Experience') {
                markdown += `## 💼 Experience\n\n`;
            } else if (line === 'Skills') {
                markdown += `## 🛠️ Skills\n\n`;
            } else if (line === 'Certifications') {
                markdown += `## 🏆 Certifications\n\n`;
            } else if (line.match(/^[A-Z][a-zA-Z\s&]+$/)) {
                // Job title lines
                markdown += `### ${line}\n\n`;
            } else if (line.match(/^[A-Z][a-zA-Z\s,]+,\s+[A-Z]{2}$/)) {
                // Company and location lines
                markdown += `**${line}**\n\n`;
            } else if (line.match(/^[A-Z][a-z]+\s+\d{4}\s+-\s+[A-Z][a-z]+$/)) {
                // Date range lines
                markdown += `*${line}*\n\n`;
            } else if (line.startsWith('•') || line.startsWith('-')) {
                // Bullet points
                markdown += `• ${line.substring(1).trim()}\n`;
            } else if (line.match(/^[A-Z][A-Z\s]+$/)) {
                // All caps section headers
                markdown += `### ${line}\n\n`;
            } else if (line.length > 0) {
                // Regular content
                markdown += `${line}\n\n`;
            }
        }
        
        return markdown;
    }

    /**
     * Test audio functionality
     * @returns {string} Audio test results
     */
    testAudio() {
        const audioElement = document.getElementById('backgroundMusic');
        if (!audioElement) {
            return 'Audio element not found!';
        }
        
        const state = {
            paused: audioElement.paused,
            currentTime: audioElement.currentTime,
            duration: audioElement.duration,
            readyState: audioElement.readyState,
            networkState: audioElement.networkState,
            volume: audioElement.volume,
            muted: audioElement.muted
        };
        
        return `Audio Test Results:
Element found: ${!!audioElement}
Paused: ${state.paused}
Current time: ${state.currentTime}
Duration: ${state.duration}
Ready state: ${state.readyState}
Network state: ${state.networkState}
Volume: ${state.volume}
Muted: ${state.muted}

Try 'play-music' or 'pause-music' to control audio directly.`;
    }

    /**
     * Play music directly
     * @returns {string} Play result
     */
    playMusic() {
        const audioElement = document.getElementById('backgroundMusic');
        if (!audioElement) {
            return 'Audio element not found!';
        }
        
        audioElement.play().then(() => {
            console.log('Music played successfully via terminal command');
        }).catch(error => {
            console.error('Failed to play music:', error);
        });
        
        return 'Attempting to play music... Check console for results.';
    }

    /**
     * Pause music directly
     * @returns {string} Pause result
     */
    pauseMusic() {
        const audioElement = document.getElementById('backgroundMusic');
        if (!audioElement) {
            return 'Audio element not found!';
        }
        
        audioElement.pause();
        console.log('Music paused via terminal command');
        
        return 'Music paused.';
    }

    /**
     * Returns fallback resume content when the file is not available
     * @returns {string} Fallback resume content
     */
    getFallbackResume() {
        return `@JaredU_   |  Senior Network Engineer, Special Projects, Technical Consulting, Sales Engineering

Summary
    Seasoned network engineer with 15+ years of experience. Known as 'The Cleaner' for expertise in resolving complex projects and technical debt across healthcare, national retail, video gaming, public transportation, managed service provider, space communications, and manufacturing.

Experience
    Senior Network Engineer
    Denali Advanced Integrations, Redmond, WA
    December 2023 - Present
        - Designed and deployed mission-critical network infrastructure for space-to-ground communications, ensuring uninterrupted connectivity for orbital hardware testing under stringent timelines
        - Achieved a pivotal two-day turnaround to integrate a satellite into the local network, averting costly delays and enabling seamless data flow between space and ground systems
        - Pioneered network segmentation for multi-site scientific environments, completely eliminating cross-contamination risks and reducing testing incident recovery time by 48 hours

    Senior Technology Consultant
    Riverstrong, Redmond, WA
    May 2023 - October 2023
        - Deployed Cisco Meraki and Fortinet solutions for SMB clients, modernizing and updating infrastructure for Utility, Medical, and Government sectors
        - Fostered trust and restored confidence in critical client relationships through exceptional communication and strategic problem-solving, resolving complex pre-existing technical issues to retain six-figure hardware investments and secure multimillion-dollar project outcomes

    Senior Network Engineer
    Sound Transit, Seattle, WA
    April 2022 - March 2023
        - Modernized a deprecated SolarWinds infrastructure on outdated Windows servers, increasing device inventory accuracy from 78% to 100% visibility for a multi-billion-dollar statewide public transportation agency; leveraged Ansible and Python, meeting PCI compliance auditing
        - Led a statewide Retail Point of Sale system refresh, coordinating with field technicians to replace all customer-facing ORCA card systems at bus and train stations, ensuring secure and reliable transactions; earned a challenge coin for exceptional project delivery
        - Resolved multiple Priority 1 and Major Incidents for a statewide public transportation agency, addressing critical issues including a poorly deployed Cisco ISE causing wireless disruptions, data center overheating, NTP failures risking train signaling safety, and site-to-site VPN tunnel outages impacting payment processing and public Wi-Fi; restored operational stability and ensured passenger safety and service continuity

    Senior Network Engineer
    ArenaNet, Bellevue, WA
    July 2019 - April 2022
        - Spearheaded a network modernization project, implementing a state-of-the-art Arista leaf-spine architecture, Arista Cloud Vision Wireless, and Arista IDF and access-layer solutions, fully upgrading the entire network infrastructure
        - Designed and deployed Palo Alto 5250 NGFWs in HA, replacing aging single firewall design
        - Created security posture and policies implementing hundreds of unique remote workflows over client VPN to ensure operational continuity
        - Mentored help desk team over multiple years, delegating junior-level network engineering tasks like cable creation and IOS upgrades, racking and stacking, how to use IPAM, and even simple core switch changes, inspiring one member to earn their CCNA certification and enhancing overall team technical proficiency

    Network Engineer
    Bealls, Bradenton, FL
    April 2015 - December 2018
        - Orchestrated Cisco Meraki deployments across 50+ retail locations for a new boutique brand, ensuring flawless connectivity and operational continuity throughout Florida
        - Led ISP auditing and accounts initiative, saving $250,000 monthly on wasted circuit costs that were never terminated
        - Restored critical communications infrastructure for a national retailer with 550+ stores across the continental U.S. within 24 hours post-disaster, minimizing downtime and protecting $100,000–$4M in daily revenue per store using Cradlepoint 3G/4G solutions

Skills
    - Networking Technologies: Cisco, Brocade, Juniper, Palo Alto, Fortinet, Arista, Meraki, IPV4/IPV6, F5
    - Security: Isolation and Segmentation, UBAC, NGFW, VPN, Posture and Profiling, PCI, HIPAA
    - Cloud & Virtualization: AWS, Azure, VMware, Hyper-V
    - Monitoring & Analytics: SolarWinds, Splunk, Grafana, Wireshark, NetFlow, SNMP
    - Automation & Scripting: Python, Ansible, bash, git, PowerShell, IaC
    - Management & Operations: Project Management, Stakeholder Engagement, Vendor Management, Circuit Procurement, Capacity Planning, Change Management, Disaster Recovery, Priority Support
    - Soft Skills: Contracts and Negotiations, Cross-Functional Collaboration, Mentorship, Leadership, Auditing and Accounting
    - For Fun: OSINT, Web Scraping, NLP, Vibe Coding, Crypto, NFTs
    - Studying: NEBIUS AI LLM 12 week course, Nvidia Cumulus Linux AI Networking

Certifications
    - Cisco CCNA (e789b6372c2b4632ac9d485919e3e863)
    - CompTIA Security+
    - CompTIA A+`;
    }

    /**
     * Handles the 'show' command and its sub-commands.
     * @param {string[]} args - The arguments for the command.
     * @returns {string | Promise<string>} The result of the command.
     * @private
     * @memberof Terminal
     */
    async handleShow(args) {
        const subcommand = args[0] || 'help';
        
        switch (subcommand) {
            case 'resume':
            case 'jared':
                return await this.showResume();
            
            case 'running-config':
                return `Current configuration:
!
version 15.2
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname core-switch-01
!
interface GigabitEthernet1/0/1
 description Link to edge-router-01
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
interface GigabitEthernet1/0/2
 description Link to server-01
 ip address 192.168.1.2 255.255.255.0
 no shutdown
!
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
!
end`;
            
            case 'ip route':
                return `Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       * - candidate default, U - per-user static route, o - ODR
       P - periodic downloaded static route

Gateway of last resort is 192.168.1.254 to network 0.0.0.0

C    192.168.1.0/24 is directly connected, GigabitEthernet1/0/1
C    192.168.2.0/24 is directly connected, GigabitEthernet1/0/2
O    10.0.0.0/8 [110/2] via 192.168.1.254, 00:05:23, GigabitEthernet1/0/1
S*   0.0.0.0/0 [1/0] via 192.168.1.254`;
            
            case 'interface brief':
                return `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet1/0/1  192.168.1.1      YES NVRAM  up                    up
GigabitEthernet1/0/2  192.168.1.2      YES NVRAM  up                    up
GigabitEthernet1/0/3  unassigned       YES NVRAM  administratively down down
GigabitEthernet1/0/4  unassigned       YES NVRAM  administratively down down
Vlan1                  unassigned       YES NVRAM  up                    up`;
            
            case 'logging':
                return `Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)
    Console logging: level debugging, 15 messages logged
    Monitor logging: level debugging, 0 messages logged
    Buffer logging: level debugging, 15 messages logged
    Logging to: 192.168.1.100
    Logging to: 192.168.1.254

Timestamp logging: enabled
Logging host: 192.168.1.100
Logging host: 192.168.1.254`;
            
            case 'version':
                return `Cisco IOS XE Software, Version 16.12.04
Cisco IOS Software [Amsterdam], Virtual XE Software (X86_64_LINUX_IOSD-UNIVERSALK9-M), Version 16.12.4, RELEASE SOFTWARE (fc3)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2020 by Cisco Systems, Inc.
Compiled Thu 26-Mar-20 10:16 by mcpre

ROM: IOS-XE ROMMON
core-switch-01 uptime is 2 weeks, 3 days, 4 hours, 23 minutes
Uptime for this control processor is 2 weeks, 3 days, 4 hours, 25 minutes`;
            
            case 'help':
                return `Available show commands:
• show resume          - Display Jared's resume
• show jared           - Display Jared's resume
• show running-config  - Current configuration
• show ip route        - Routing table
• show interface brief - Interface status
• show logging         - Logging configuration
• show version         - System version
• show vlan            - VLAN information
• show arp             - ARP table
• show mac address-table - MAC address table`;
            
            default:
                return `Unknown show command: ${subcommand}
Type 'show help' for available commands`;
        }
    }

    handleTracert(args) {
        const target = args[0] || '8.8.8.8';
        return `Tracing route to ${target} over a maximum of 30 hops:

  1    <1 ms    <1 ms    <1 ms  192.168.1.254
  2     2 ms     2 ms     2 ms  10.0.0.1
  3     5 ms     4 ms     4 ms  172.16.0.1
  4    15 ms    15 ms    15 ms  8.8.8.8

Trace complete.`;
    }

    handleNslookup(args) {
        const target = args[0] || 'google.com';
        return `Server: 8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name: ${target}
Address: 142.250.191.78
Name: ${target}
Address: 2607:f8b0:4004:c0c::65`;
    }

    handleArp() {
        return `Protocol  Address          Age (min)  Hardware Addr   Type   Interface
Internet  192.168.1.1             -   0011.2233.4455  ARPA   GigabitEthernet1/0/1
Internet  192.168.1.254           2   0011.2233.4456  ARPA   GigabitEthernet1/0/1
Internet  192.168.1.100           5   0011.2233.4457  ARPA   GigabitEthernet1/0/2
Internet  192.168.1.10           10   0011.2233.4458  ARPA   GigabitEthernet1/0/1`;
    }

    handleRoute() {
        return `Kernel IP routing table
Destination     Gateway         Genmask         Flags   MSS Window  irtt Iface
default         192.168.1.254   0.0.0.0         UG        0 0          0 eth0
192.168.1.0     *               255.255.255.0   U         0 0          0 eth0
192.168.2.0     *               255.255.255.0   U         0 0          0 eth1
10.0.0.0       192.168.1.254   255.0.0.0       UG        0 0          0 eth0`;
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
        
        console.log('Enhanced particle command called:', args);

        const subcommand = args[0] || 'status';
        
        switch (subcommand) {
            case 'status':
                const particleCount = bootSystem.particles ? bootSystem.particles.length : 0;
                const rate = bootSystem.particleGenerationRate || 1200;
                const isRunning = bootSystem.particleAnimationRunning;
                const colorScheme = bootSystem.currentColorScheme || 'chillhouse';
                const mode = bootSystem.particleMode || 'normal';
                
                return `✨ Enhanced Particle System Status:
• Active Particles: ${particleCount} ✨
• Generation Rate: ${rate}ms ⚡
• Animation: ${isRunning ? '🟢 Running' : '🔴 Stopped'}
• Mode: ${mode} 🎭
• Color Scheme: ${colorScheme} 🌈
• Physics: ${bootSystem.particlePhysics ? 'Enabled' : 'Disabled'} ⚛️

Quick Commands:
  start/stop    - Control generation
  burst         - Create particle burst
  rain/calm/storm/dance - Set modes
  colors        - Change color scheme
  speed <level> - Adjust generation speed
  clear         - Remove all particles
  demo          - Show all features`;
            
            case 'start':
                bootSystem.particleAnimationRunning = true;
                bootSystem.startContinuousGeneration();
                return '🎉 Particle generation started! Watch the magic happen ✨';
            
            case 'stop':
                bootSystem.particleAnimationRunning = false;
                return '⏸️ Particle generation paused';
            
            case 'burst':
                const burstCount = parseInt(args[1]) || 15;
                bootSystem.createParticleBurst(burstCount);
                return `💥 Particle burst initiated! ${burstCount} particles released ✨`;
            
            case 'rain':
                bootSystem.setParticleMode('rain');
                return '🌧️ Rain mode activated - Heavy particle generation (300ms)';
            
            case 'calm':
                bootSystem.setParticleMode('calm');
                return '😌 Calm mode activated - Peaceful generation (2000ms)';
            
            case 'storm':
                bootSystem.setParticleMode('storm');
                return '⚡ Storm mode activated - Intense generation (150ms)';
            
            case 'dance':
                bootSystem.setParticleMode('dance');
                return '💃 Dance mode activated - Fun particle dance! 🎵';
            
            case 'clear':
                bootSystem.clearAllParticles();
                return '🧹 All particles cleared from screen';
            
            case 'colors':
                const scheme = args[1] || 'next';
                if (scheme === 'next') {
                    const schemes = Object.keys(bootSystem.colorSchemes);
                    const currentIndex = schemes.indexOf(bootSystem.currentColorScheme);
                    const nextIndex = (currentIndex + 1) % schemes.length;
                    bootSystem.currentColorScheme = schemes[nextIndex];
                    bootSystem.changeParticleColors();
                    return `🎨 Color scheme changed to: ${schemes[nextIndex]} ✨`;
                } else if (bootSystem.colorSchemes[scheme]) {
                    bootSystem.currentColorScheme = scheme;
                    bootSystem.changeParticleColors();
                    return `🎨 Color scheme changed to: ${scheme} ✨`;
                } else {
                    const availableSchemes = Object.keys(bootSystem.colorSchemes).join(', ');
                    return `Available color schemes: ${availableSchemes}
Usage: particles colors [scheme] or particles colors next`;
                }
            
            case 'speed':
                const speed = args[1] || 'normal';
                const speedMap = {
                    'slow': 3000,
                    'normal': 1200,
                    'fast': 600,
                    'turbo': 200,
                    'ultra': 100
                };
                
                if (speedMap[speed]) {
                    bootSystem.particleGenerationRate = speedMap[speed];
                    bootSystem.startContinuousGeneration();
                    return `⚡ Particle speed set to ${speed} (${speedMap[speed]}ms)`;
                } else {
                    return `Usage: particles speed [slow|normal|fast|turbo|ultra]`;
                }
            
            case 'demo':
                return this.runParticleDemo(bootSystem);
            
            case 'physics':
                const physicsAction = args[1];
                if (physicsAction === 'on') {
                    bootSystem.particlePhysics.enabled = true;
                    return '⚛️ Particle physics enabled';
                } else if (physicsAction === 'off') {
                    bootSystem.particlePhysics.enabled = false;
                    return '⚛️ Particle physics disabled';
                } else {
                    return `Physics: ${bootSystem.particlePhysics?.enabled ? 'On' : 'Off'}
Usage: particles physics [on|off]`;
                }
            
            case 'interactive':
                const interactiveAction = args[1];
                if (interactiveAction === 'on') {
                    document.body.classList.add('particle-interactive-mode');
                    return '🖱️ Interactive particle mode enabled - Click particles!';
                } else if (interactiveAction === 'off') {
                    document.body.classList.remove('particle-interactive-mode');
                    return '🖱️ Interactive particle mode disabled';
                } else {
                    return `Interactive: ${document.body.classList.contains('particle-interactive-mode') ? 'On' : 'Off'}
Usage: particles interactive [on|off]`;
                }
            
            case 'help':
                return `🎮 Enhanced Particle Commands:

Basic Control:
  start/stop     - Start/stop particle generation
  burst [count]  - Create particle burst (default: 15)
  clear          - Remove all particles

Modes:
  rain           - Heavy rain effect
  calm           - Peaceful floating
  storm          - Intense storm effect
  dance          - Fun dance mode

Visual:
  colors [scheme] - Change color scheme
  colors next     - Cycle to next scheme
  speed <level>   - Adjust generation speed

Advanced:
  physics [on/off]    - Toggle particle physics
  interactive [on/off] - Toggle click interactions
  demo               - Show all features

Color Schemes: chillhouse, sunset, neon, cosmic, ocean, forest
Speed Levels: slow, normal, fast, turbo, ultra

Try: particles demo 🌟`;
            
            // Legacy commands for compatibility
            case 'test':
                bootSystem.createVisibleTestParticles();
                return '🧪 Test particles created! Look for green dots.';
            
            case 'reinit':
                bootSystem.reinitializeParticleSystem();
                return '🔄 Particle system reinitialized!';
            
            case 'stats':
                return this.getEnhancedParticleStats(bootSystem);
            
            case 'debug':
                return this.getParticleDebugInfo(bootSystem);
            
            default:
                return `Unknown particle command: ${subcommand}
Type 'particles help' for available commands 🌟`;
        }
    }

    runParticleDemo(bootSystem) {
        const demoSteps = [
            { action: () => bootSystem.setParticleMode('rain'), message: '🌧️ Step 1: Rain mode' },
            { action: () => bootSystem.changeParticleColors(), message: '🎨 Step 2: Color change' },
            { action: () => bootSystem.setParticleMode('storm'), message: '⚡ Step 3: Storm mode' },
            { action: () => bootSystem.createParticleBurst(20), message: '💥 Step 4: Particle burst' },
            { action: () => bootSystem.setParticleMode('dance'), message: '💃 Step 5: Dance mode' },
            { action: () => bootSystem.setParticleMode('calm'), message: '😌 Step 6: Calm mode' },
            { action: () => bootSystem.setParticleMode('normal'), message: '✨ Demo complete! Welcome to the chillhouse 🎵' }
        ];
        
        let currentStep = 0;
        const runStep = () => {
            if (currentStep < demoSteps.length) {
                demoSteps[currentStep].action();
                setTimeout(() => {
                    currentStep++;
                    runStep();
                }, 3000);
            }
        };
        
        runStep();
        return '🎬 Particle demo starting! Watch the magic happen... ✨';
    }

    getEnhancedParticleStats(bootSystem) {
        if (!bootSystem.particles) return 'No particle data available';
        
        const now = Date.now();
        const recent = bootSystem.particles.filter(p => p.createdAt && (now - p.createdAt) < 30000);
        const old = bootSystem.particles.filter(p => p.createdAt && (now - p.createdAt) >= 30000);
        
        const sizeDistribution = {
            small: bootSystem.particles.filter(p => p.element?.classList.contains('small')).length,
            medium: bootSystem.particles.filter(p => p.element?.classList.contains('medium')).length,
            large: bootSystem.particles.filter(p => p.element?.classList.contains('large')).length,
            xlarge: bootSystem.particles.filter(p => p.element?.classList.contains('xlarge')).length
        };
        
        return `📊 Enhanced Particle Statistics:
• Total Active: ${bootSystem.particles.length} ✨
• Recent (30s): ${recent.length} 🆕
• Older: ${old.length} ⏰
• Memory Usage: ~${(bootSystem.particles.length * 0.8).toFixed(1)}KB 💾
• Generation Rate: ${bootSystem.particleGenerationRate}ms ⚡
• Color Scheme: ${bootSystem.currentColorScheme} 🌈
• Mode: ${bootSystem.particleMode} 🎭

Size Distribution:
• Small: ${sizeDistribution.small} 🔵
• Medium: ${sizeDistribution.medium} 🔷
• Large: ${sizeDistribution.large} 🔶
• X-Large: ${sizeDistribution.xlarge} 🔴

Performance: ${bootSystem.particles.length < 50 ? 'Excellent' : bootSystem.particles.length < 100 ? 'Good' : 'Optimization needed'} 🚀`;
    }

    getParticleDebugInfo(bootSystem) {
        const container = document.getElementById('particleContainer');
        const visibleParticles = document.querySelectorAll('.enhanced-particle');
        const containerVisible = container && container.offsetParent !== null;
        
        return `🔍 Particle Debug Information:
• Container exists: ${!!container} ✅
• Container visible: ${containerVisible} 👁️
• Visible particles: ${visibleParticles.length} ✨
• Boot system ready: ${!!bootSystem} 🔧
• Particle array length: ${bootSystem.particles?.length || 0} 📊
• Animation running: ${bootSystem.particleAnimationRunning} ⏯️
• Generation rate: ${bootSystem.particleGenerationRate}ms ⚡
• Mode: ${bootSystem.particleMode || 'normal'} 🎭
• Color scheme: ${bootSystem.currentColorScheme || 'chillhouse'} 🌈
• Physics enabled: ${bootSystem.particlePhysics?.enabled || false} ⚛️

System Status: ${containerVisible && visibleParticles.length > 0 ? '🟢 Healthy' : '🟡 Needs attention'} 📈`;
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
            'life': 'conway-game-of-life',
            'pocket-tanks': 'pocket-tanks',
            'tanks': 'pocket-tanks',
            'artillery': 'pocket-tanks'
        };

        const appId = appMappings[appName];
        if (appId && window.handleAppClick) {
            window.handleAppClick(appId);
            return `Launched ${appName} application`;
        }

        return `Unknown application: ${appName}. Type 'apps' to see available applications.`;
    }

    listApps() {
        return `available applications:
• terminal       - command line interface

usage: launch <app-name>
example: launch terminal`;
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

    handleScreensaverControl(args) {
        const action = args?.[0];
        const screensaver = window.spaceScreensaver;
        
        if (!screensaver) {
            return 'Screensaver system not available';
        }
        
        switch(action) {
            case 'on':
            case 'enable':
                screensaver.enable();
                return 'Screensaver enabled - will activate after 8 seconds of inactivity';

            case 'off':
            case 'disable':
                screensaver.disable();
                return 'Screensaver disabled';

            case 'test':
            case 'demo':
                screensaver.startScreensaver();
                setTimeout(() => {
                    screensaver.stopScreensaver();
                }, 3000);
                return 'Screensaver demo started - will show for 3 seconds';

            case 'timeout':
                const seconds = parseInt(args[1]);
                if (isNaN(seconds) || seconds < 1) {
                    return 'Usage: screensaver timeout <seconds>\nExample: screensaver timeout 15';
                }
                screensaver.setTimeout(seconds);
                return `Screensaver timeout set to ${seconds} seconds`;

            case 'status':
                const isActive = screensaver.isActive;
                const timeout = screensaver.IDLE_TIMEOUT / 1000;
                return `Screensaver Status:
• Active: ${isActive ? 'Yes' : 'No'}
• Timeout: ${timeout} seconds
• Stars: ${screensaver.stars?.length || 0}
• Shooting Stars: ${screensaver.shootingStars?.length || 0}`;

            case 'help':
                return `Screensaver Control Commands:
screensaver on/enable     - Enable screensaver
screensaver off/disable   - Disable screensaver
screensaver test/demo     - Test screensaver (3 seconds)
screensaver timeout <sec> - Set inactivity timeout
screensaver status        - Show screensaver status
screensaver help          - Show this help

Shortcut: ss <command> (same as screensaver)`;
                
            default:
                return 'Usage: screensaver [on|off|test|timeout|status|help]';
        }
    }

    showDemoscene() {
        // Launch the DarkWave Demoscene Platform
        this.launchDarkWaveDemoscene();
        
        return `🌟 DARKWAVE DEMOSCENE PLATFORM 🌟

▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 100%

🎵 LAUNCHING: "DARKWAVE DEMOSCENE" 🎵
A Standalone Web-Based Demoscene Platform with Dark Wave 8-bit Hacker Aesthetic

⚡ Enhanced Features:
• High-Resolution Graphics (No More Pixelation!)
• Unique 8-bit Audio Tracks (45-second loops)
• Auto-play Audio with Mute Control
• Enhanced Particle Systems with Glow Effects
• Improved Matrix Rain with Trail Effects
• Advanced Wireframe Networks with Pulsing Nodes
• Multi-layered Glitch Text with Scanline Effects
• Responsive Canvas Sizing
• Smooth 60 FPS Animations

🎮 Platform Sections:
• Showcase - Browse enhanced demo gallery
• Create - Build your own demos
• Community - Share and discuss
• Learn - Tutorials and guides

🎼 Audio System: ${window.darkWaveAudio?.isInitialized ? 'READY - Unique tracks per demo!' : 'INITIALIZING - Audio system loading...'}

🎯 Demo Audio Tracks:
• Neon Particles - "Neon Pulse" (Dark Wave, 120 BPM)
• Matrix Rain - "Digital Rain" (Chiptune, 140 BPM)
• Wireframe Network - "Network Pulse" (Hacker, 110 BPM)
• Glitch Text - "Glitch Corruption" (Wave, 90 BPM)

Platform launching... Welcome to the enhanced DarkWave Demoscene experience!`;
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
            <iframe id="demoscene-iframe" src="demoscene/demoscene.html" frameborder="0"></iframe>
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
                background: transparent !important;
                backdrop-filter: none !important;
                border-bottom: 1px solid #b388ff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                box-shadow: none !important;
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
                background: transparent !important;
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

    // Enhanced Network Engineering Commands
    handleSSH(args) {
        const target = args[0];
        if (!target) {
            return `Available SSH targets:
• core-switch-01 (192.168.1.1) - Core switch
• edge-router-01 (192.168.1.254) - Edge router  
• firewall-01 (192.168.1.10) - Firewall
• server-01 (192.168.1.100) - Management server
• wireless-controller (192.168.1.50) - Wireless controller

Usage: ssh <target>`;
        }
        
        const targets = {
            'core-switch-01': { ip: '192.168.1.1', type: 'Cisco Catalyst 9300' },
            'edge-router-01': { ip: '192.168.1.254', type: 'Cisco ISR 4321' },
            'firewall-01': { ip: '192.168.1.10', type: 'Cisco ASA 5516' },
            'server-01': { ip: '192.168.1.100', type: 'Ubuntu Server 20.04' },
            'wireless-controller': { ip: '192.168.1.50', type: 'Cisco WLC 9800' }
        };
        
        if (targets[target]) {
            const device = targets[target];
            return `Connecting to ${target} (${device.ip})...
${device.type}
Username: admin
Password: ********
Connection established.
${target}#`;
        } else {
            return `Error: Unknown target '${target}'
Available: ${Object.keys(targets).join(', ')}`;
        }
    }

    async handleShow(args) {
        const subcommand = args[0] || 'help';
        
        switch (subcommand) {
            case 'resume':
            case 'jared':
                const resumeContent = await this.showResume();
                // Scroll to top after loading resume content
                setTimeout(() => {
                    this.scrollToTop();
                }, 100);
                return resumeContent;
            
            case 'running-config':
                return `Current configuration:
!
version 15.2
service timestamps debug datetime msec
service timestamps log datetime msec
no service password-encryption
!
hostname core-switch-01
!
interface GigabitEthernet1/0/1
 description Link to edge-router-01
 ip address 192.168.1.1 255.255.255.0
 no shutdown
!
interface GigabitEthernet1/0/2
 description Link to server-01
 ip address 192.168.1.2 255.255.255.0
 no shutdown
!
router ospf 1
 network 192.168.1.0 0.0.0.255 area 0
!
end`;
            
            case 'ip route':
                return `Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
       E1 - OSPF external type 1, E2 - OSPF external type 2, E - EGP
       i - IS-IS, L1 - IS-IS level-1, L2 - IS-IS level-2, ia - IS-IS inter area
       * - candidate default, U - per-user static route, o - ODR
       P - periodic downloaded static route

Gateway of last resort is 192.168.1.254 to network 0.0.0.0

C    192.168.1.0/24 is directly connected, GigabitEthernet1/0/1
C    192.168.2.0/24 is directly connected, GigabitEthernet1/0/2
O    10.0.0.0/8 [110/2] via 192.168.1.254, 00:05:23, GigabitEthernet1/0/1
S*   0.0.0.0/0 [1/0] via 192.168.1.254`;
            
            case 'interface brief':
                return `Interface              IP-Address      OK? Method Status                Protocol
GigabitEthernet1/0/1  192.168.1.1      YES NVRAM  up                    up
GigabitEthernet1/0/2  192.168.1.2      YES NVRAM  up                    up
GigabitEthernet1/0/3  unassigned       YES NVRAM  administratively down down
GigabitEthernet1/0/4  unassigned       YES NVRAM  administratively down down
Vlan1                  unassigned       YES NVRAM  up                    up`;
            
            case 'logging':
                return `Syslog logging: enabled (0 messages dropped, 0 flushes, 0 overruns)
    Console logging: level debugging, 15 messages logged
    Monitor logging: level debugging, 0 messages logged
    Buffer logging: level debugging, 15 messages logged
    Logging to: 192.168.1.100
    Logging to: 192.168.1.254

Timestamp logging: enabled
Logging host: 192.168.1.100
Logging host: 192.168.1.254`;
            
            case 'version':
                return `Cisco IOS XE Software, Version 16.12.04
Cisco IOS Software [Amsterdam], Virtual XE Software (X86_64_LINUX_IOSD-UNIVERSALK9-M), Version 16.12.4, RELEASE SOFTWARE (fc3)
Technical Support: http://www.cisco.com/techsupport
Copyright (c) 1986-2020 by Cisco Systems, Inc.
Compiled Thu 26-Mar-20 10:16 by mcpre

ROM: IOS-XE ROMMON
core-switch-01 uptime is 2 weeks, 3 days, 4 hours, 23 minutes
Uptime for this control processor is 2 weeks, 3 days, 4 hours, 25 minutes`;
            
            case 'help':
                return `Available show commands:
• show running-config    - Current configuration
• show ip route         - Routing table
• show interface brief  - Interface status
• show logging          - Logging configuration
• show version          - System version
• show vlan             - VLAN information
• show arp              - ARP table
• show mac address-table - MAC address table`;
            
            default:
                return `Unknown show command: ${subcommand}
Type 'show help' for available commands`;
        }
    }

    handleLogging(args) {
        const subcommand = args[0];
        
        switch (subcommand) {
            case 'on':
                return `Logging enabled.
*Mar 1 00:00:00.000: %SYS-5-CONFIG_I: Configured from console by admin
*Mar 1 00:00:01.000: %LINK-3-UPDOWN: Interface GigabitEthernet1/0/1, changed state to up
*Mar 1 00:00:02.000: %LINEPROTO-5-UPDOWN: Line protocol on Interface GigabitEthernet1/0/1, changed state to up`;
            
            case 'off':
                return `Logging disabled.
*Mar 1 00:00:03.000: %SYS-5-CONFIG_I: Logging disabled by admin`;
            
            case 'debug':
                return `Debug logging enabled.
*Mar 1 00:00:04.000: %OSPF-5-ADJCHG: Process 1, Nbr 192.168.1.254 on GigabitEthernet1/0/1 from LOADING to FULL, Loading Done
*Mar 1 00:00:05.000: %BGP-5-ADJCHANGE: neighbor 192.168.1.254 Up
*Mar 1 00:00:06.000: %SYS-6-BOOTTIME: Time taken to discover after first neighbor discovery: 00:00:00`;
            
            default:
                return `Usage: logging [on|off|debug]
• logging on    - Enable logging
• logging off   - Disable logging  
• logging debug - Enable debug logging`;
        }
    }
    /**
     * Handle Mechvibes keyboard sound commands
     * Usage:
     *   mechvibes on/off
     *   mechvibes volume <0.0-1.0>
     *   mechvibes info
     */
    async handleMechvibes(args = []) {
        const bootSystem = window.bootSystemInstance;
        if (!bootSystem || !bootSystem.mechvibesPlayer) {
            return 'Mechvibes system not initialized.';
        }
        const player = bootSystem.mechvibesPlayer;
        const sub = (args[0] || '').toLowerCase();
        if (sub === 'on') {
            player.setEnabled(true);
            return 'Mechvibes keyboard sounds enabled.';
        } else if (sub === 'off') {
            player.setEnabled(false);
            return 'Mechvibes keyboard sounds disabled.';
        } else if (sub === 'volume') {
            const v = parseFloat(args[1]);
            if (isNaN(v) || v < 0 || v > 1) {
                return 'Usage: mechvibes volume <0.0-1.0>';
            }
            player.setVolume(v);
            return `Mechvibes volume set to ${v}`;
        } else if (sub === 'info') {
            const info = player.getSoundPackInfo();
            if (!info) return 'No Mechvibes sound pack loaded.';
            return `Mechvibes Sound Pack:
Name: ${info.name}
ID: ${info.id}
Loaded: ${info.isLoaded}
Enabled: ${info.isEnabled}
Volume: ${info.volume}`;
        } else {
            return `Mechvibes keyboard sound commands:
• mechvibes on/off         Enable or disable Mechvibes sounds
• mechvibes volume <0-1>   Set Mechvibes volume
• mechvibes info           Show sound pack info`;
        }
    }
}
