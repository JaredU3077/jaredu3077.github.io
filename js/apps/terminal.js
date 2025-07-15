import { AppError, ErrorTypes, eventEmitter } from '../utils/utils.js';
import { CONFIG } from '../config.js';
import { registerCommands } from './commands.js';

export class Terminal {
    constructor(inputElement, outputElement) {
        if (!inputElement || !outputElement) throw new AppError('Input and output elements are required', ErrorTypes.VALIDATION);
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

        registerCommands(this.commands, this);

        this.setupEventListeners();
        this.loadHistory();

        setTimeout(() => this.inputElement.focus(), 100);
    }

    setupEventListeners() {
        this.inputElement.addEventListener('keydown', e => this.handleKeyDown(e), { capture: true });
        this.inputElement.addEventListener('input', () => this.handleInput(), { passive: true });
        window.addEventListener('resize', () => this.scrollToBottom(), { passive: true });
        if (window.innerWidth <= 768) this.setupMobileEventListeners();
    }

    setupMobileEventListeners() {
        this.inputElement.addEventListener('touchstart', e => e.preventDefault(), { passive: true });
        this.inputElement.addEventListener('touchend', e => { this.inputElement.style.transform = 'scale(0.98)'; setTimeout(() => this.inputElement.style.transform = '', 100); }, { passive: true });
        this.inputElement.addEventListener('focus', () => setTimeout(() => this.inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300), { passive: true });
        this.inputElement.addEventListener('blur', () => this.inputElement.style.transform = '', { passive: true });
        this.inputElement.addEventListener('input', e => { if (e.inputType === 'insertText') this.currentInput = this.inputElement.value; }, { passive: true });
    }

    handleKeyDown(e) {
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
        } catch {}
    }

    async playTypingSound(key) {
        window.bootSystemInstance?.mechvibesPlayer && (await window.bootSystemInstance.mechvibesPlayer.playKeySound(key).catch(() => {}));
    }

    handleInput() {
        this.currentInput = this.inputElement.value;
    }

    navigateHistory(direction) {
        if (!this.history.length) return;
        direction === 'up' && this.historyIndex < this.history.length - 1 && this.historyIndex++;
        direction === 'down' && this.historyIndex > -1 && this.historyIndex--;
        this.inputElement.value = this.historyIndex === -1 ? this.currentInput : this.history[this.history.length - 1 - this.historyIndex];
    }

    handleTabCompletion() {
        const input = this.inputElement.value.trim();
        if (!input) return;
        const matchingCommands = [...this.commands.keys()].filter(cmd => cmd.startsWith(input));
        matchingCommands.length === 1 ? this.inputElement.value = `${matchingCommands[0]} ` : matchingCommands.length > 1 && this.writeOutput(`Completions:\n${matchingCommands.join('\n')}`);
    }

    async executeCommand() {
        if (this.isProcessing) return this.commandQueue.push(this.inputElement.value);
        this.isProcessing = true;
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
            if (this.commandQueue.length) {
                this.inputElement.value = this.commandQueue.shift();
                setTimeout(() => this.executeCommand(), 100);
            }
        }
    }

    displayCommand(command) {
        const commandElement = document.createElement('div');
        commandElement.className = 'terminal-command';
        commandElement.innerHTML = `<span class="prompt">$</span> ${command}`;
        this.outputElement.appendChild(commandElement);
        this.clearInput();
    }

    async handleCommandResult(result, command = '') {
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-result';
        let output = result instanceof Promise ? await result : result;
        this.formatOutput(output, resultElement);
        this.outputElement.appendChild(resultElement);
        this.isDocumentContent(command, output) ? this.scrollToTop() : this.scrollToBottom();
    }

    handleCommandError(error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'terminal-error';
        errorElement.textContent = `Error: ${error.message}`;
        this.outputElement.appendChild(errorElement);
        this.scrollToBottom();
        eventEmitter.emit('terminalError', { error });
    }

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

    addToHistory(command) {
        this.history.push(command);
        this.history.length > this.maxHistorySize && this.history.shift();
        this.historyIndex = -1;
        this.saveHistory();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('terminalHistory');
            saved && (this.history = JSON.parse(saved));
        } catch {}
    }

    saveHistory() {
        try {
            localStorage.setItem('terminalHistory', JSON.stringify(this.history));
        } catch {}
    }

    writeOutput(content) {
        const div = document.createElement('div');
        div.innerHTML = content;
        this.outputElement.appendChild(div);
        this.trimOutput();
        this.scrollToBottom();
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

    isDocumentContent(command, output) {
        return command.includes('show resume') || command.includes('show jared') || (typeof output === 'string' && output.includes('terminal-heading'));
    }

    clear() {
        this.outputElement.innerHTML = '';
        return '';
    }

    clearInput() {
        this.inputElement.value = '';
        this.currentInput = '';
    }

    async loadResume() {
        try {
            const response = await fetch('resume.txt');
            if (!response.ok) throw new Error('Failed to load resume.txt');
            return await response.text();
        } catch (error) {
            return `Error loading resume: ${error.message}`;
        }
    }

    async handleShow(args) {
        const [section] = args;
        if (!section) {
            return 'Usage: show <section>\nAvailable sections: resume, jared, demoscene';
        }
        
        switch (section.toLowerCase()) {
            case 'resume':
            case 'jared':
                return await this.loadResume();
            case 'demoscene':
                return this.handleDemoscene();
            default:
                return `Unknown section: ${section}\nAvailable sections: resume, jared, demoscene`;
        }
    }

    handleDemoscene() {
        window.open('./demoscene/demoscene.html', '_blank');
        return 'Opening demoscene in new tab...';
    }
}