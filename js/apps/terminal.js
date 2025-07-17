import { AppError, ErrorTypes, eventEmitter } from '../utils/utils.js';
import { CONFIG } from '../config.js';
import { registerCommands } from './commands.js';

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
        
        // Enhanced terminal features
        this.workingDirectory = '/home/jared';
        this.environment = {
            'USER': 'jared',
            'HOME': '/home/jared',
            'PWD': '/home/jared',
            'PATH': '/usr/local/bin:/usr/bin:/bin',
            'SHELL': '/bin/bash',
            'TERM': 'xterm-256color',
            'LANG': 'en_US.UTF-8'
        };
        this.commandBuffer = '';
        this.isCommandMode = false;
        this.lastCommand = '';
        this.commandStartTime = Date.now();
        
        // Theme system
        this.currentTheme = localStorage.getItem('terminalTheme') || 'default';
        this.themes = {
            default: {
                name: 'default',
                background: 'rgba(255, 255, 255, 0.001)',
                backdropFilter: 'blur(8px) saturate(140%) brightness(110%)',
                border: 'rgba(255,255,255,0.05)',
                textColor: 'var(--text-color)',
                promptColor: 'var(--primary-color)',
                errorColor: '#ef4444',
                successColor: '#10b981',
                warningColor: '#f59e0b'
            },
            dracula: {
                name: 'dracula',
                background: 'rgba(40, 42, 54, 0.95)',
                backdropFilter: 'blur(12px) saturate(120%)',
                border: 'rgba(189, 147, 249, 0.3)',
                textColor: '#f8f8f2',
                promptColor: '#bd93f9',
                errorColor: '#ff5555',
                successColor: '#50fa7b',
                warningColor: '#ffb86c'
            },
            sunset: {
                name: 'sunset',
                background: 'rgba(255, 69, 0, 0.1)',
                backdropFilter: 'blur(10px) saturate(150%) brightness(120%)',
                border: 'rgba(255, 140, 0, 0.4)',
                textColor: '#fff8dc',
                promptColor: '#ff6347',
                errorColor: '#ff4500',
                successColor: '#32cd32',
                warningColor: '#ffd700'
            },
            cyberpunk: {
                name: 'cyberpunk',
                background: 'rgba(0, 255, 255, 0.05)',
                backdropFilter: 'blur(15px) saturate(200%) brightness(130%)',
                border: 'rgba(0, 255, 255, 0.3)',
                textColor: '#00ffff',
                promptColor: '#ff00ff',
                errorColor: '#ff0000',
                successColor: '#00ff00',
                warningColor: '#ffff00'
            }
        };

        registerCommands(this.commands, this);

        this.setupEventListeners();
        this.loadHistory();
        this.applyTheme(this.currentTheme);
        this.initializeStatusBar();

        // Show welcome message with theme info
        setTimeout(() => {
            this.writeOutput(`<div class="terminal-welcome">
                <h3>neuOS terminal v2.1</h3>
                <p>welcome to the enhanced terminal interface</p>
                <p>current theme: <span style="color: var(--terminal-prompt);">${this.currentTheme}</span></p>
                <p>available themes: default, dracula, sunset, cyberpunk</p>
                <p>use 'theme <name>' to switch themes</p>
                <p>type 'help' for available commands</p>
                <p>working directory: ${this.workingDirectory}</p>
            </div>`);
            this.inputElement.focus();
        }, 100);
    }

    initializeStatusBar() {
        this.statusBar = document.querySelector('.terminal-status');
        if (this.statusBar) {
            this.updateStatusBar();
            // Update status bar every 5 seconds instead of every second for better performance
            setInterval(() => this.updateStatusBar(), 5000);
        }
    }

    updateStatusBar() {
        if (!this.statusBar || this._statusBarDisabled) return;
        
        const statusItems = this.statusBar.querySelectorAll('.status-item');
        if (statusItems.length >= 4) {
            // Update status indicator
            const statusIndicator = statusItems[0].querySelector('.status-indicator');
            const statusText = statusItems[0].querySelector('.status-text');
            
            if (this.isProcessing) {
                statusIndicator.style.background = '#f59e0b';
                statusText.textContent = 'processing...';
            } else {
                statusIndicator.style.background = '#10b981';
                statusText.textContent = 'ready';
            }
            
            // Update theme
            statusItems[1].querySelector('.status-text').textContent = `theme: ${this.currentTheme}`;
            
            // Update history count
            statusItems[2].querySelector('.status-text').textContent = `history: ${this.history.length}`;
            
            // Update uptime
            const uptime = this.calculateUptime();
            statusItems[3].querySelector('.status-text').textContent = `uptime: ${uptime}`;
        }
    }

    calculateUptime() {
        const now = Date.now();
        const uptimeMs = now - this.commandStartTime;
        const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    setupEventListeners() {
        this.inputElement.addEventListener('keydown', e => this.handleKeyDown(e), { capture: true });
        this.inputElement.addEventListener('input', () => this.handleInput(), { passive: true });
        this.inputElement.addEventListener('paste', e => this.handlePaste(e), { passive: true });
        this.inputElement.addEventListener('compositionstart', () => this.isComposing = true, { passive: true });
        this.inputElement.addEventListener('compositionend', () => this.isComposing = false, { passive: true });
        
        // Optimized resize handling
        this.setupOptimizedResizeHandler();
        
        if (window.innerWidth <= 768) this.setupMobileEventListeners();
    }

    setupOptimizedResizeHandler() {
        let resizeTimeout;
        let isResizing = false;
        let resizeStartTime = 0;
        
        // Listen for window resize events
        window.addEventListener('resize', () => {
            if (!isResizing) {
                isResizing = true;
                resizeStartTime = performance.now();
                
                // Disable all non-essential operations during resize
                this.outputElement.style.pointerEvents = 'none';
                this.outputElement.style.overflow = 'hidden';
                this.inputElement.style.pointerEvents = 'none';
                
                // Disable status bar updates during resize
                this._statusBarDisabled = true;
            }
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.scrollToBottom();
                this.outputElement.style.pointerEvents = '';
                this.outputElement.style.overflow = '';
                this.inputElement.style.pointerEvents = '';
                this._statusBarDisabled = false;
                isResizing = false;
                
                // Update status bar after resize
                this.updateStatusBar();
            }, 150);
        }, { passive: true });
        
        // Listen for terminal window resize events with ultra-fast handling
        window.addEventListener('windowResizeUpdate', (e) => {
            if (e.detail.window.id === 'terminalWindow') {
                // Only handle resize if it's been going on for a while
                if (isResizing && performance.now() - resizeStartTime > 100) {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(() => {
                        this.handleTerminalResize(e.detail.size);
                    }, 100);
                }
            }
        }, { passive: true });
    }

    handleTerminalResize(size) {
        // Ultra-minimal resize handling for maximum performance
        if (this.outputElement.children.length > 50) {
            // Only trim if there's a lot of content
            this.trimOutput();
        }
        
        // Update scroll position
        this.scrollToBottom();
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
            // Don't process during IME composition
            if (this.isComposing) return;
            
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
                case 'Escape':
                    e.preventDefault();
                    this.handleEscape();
                    break;
                case 'Backspace':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlBackspace();
                    }
                    break;
                case 'Delete':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlDelete();
                    }
                    break;
                case 'c':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlC();
                    }
                    break;
                case 'l':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.clear();
                    }
                    break;
                case 'r':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlR();
                    }
                    break;
                case 'u':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlU();
                    }
                    break;
                case 'k':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlK();
                    }
                    break;
                case 'a':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.inputElement.setSelectionRange(0, this.inputElement.value.length);
                    }
                    break;
                case 'e':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
                    }
                    break;
                case 'w':
                    if (e.ctrlKey) {
                        e.preventDefault();
                        this.handleCtrlW();
                    }
                    break;
            }
        } catch {}
    }

    handlePaste(e) {
        // Allow paste but ensure it's handled properly
        setTimeout(() => {
            this.currentInput = this.inputElement.value;
        }, 0);
    }

    handleEscape() {
        this.inputElement.value = '';
        this.currentInput = '';
        this.inputElement.focus();
    }

    handleCtrlBackspace() {
        const cursorPos = this.inputElement.selectionStart;
        const value = this.inputElement.value;
        let newPos = cursorPos;
        
        // Find the start of the previous word
        while (newPos > 0 && /\s/.test(value[newPos - 1])) newPos--;
        while (newPos > 0 && !/\s/.test(value[newPos - 1])) newPos--;
        
        this.inputElement.value = value.slice(0, newPos) + value.slice(cursorPos);
        this.inputElement.setSelectionRange(newPos, newPos);
        this.currentInput = this.inputElement.value;
    }

    handleCtrlDelete() {
        const cursorPos = this.inputElement.selectionStart;
        const value = this.inputElement.value;
        let newPos = cursorPos;
        
        // Find the end of the current word
        while (newPos < value.length && !/\s/.test(value[newPos])) newPos++;
        while (newPos < value.length && /\s/.test(value[newPos])) newPos++;
        
        this.inputElement.value = value.slice(0, cursorPos) + value.slice(newPos);
        this.inputElement.setSelectionRange(cursorPos, cursorPos);
        this.currentInput = this.inputElement.value;
    }

    handleCtrlC() {
        if (this.inputElement.selectionStart !== this.inputElement.selectionEnd) {
            // Copy selected text
            const selectedText = this.inputElement.value.slice(
                this.inputElement.selectionStart,
                this.inputElement.selectionEnd
            );
            navigator.clipboard.writeText(selectedText);
        } else {
            // Clear line
            this.inputElement.value = '';
            this.currentInput = '';
        }
    }

    handleCtrlR() {
        // Reverse search through history
        const searchTerm = this.inputElement.value;
        if (!searchTerm) return;
        
        const matchingHistory = this.history
            .slice()
            .reverse()
            .find(cmd => cmd.includes(searchTerm));
        
        if (matchingHistory) {
            this.inputElement.value = matchingHistory;
            this.currentInput = matchingHistory;
        }
    }

    handleCtrlU() {
        // Clear from cursor to beginning of line
        const cursorPos = this.inputElement.selectionStart;
        this.inputElement.value = this.inputElement.value.slice(cursorPos);
        this.inputElement.setSelectionRange(0, 0);
        this.currentInput = this.inputElement.value;
    }

    handleCtrlK() {
        // Clear from cursor to end of line
        const cursorPos = this.inputElement.selectionStart;
        this.inputElement.value = this.inputElement.value.slice(0, cursorPos);
        this.inputElement.setSelectionRange(cursorPos, cursorPos);
        this.currentInput = this.inputElement.value;
    }

    handleCtrlW() {
        // Delete word before cursor
        this.handleCtrlBackspace();
    }

    async playTypingSound(key) {
        // Ensure audio context is resumed on first user interaction
        if (window.bootSystemInstance?.audioSystem?.audioContext?.state === 'suspended') {
            try {
                await window.bootSystemInstance.audioSystem.audioContext.resume();
            } catch (err) {
                console.warn('Failed to resume audio context:', err);
            }
        }
        
        // Try to play mechvibes sound
        if (window.bootSystemInstance?.mechvibesPlayer) {
            try {
                await window.bootSystemInstance.mechvibesPlayer.playKeySound(key);
            } catch (err) {
                // Fallback to audio system typing sound
                window.bootSystemInstance?.audioSystem?.playTypingSound(key);
            }
        } else {
            // Fallback to audio system typing sound
            window.bootSystemInstance?.audioSystem?.playTypingSound(key);
        }
    }

    handleInput() {
        // Only update currentInput if we're not navigating history
        if (this.historyIndex === -1) {
            this.currentInput = this.inputElement.value;
        }
    }

    navigateHistory(direction) {
        if (!this.history.length) return;
        
        if (direction === 'up') {
            if (this.historyIndex < this.history.length - 1) {
                this.historyIndex++;
                this.inputElement.value = this.history[this.history.length - 1 - this.historyIndex];
            }
        } else if (direction === 'down') {
            if (this.historyIndex > -1) {
                this.historyIndex--;
                if (this.historyIndex === -1) {
                    this.inputElement.value = this.currentInput;
                } else {
                    this.inputElement.value = this.history[this.history.length - 1 - this.historyIndex];
                }
            }
        }
        
        // Move cursor to end of input
        this.inputElement.setSelectionRange(this.inputElement.value.length, this.inputElement.value.length);
        this.currentInput = this.inputElement.value;
    }

    handleTabCompletion() {
        const input = this.inputElement.value.trim();
        if (!input) return;
        
        const words = input.split(/\s+/);
        const lastWord = words[words.length - 1];
        const prefix = words.slice(0, -1).join(' ') + (words.length > 1 ? ' ' : '');
        
        // Get all available commands and files
        const availableCommands = [...this.commands.keys()];
        const availableFiles = ['resume.txt', 'network-configs/', 'scripts/', 'config.json', 'manifest.json'];
        const allOptions = [...availableCommands, ...availableFiles];
        
        const matchingOptions = allOptions.filter(option => option.startsWith(lastWord));
        
        if (matchingOptions.length === 1) {
            // Single match - complete it
            this.inputElement.value = prefix + matchingOptions[0] + ' ';
            this.currentInput = this.inputElement.value;
        } else if (matchingOptions.length > 1) {
            // Multiple matches - show options
            this.writeOutput(`<div class="terminal-completion">Completions:</div>`);
            matchingOptions.forEach(option => {
                this.writeOutput(`<div class="terminal-completion-item">${option}</div>`);
            });
        }
        
        this.inputElement.focus();
    }

    async executeCommand() {
        if (this.isProcessing) return this.commandQueue.push(this.inputElement.value);
        this.isProcessing = true;
        
        try {
            const command = this.inputElement.value.trim();
            if (!command) {
                this.displayPrompt();
                return;
            }
            
            this.addToHistory(command);
            
            // Determine command category for styling
            const category = this.getCommandCategory(command);
            this.displayCommand(command, category);
            
            this.lastCommand = command;
            this.commandStartTime = Date.now();
            
            // Show loading state for longer operations
            if (this.isLongRunningCommand(command)) {
                this.showLoading('executing command...');
            }
            
            // Handle command chaining with && and ||
            const chainCommands = this.parseCommandChain(command);
            let lastResult = null;
            let shouldContinue = true;
            
            for (const chainCommandObj of chainCommands) {
                if (!shouldContinue) break;
                
                const [cmd, ...args] = chainCommandObj.command.split(/\s+/).filter(Boolean);
                const sanitizedCmd = cmd.toLowerCase().replace(/[^a-z0-9-]/g, '');
                
                if (this.commands.has(sanitizedCmd)) {
                    try {
                        const result = await this.commands.get(sanitizedCmd)(args);
                        lastResult = result;
                        
                        // Hide loading state
                        this.hideLoading();
                        
                        // Handle result with enhanced formatting
                        if (result instanceof Error) {
                            this.handleCommandError(result);
                        } else if (typeof result === 'string' && result.includes('success')) {
                            this.handleCommandSuccess(result);
                        } else {
                            await this.handleCommandResult(result, chainCommandObj.command);
                        }
                        
                        // Check if we should continue based on chain operator
                        const isSuccess = !(result instanceof Error);
                        if (chainCommandObj.operator === '&&' && !isSuccess) {
                            shouldContinue = false;
                        } else if (chainCommandObj.operator === '||' && isSuccess) {
                            shouldContinue = false;
                        }
                    } catch (error) {
                        lastResult = error;
                        this.hideLoading();
                        this.handleCommandError(error);
                        shouldContinue = false;
                    }
                } else {
                    this.hideLoading();
                    throw new AppError(`command not found: ${cmd}`, ErrorTypes.VALIDATION);
                }
            }
            
            // Update environment variables
            this.updateEnvironment();
            
        } catch (error) {
            this.hideLoading();
            this.handleCommandError(error);
        } finally {
            this.isProcessing = false;
            this.clearInput();
            
            if (this.commandQueue.length) {
                this.inputElement.value = this.commandQueue.shift();
                setTimeout(() => this.executeCommand(), 100);
            } else {
                // Restore focus to input after command execution
                this.inputElement.focus();
            }
        }
    }

    parseCommandChain(command) {
        const parts = command.split(/(\s*&&\s*|\s*\|\|\s*)/);
        const result = [];
        
        for (let i = 0; i < parts.length; i += 2) {
            const cmd = parts[i].trim();
            const operator = parts[i + 1] ? parts[i + 1].trim() : null;
            
            if (cmd) {
                result.push({
                    command: cmd,
                    operator: operator
                });
            }
        }
        
        return result;
    }

    updateEnvironment() {
        this.environment.PWD = this.workingDirectory;
        this.environment.USER = 'jared';
    }

    // Enhanced command display with categories
    displayCommand(command, category = '') {
        const commandDiv = document.createElement('div');
        commandDiv.className = `terminal-command ${category}`;
        
        const prompt = document.createElement('span');
        prompt.className = 'prompt';
        prompt.textContent = this.getPrompt();
        
        const commandText = document.createElement('span');
        commandText.className = 'command-text';
        commandText.textContent = command;
        
        commandDiv.appendChild(prompt);
        commandDiv.appendChild(commandText);
        
        this.outputElement.appendChild(commandDiv);
        this.scrollToBottom();
    }

    getPrompt() {
        const user = this.environment.USER;
        const hostname = 'neuos';
        const dir = this.workingDirectory === '/home/jared' ? '~' : this.workingDirectory.split('/').pop();
        return `${user}@${hostname}:${dir}$`;
    }

    displayPrompt() {
        const promptElement = document.createElement('div');
        promptElement.className = 'terminal-prompt';
        promptElement.innerHTML = `<span class="prompt">${this.getPrompt()}</span>`;
        this.outputElement.appendChild(promptElement);
    }

    async handleCommandResult(result, command = '') {
        const resultElement = document.createElement('div');
        resultElement.className = 'terminal-result';
        let output = result instanceof Promise ? await result : result;
        this.formatOutput(output, resultElement);
        this.outputElement.appendChild(resultElement);
        this.isDocumentContent(command, output) ? this.scrollToTop() : this.scrollToBottom();
    }

    // Enhanced error handling with better formatting
    handleCommandError(error) {
        const errorMessage = error instanceof AppError ? error.message : error.toString();
        const errorDiv = document.createElement('div');
        errorDiv.className = 'terminal-error';
        errorDiv.innerHTML = `<span class="error">error:</span> ${this.formatOutputWithSyntaxHighlighting(errorMessage)}`;
        errorDiv.style.animation = 'errorShake 0.5s ease-in-out';
        
        this.outputElement.appendChild(errorDiv);
        this.scrollToBottom();
        eventEmitter.emit('terminalError', { error });
    }

    // Enhanced success handling
    handleCommandSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'terminal-success';
        successDiv.innerHTML = `<span class="success">success:</span> ${this.formatOutputWithSyntaxHighlighting(message)}`;
        successDiv.style.animation = 'successBounce 0.6s ease-out';
        
        this.outputElement.appendChild(successDiv);
        this.scrollToBottom();
    }

    // Enhanced loading state
    showLoading(message = 'processing...') {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'terminal-loading';
        loadingDiv.textContent = message;
        loadingDiv.id = 'terminal-loading';
        
        this.outputElement.appendChild(loadingDiv);
        this.scrollToBottom();
    }

    hideLoading() {
        const loadingDiv = document.getElementById('terminal-loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
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
        // Don't add empty commands or duplicate consecutive commands
        if (!command.trim() || (this.history.length > 0 && this.history[this.history.length - 1] === command)) {
            return;
        }
        
        this.history.push(command);
        this.history.length > this.maxHistorySize && this.history.shift();
        this.historyIndex = -1;
        this.saveHistory();
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('terminalHistory');
            if (saved) {
                this.history = JSON.parse(saved);
                this.historyIndex = -1;
            }
        } catch (error) {
            console.warn('Failed to load terminal history:', error);
            this.history = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('terminalHistory', JSON.stringify(this.history));
        } catch (error) {
            console.warn('Failed to save terminal history:', error);
        }
    }

    writeOutput(content) {
        if (!content || typeof content !== 'string') return;
        
        // For HTML content, don't apply syntax highlighting
        const isHtmlContent = content.includes('<div') || content.includes('<span') || content.includes('<h3') || content.includes('<p>');
        const formattedContent = isHtmlContent ? content : this.formatOutputWithSyntaxHighlighting(content);
        
        const outputDiv = document.createElement('div');
        outputDiv.className = 'terminal-result';
        outputDiv.innerHTML = formattedContent;
        outputDiv.style.animation = 'resultSlideIn 0.3s ease-out';
        
        this.outputElement.appendChild(outputDiv);
        this.trimOutput();
        this.scrollToBottom();
        
        // Only add interactive elements for non-HTML content to avoid conflicts
        if (!isHtmlContent) {
            this.addInteractiveElements(outputDiv);
        }
    }

    formatOutputWithSyntaxHighlighting(content) {
        // Don't apply syntax highlighting to HTML content
        if (content.includes('<div') || content.includes('<span') || content.includes('<h3') || content.includes('<p>')) {
            return content;
        }
        
        // Apply syntax highlighting to plain text content only
        return content
            // Highlight keywords
            .replace(/\b(if|else|for|while|function|return|const|let|var|import|export|class|extends|super|this|new|delete|typeof|instanceof|in|of|try|catch|finally|throw|break|continue|switch|case|default|do|with|debugger|yield|async|await|static|enum|interface|type|namespace|module|require|define|use|strict)\b/g, '<span class="keyword">$1</span>')
            // Highlight strings
            .replace(/(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g, '<span class="string">$1$2$1</span>')
            // Highlight numbers
            .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="number">$1</span>')
            // Highlight comments
            .replace(/(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, '<span class="comment">$1</span>')
            // Highlight error messages
            .replace(/\b(error|Error|ERROR|failed|Failed|FAILED|exception|Exception|EXCEPTION)\b/g, '<span class="error">$1</span>')
            // Highlight success messages
            .replace(/\b(success|Success|SUCCESS|completed|Completed|COMPLETED|ok|OK|done|Done|DONE)\b/g, '<span class="success">$1</span>')
            // Highlight warning messages
            .replace(/\b(warning|Warning|WARNING|warn|Warn|WARN|caution|Caution|CAUTION)\b/g, '<span class="warning">$1</span>')
            // Highlight info messages
            .replace(/\b(info|Info|INFO|information|Information|INFORMATION|note|Note|NOTE)\b/g, '<span class="info">$1</span>')
            // Highlight file paths (but not URLs that are already links)
            .replace(/(\/[^\s]+)(?![^<]*<\/a>)/g, '<span class="string">$1</span>')
            // Highlight URLs (only if not already in HTML)
            .replace(/(https?:\/\/[^\s]+)(?![^<]*<\/a>)/g, '<a href="$1" target="_blank" class="string">$1</a>')
            // Highlight command names
            .replace(/\b(ls|cd|pwd|cat|grep|find|chmod|chown|cp|mv|rm|mkdir|rmdir|touch|echo|printf|read|source|exec|eval|shift|getopts|trap|ulimit|umask|env|set|unset|export|alias|unalias|type|which|whereis|man|info|whatis|apropos|head|tail|more|less|sort|uniq|cut|paste|join|split|tr|sed|awk|wc|stat|file|du|df|ps|top|kill|nice|renice|bg|fg|jobs|wait|sleep|date|time|uptime|whoami|who|w|hostname|uname|ping|traceroute|nslookup|arp|route|ssh|telnet|ftp|sftp|scp|rsync|wget|curl|nc|netstat|ss|lsof|tcpdump|nmap|host|whois|ifconfig|ip|iptables|ufw|firewall-cmd|speedtest|netsh)\b/g, '<span class="keyword">$1</span>');
    }

    addInteractiveElements(outputDiv) {
        // Only add interactive elements for specific content types
        const content = outputDiv.textContent || '';
        
        // Add click handlers for file paths only if they exist
        const filePaths = outputDiv.querySelectorAll('.string');
        if (filePaths.length > 0) {
            filePaths.forEach(path => {
                if (path.textContent && path.textContent.startsWith('/')) {
                    path.style.cursor = 'pointer';
                    path.title = 'Click to navigate';
                    path.addEventListener('click', () => {
                        this.handlePathClick(path.textContent);
                    });
                }
            });
        }

        // Add copy functionality for code blocks only if they exist
        const codeBlocks = outputDiv.querySelectorAll('pre, code');
        if (codeBlocks.length > 0) {
            codeBlocks.forEach(block => {
                block.style.cursor = 'pointer';
                block.title = 'Click to copy';
                block.addEventListener('click', () => {
                    this.copyToClipboard(block.textContent);
                });
            });
        }
    }

    handlePathClick(path) {
        this.writeOutput(`<div class="terminal-info">navigating to: ${path}</div>`);
        // Here you could implement actual navigation logic
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.writeOutput('<div class="terminal-success">copied to clipboard</div>');
        } catch (err) {
            this.writeOutput('<div class="terminal-error">failed to copy to clipboard</div>');
        }
    }

    trimOutput() {
        while (this.outputElement.children.length > this.maxOutputLength) {
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
        return command.includes('show') || command.includes('resume') || command.includes('demoscene');
    }

    clear() {
        this.outputElement.innerHTML = '';
        this.displayPrompt();
        this.inputElement.focus();
    }

    clearInput() {
        this.inputElement.value = '';
        this.currentInput = '';
    }

    async loadResume() {
        try {
                    const response = await fetch('assets/content/resume.txt');
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

    applyTheme(themeName) {
        // Emit theme change event for global theme manager
        window.dispatchEvent(new CustomEvent('themeChanged', { 
            detail: { theme: themeName } 
        }));
        
        // Also apply local theme for backward compatibility
        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;
        localStorage.setItem('terminalTheme', themeName);

        const terminalWindow = document.getElementById('terminalWindow');
        if (terminalWindow) {
            terminalWindow.style.setProperty('--terminal-bg', theme.background);
            terminalWindow.style.setProperty('--terminal-backdrop', theme.backdropFilter);
            terminalWindow.style.setProperty('--terminal-border', theme.border);
            terminalWindow.style.setProperty('--terminal-text', theme.textColor);
            terminalWindow.style.setProperty('--terminal-prompt', theme.promptColor);
            terminalWindow.style.setProperty('--terminal-error', theme.errorColor);
            terminalWindow.style.setProperty('--terminal-success', theme.successColor);
            terminalWindow.style.setProperty('--terminal-warning', theme.warningColor);
        }

        // Update CSS custom properties
        document.documentElement.style.setProperty('--terminal-bg', theme.background);
        document.documentElement.style.setProperty('--terminal-backdrop', theme.backdropFilter);
        document.documentElement.style.setProperty('--terminal-border', theme.border);
        document.documentElement.style.setProperty('--terminal-text', theme.textColor);
        document.documentElement.style.setProperty('--terminal-prompt', theme.promptColor);
        document.documentElement.style.setProperty('--terminal-error', theme.errorColor);
        document.documentElement.style.setProperty('--terminal-success', theme.successColor);
        document.documentElement.style.setProperty('--terminal-warning', theme.warningColor);
    }

    handleThemeSwitch(args) {
        const [themeName] = args;
        if (!themeName) {
            const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'].join(', ');
            return `Available themes: ${availableThemes}\nCurrent theme: ${this.currentTheme}\nUsage: theme <theme-name>`;
        }

        const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'];
        if (availableThemes.includes(themeName)) {
            // Use the global theme manager
            const themeManager = window.themeManagerInstance;
            if (themeManager) {
                themeManager.applyTheme(themeName);
                this.currentTheme = themeName;
                return `Theme switched to: ${themeName}`;
            } else {
                // Fallback to local theme
                this.applyTheme(themeName);
                return `Theme switched to: ${themeName}`;
            }
        } else {
            const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'].join(', ');
            return `Unknown theme: ${themeName}\nAvailable themes: ${availableThemes}`;
        }
    }

    handleThemes() {
        const themeList = Object.keys(this.themes).map(theme => {
            const isCurrent = theme === this.currentTheme ? ' (current)' : '';
            return `  ${theme}${isCurrent}`;
        }).join('\n');
        
        return `Available themes:\n${themeList}\n\nUsage: theme <theme-name>`;
    }

    // Mechvibes command handlers
    handleMechvibes() {
        const mechvibesPlayer = window.bootSystemInstance?.mechvibesPlayer;
        if (!mechvibesPlayer) {
            return '❌ Mechvibes not available';
        }

        const isEnabled = mechvibesPlayer.toggle();
        const status = isEnabled ? 'enabled' : 'disabled';
        return `🎹 Mechvibes ${status}`;
    }

    handleMechvibesStatus() {
        const mechvibesPlayer = window.bootSystemInstance?.mechvibesPlayer;
        if (!mechvibesPlayer) {
            return '❌ Mechvibes not available';
        }

        return mechvibesPlayer.getStatus();
    }

    testAudio() {
        const audioSystem = window.bootSystemInstance?.audioSystem;
        if (!audioSystem) {
            return '❌ Audio system not available';
        }

        // Test typing sound
        audioSystem.playTypingSound('a');
        return '🔊 Audio test completed - you should hear a typing sound';
    }

    playMusic() {
        const backgroundMusic = window.bootSystemInstance?.backgroundMusic;
        if (!backgroundMusic) {
            return '❌ Background music not available';
        }

        backgroundMusic.playBackgroundMusic();
        return '🎵 Background music started';
    }

    pauseMusic() {
        const backgroundMusic = window.bootSystemInstance?.backgroundMusic;
        if (!backgroundMusic) {
            return '❌ Background music not available';
        }

        backgroundMusic.pauseBackgroundMusic();
        return '⏸️ Background music paused';
    }

    handleAudioControl() {
        const audioSystem = window.bootSystemInstance?.audioSystem;
        if (!audioSystem) {
            return '❌ Audio system not available';
        }

        const isEnabled = audioSystem.toggleAudio();
        const status = isEnabled ? 'enabled' : 'disabled';
        return `🔊 Audio system ${status}`;
    }

    showHelp() {
        return `<div class="terminal-help-section">
            <h4>core commands</h4>
            <div class="help-command">
                <span class="command-name">help</span>
                <span class="command-desc">show this help</span>
            </div>
            <div class="help-command">
                <span class="command-name">clear</span>
                <span class="command-desc">clear terminal</span>
            </div>
            <div class="help-command">
                <span class="command-name">themes</span>
                <span class="command-desc">list available themes</span>
            </div>
            <div class="help-command">
                <span class="command-name">theme &lt;name&gt;</span>
                <span class="command-desc">switch theme</span>
            </div>
            <div class="help-command">
                <span class="command-name">version</span>
                <span class="command-desc">show version</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>audio commands</h4>
            <div class="help-command">
                <span class="command-name">mechvibes</span>
                <span class="command-desc">toggle mechvibes keyboard sounds</span>
            </div>
            <div class="help-command">
                <span class="command-name">mechvibes-status</span>
                <span class="command-desc">show mechvibes status</span>
            </div>
            <div class="help-command">
                <span class="command-name">test-audio</span>
                <span class="command-desc">test audio system</span>
            </div>
            <div class="help-command">
                <span class="command-name">audio</span>
                <span class="command-desc">toggle audio system</span>
            </div>
            <div class="help-command">
                <span class="command-name">play-music</span>
                <span class="command-desc">start background music</span>
            </div>
            <div class="help-command">
                <span class="command-name">pause-music</span>
                <span class="command-desc">pause background music</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>visual effects</h4>
            <div class="help-command">
                <span class="command-name">particles &lt;mode&gt;</span>
                <span class="command-desc">control particle system</span>
            </div>
            <div class="help-command">
                <span class="command-name">solar</span>
                <span class="command-desc">solar system control</span>
            </div>
            <div class="help-command">
                <span class="command-name">planets</span>
                <span class="command-desc">solar system control (alias)</span>
            </div>
            <div class="help-command">
                <span class="command-name">sun</span>
                <span class="command-desc">solar system control (alias)</span>
            </div>
            <div class="help-command">
                <span class="command-name">effects</span>
                <span class="command-desc">visual effects control</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>network commands</h4>
            <div class="help-command">
                <span class="command-name">ping &lt;host&gt;</span>
                <span class="command-desc">ping a host</span>
            </div>
            <div class="help-command">
                <span class="command-name">tracert &lt;host&gt;</span>
                <span class="command-desc">trace route</span>
            </div>
            <div class="help-command">
                <span class="command-name">nslookup &lt;domain&gt;</span>
                <span class="command-desc">dns lookup</span>
            </div>
            <div class="help-command">
                <span class="command-name">show &lt;section&gt;</span>
                <span class="command-desc">show content (resume, jared, demoscene)</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>system commands</h4>
            <div class="help-command">
                <span class="command-name">system</span>
                <span class="command-desc">system control</span>
            </div>
            <div class="help-command">
                <span class="command-name">performance</span>
                <span class="command-desc">performance control</span>
            </div>
            <div class="help-command">
                <span class="command-name">screensaver</span>
                <span class="command-desc">screensaver control</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>file system commands</h4>
            <div class="help-command">
                <span class="command-name">ls [path]</span>
                <span class="command-desc">list directory contents</span>
            </div>
            <div class="help-command">
                <span class="command-name">cd [path]</span>
                <span class="command-desc">change directory</span>
            </div>
            <div class="help-command">
                <span class="command-name">pwd</span>
                <span class="command-desc">print working directory</span>
            </div>
            <div class="help-command">
                <span class="command-name">cat [file]</span>
                <span class="command-desc">concatenate and display files</span>
            </div>
            <div class="help-command">
                <span class="command-name">grep [pattern] [file]</span>
                <span class="command-desc">search for patterns in files</span>
            </div>
        </div>

        <div class="terminal-help-section">
            <h4>information commands</h4>
            <div class="help-command">
                <span class="command-name">whoami</span>
                <span class="command-desc">display current user</span>
            </div>
            <div class="help-command">
                <span class="command-name">date</span>
                <span class="command-desc">display current date</span>
            </div>
            <div class="help-command">
                <span class="command-name">time</span>
                <span class="command-desc">display current time</span>
            </div>
            <div class="help-command">
                <span class="command-name">uptime</span>
                <span class="command-desc">display system uptime</span>
            </div>
            <div class="help-command">
                <span class="command-name">history</span>
                <span class="command-desc">display command history</span>
            </div>
        </div>

        <div style="margin-top: 16px; padding: 12px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border-left: 3px solid #6366f1;">
            <strong>tip:</strong> use tab for command completion, arrow keys for history navigation, and ctrl+l to clear the terminal.
        </div>`;
    }

    // Network command handlers
    handlePing(args) {
        const [host] = args;
        if (!host) return 'Usage: ping <host>';
        return `Pinging ${host}...\nReply from ${host}: time=10ms\nReply from ${host}: time=12ms\nReply from ${host}: time=8ms`;
    }

    handleTracert(args) {
        const [host] = args;
        if (!host) return 'Usage: tracert <host>';
        return `Tracing route to ${host}...\n1  10ms  10ms  10ms  router.local\n2  15ms  12ms  14ms  ${host}`;
    }

    handleNslookup(args) {
        const [domain] = args;
        if (!domain) return 'Usage: nslookup <domain>';
        return `Name: ${domain}\nAddress: 192.168.1.100\nAliases: www.${domain}`;
    }

    handleArp() {
        return 'Internet Address      Physical Address      Type\n192.168.1.1           aa-bb-cc-dd-ee-ff     dynamic\n192.168.1.100         ff-ee-dd-cc-bb-aa     dynamic';
    }

    handleRoute() {
        return 'Network Destination        Netmask          Gateway       Interface  Metric\n0.0.0.0                0.0.0.0          192.168.1.1    192.168.1.100      1';
    }

    handleSSH(args) {
        const [host] = args;
        if (!host) return 'Usage: ssh <host>';
        return `Connecting to ${host}...\nSSH connection established\nWelcome to ${host}`;
    }

    // Placeholder handlers for other commands
    handleBackground(args) { return 'Background control not implemented'; }
    handleParticles(args) { return 'Particle control not implemented'; }
    handleEffects(args) { return 'Effects control not implemented'; }
    handleLaunch(args) { return 'App launch not implemented'; }
    listApps() { return 'Available apps: terminal, resume, demoscene'; }
    listWindows() { return 'Open windows: terminal'; }
    handleClose(args) { return 'Window close not implemented'; }
    handleFocus(args) { return 'Window focus not implemented'; }
    handleDesktop() { return 'Desktop control not implemented'; }
    handleNetworkControl() { return 'Network control not implemented'; }
    handleDeviceControl() { return 'Device control not implemented'; }
    handleStatusControl() { return 'Status control not implemented'; }
    handleSkillsControl() { return 'Skills control not implemented'; }
    handleProjectsControl() { return 'Projects control not implemented'; }
    handleSystemControl() { return 'System control not implemented'; }
    handlePerformanceControl() { return 'Performance control not implemented'; }
    handleScreensaverControl() { return 'Screensaver control not implemented'; }
    handleLogging() { return 'Logging control not implemented'; }

    // New command handlers for realistic terminal functionality
    
    // Core system commands
    handlePwd() {
        return this.workingDirectory;
    }

    handleCd(args) {
        const [path] = args;
        if (!path || path === '~' || path === '~/' || path === '/home/jared') {
            this.workingDirectory = '/home/jared';
            this.environment.PWD = this.workingDirectory;
            return '';
        }
        if (path === '..') {
            const parts = this.workingDirectory.split('/').filter(Boolean);
            if (parts.length > 1) {
                parts.pop();
                this.workingDirectory = '/' + parts.join('/');
            } else {
                this.workingDirectory = '/';
            }
        } else if (path.startsWith('/')) {
            this.workingDirectory = path;
        } else {
            this.workingDirectory = this.workingDirectory + '/' + path;
        }
        this.environment.PWD = this.workingDirectory;
        return '';
    }

    handleLs(args) {
        const [path] = args;
        const targetPath = path || this.workingDirectory;
        
        if (targetPath === '/home/jared' || targetPath === '~') {
            return 'resume.txt  network-configs/  scripts/  .bashrc  .profile  Documents/  Downloads/';
        } else if (targetPath === '/home/jared/network-configs') {
            return 'router1.conf  switch1.conf  firewall.conf  vlan-config.txt  ospf-config.txt';
        } else if (targetPath === '/home/jared/scripts') {
            return 'backup.sh  monitor.sh  deploy.sh  test.sh  utils.py';
        } else if (targetPath === '/home/jared/Documents') {
            return 'resume.pdf  certifications/  projects/  notes.txt';
        } else if (targetPath === '/home/jared/Downloads') {
            return 'firmware.bin  config-backup.tar.gz  logs.zip  tools/';
        }
        return `ls: cannot access '${path}': No such file or directory`;
    }

    handleWhoami() {
        return 'jared';
    }

    handleWho() {
        return `jared    pts/0        ${new Date().toLocaleDateString()} 09:30 (192.168.1.100)`;
    }

    handleW() {
        return ` 09:30:30 up 15 days, 23:45,  1 user,  load average: 0.52, 0.48, 0.44\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\njared    pts/0    192.168.1.100    09:30    0.00s  0.05s  0.00s w`;
    }

    handleDate() {
        return new Date().toString();
    }

    handleTime() {
        return new Date().toLocaleTimeString();
    }

    handleUptime() {
        return 'up 15 days, 23 hours, 45 minutes';
    }

    handleUname(args) {
        const [flag] = args;
        if (flag === '-a') {
            return 'Linux neuos 5.15.0-generic #1 SMP x86_64 x86_64 x86_64 GNU/Linux';
        } else if (flag === '-s') {
            return 'Linux';
        } else if (flag === '-n') {
            return 'neuos';
        } else if (flag === '-r') {
            return '5.15.0-generic';
        } else if (flag === '-m') {
            return 'x86_64';
        }
        return 'Linux';
    }

    handleHostname() {
        return 'neuos';
    }

    handleVersion() {
        return 'neuOS Terminal v2.1 - Enhanced with realistic Unix/Linux commands';
    }

    handleHistory() {
        if (this.history.length === 0) {
            return 'No command history available.';
        }
        return this.history.map((cmd, index) => `${index + 1}  ${cmd}`).join('\n');
    }

    handleAlias(args) {
        if (args.length === 0) {
            return 'alias ls=\'ls --color=auto\'\nalias ll=\'ls -la\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\'';
        }
        return `Alias '${args.join(' ')}' created.`;
    }

    handleUnalias(args) {
        const [aliasName] = args;
        if (!aliasName) {
            return 'unalias: missing argument';
        }
        return `Alias '${aliasName}' removed.`;
    }

    handleType(args) {
        const [command] = args;
        if (!command) {
            return 'type: missing argument';
        }
        if (this.commands.has(command)) {
            return `${command} is a shell builtin`;
        }
        return `${command} not found`;
    }

    handleWhich(args) {
        const [command] = args;
        if (!command) {
            return 'which: missing argument';
        }
        if (this.commands.has(command)) {
            return `/usr/bin/${command}`;
        }
        return `which: no ${command} in (/usr/local/bin:/usr/bin:/bin)`;
    }

    handleWhereis(args) {
        const [command] = args;
        if (!command) {
            return 'whereis: missing argument';
        }
        if (this.commands.has(command)) {
            return `${command}: /usr/bin/${command} /usr/share/man/man1/${command}.1.gz`;
        }
        return `${command}:`;
    }

    handleMan(args) {
        const [command] = args;
        if (!command) {
            return 'man: missing argument';
        }
        if (this.commands.has(command)) {
            return `NAME\n    ${command} - ${command} command\n\nSYNOPSIS\n    ${command} [OPTIONS] [ARGUMENTS]\n\nDESCRIPTION\n    This is a simulated man page for the ${command} command.\n\nSEE ALSO\n    help, info`;
        }
        return `No manual entry for ${command}`;
    }

    handleInfo(args) {
        const [command] = args;
        if (!command) {
            return 'info: missing argument';
        }
        return `Info entry for ${command} not found. Try 'man ${command}' instead.`;
    }

    handleWhatis(args) {
        const [command] = args;
        if (!command) {
            return 'whatis: missing argument';
        }
        if (this.commands.has(command)) {
            return `${command} (1) - ${command} command`;
        }
        return `${command}: nothing appropriate.`;
    }

    handleApropos(args) {
        const [keyword] = args;
        if (!keyword) {
            return 'apropos: missing argument';
        }
        const matchingCommands = [...this.commands.keys()].filter(cmd => cmd.includes(keyword));
        if (matchingCommands.length > 0) {
            return matchingCommands.map(cmd => `${cmd} (1) - ${cmd} command`).join('\n');
        }
        return `nothing appropriate for "${keyword}"`;
    }

    // File system commands
    handleCat(args) {
        const [file] = args;
        if (!file) {
            return 'cat: missing argument';
        }
        if (file === 'resume.txt') {
            return this.loadResume();
        }
        return `cat: ${file}: No such file or directory`;
    }

    handleHead(args) {
        const [file] = args;
        if (!file) {
            return 'head: missing argument';
        }
        if (file === 'resume.txt') {
            return 'JARED EDUARDO\nSenior Network Engineer\n\nEXPERIENCE\n15+ years in networking...';
        }
        return `head: ${file}: No such file or directory`;
    }

    handleTail(args) {
        const [file] = args;
        if (!file) {
            return 'tail: missing argument';
        }
        if (file === 'resume.txt') {
            return '...\n\nREFERENCES\nAvailable upon request\n\nCONTACT\njared@example.com';
        }
        return `tail: ${file}: No such file or directory`;
    }

    handleMore(args) {
        const [file] = args;
        if (!file) {
            return 'more: missing argument';
        }
        return this.handleCat(args);
    }

    handleLess(args) {
        const [file] = args;
        if (!file) {
            return 'less: missing argument';
        }
        return this.handleCat(args);
    }

    handleGrep(args) {
        const [pattern, file] = args;
        if (!pattern) {
            return 'grep: missing argument';
        }
        if (!file) {
            return 'grep: missing file operand';
        }
        if (file === 'resume.txt') {
            return `grep: searching for "${pattern}" in ${file}...\nNo matches found.`;
        }
        return `grep: ${file}: No such file or directory`;
    }

    handleFind(args) {
        const [path, ...options] = args;
        if (!path) {
            return 'find: missing argument';
        }
        return `find: searching in ${path}...\nNo files found matching criteria.`;
    }

    handleLocate(args) {
        const [pattern] = args;
        if (!pattern) {
            return 'locate: missing argument';
        }
        return `locate: searching for "${pattern}"...\nNo files found.`;
    }

    handleTouch(args) {
        const [file] = args;
        if (!file) {
            return 'touch: missing argument';
        }
        return `touch: created file '${file}'`;
    }

    handleMkdir(args) {
        const [dir] = args;
        if (!dir) {
            return 'mkdir: missing argument';
        }
        return `mkdir: created directory '${dir}'`;
    }

    handleRmdir(args) {
        const [dir] = args;
        if (!dir) {
            return 'rmdir: missing argument';
        }
        return `rmdir: removed directory '${dir}'`;
    }

    handleRm(args) {
        const [file] = args;
        if (!file) {
            return 'rm: missing argument';
        }
        return `rm: removed '${file}'`;
    }

    handleCp(args) {
        const [source, dest] = args;
        if (!source || !dest) {
            return 'cp: missing argument';
        }
        return `cp: copied '${source}' to '${dest}'`;
    }

    handleMv(args) {
        const [source, dest] = args;
        if (!source || !dest) {
            return 'mv: missing argument';
        }
        return `mv: moved '${source}' to '${dest}'`;
    }

    handleLn(args) {
        const [target, link] = args;
        if (!target || !link) {
            return 'ln: missing argument';
        }
        return `ln: created link '${link}' to '${target}'`;
    }

    handleChmod(args) {
        const [mode, file] = args;
        if (!mode || !file) {
            return 'chmod: missing argument';
        }
        return `chmod: changed permissions of '${file}' to ${mode}`;
    }

    handleChown(args) {
        const [owner, file] = args;
        if (!owner || !file) {
            return 'chown: missing argument';
        }
        return `chown: changed owner of '${file}' to ${owner}`;
    }

    handleDu(args) {
        const [path] = args;
        const targetPath = path || this.workingDirectory;
        return `4.0K\t${targetPath}`;
    }

    handleDf(args) {
        return `Filesystem     1K-blocks    Used Available Use% Mounted on\n/dev/sda1      104857600  52428800  52428800  50% /\n/dev/sdb1      209715200 104857600 104857600  50% /home`;
    }

    handleStat(args) {
        const [file] = args;
        if (!file) {
            return 'stat: missing argument';
        }
        return `  File: ${file}\n  Size: 1024\t\tBlocks: 8          IO Block: 4096   regular file\nAccess: (0644/-rw-r--r--)  Uid: ( 1000/   jared)   Gid: ( 1000/   jared)\nAccess: 2024-01-15 10:30:00.000000000 +0000\nModify: 2024-01-15 10:30:00.000000000 +0000\nChange: 2024-01-15 10:30:00.000000000 +0000`;
    }

    handleFile(args) {
        const [file] = args;
        if (!file) {
            return 'file: missing argument';
        }
        if (file.endsWith('.txt')) {
            return `${file}: ASCII text`;
        } else if (file.endsWith('.sh')) {
            return `${file}: Bourne-Again shell script, ASCII text executable`;
        } else if (file.endsWith('.py')) {
            return `${file}: Python script, ASCII text executable`;
        }
        return `${file}: data`;
    }

    handleWc(args) {
        const [file] = args;
        if (!file) {
            return 'wc: missing argument';
        }
        return `     50     200    1500 ${file}`;
    }

    handleSort(args) {
        const [file] = args;
        if (!file) {
            return 'sort: missing argument';
        }
        return `sort: sorted '${file}'`;
    }

    handleUniq(args) {
        const [file] = args;
        if (!file) {
            return 'uniq: missing argument';
        }
        return `uniq: removed duplicates from '${file}'`;
    }

    handleCut(args) {
        const [file] = args;
        if (!file) {
            return 'cut: missing argument';
        }
        return `cut: processed '${file}'`;
    }

    handlePaste(args) {
        const [file] = args;
        if (!file) {
            return 'paste: missing argument';
        }
        return `paste: processed '${file}'`;
    }

    handleJoin(args) {
        const [file1, file2] = args;
        if (!file1 || !file2) {
            return 'join: missing argument';
        }
        return `join: joined '${file1}' and '${file2}'`;
    }

    handleSplit(args) {
        const [file] = args;
        if (!file) {
            return 'split: missing argument';
        }
        return `split: split '${file}' into multiple files`;
    }

    handleTr(args) {
        const [file] = args;
        if (!file) {
            return 'tr: missing argument';
        }
        return `tr: translated '${file}'`;
    }

    handleSed(args) {
        const [file] = args;
        if (!file) {
            return 'sed: missing argument';
        }
        return `sed: processed '${file}'`;
    }

    handleAwk(args) {
        const [file] = args;
        if (!file) {
            return 'awk: missing argument';
        }
        return `awk: processed '${file}'`;
    }

    // Network commands
    handleIfconfig() {
        return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1234:5678:9abc:def0  prefixlen 64  scopeid 0x20<link>\n        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)\n        RX packets 12345  bytes 9876543 (9.4 MiB)\n        RX errors 0  dropped 0  overruns 0  frame 0\n        TX packets 6789  bytes 5432109 (5.1 MiB)\n        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`;
    }

    handleIp(args) {
        const [subcommand] = args;
        if (subcommand === 'addr') {
            return this.handleIfconfig();
        } else if (subcommand === 'route') {
            return this.handleRoute();
        }
        return `ip: unknown command '${subcommand}'`;
    }

    handleNetstat() {
        return `Active Internet connections (w/o servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 192.168.1.100:22        192.168.1.50:12345      ESTABLISHED\ntcp        0      0 192.168.1.100:80        192.168.1.50:54321      ESTABLISHED`;
    }

    handlePs() {
        return `  PID TTY          TIME CMD\n 1234 pts/0    00:00:00 bash\n 1235 pts/0    00:00:00 ps`;
    }

    handleTop() {
        return `top - 09:30:30 up 15 days, 23:45,  1 user,  load average: 0.52, 0.48, 0.44\nTasks: 123 total,   1 running, 122 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.5 us,  1.2 sy,  0.0 ni, 96.3 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\nMiB Mem :   8192.0 total,   2048.0 free,   3072.0 used,   3072.0 buff/cache\nMiB Swap:   4096.0 total,   4096.0 free,      0.0 used.   4096.0 avail Mem\n\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1234 jared     20   0   12345   6789   1234 S   2.5   0.1   0:00.01 bash`;
    }

    handleTelnet() {
        return 'telnet: connection refused (telnet is disabled for security)';
    }

    handleFtp() {
        return 'ftp: connection refused (ftp is disabled for security)';
    }

    handleSftp() {
        return 'sftp: connection refused (sftp is disabled for security)';
    }

    handleScp(args) {
        const [source, dest] = args;
        if (!source || !dest) {
            return 'scp: missing argument';
        }
        return `scp: connection refused (scp is disabled for security)`;
    }

    handleRsync(args) {
        const [source, dest] = args;
        if (!source || !dest) {
            return 'rsync: missing argument';
        }
        return `rsync: connection refused (rsync is disabled for security)`;
    }

    handleWget(args) {
        const [url] = args;
        if (!url) {
            return 'wget: missing argument';
        }
        return `wget: connection refused (wget is disabled for security)`;
    }

    handleCurl(args) {
        const [url] = args;
        if (!url) {
            return 'curl: missing argument';
        }
        return `curl: connection refused (curl is disabled for security)`;
    }

    handleNc(args) {
        const [host, port] = args;
        if (!host || !port) {
            return 'nc: missing argument';
        }
        return `nc: connection refused (nc is disabled for security)`;
    }

    handleIpconfig() {
        return 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   Connection-specific DNS Suffix  . : local\n   IPv4 Address. . . . . . . . . . . : 192.168.1.100\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1';
    }

    handleSpeedtest() {
        return 'Speedtest results:\nDownload: 100 Mbps\nUpload: 50 Mbps\nPing: 10 ms\nJitter: 2 ms';
    }

    handleNetsh(args) {
        const command = args.join(' ');
        return `netsh: executed '${command}'`;
    }

    handleIptables(args) {
        const [action] = args;
        if (!action) {
            return 'iptables: missing argument';
        }
        return `iptables: ${action} rule applied`;
    }

    handleUfw(args) {
        const [action] = args;
        if (!action) {
            return 'ufw: missing argument';
        }
        return `ufw: ${action} rule applied`;
    }

    handleFirewallCmd(args) {
        const [action] = args;
        if (!action) {
            return 'firewall-cmd: missing argument';
        }
        return `firewall-cmd: ${action} rule applied`;
    }

    handleSs(args) {
        return `Netid  State   Recv-Q  Send-Q  Local Address:Port    Peer Address:Port\ntcp    ESTAB   0       0       192.168.1.100:22      192.168.1.50:12345`;
    }

    handleLsof(args) {
        const [file] = args;
        if (!file) {
            return 'lsof: missing argument';
        }
        return `lsof: no process found using '${file}'`;
    }

    handleTcpdump(args) {
        const [iface] = args;
        if (!iface) {
            return 'tcpdump: missing argument';
        }
        return `tcpdump: listening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes`;
    }

    handleWireshark() {
        return 'wireshark: GUI application not available in terminal mode';
    }

    handleNmap(args) {
        const [target] = args;
        if (!target) {
            return 'nmap: missing argument';
        }
        return `nmap: scan initiated for ${target}`;
    }

    handleHost(args) {
        const [domain] = args;
        if (!domain) {
            return 'host: missing argument';
        }
        return `host: ${domain} has address 192.168.1.100`;
    }

    handleWhois(args) {
        const [domain] = args;
        if (!domain) {
            return 'whois: missing argument';
        }
        return `whois: ${domain} - No match for domain "${domain}"`;
    }

    // Audio commands
    handleStopMusic() {
        return 'Music stopped';
    }

    handleNextTrack() {
        return 'Next track';
    }

    handlePrevTrack() {
        return 'Previous track';
    }

    handleVolume(args) {
        const [level] = args;
        if (!level) {
            return 'Current volume: 50%';
        }
        return `Volume set to ${level}%`;
    }

    handleMute() {
        return 'Audio muted';
    }

    handleUnmute() {
        return 'Audio unmuted';
    }

    // Effects commands
    handleColor(args) {
        const [color] = args;
        if (!color) {
            return 'color: missing argument';
        }
        return `Color changed to ${color}`;
    }

    handleBrightness(args) {
        const [level] = args;
        if (!level) {
            return 'Current brightness: 100%';
        }
        return `Brightness set to ${level}%`;
    }

    handleContrast(args) {
        const [level] = args;
        if (!level) {
            return 'Current contrast: 100%';
        }
        return `Contrast set to ${level}%`;
    }

    handleBlur(args) {
        const [level] = args;
        if (!level) {
            return 'Current blur: 8px';
        }
        return `Blur set to ${level}px`;
    }

    handleSaturation(args) {
        const [level] = args;
        if (!level) {
            return 'Current saturation: 140%';
        }
        return `Saturation set to ${level}%`;
    }

    handleSolarSystem(args) {
        return `🌌 Solar System Background

The solar system is running as a beautiful background animation with:
- Enhanced 120px sun with realistic pulsing glow
- 8 planets with realistic characteristics and orbital mechanics
- Atmospheric effects for planets with atmospheres
- Ring systems for gas giants (Jupiter, Saturn, Uranus, Neptune)
- Multiple moons for larger planets
- Dynamic animations with enhanced visual effects

This is a background feature that enhances the visual appeal of neuOS.`;
    }

    // App control commands
    handleMinimize(args) {
        const [window] = args;
        if (!window) {
            return 'minimize: missing argument';
        }
        return `Window '${window}' minimized`;
    }

    handleMaximize(args) {
        const [window] = args;
        if (!window) {
            return 'maximize: missing argument';
        }
        return `Window '${window}' maximized`;
    }

    handleRestore(args) {
        const [window] = args;
        if (!window) {
            return 'restore: missing argument';
        }
        return `Window '${window}' restored`;
    }

    // System control commands
    handleShutdown() {
        return 'System shutdown initiated...';
    }

    handleReboot() {
        return 'System reboot initiated...';
    }

    handleLogout() {
        return 'Logging out...';
    }

    handleExit() {
        return 'Exiting terminal...';
    }

    handleSuspend() {
        return 'System suspended...';
    }

    handleHibernate() {
        return 'System hibernated...';
    }

    handleLock() {
        return 'System locked...';
    }

    // Cisco commands
    handleConfigure() {
        return 'Entering configuration mode...\nType "exit" to return to privileged EXEC mode.';
    }

    handleInterface() {
        return 'Interface configuration not available in demo mode.';
    }

    handleVlan() {
        return 'VLAN configuration not available in demo mode.';
    }

    handleOspf() {
        return 'OSPF configuration not available in demo mode.';
    }

    handleBgp() {
        return 'BGP configuration not available in demo mode.';
    }

    handleEigrp() {
        return 'EIGRP configuration not available in demo mode.';
    }

    handleAccessList() {
        return 'Access list configuration not available in demo mode.';
    }

    handleMonitor() {
        return 'Monitoring not available in demo mode.';
    }

    handleDebug() {
        return 'Debug mode not available in demo mode.';
    }

    handleReload() {
        return 'Reload not available in demo mode.';
    }

    handleCopy() {
        return 'Copy command not available in demo mode.';
    }

    handleWrite() {
        return 'Write command not available in demo mode.';
    }

    handleErase() {
        return 'Erase command not available in demo mode.';
    }

    handleTerminal() {
        return 'Terminal configuration not available in demo mode.';
    }

    handleLine() {
        return 'Line configuration not available in demo mode.';
    }

    handleUsername() {
        return 'Username configuration not available in demo mode.';
    }

    handleEnable() {
        return 'Already in privileged EXEC mode.';
    }

    handleDisable() {
        return 'Disabling privileged mode...\nType "enable" to return to privileged EXEC mode.';
    }

    handleEnd() {
        return 'Exiting configuration mode...';
    }

    handleCiscoShow(args) {
        const [what] = args;
        if (!what) {
            return 'show: missing argument';
        }
        return `show ${what}: command not available in demo mode.`;
    }

    handleNo(args) {
        const [command] = args;
        if (!command) {
            return 'no: missing argument';
        }
        return `no ${command}: command not available in demo mode.`;
    }

    handleDo(args) {
        const [command] = args;
        if (!command) {
            return 'do: missing argument';
        }
        return `do ${command}: command not available in demo mode.`;
    }

    // Environment commands
    handleEnv() {
        return Object.entries(this.environment)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');
    }

    handleSet(args) {
        if (args.length === 0) {
            return this.handleEnv();
        }
        const [varName, value] = args;
        if (!varName) {
            return 'set: missing argument';
        }
        this.environment[varName] = value || '';
        return '';
    }

    handleUnset(args) {
        const [varName] = args;
        if (!varName) {
            return 'unset: missing argument';
        }
        delete this.environment[varName];
        return '';
    }

    handleExport(args) {
        const [varName, value] = args;
        if (!varName) {
            return 'export: missing argument';
        }
        this.environment[varName] = value || '';
        return '';
    }

    handleEcho(args) {
        return args.join(' ');
    }

    handlePrintf(args) {
        const [format, ...values] = args;
        if (!format) {
            return 'printf: missing argument';
        }
        return `printf: ${format} ${values.join(' ')}`;
    }

    handleRead(args) {
        const [varName] = args;
        if (!varName) {
            return 'read: missing argument';
        }
        return `read: waiting for input for variable '${varName}'`;
    }

    handleSource(args) {
        const [file] = args;
        if (!file) {
            return 'source: missing argument';
        }
        return `source: sourced '${file}'`;
    }

    handleExec(args) {
        const [command] = args;
        if (!command) {
            return 'exec: missing argument';
        }
        return `exec: executed '${command}'`;
    }

    handleEval(args) {
        const [expression] = args;
        if (!expression) {
            return 'eval: missing argument';
        }
        return `eval: evaluated '${expression}'`;
    }

    handleShift(args) {
        const [count] = args;
        return `shift: shifted ${count || 1} arguments`;
    }

    handleGetopts(args) {
        const [optstring, varName] = args;
        if (!optstring || !varName) {
            return 'getopts: missing argument';
        }
        return `getopts: processing options '${optstring}' for variable '${varName}'`;
    }

    handleTrap(args) {
        const [action, signal] = args;
        if (!action || !signal) {
            return 'trap: missing argument';
        }
        return `trap: set trap for signal '${signal}' to '${action}'`;
    }

    handleUlimit(args) {
        const [resource, limit] = args;
        if (!resource) {
            return 'ulimit: missing argument';
        }
        return `ulimit: set limit for '${resource}' to '${limit || 'unlimited'}'`;
    }

    handleUmask(args) {
        const [mask] = args;
        if (!mask) {
            return 'umask: current umask is 022';
        }
        return `umask: set umask to ${mask}`;
    }

    getCommandCategory(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        
        // Network commands
        if (['ping', 'traceroute', 'nslookup', 'arp', 'route', 'ssh', 'telnet', 'ftp', 'sftp', 'scp', 'rsync', 'wget', 'curl', 'nc', 'netstat', 'ss', 'lsof', 'tcpdump', 'nmap', 'host', 'whois', 'ifconfig', 'ip', 'iptables', 'ufw', 'firewall-cmd', 'speedtest', 'netsh'].includes(cmd)) {
            return 'network';
        }
        
        // System commands
        if (['ps', 'top', 'kill', 'nice', 'renice', 'bg', 'fg', 'jobs', 'wait', 'sleep', 'date', 'time', 'uptime', 'whoami', 'who', 'w', 'hostname', 'uname', 'shutdown', 'reboot', 'logout', 'exit', 'suspend', 'hibernate', 'lock'].includes(cmd)) {
            return 'system';
        }
        
        // File system commands
        if (['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'more', 'less', 'grep', 'find', 'locate', 'touch', 'mkdir', 'rmdir', 'rm', 'cp', 'mv', 'ln', 'chmod', 'chown', 'du', 'df', 'stat', 'file', 'wc', 'sort', 'uniq', 'cut', 'paste', 'join', 'split', 'tr', 'sed', 'awk'].includes(cmd)) {
            return 'filesystem';
        }
        
        // Effects and visual commands
        if (['theme', 'color', 'brightness', 'contrast', 'blur', 'saturation', 'solarsystem', 'minimize', 'maximize', 'restore'].includes(cmd)) {
            return 'effects';
        }
        
        // App and window commands
        if (['launch', 'close', 'focus', 'desktop', 'show', 'demoscene'].includes(cmd)) {
            return 'apps';
        }
        
        // Audio commands
        if (['mechvibes', 'play', 'pause', 'stop', 'next', 'prev', 'volume', 'mute', 'unmute'].includes(cmd)) {
            return 'audio';
        }
        
        // Help and info commands
        if (['help', 'man', 'info', 'whatis', 'apropos', 'type', 'which', 'whereis', 'alias', 'unalias', 'history', 'env', 'set', 'unset', 'export', 'echo', 'printf'].includes(cmd)) {
            return 'help';
        }
        
        return '';
    }

    isLongRunningCommand(command) {
        const cmd = command.toLowerCase().split(' ')[0];
        return ['ping', 'traceroute', 'nslookup', 'whois', 'speedtest', 'top', 'find', 'grep', 'nmap', 'tcpdump'].includes(cmd);
    }
}