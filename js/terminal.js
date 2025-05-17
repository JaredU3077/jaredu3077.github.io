/**
 * Terminal Module
 * Handles terminal functionality with command history, autocomplete, and network command responses
 */

import { ContentParser } from './parser.js';
import { AppError, ErrorTypes, validateCommand } from './utils.js';
import { CONFIG } from './config.js';

export class Terminal {
    constructor(inputElement, outputElement) {
        this.inputElement = inputElement;
        this.outputElement = outputElement;
        this.commands = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.currentInput = '';
        
        this.initializeCommands();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.inputElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
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
            }
        });

        this.inputElement.addEventListener('input', () => {
            this.currentInput = this.inputElement.value;
        });
    }

    navigateHistory(direction) {
        if (this.history.length === 0) return;

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
    }

    handleTabCompletion() {
        const input = this.inputElement.value.trim();
        if (!input) return;

        const matchingCommands = Array.from(this.commands.keys())
            .filter(cmd => cmd.startsWith(input));

        if (matchingCommands.length === 1) {
            this.inputElement.value = matchingCommands[0] + ' ';
        } else if (matchingCommands.length > 1) {
            this.writeOutput('Possible completions:\n' + matchingCommands.join('\n'));
        }
    }

    executeCommand() {
        const command = this.inputElement.value.trim();
        if (!command) return;

        // Add command to history
        this.history.push(command);
        this.historyIndex = this.history.length;

        // Display command in output
        const commandLine = document.createElement('div');
        commandLine.className = 'terminal-line';
        commandLine.innerHTML = `
            <span class="prompt">$</span>
            <span class="command">${command}</span>
        `;
        this.outputElement.appendChild(commandLine);

        // Execute command
        try {
            const [cmd, ...args] = command.split(' ');
            const handler = this.commands.get(cmd);
            
            if (handler) {
                const result = handler(args);
                const resultElement = document.createElement('div');
                resultElement.className = 'terminal-result';
                resultElement.textContent = result;
                this.outputElement.appendChild(resultElement);
            } else {
                const errorElement = document.createElement('div');
                errorElement.className = 'terminal-error';
                errorElement.textContent = `Command not found: ${cmd}`;
                this.outputElement.appendChild(errorElement);
            }
        } catch (error) {
            const errorElement = document.createElement('div');
            errorElement.className = 'terminal-error';
            errorElement.textContent = `Error: ${error.message}`;
            this.outputElement.appendChild(errorElement);
        }

        // Clear input and scroll to bottom
        this.inputElement.value = '';
        this.currentInput = '';
        this.outputElement.scrollTop = this.outputElement.scrollHeight;
    }

    formatOutput(output) {
        if (typeof output === 'string') {
            return `<div class="terminal-output-success">${output}</div>`;
        } else if (output instanceof Error) {
            return `<div class="terminal-output-error">Error: ${output.message}</div>`;
        } else if (Array.isArray(output)) {
            return `<div class="terminal-output-success">${output.join('\n')}</div>`;
        } else if (typeof output === 'object') {
            return `<div class="terminal-output-success">${JSON.stringify(output, null, 2)}</div>`;
        }
        return `<div class="terminal-output-success">${String(output)}</div>`;
    }

    writeOutput(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.outputElement.appendChild(div);
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
        this.commands.set('ping', (args) => this.handlePing(args));
        this.commands.set('traceroute', (args) => this.handleTraceroute(args));
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

    handlePing(args) {
        if (!args[0]) return 'Usage: ping <host>';
        
        const host = args[0];
        const responses = [
            `Pinging ${host} with 32 bytes of data:`,
            `Reply from ${host}: bytes=32 time=1ms TTL=128`,
            `Reply from ${host}: bytes=32 time=2ms TTL=128`,
            `Reply from ${host}: bytes=32 time=1ms TTL=128`,
            `Reply from ${host}: bytes=32 time=3ms TTL=128`,
            '',
            `Ping statistics for ${host}:`,
            '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
            'Approximate round trip times in milli-seconds:',
            '    Minimum = 1ms, Maximum = 3ms, Average = 1ms'
        ];

        return responses.join('\n');
    }

    handleTraceroute(args) {
        if (!args[0]) return 'Usage: traceroute <host>';
        
        const host = args[0];
        const responses = [
            `Tracing route to ${host} over a maximum of 30 hops:`,
            '',
            '  1    <1 ms    <1 ms    <1 ms  192.168.1.1',
            '  2     2 ms     1 ms     2 ms  10.0.0.1',
            '  3     3 ms     2 ms     3 ms  172.16.0.1',
            '  4     4 ms     3 ms     4 ms  8.8.8.8',
            '',
            'Trace complete.'
        ];

        return responses.join('\n');
    }

    async showResume() {
        try {
            console.log('Loading resume from:', CONFIG.PATHS.RESUME);
            const response = await fetch(CONFIG.PATHS.RESUME);
            if (!response.ok) {
                console.error('Failed to load resume:', response.status, response.statusText);
                throw new Error(`Failed to load resume: ${response.status} ${response.statusText}`);
            }
            const text = await response.text();
            console.log('Resume content loaded:', text.substring(0, 100) + '...');
            const formattedContent = ContentParser.parseTextContent(text);
            console.log('Formatted content:', formattedContent.substring(0, 100) + '...');
            return formattedContent;
        } catch (error) {
            console.error('Error in showResume:', error);
            return `Error loading resume content: ${error.message}`;
        }
    }

    handleShow(args) {
        if (!args[0]) return 'Usage: show [interfaces|routes|config|resume|jared]';

        console.log('Handling show command with args:', args);
        switch (args[0].toLowerCase()) {
            case 'interfaces':
                return this.showInterfaces();
            case 'routes':
                return this.showRoutes();
            case 'config':
                return this.showConfig();
            case 'resume':
            case 'jared':
                console.log('Showing resume content');
                return this.showResume();
            default:
                return `Invalid option: ${args[0]}`;
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
