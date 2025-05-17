/**
 * Terminal Module
 * Handles terminal functionality with command history, autocomplete, and network command responses
 */

import { ContentParser } from './parser.js';
import { AppError, ErrorTypes, validateCommand } from './utils.js';
import { CONFIG } from './config.js';

export class Terminal {
    constructor(inputElement, outputElement) {
        this.input = inputElement;
        this.output = outputElement;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.commands = new Map();
        this.initializeCommands();
        this.initializeEventListeners();
    }

    initializeCommands() {
        // Network commands
        this.commands.set('ping', {
            description: 'Test network connectivity',
            usage: 'ping <host>',
            execute: (args) => this.handlePing(args)
        });

        this.commands.set('traceroute', {
            description: 'Trace route to host',
            usage: 'traceroute <host>',
            execute: (args) => this.handleTraceroute(args)
        });

        this.commands.set('show', {
            description: 'Show network information',
            usage: 'show [interfaces|routes|config]',
            execute: (args) => this.handleShow(args)
        });

        this.commands.set('clear', {
            description: 'Clear terminal screen',
            usage: 'clear',
            execute: () => this.clearTerminal()
        });

        this.commands.set('help', {
            description: 'Show available commands',
            usage: 'help [command]',
            execute: (args) => this.showHelp(args)
        });

        // Additional commands
        this.commands.set('show resume', async () => {
            try {
                const content = await ContentParser.loadAndParseContent(CONFIG.PATHS.RESUME, this.output);
                return content;
            } catch (error) {
                if (error instanceof AppError) {
                    return `Error: ${error.message}`;
                }
                return 'Error loading resume content.';
            }
        });

        this.commands.set('show jared', async () => {
            try {
                const content = await ContentParser.loadAndParseContent(CONFIG.PATHS.RESUME, this.output);
                return content;
            } catch (error) {
                if (error instanceof AppError) {
                    return `Error: ${error.message}`;
                }
                return 'Error loading resume content.';
            }
        });

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

    /**
     * Initialize terminal event listeners
     */
    initializeEventListeners() {
        this.input.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const command = this.input.value.trim();
                
                // Validate command
                if (!validateCommand(command)) {
                    this.appendOutput(command, 'Error: Invalid command format');
                    this.input.value = '';
                    return;
                }

                // Add to command history
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;

                // Process command
                const result = await this.processCommand(command);
                this.appendOutput(command, result);
                
                this.input.value = '';
            }
        });

        // Command history navigation
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.input.value = this.commandHistory[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.commandHistory.length - 1) {
                    this.historyIndex++;
                    this.input.value = this.commandHistory[this.historyIndex];
                } else {
                    this.historyIndex = this.commandHistory.length;
                    this.input.value = '';
                }
            }
        });
    }

    /**
     * Append output to the terminal
     * @param {string} command - The command that was executed
     * @param {string} result - The result of the command
     */
    appendOutput(command, result) {
        const timestamp = new Date().toLocaleTimeString();
        this.output.innerHTML += `
            <div class="terminal-line">
                <span class="timestamp">[${timestamp}]</span>
                <span class="prompt">></span>
                <span class="command">${command}</span>
            </div>
            <div class="terminal-result">${result}</div>
        `;
        this.output.scrollTop = this.output.scrollHeight;
    }

    /**
     * Process command with arguments
     * @param {string} command - The command to process
     * @returns {Promise<string>} Command output
     */
    async processCommand(command) {
        const parts = command.split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        const handler = this.commands.get(cmd);
        if (!handler) {
            return 'Command not found. Type "help" for available commands.';
        }

        try {
            if (typeof handler.execute === 'function') {
                return await handler.execute(args);
            }
            return handler.description;
        } catch (error) {
            return `Error: ${error.message}`;
        }
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

    handleShow(args) {
        if (!args[0]) return 'Usage: show [interfaces|routes|config]';

        switch (args[0].toLowerCase()) {
            case 'interfaces':
                return this.showInterfaces();
            case 'routes':
                return this.showRoutes();
            case 'config':
                return this.showConfig();
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
        this.output.innerHTML = '';
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
