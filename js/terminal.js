/**
 * Terminal Module
 * Handles terminal functionality and command processing
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
        this.commands = {
            'help': () => this.getHelpText(),
            'ping': () => CONFIG.COMMANDS.PING,
            'clear': () => { this.output.innerHTML = ''; return ''; },
            'show resume': async () => {
                try {
                    const content = await ContentParser.loadAndParseContent(CONFIG.PATHS.RESUME, this.output);
                    return content;
                } catch (error) {
                    if (error instanceof AppError) {
                        return `Error: ${error.message}`;
                    }
                    return 'Error loading resume content.';
                }
            },
            'show jared': async () => {
                try {
                    const content = await ContentParser.loadAndParseContent(CONFIG.PATHS.RESUME, this.output);
                    return content;
                } catch (error) {
                    if (error instanceof AppError) {
                        return `Error: ${error.message}`;
                    }
                    return 'Error loading resume content.';
                }
            },
            'date': () => new Date().toLocaleString(),
            'echo': (args) => args.join(' '),
            'network status': () => {
                const bandwidth = document.getElementById('bandwidth')?.textContent || 'N/A';
                const alerts = document.getElementById('alerts')?.textContent || 'N/A';
                return `Bandwidth: ${bandwidth}\nAlerts: ${alerts}`;
            },
            'window list': () => {
                const windows = Array.from(document.querySelectorAll('.window'))
                    .map(w => `${w.id}: ${w.style.display === 'none' ? 'closed' : 'open'}`)
                    .join('\n');
                return windows || 'No windows found';
            },
            'window focus': (args) => {
                const windowId = args[0];
                if (!windowId) return 'Error: Window ID required';
                const window = document.getElementById(windowId);
                if (!window) return `Error: Window '${windowId}' not found`;
                window.style.zIndex = '100';
                return `Focused window: ${windowId}`;
            },
            'network zoom': (args) => {
                const action = args[0];
                if (!action) return 'Error: Action required (in/out/reset)';
                switch (action) {
                    case 'in': window.network?.zoomIn(); return 'Zoomed in';
                    case 'out': window.network?.zoomOut(); return 'Zoomed out';
                    case 'reset': window.network?.resetZoom(); return 'Zoom reset';
                    default: return 'Error: Invalid action (use in/out/reset)';
                }
            }
        };

        this.initializeEventListeners();
    }

    /**
     * Get help text for available commands
     * @returns {string} Help text
     */
    getHelpText() {
        return `Available commands:
help - Show this help message
ping - Test network connectivity
clear - Clear terminal output
show resume - Display resume content
show jared - Display resume content
date - Show current date and time
echo [text] - Echo the provided text
network status - Show network status
window list - List all windows
window focus [id] - Focus a specific window
network zoom [in/out/reset] - Control network zoom
`;
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
     * Add a new command to the terminal
     * @param {string} name - The command name
     * @param {Function|string} handler - The command handler or response
     */
    addCommand(name, handler) {
        if (!validateCommand(name)) {
            throw new AppError('Invalid command name', ErrorTypes.VALIDATION);
        }
        this.commands[name.toLowerCase()] = handler;
    }

    /**
     * Clear the terminal output
     */
    clear() {
        this.output.innerHTML = '';
        return '';
    }

    /**
     * Clear the terminal input
     */
    clearInput() {
        this.input.value = '';
    }

    /**
     * Reload the terminal
     */
    reload() {
        this.clear();
        this.appendOutput('Terminal reloaded', '');
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

        const handler = this.commands[cmd];
        if (!handler) {
            return 'Command not found. Type "help" for available commands.';
        }

        try {
            if (typeof handler === 'function') {
                return await handler(args);
            }
            return handler;
        } catch (error) {
            return `Error: ${error.message}`;
        }
    }
}
