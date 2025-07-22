// js/apps/terminal/history.js

/**
 * Terminal command history management
 * @author jared u.
 */

const MAX_HISTORY_SIZE = 1000;

/**
 * Add a command to history
 * @param {string} command - The command to add
 */
export function addToHistory(command) {
    if (!command || typeof command !== 'string') {
        return;
    }
    
    // Remove leading/trailing whitespace
    command = command.trim();
    
    // Don't add empty commands or duplicates
    if (!command || (this.history.length > 0 && this.history[this.history.length - 1] === command)) {
        return;
    }
    
    this.history.push(command);
    
    // Limit history size
    if (this.history.length > MAX_HISTORY_SIZE) {
        this.history.shift();
    }
    
    // Reset history index
    this.historyIndex = -1;
    
    // Save to localStorage
    this.saveHistory();
}

/**
 * Load history from localStorage
 */
export function loadHistory() {
    try {
        const savedHistory = localStorage.getItem('neuOS_terminal_history');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.historyIndex = -1;
        }
    } catch (error) {
        console.warn('neuOS: Failed to load terminal history:', error);
        this.history = [];
    }
}

/**
 * Save history to localStorage
 */
export function saveHistory() {
    try {
        localStorage.setItem('neuOS_terminal_history', JSON.stringify(this.history));
    } catch (error) {
        console.warn('neuOS: Failed to save terminal history:', error);
    }
} 