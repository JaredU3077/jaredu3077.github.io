/**
 * Terminal Module
 * Handles terminal functionality with performance optimizations and enhanced error handling
 */

import { ContentParser } from './parser.js';
import { AppError, ErrorTypes, performanceMonitor, eventEmitter } from './utils.js';
import { CONFIG } from './config.js';

export class Terminal {
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
        
        // Track performance metrics
        this.performanceMetrics = new Map();
    }

    setupEventListeners() {
        // Use passive event listeners for better performance
        this.inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.inputElement.addEventListener('input', this.handleInput.bind(this), { passive: true });
        
        // Handle window resize for terminal resizing
        window.addEventListener('resize', this.handleResize.bind(this), { passive: true });
    }

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

    handleInput() {
        this.currentInput = this.inputElement.value;
    }

    handleResize() {
        // Adjust terminal output height based on window size
        const windowHeight = window.innerHeight;
        const maxHeight = Math.min(windowHeight * 0.8, 600);
        this.outputElement.style.maxHeight = `${maxHeight}px`;
    }

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

            // Add command to history
            this.addToHistory(command);

            // Display command in output
            this.displayCommand(command);

            // Execute command
            const [cmd, ...args] = command.split(' ');
            const handler = this.commands.get(cmd);
            
            if (handler) {
                try {
                    const result = handler(args);
                    await this.handleCommandResult(result);
                } catch (error) {
                    this.handleCommandError(error);
                }
            } else {
                this.handleCommandError(new AppError(`Command not found: ${cmd}`, ErrorTypes.VALIDATION));
            }
        } finally {
            this.isProcessing = false;
            performanceMonitor.endMeasure('commandExecution');
            
            // Process queued commands
            if (this.commandQueue.length > 0) {
                const nextCommand = this.commandQueue.shift();
                this.inputElement.value = nextCommand;
                this.executeCommand();
            }
        }
    }

    async handleCommandResult(result) {
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-result';
        
        if (result instanceof Promise) {
            try {
                const output = await result;
                this.formatOutput(output, resultElement);
            } catch (error) {
                this.handleCommandError(error);
            }
        } else {
            this.formatOutput(result, resultElement);
        }
        
        this.outputElement.appendChild(resultElement);
        this.scrollToBottom();
    }

    handleCommandError(error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'terminal-error';
        errorElement.textContent = `Error: ${error.message}`;
        this.outputElement.appendChild(errorElement);
        this.scrollToBottom();
        
        // Emit error event
        eventEmitter.emit('terminalError', { error });
    }

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

    addToHistory(command) {
        this.history.push(command);
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
        this.historyIndex = -1;
        this.saveHistory();
    }

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

    saveHistory() {
        try {
            localStorage.setItem('terminalHistory', JSON.stringify(this.history));
        } catch (error) {
            console.error('Failed to save terminal history:', error);
        }
    }

    writeOutput(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.outputElement.appendChild(div);
        this.scrollToBottom();
        
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

    clear() {
        this.outputElement.innerHTML = '';
        this.writeOutput('<div class="terminal-heading">Terminal cleared</div>');
    }

    clearInput() {
        this.inputElement.value = '';
        this.currentInput = '';
    }

    reload() {
        this.clear();
        this.writeOutput('<div class="terminal-heading">Terminal reloaded</div>');
    }

    initializeCommands() {
        // Network commands
        this.commands.set('ping', this.handlePing.bind(this));
        this.commands.set('traceroute', this.handleTraceroute.bind(this));
        this.commands.set('show', (args) => this.handleShow(args));
        this.commands.set('clear', () => this.clearTerminal());
        this.commands.set('help', (args) => this.showHelp(args));
        this.commands.set('date', () => new Date().toLocaleString());
        this.commands.set('echo', (args) => args.join(' '));

        this.commands.set('network status', () => {
            const bandwidth = document.getElementById('bandwidth')?.textContent || 'N/A';
            const alerts = document.getElementById('alerts')?.textContent || 'N/A';
            return `Bandwidth: ${bandwidth}\nAlerts: ${alerts}`;
        });

        this.commands.set('window list', () => {
            const windows = Array.from(document.querySelectorAll('.window'))
                .map(w => `${w.id}: ${w.style.display === 'none' ? 'closed' : 'open'}`)
                .join('\n');
            return windows || 'No windows found';
        });

        this.commands.set('window focus', (args) => {
            const windowId = args[0];
            if (!windowId) return 'Error: Window ID required';
            const window = document.getElementById(windowId);
            if (!window) return `Error: Window '${windowId}' not found`;
            window.style.zIndex = '100';
            return `Focused window: ${windowId}`;
        });

        this.commands.set('network zoom', (args) => {
            const action = args[0];
            if (!action) return 'Error: Action required (in/out/reset)';
            switch (action) {
                case 'in': window.network?.zoomIn(); return 'Zoomed in';
                case 'out': window.network?.zoomOut(); return 'Zoomed out';
                case 'reset': window.network?.resetZoom(); return 'Zoom reset';
                default: return 'Error: Invalid action (use in/out/reset)';
            }
        });
    }

    async handlePing(args) {
        const host = args[0] || 'google.com';
        const PING_COUNT = 4;
        let times = [];
        this.writeOutput(`Pinging ${host}...`);

        for (let i = 0; i < PING_COUNT; i++) {
            const startTime = performance.now();
            try {
                // Using a CORS proxy to avoid CORS issues
                await fetch(`https://api.allorigins.win/get?url=http://${host}`);
                const endTime = performance.now();
                const duration = (endTime - startTime).toFixed(2);
                times.push(duration);
                this.writeOutput(`Reply from ${host}: time=${duration}ms`);
            } catch (error) {
                this.writeOutput(`Request timeout for ${host}.`);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between pings
        }

        if (times.length > 0) {
            const avgTime = (times.reduce((a, b) => parseFloat(a) + parseFloat(b)) / times.length).toFixed(2);
            this.writeOutput(`\nPing statistics for ${host}:`);
            this.writeOutput(`    Packets: Sent = ${PING_COUNT}, Received = ${times.length}, Lost = ${PING_COUNT - times.length} (${((PING_COUNT - times.length) / PING_COUNT) * 100}% loss),`);
            this.writeOutput(`Approximate round trip times in milli-seconds:`);
            this.writeOutput(`    Minimum = ${Math.min(...times)}ms, Maximum = ${Math.max(...times)}ms, Average = ${avgTime}ms`);
        } else {
            this.writeOutput(`\nPing statistics for ${host}:`);
            this.writeOutput(`    Packets: Sent = ${PING_COUNT}, Received = 0, Lost = ${PING_COUNT} (100% loss),`);
        }
    }

    handleTraceroute(args) {
        if (!args[0]) {
            return 'Usage: traceroute <host>';
        }
        
        const host = args[0];
        return 'Traceroute complete.';
    }

    async showResume() {
        try {
            const response = await fetch('resume.txt');
            if (!response.ok) {
                throw new AppError('Could not load resume.txt', ErrorTypes.NETWORK);
            }
            const text = await response.text();
            return text;
        } catch (error) {
            console.error('Error fetching resume:', error);
            return 'Error: Could not load resume.';
        }
    }

    handleShow(args) {
        if (args.length === 0) {
            return 'Usage: show <subcommand>. Try "show help"';
        }

        const subcommand = args[0].toLowerCase();
        switch (subcommand) {
            case 'resume':
            case 'jared':
                return this.showResume();
            case 'interfaces':
                return this.showInterfaces();
            case 'routes':
                return this.showRoutes();
            case 'config':
                return this.showConfig();
            default:
                return `Invalid option: ${subcommand}`;
        }
    }

    showInterfaces() {
        return [
            'Interface Status:',
            'GigabitEthernet0/0 is up, line protocol is up',
            '  Hardware is GigabitEthernet, address is 00:1a:2b:3c:4d:5e',
            '  Internet address is 192.168.1.1/24',
            '  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec',
            '',
            'GigabitEthernet0/1 is up, line protocol is up',
            '  Hardware is GigabitEthernet, address is 00:1a:2b:3c:4d:5f',
            '  Internet address is 10.0.0.1/24',
            '  MTU 1500 bytes, BW 1000000 Kbit/sec, DLY 10 usec'
        ].join('\n');
    }

    showRoutes() {
        return [
            'Routing Table:',
            'Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP',
            '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area',
            '',
            'Gateway of last resort is 192.168.1.254 to network 0.0.0.0',
            '',
            'C    192.168.1.0/24 is directly connected, GigabitEthernet0/0',
            'C    10.0.0.0/24 is directly connected, GigabitEthernet0/1',
            'S*   0.0.0.0/0 [1/0] via 192.168.1.254'
        ].join('\n');
    }

    showConfig() {
        return [
            'Current configuration:',
            '!',
            'version 15.0',
            'service timestamps debug datetime msec',
            'service timestamps log datetime msec',
            '!',
            'hostname Router',
            '!',
            'interface GigabitEthernet0/0',
            ' ip address 192.168.1.1 255.255.255.0',
            ' no shutdown',
            '!',
            'interface GigabitEthernet0/1',
            ' ip address 10.0.0.1 255.255.255.0',
            ' no shutdown',
            '!',
            'ip route 0.0.0.0 0.0.0.0 192.168.1.254',
            '!',
            'end'
        ].join('\n');
    }

    clearTerminal() {
        this.outputElement.innerHTML = '';
        return '';
    }

    showHelp(args) {
        if (args[0]) {
            const cmd = this.commands.get(args[0].toLowerCase());
            if (cmd) {
                return [
                    `Command: ${args[0]}`,
                    `Description: ${cmd.description}`,
                    `Usage: ${cmd.usage}`
                ].join('\n');
            }
            return `Command not found: ${args[0]}`;
        }

        const helpText = ['Available commands:'];
        for (const [cmd, info] of this.commands) {
            helpText.push(`${cmd.padEnd(15)} ${info.description}`);
        }
        return helpText.join('\n');
    }
}
