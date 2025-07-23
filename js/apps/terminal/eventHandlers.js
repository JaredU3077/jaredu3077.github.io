// js/apps/terminal/eventHandlers.js

export function setupEventListeners(terminal) {
    terminal.inputElement.addEventListener('keydown', e => terminal.handleKeyDown(e), { capture: true });
    terminal.inputElement.addEventListener('input', () => terminal.handleInput(), { passive: true });
    terminal.inputElement.addEventListener('paste', e => terminal.handlePaste(e), { passive: true });
    terminal.inputElement.addEventListener('compositionstart', () => terminal.isComposing = true, { passive: true });
    terminal.inputElement.addEventListener('compositionend', () => terminal.isComposing = false, { passive: true });
    
    // Add click handler to ensure input gets focus when clicked anywhere in the input area
    terminal.inputElement.addEventListener('click', (e) => {
        // If clicking on the input container but not directly on the input field, focus the input
        if (e.target === terminal.inputElement || e.target.classList.contains('prompt')) {
            const inputField = terminal.inputElement.querySelector('input');
            if (inputField) {
                inputField.focus();
            }
        }
    }, { passive: true });
    
    // Listen for window focus events to restore terminal input focus
    window.addEventListener('windowFocus', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
            }, 100);
        }
    });
    
    // Listen for window restore events
    window.addEventListener('windowRestore', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
            }, 150);
        }
    });
    
    // Listen for window unmaximize events
    window.addEventListener('windowUnmaximize', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
            }, 150);
        }
    });
    
    // Listen for window close events to clean up
    window.addEventListener('windowClose', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            // Clean up terminal instance
            if (window.neuOS && window.neuOS.terminalInstance === terminal) {
                window.neuOS.terminalInstance = null;
            }
        }
    });
    
    // Optimized resize handling
    terminal.setupOptimizedResizeHandler();
    
    if (window.innerWidth <= 768) terminal.setupMobileEventListeners();
}

export function setupOptimizedResizeHandler(terminal) {
    let resizeTimeout;
    let isResizing = false;
    let resizeStartTime = 0;
    let scrollPosition = 0;
    
    // Listen for window resize events
    window.addEventListener('resize', () => {
        if (!isResizing) {
            isResizing = true;
            resizeStartTime = performance.now();
            
            // Store current scroll position
            if (terminal.outputElement) {
                scrollPosition = terminal.outputElement.scrollTop;
                // Don't disable overflow during resize - it breaks scrolling
                // terminal.outputElement.style.overflow = 'hidden';
            }
            
            // Disable status bar updates during resize
            terminal._statusBarDisabled = true;
        }
        
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (terminal.outputElement) {
                // Restore scroll position or scroll to bottom if at bottom
                if (scrollPosition === terminal.outputElement.scrollHeight - terminal.outputElement.clientHeight) {
                    // Was at bottom, stay at bottom
                    terminal.scrollToBottom();
                } else {
                    // Restore previous scroll position
                    terminal.outputElement.scrollTop = scrollPosition;
                }
                
                // Ensure overflow is properly restored
                terminal.outputElement.style.overflow = 'auto';
                terminal.outputElement.style.overflowY = 'auto';
            }
            
            // Ensure input remains functional
            if (terminal.inputElement) {
                setTimeout(() => {
                    if (terminal.inputElement) {
                        terminal.inputElement.focus();
                    }
                }, 50);
            }
            terminal._statusBarDisabled = false;
            isResizing = false;
            
            // Update status bar after resize
            terminal.updateStatusBar();
        }, 150);
    }, { passive: true });
    
    // Listen for terminal window resize events with ultra-fast handling
    window.addEventListener('windowResizeUpdate', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            // Only handle resize if it's been going on for a while
            if (isResizing && performance.now() - resizeStartTime > 100) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    terminal.handleTerminalResize(e.detail.size);
                }, 100);
            }
        }
    }, { passive: true });
    
    // Listen for window resize end events
    window.addEventListener('windowResizeEnd', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            // Restore terminal functionality after resize
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
                if (terminal.outputElement) {
                    // Ensure overflow is properly restored
                    terminal.outputElement.style.overflow = 'auto';
                    terminal.outputElement.style.overflowY = 'auto';
                    
                    // Restore scroll position or scroll to bottom
                    if (scrollPosition === terminal.outputElement.scrollHeight - terminal.outputElement.clientHeight) {
                        terminal.scrollToBottom();
                    } else {
                        terminal.outputElement.scrollTop = scrollPosition;
                    }
                }
            }, 200);
        }
    }, { passive: true });
    
    // Listen for window maximize events
    window.addEventListener('windowMaximize', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
                if (terminal.outputElement) {
                    terminal.scrollToBottom();
                }
            }, 150);
        }
    });
    
    // Listen for window unmaximize events
    window.addEventListener('windowUnmaximize', (e) => {
        if (e.detail.window.id === 'terminalWindow') {
            setTimeout(() => {
                if (terminal.inputElement) {
                    terminal.inputElement.focus();
                }
                if (terminal.outputElement) {
                    terminal.scrollToBottom();
                }
            }, 150);
        }
    });
    
    // Periodic scroll position maintenance
    setInterval(() => {
        if (terminal.outputElement && !isResizing) {
            // Update stored scroll position if not at bottom
            const currentScroll = terminal.outputElement.scrollTop;
            const maxScroll = terminal.outputElement.scrollHeight - terminal.outputElement.clientHeight;
            if (currentScroll < maxScroll) {
                scrollPosition = currentScroll;
            }
        }
    }, 5000); // Check every 5 seconds
}

