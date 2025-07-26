// js/apps/terminal/outputUtils.js

import { AppError, eventEmitter } from '../../utils/utils.js';

function detectContentType(content) {
    if (typeof content !== 'string') return 'plain';
    
    // Check for resume content more comprehensively
    const resumeKeywords = [
        'Jared Ubriaco', 'Senior Network Engineer', 'Professional Summary', 
        'Professional Experience', 'Skills', 'Certifications', 'Network Engineer',
        'Technology Consultant', 'Computer Support Specialist', 'Network Manager'
    ];
    
    const hasResumeKeywords = resumeKeywords.some(keyword => 
        content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasResumeKeywords) return 'resume';
    if (/<(div|span|h3|p)/i.test(content)) return 'html';
    return 'code';
}

export function writeOutput(terminal, content) {
    if (!content || typeof content !== 'string') return;
    
    const type = detectContentType(content);
    let formatted = content;
    
    // Only apply syntax highlighting to code content
    if (type === 'code') {
        formatted = formatOutputWithSyntaxHighlighting(content);
    }
    
    const outputDiv = document.createElement('div');
    outputDiv.className = 'terminal-result';
    outputDiv.style.animation = 'resultSlideIn 0.3s ease-out';
    
    // For resume content, use textContent to avoid HTML rendering issues
    if (type === 'resume') {
        outputDiv.textContent = formatted;
    } else {
        outputDiv.innerHTML = formatted;
    }
    
    terminal.outputElement.appendChild(outputDiv);
    trimOutput(terminal);
    
    if (!terminal._disableAutoScroll) {
        scrollToBottom(terminal);
    }
    
    // Only add interactive elements for code content
    if (type === 'code') {
        addInteractiveElements(terminal, outputDiv);
    }
}

export function formatOutputWithSyntaxHighlighting(content) {
    // Performance optimization: simplified highlighting for better performance
    return content
        .replace(/\b(error|Error|ERROR|failed|Failed|FAILED)\b/gi, '<span class="error">$1</span>')
        .replace(/\b(success|Success|SUCCESS|connected|Connected)\b/gi, '<span class="success">$1</span>')
        .replace(/\b(ssh|ping|show|clear|help|exit|launch|apps|close|focus)\b/gi, '<span class="keyword">$1</span>');
}

export function addInteractiveElements(terminal, outputDiv) {
    outputDiv.querySelectorAll('.string').forEach(el => {
        const text = el.textContent;
        if (text?.startsWith('/')) {
            el.style.cursor = 'pointer';
            el.title = 'Click to navigate';
            el.addEventListener('click', () => handlePathClick(terminal, text));
        }
    });
    outputDiv.querySelectorAll('pre, code').forEach(el => {
        el.style.cursor = 'pointer';
        el.title = 'Click to copy';
        el.addEventListener('click', () => copyToClipboard(terminal, el.textContent));
    });
}

export function handlePathClick(terminal, path) {
    writeOutput(terminal, `navigating to: ${path}`);
}

export async function copyToClipboard(terminal, text) {
    try {
        await navigator.clipboard.writeText(text);
        writeOutput(terminal, 'copied to clipboard');
    } catch {
        writeOutput(terminal, 'failed to copy');
    }
}

export function trimOutput(terminal) {
    const { outputElement, maxOutputLength } = terminal;
    while (outputElement.children.length > maxOutputLength) {
        outputElement.firstChild.remove();
    }
}

export function scrollToBottom(terminal) {
    const el = terminal.outputElement;
    el.scrollTop = el.scrollHeight;
}

export function scrollToTop(terminal) {
    const el = terminal.outputElement;
    el.scrollTop = 0;
    setTimeout(() => el.scrollTop = 0, 50);
}

export function isDocumentContent(command, output) {
    return /show|resume|demoscene/i.test(command);
}

export function clear(terminal) {
    terminal.outputElement.innerHTML = '';
    displayPrompt(terminal);
    terminal.inputElement.focus();
}

export function formatOutput(output, element) {
    if (typeof output === 'string') {
        /<[^>]*>/.test(output) ? element.innerHTML = output : element.textContent = output;
    } else if (Array.isArray(output)) {
        element.textContent = output.join('\n');
    } else if (output && typeof output === 'object') {
        element.textContent = JSON.stringify(output, null, 2);
    } else {
        element.textContent = String(output);
    }
}

export function showLoading(terminal, message = 'processing...') {
    const div = document.createElement('div');
    div.className = 'terminal-loading';
    div.textContent = message;
    terminal.outputElement.appendChild(div);
    scrollToBottom(terminal);
}

export function hideLoading(terminal) {
    terminal.outputElement.querySelector('.terminal-loading')?.remove();
}

export function handleCommandError(terminal, error) {
    const msg = error instanceof AppError ? error.message : String(error);
    const div = document.createElement('div');
    div.className = 'terminal-error';
    div.innerHTML = `error: ${formatOutputWithSyntaxHighlighting(msg)}`;
    div.style.animation = 'errorShake 0.5s ease-in-out';
    terminal.outputElement.appendChild(div);
    scrollToBottom(terminal);
    eventEmitter.emit('terminalError', { error });
}

export function handleCommandSuccess(terminal, message) {
    const div = document.createElement('div');
    div.className = 'terminal-success';
    div.innerHTML = `success: ${formatOutputWithSyntaxHighlighting(message)}`;
    div.style.animation = 'successBounce 0.6s ease-out';
    terminal.outputElement.appendChild(div);
    scrollToBottom(terminal);
}

export async function handleCommandResult(terminal, result, command = '') {
    const output = await (result instanceof Promise ? result : Promise.resolve(result));
    const div = document.createElement('div');
    div.className = 'terminal-result';
    formatOutput(output, div);
    terminal.outputElement.appendChild(div);
    if (isDocumentContent(command, output)) {
        scrollToTop(terminal);
        terminal._disableAutoScroll = true;
        setTimeout(() => terminal._disableAutoScroll = false, 1000);
    } else if (!terminal._disableAutoScroll) {
        scrollToBottom(terminal);
    }
}

export function displayCommand(terminal, command, category = '') {
    const div = document.createElement('div');
    div.className = `terminal-command ${category}`;
    div.innerHTML = `<span class="prompt">${terminal.getPrompt()}</span><span class="command-text">${command}</span>`;
    terminal.outputElement.appendChild(div);
    if (!terminal._disableAutoScroll) scrollToBottom(terminal);
}

export function displayPrompt(terminal) {
    const div = document.createElement('div');
    div.className = 'terminal-prompt';
    div.innerHTML = `<span class="prompt">${terminal.getPrompt()}</span>`;
    terminal.outputElement.appendChild(div);
}