/**
 * Terminal Module
 * Handles terminal functionality and command processing
 */

import { ContentParser } from './parser.js';

export class Terminal {
    constructor(inputElement, outputElement) {
        this.input = inputElement;
        this.output = outputElement;
        this.commands = {
            'help': 'Available commands: ping, clear, help, show resume, show jared',
            'ping': 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms',
            'clear': () => { this.output.innerHTML = ''; return ''; },
            'show resume': async () => {
                try {
                    const content = await ContentParser.loadAndParseContent('resume.txt');
                    return content;
                } catch (error) {
                    return 'Error loading resume content.';
                }
            },
            'show jared': async () => {
                try {
                    const content = await ContentParser.loadAndParseContent('resume.txt');
                    return content;
                } catch (error) {
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
                const command = this.input.value.trim().toLowerCase();
                let output = this.commands[command] || 'Command not found';
                
                if (typeof output === 'function') {
                    try {
                        const result = await output();
                        this.appendOutput(command, result);
                    } catch (error) {
                        this.appendOutput(command, 'Error executing command.');
                    }
                } else {
                    this.appendOutput(command, output);
                }
                
                this.input.value = '';
            }
        });
    }

    /**
     * Append output to the terminal
     * @param {string} command - The command that was executed
     * @param {string} result - The result of the command
     */
    appendOutput(command, result) {
        this.output.innerHTML += `<div>> ${command}</div><div>${result}</div>`;
        this.output.scrollTop = this.output.scrollHeight;
    }

    /**
     * Add a new command to the terminal
     * @param {string} name - The command name
     * @param {Function|string} handler - The command handler or response
     */
    addCommand(name, handler) {
        this.commands[name] = handler;
    }
}