export function handleTerminalResize(terminal, size) {
    // Store current scroll position before any operations
    const currentScrollTop = terminal.outputElement.scrollTop;
    const scrollHeight = terminal.outputElement.scrollHeight;
    const clientHeight = terminal.outputElement.clientHeight;
    const wasAtBottom = currentScrollTop >= (scrollHeight - clientHeight - 10); // 10px tolerance
    
    // Ultra-minimal resize handling for maximum performance
    if (terminal.outputElement.children.length > 50) {
        // Only trim if there's a lot of content
        terminal.trimOutput();
    }
    
    // Restore scroll position after resize
    setTimeout(() => {
        if (wasAtBottom) {
            // Was at bottom, scroll to bottom
            terminal.scrollToBottom();
        } else {
            // Restore previous scroll position
            terminal.outputElement.scrollTop = currentScrollTop;
        }
    }, 50);
}

export function setupMobileEventListeners(terminal) {
    terminal.inputElement.addEventListener('touchstart', e => e.preventDefault(), { passive: true });
    terminal.inputElement.addEventListener('touchend', e => { terminal.inputElement.style.transform = 'scale(0.98)'; setTimeout(() => terminal.inputElement.style.transform = '', 100); }, { passive: true });
    terminal.inputElement.addEventListener('focus', () => setTimeout(() => terminal.inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300), { passive: true });
    terminal.inputElement.addEventListener('blur', () => terminal.inputElement.style.transform = '', { passive: true });
    terminal.inputElement.addEventListener('input', e => { if (e.inputType === 'insertText') terminal.currentInput = terminal.inputElement.value; }, { passive: true });
}

export function handleKeyDown(terminal, e) {
    try {
        // Don't process during IME composition
        if (terminal.isComposing) return;
        
        terminal.playTypingSound(e.key);
        
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                terminal.executeCommand();
                break;
            case 'ArrowUp':
                e.preventDefault();
                terminal.navigateHistory('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                terminal.navigateHistory('down');
                break;
            case 'Tab':
                e.preventDefault();
                terminal.handleTabCompletion();
                break;
            case 'Escape':
                e.preventDefault();
                terminal.handleEscape();
                break;
            case 'Backspace':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlBackspace();
                }
                break;
            case 'Delete':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlDelete();
                }
                break;
            case 'c':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlC();
                }
                break;
            case 'l':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.clear();
                }
                break;
            case 'r':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlR();
                }
                break;
            case 'u':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlU();
                }
                break;
            case 'k':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlK();
                }
                break;
            case 'a':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.inputElement.setSelectionRange(0, terminal.inputElement.value.length);
                }
                break;
            case 'e':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.inputElement.setSelectionRange(terminal.inputElement.value.length, terminal.inputElement.value.length);
                }
                break;
            case 'w':
                if (e.ctrlKey) {
                    e.preventDefault();
                    terminal.handleCtrlW();
                }
                break;
        }
    } catch {}
}

export function handlePaste(terminal, e) {
    // Allow paste but ensure it's handled properly
    setTimeout(() => {
        terminal.currentInput = terminal.inputElement.value;
    }, 0);
}

export function handleEscape(terminal) {
    terminal.inputElement.value = '';
    terminal.currentInput = '';
    terminal.inputElement.focus();
}

export function handleCtrlBackspace(terminal) {
    const cursorPos = terminal.inputElement.selectionStart;
    const value = terminal.inputElement.value;
    let newPos = cursorPos;
    
    // Find the start of the previous word
    while (newPos > 0 && /\s/.test(value[newPos - 1])) newPos--;
    while (newPos > 0 && !/\s/.test(value[newPos - 1])) newPos--;
    
    terminal.inputElement.value = value.slice(0, newPos) + value.slice(cursorPos);
    terminal.inputElement.setSelectionRange(newPos, newPos);
    terminal.currentInput = terminal.inputElement.value;
}

