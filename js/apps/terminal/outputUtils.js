// js/apps/terminal/outputUtils.js

import { AppError, ErrorTypes, eventEmitter } from '../../utils/utils.js';

export function writeOutput(terminal, content) {
    if (!content || typeof content !== 'string') return;
    
    // For HTML content, don't apply syntax highlighting
    const isHtmlContent = content.includes('<div') || content.includes('<span') || content.includes('<h3') || content.includes('<p>');
    const formattedContent = isHtmlContent ? content : formatOutputWithSyntaxHighlighting(content);
    
    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal-result';
    outputDiv.innerHTML = formattedContent;
    outputDiv.style.animation = 'resultSlideIn 0.3s ease-out';
    
    terminal.outputElement.appendChild(outputDiv);
    trimOutput(terminal);
    scrollToBottom(terminal);
    
    // Only add interactive elements for non-HTML content to avoid conflicts
    if (!isHtmlContent) {
        addInteractiveElements(terminal, outputDiv);
    }
}

export function formatOutputWithSyntaxHighlighting(content) {
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

export function addInteractiveElements(terminal, outputDiv) {
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
                    handlePathClick(terminal, path.textContent);
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
                copyToClipboard(terminal, block.textContent);
            });
        });
    }
}

export function handlePathClick(terminal, path) {
    writeOutput(terminal, `<div class="terminal-info">navigating to: ${path}</div>`);
    // Here you could implement actual navigation logic
}

export async function copyToClipboard(terminal, text) {
    try {
        await navigator.clipboard.writeText(text);
        writeOutput(terminal, '<div class="terminal-success">copied to clipboard</div>');
    } catch (err) {
        writeOutput(terminal, '<div class="terminal-error">failed to copy to clipboard</div>');
    }
}

export function trimOutput(terminal) {
    while (terminal.outputElement.children.length > terminal.maxOutputLength) {
        terminal.outputElement.removeChild(terminal.outputElement.firstChild);
    }
}

export function scrollToBottom(terminal) {
    terminal.outputElement.scrollTop = terminal.outputElement.scrollHeight;
}

export function scrollToTop(terminal) {
    terminal.outputElement.scrollTop = 0;
}

export function isDocumentContent(command, output) {
    return command.includes('show') || command.includes('resume') || command.includes('demoscene');
}

export function clear(terminal) {
    terminal.outputElement.innerHTML = '';
    displayPrompt(terminal);
    terminal.inputElement.focus();
}

export function clearInput(terminal) {
    terminal.inputElement.value = '';
    terminal.currentInput = '';
}

export function formatOutput(output, element) {
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

export function showLoading(terminal, message = 'processing...') {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'terminal-loading';
    loadingDiv.textContent = message;
    loadingDiv.id = 'terminal-loading';
    
    terminal.outputElement.appendChild(loadingDiv);
    scrollToBottom(terminal);
}

export function hideLoading(terminal) {
    const loadingDiv = document.getElementById('terminal-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

export function handleCommandError(terminal, error) {
    const errorMessage = error instanceof AppError ? error.message : error.toString();
    const errorDiv = document.createElement('div');
    errorDiv.className = 'terminal-error';
    errorDiv.innerHTML = `<span class="error">error:</span> ${formatOutputWithSyntaxHighlighting(errorMessage)}`;
    errorDiv.style.animation = 'errorShake 0.5s ease-in-out';
    
    terminal.outputElement.appendChild(errorDiv);
    scrollToBottom(terminal);
    eventEmitter.emit('terminalError', { error });
}

export function handleCommandSuccess(terminal, message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'terminal-success';
    successDiv.innerHTML = `<span class="success">success:</span> ${formatOutputWithSyntaxHighlighting(message)}`;
    successDiv.style.animation = 'successBounce 0.6s ease-out';
    
    terminal.outputElement.appendChild(successDiv);
    scrollToBottom(terminal);
}

export async function handleCommandResult(terminal, result, command = '') {
    const resultElement = document.createElement('div');
    resultElement.className = 'terminal-result';
    let output = result instanceof Promise ? await result : result;
    formatOutput(output, resultElement);
    terminal.outputElement.appendChild(resultElement);
    isDocumentContent(command, output) ? scrollToTop(terminal) : scrollToBottom(terminal);
}

export function displayCommand(terminal, command, category = '') {
    const commandDiv = document.createElement('div');
    commandDiv.className = `terminal-command ${category}`;
    
    const prompt = document.createElement('span');
    prompt.className = 'prompt';
    prompt.textContent = terminal.getPrompt();
    
    const commandText = document.createElement('span');
    commandText.className = 'command-text';
    commandText.textContent = command;
    
    commandDiv.appendChild(prompt);
    commandDiv.appendChild(commandText);
    
    terminal.outputElement.appendChild(commandDiv);
    scrollToBottom(terminal);
}

export function displayPrompt(terminal) {
    const promptElement = document.createElement('div');
    promptElement.className = 'terminal-prompt';
    promptElement.innerHTML = `<span class="prompt">${terminal.getPrompt()}</span>`;
    terminal.outputElement.appendChild(promptElement);
}