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
        // Adjust terminal output height based on window size
        const windowHeight = window.innerHeight;
        const maxHeight = Math.min(windowHeight * 0.8, 600);
        this.outputElement.style.maxHeight = `${maxHeight}px`;
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
     * @private
     * @memberof Terminal
     */
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
        this.scrollToBottom();
        
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
        // Future commands: traceroute, etc.
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
     * Fetches and displays the resume.
     * @returns {Promise<string>} The resume content or an error message.
     * @private
     * @memberof Terminal
     */
    async showResume() {
        try {
            const content = await ContentParser.loadAndParseContent('resume.txt');
            return content;
        } catch (error) {
            console.error('Error fetching resume:', error);
            return 'Error: Could not fetch resume.txt.';
        }
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
        }
        return `Error: Unknown 'show' command target: ${target}. Try 'show resume' or 'show jared'.`;
    }

    /**
     * Displays a list of available commands.
     * @returns {string} The help text.
     * @memberof Terminal
     */
    showHelp() {
        const commandList = Array.from(this.commands.keys()).join(', ');
        return `Available commands: ${commandList}`;
    }
}