export function handleCtrlDelete(terminal) {
    const cursorPos = terminal.inputElement.selectionStart;
    const value = terminal.inputElement.value;
    let newPos = cursorPos;
    
    // Find the end of the current word
    while (newPos < value.length && !/\s/.test(value[newPos])) newPos++;
    while (newPos < value.length && /\s/.test(value[newPos])) newPos++;
    
    terminal.inputElement.value = value.slice(0, cursorPos) + value.slice(newPos);
    terminal.inputElement.setSelectionRange(cursorPos, cursorPos);
    terminal.currentInput = terminal.inputElement.value;
}

export function handleCtrlC(terminal) {
    if (terminal.inputElement.selectionStart !== terminal.inputElement.selectionEnd) {
        // Copy selected text
        const selectedText = terminal.inputElement.value.slice(
            terminal.inputElement.selectionStart,
            terminal.inputElement.selectionEnd
        );
        navigator.clipboard.writeText(selectedText);
    } else {
        // Clear line
        terminal.inputElement.value = '';
        terminal.currentInput = '';
    }
}

export function handleCtrlR(terminal) {
    // Reverse search through history
    const searchTerm = terminal.inputElement.value;
    if (!searchTerm) return;
    
    const matchingHistory = terminal.history
        .slice()
        .reverse()
        .find(cmd => cmd.includes(searchTerm));
    
    if (matchingHistory) {
        terminal.inputElement.value = matchingHistory;
        terminal.currentInput = matchingHistory;
    }
}

export function handleCtrlU(terminal) {
    // Clear from cursor to beginning of line
    const cursorPos = terminal.inputElement.selectionStart;
    terminal.inputElement.value = terminal.inputElement.value.slice(cursorPos);
    terminal.inputElement.setSelectionRange(0, 0);
    terminal.currentInput = terminal.inputElement.value;
}

export function handleCtrlK(terminal) {
    // Clear from cursor to end of line
    const cursorPos = terminal.inputElement.selectionStart;
    terminal.inputElement.value = terminal.inputElement.value.slice(0, cursorPos);
    terminal.inputElement.setSelectionRange(cursorPos, cursorPos);
    terminal.currentInput = terminal.inputElement.value;
}

export function handleCtrlW(terminal) {
    // Delete word before cursor
    terminal.handleCtrlBackspace();
}

export async function playTypingSound(terminal, key) {
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

export function handleInput(terminal) {
    // Only update currentInput if we're not navigating history
    if (terminal.historyIndex === -1) {
        terminal.currentInput = terminal.inputElement.value;
    }
}

export function navigateHistory(terminal, direction) {
    if (!terminal.history.length) return;
    
    if (direction === 'up') {
        if (terminal.historyIndex < terminal.history.length - 1) {
            terminal.historyIndex++;
            terminal.inputElement.value = terminal.history[terminal.history.length - 1 - terminal.historyIndex];
        }
    } else if (direction === 'down') {
        if (terminal.historyIndex > -1) {
            terminal.historyIndex--;
            if (terminal.historyIndex === -1) {
                terminal.inputElement.value = terminal.currentInput;
            } else {
                terminal.inputElement.value = terminal.history[terminal.history.length - 1 - terminal.historyIndex];
            }
        }
    }
    
    // Move cursor to end of input
    terminal.inputElement.setSelectionRange(terminal.inputElement.value.length, terminal.inputElement.value.length);
    terminal.currentInput = terminal.inputElement.value;
}

export function handleTabCompletion(terminal) {
    const input = terminal.inputElement.value.trim();
    if (!input) return;
    
    const words = input.split(/\s+/);
    const lastWord = words[words.length - 1];
    const prefix = words.slice(0, -1).join(' ') + (words.length > 1 ? ' ' : '');
    
    // Get all available commands and files
    const availableCommands = [...terminal.commands.keys()];
    const availableFiles = ['resume.txt', 'network-configs/', 'scripts/', 'config.json', 'manifest.json'];
    const allOptions = [...availableCommands, ...availableFiles];
    
    const matchingOptions = allOptions.filter(option => option.startsWith(lastWord));
    
    if (matchingOptions.length === 1) {
        // Single match - complete it
        terminal.inputElement.value = prefix + matchingOptions[0] + ' ';
        terminal.currentInput = terminal.inputElement.value;
    } else if (matchingOptions.length > 1) {
        // Multiple matches - show options
        terminal.writeOutput(`<div class="terminal-completion">Completions:</div>`);
        matchingOptions.forEach(option => {
            terminal.writeOutput(`<div class="terminal-completion-item">${option}</div>`);
        });
    }
    
    terminal.inputElement.focus();
}