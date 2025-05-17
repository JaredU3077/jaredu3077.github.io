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
            'help': () => CONFIG.COMMANDS.HELP,
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
            }
        };

        this.initializeEventListeners();
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
                const commandLower = command.toLowerCase();
                let output = this.commands[commandLower] || 'Command not found';
                
                if (typeof output === 'function') {
                    try {
                        const result = await output();
                        this.appendOutput(command, result);
                    } catch (error) {
                        this.appendOutput(command, `Error: ${error.message}`);
                    }
                } else {
                    this.appendOutput(command, output);
                }
                
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
}
