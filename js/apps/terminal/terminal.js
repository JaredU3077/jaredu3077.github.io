// js/apps/terminal/terminal.js

import { AppError, ErrorTypes, eventEmitter } from '../../utils/utils.js';
import { CONFIG } from '../../config.js';
import { registerCommands } from './commands/commands.js';
import {
    setupEventListeners,
    handleKeyDown,
    handlePaste,
    handleEscape,
    handleCtrlBackspace,
    handleCtrlDelete,
    handleCtrlC,
    handleCtrlR,
    handleCtrlU,
    handleCtrlK,
    handleCtrlW,
    playTypingSound,
    handleInput,
    navigateHistory,
    handleTabCompletion,
    setupOptimizedResizeHandler,
    handleTerminalResize,
    setupMobileEventListeners
} from './eventHandlers.js';
import {
    initializeStatusBar,
    updateStatusBar,
    calculateUptime
} from './statusBar.js';
import {
    writeOutput,
    formatOutputWithSyntaxHighlighting,
    addInteractiveElements,
    handlePathClick,
    copyToClipboard,
    trimOutput,
    scrollToBottom,
    scrollToTop,
    isDocumentContent,
    clear,
    formatOutput,
    showLoading,
    hideLoading,
    handleCommandError,
    handleCommandSuccess,
    handleCommandResult,
    displayCommand,
    displayPrompt
} from './outputUtils.js';
import {
    addToHistory,
    loadHistory,
    saveHistory
} from './history.js';
import {
    updateEnvironment,
    getPrompt
} from './environment.js';
import {
    applyTheme,
    handleThemeSwitch,
    getCurrentTheme,
    handleThemes
} from './theme.js';
import {
    handleMechvibes,
    handleMechvibesStatus,
    testAudio,
    playMusic,
    pauseMusic,
    handleAudioControl,
    handleStopMusic,
    handleNextTrack,
    handlePrevTrack,
    handleVolume,
    handleMute,
    handleUnmute
} from './audio.js';
import {
    loadResume,
    handleShow
} from './content.js';

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
        
        // Theme system - Use global theme manager
        this.currentTheme = localStorage.getItem('neuos-theme') || 'default';

        registerCommands(this.commands, this);

        setupEventListeners(this);
        loadHistory(this);
        
        // Apply current theme from global manager
        const themeManager = window.themeManagerInstance;
        if (themeManager) {
            this.currentTheme = themeManager.getCurrentTheme();
        }
        initializeStatusBar(this);

        // Show welcome message with theme info
        setTimeout(() => {
            writeOutput(this, `<div class="terminal-welcome">
                <h3>neuOS terminal v2.1</h3>
                <p>welcome to the enhanced terminal interface</p>
                <p>current theme: <span style="color: var(--terminal-prompt);">${this.currentTheme}</span></p>
                <p>available themes: default, dracula, sunset, cyberpunk</p>
                <p>use 'theme <name>' to switch themes</p>
                <p>type 'help' for available commands</p>
                <p>working directory: ${this.workingDirectory}</p>
            </div>`);
            this.inputElement.focus();
            
            // Force scrolling to work
            this.forceScrolling();
        }, 100);
    }

    // Method to force scrolling to work
    forceScrolling() {
        if (this.outputElement) {
            // Force overflow settings
            this.outputElement.style.overflow = 'auto';
            this.outputElement.style.overflowY = 'auto';
            this.outputElement.style.overflowX = 'hidden';
            
            // Force scrollbar visibility
            this.outputElement.style.scrollbarWidth = 'thin';
            this.outputElement.style.msOverflowStyle = 'auto';
            
            // Ensure proper height
            this.outputElement.style.maxHeight = 'none';
            this.outputElement.style.height = 'auto';
            this.outputElement.style.minHeight = '200px';
            
            // Force the container to be scrollable
            this.outputElement.style.display = 'block';
            this.outputElement.style.position = 'relative';
            
            // Ensure content can overflow
            this.outputElement.style.wordWrap = 'break-word';
            this.outputElement.style.whiteSpace = 'pre-wrap';
            
            console.log('Terminal scrolling forced to work');
        }
    }

    async executeCommand() {
        if (this.isProcessing) return this.commandQueue.push(this.inputElement.value);
        this.isProcessing = true;
        
        try {
            const command = this.inputElement.value.trim();
            if (!command) {
                displayPrompt(this);
                return;
            }
            
            addToHistory(this, command);
            
            // Determine command category for styling
            const category = this.getCommandCategory(command);
            displayCommand(this, command, category);
            
            this.lastCommand = command;
            this.commandStartTime = Date.now();
            
            // Show loading state for longer operations
            if (this.isLongRunningCommand(command)) {
                showLoading(this, 'executing command...');
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
                        hideLoading(this);
                        
                        // Handle result with enhanced formatting
                        if (result instanceof Error) {
                            handleCommandError(this, result);
                        } else if (typeof result === 'string' && result.includes('success')) {
                            handleCommandSuccess(this, result);
                        } else {
                            await handleCommandResult(this, result, chainCommandObj.command);
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
                        hideLoading(this);
                        handleCommandError(this, error);
                        shouldContinue = false;
                    }
                } else {
                    hideLoading(this);
                    throw new AppError(`command not found: ${cmd}`, ErrorTypes.VALIDATION);
                }
            }
            
            // Update environment variables
            updateEnvironment(this);
            
        } catch (error) {
            hideLoading(this);
            handleCommandError(this, error);
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

    // Override methods to use imported functions
    handleKeyDown(e) {
        handleKeyDown(this, e);
    }

    handlePaste(e) {
        handlePaste(this, e);
    }

    handleEscape() {
        handleEscape(this);
    }

    handleCtrlBackspace() {
        handleCtrlBackspace(this);
    }

    handleCtrlDelete() {
        handleCtrlDelete(this);
    }

    handleCtrlC() {
        handleCtrlC(this);
    }

    handleCtrlR() {
        handleCtrlR(this);
    }

    handleCtrlU() {
        handleCtrlU(this);
    }

    handleCtrlK() {
        handleCtrlK(this);
    }

    handleCtrlW() {
        handleCtrlW(this);
    }

    playTypingSound(key) {
        playTypingSound(this, key);
    }

    handleInput() {
        handleInput(this);
    }

    navigateHistory(direction) {
        navigateHistory(this, direction);
    }

    handleTabCompletion() {
        handleTabCompletion(this);
    }

    setupOptimizedResizeHandler() {
        setupOptimizedResizeHandler(this);
    }

    handleTerminalResize(size) {
        handleTerminalResize(this, size);
    }

    setupMobileEventListeners() {
        setupMobileEventListeners(this);
    }

    updateStatusBar() {
        updateStatusBar(this);
    }

    calculateUptime() {
        return calculateUptime(this);
    }

    writeOutput(content) {
        writeOutput(this, content);
    }

    formatOutputWithSyntaxHighlighting(content) {
        return formatOutputWithSyntaxHighlighting(content);
    }

    addInteractiveElements(outputDiv) {
        addInteractiveElements(this, outputDiv);
    }

    handlePathClick(path) {
        handlePathClick(this, path);
    }

    copyToClipboard(text) {
        copyToClipboard(this, text);
    }

    trimOutput() {
        trimOutput(this);
    }

    scrollToBottom() {
        scrollToBottom(this);
    }

    scrollToTop() {
        scrollToTop(this);
    }

    isDocumentContent(command, output) {
        return isDocumentContent(command, output);
    }

    clear() {
        clear(this);
    }

    clearInput() {
        this.inputElement.value = '';
    }

    formatOutput(output, element) {
        formatOutput(output, element);
    }

    showLoading(message = 'processing...') {
        showLoading(this, message);
    }

    hideLoading() {
        hideLoading(this);
    }

    handleCommandError(error) {
        handleCommandError(this, error);
    }

    handleCommandSuccess(message) {
        handleCommandSuccess(this, message);
    }

    handleCommandResult(result, command = '') {
        handleCommandResult(this, result, command);
    }

    displayCommand(command, category = '') {
        displayCommand(this, command, category);
    }

    displayPrompt() {
        displayPrompt(this);
    }

    addToHistory(command) {
        addToHistory(this, command);
    }

    loadHistory() {
        loadHistory(this);
    }

    saveHistory() {
        saveHistory(this);
    }

    updateEnvironment() {
        updateEnvironment(this);
    }

    getPrompt() {
        return getPrompt(this);
    }

    applyTheme(themeName) {
        applyTheme(this, themeName);
    }

    handleThemeSwitch(args) {
        return handleThemeSwitch(this, args);
    }

    getCurrentTheme() {
        return getCurrentTheme(this);
    }

    handleThemes() {
        return handleThemes(this);
    }

    handleMechvibes() {
        return handleMechvibes(this);
    }

    handleMechvibesStatus() {
        return handleMechvibesStatus(this);
    }

    testAudio() {
        return testAudio(this);
    }

    playMusic() {
        return playMusic(this);
    }

    pauseMusic() {
        return pauseMusic(this);
    }

    handleAudioControl() {
        return handleAudioControl(this);
    }

    handleStopMusic() {
        return handleStopMusic();
    }

    handleNextTrack() {
        return handleNextTrack();
    }

    handlePrevTrack() {
        return handlePrevTrack();
    }

    handleVolume(args) {
        return handleVolume(args);
    }

    handleMute() {
        return handleMute();
    }

    handleUnmute() {
        return handleUnmute();
    }

    handleShow(args) {
        return handleShow(this, args);
    }

    handleDemoscene() {
        return handleDemoscene(this);
    }

    // Missing methods that are referenced in commands
    showHelp() {
        return CONFIG.COMMANDS.HELP;
    }

    handleAlias(args) {
        return `alias command not implemented yet. args: ${args.join(' ')}`;
    }

    handleUnalias(args) {
        return `unalias command not implemented yet. args: ${args.join(' ')}`;
    }

    handleType(args) {
        return `type command not implemented yet. args: ${args.join(' ')}`;
    }

    handleWhich(args) {
        return `which command not implemented yet. args: ${args.join(' ')}`;
    }

    handleWhereis(args) {
        return `whereis command not implemented yet. args: ${args.join(' ')}`;
    }

    handleMan(args) {
        return `man command not implemented yet. args: ${args.join(' ')}`;
    }

    handleInfo(args) {
        return `info command not implemented yet. args: ${args.join(' ')}`;
    }

    handleWhatis(args) {
        return `whatis command not implemented yet. args: ${args.join(' ')}`;
    }

    handleApropos(args) {
        return `apropos command not implemented yet. args: ${args.join(' ')}`;
    }

    handleLogging() {
        return `logging command not implemented yet.`;
    }

    handleCat(args) {
        const [file] = args;
        if (!file) {
            return 'cat: missing argument';
        }
        if (file === 'resume.txt') {
            return loadResume();
        }
        return `cat: ${file}: No such file or directory`;
    }

    // Method to restore scrolling functionality
    restoreScrolling() {
        if (this.outputElement) {
            // Use the comprehensive forceScrolling method
            this.forceScrolling();
            
            // Force scroll to top to ensure scrolling works
            this.outputElement.scrollTop = 0;
            
            console.log('Terminal scrolling restored with forced settings');
        }
    }
}