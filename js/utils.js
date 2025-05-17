/**
 * Utility Module
 * Contains common utility functions and error handling
 */

export class AppError extends Error {
    constructor(message, type, details = {}) {
        super(message);
        this.name = 'AppError';
        this.type = type;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

export const ErrorTypes = {
    MODULE_LOAD: 'MODULE_LOAD',
    NETWORK_INIT: 'NETWORK_INIT',
    FILE_LOAD: 'FILE_LOAD',
    WINDOW_OP: 'WINDOW_OP',
    VALIDATION: 'VALIDATION'
};

/**
 * Create a loading indicator element
 * @param {string} message - Loading message to display
 * @returns {HTMLElement} Loading indicator element
 */
export function createLoadingIndicator(message = 'Loading...') {
    const indicator = document.createElement('div');
    indicator.className = 'loading-indicator';
    indicator.innerHTML = `
        <div class="spinner"></div>
        <div class="message">${message}</div>
    `;
    return indicator;
}

/**
 * Show a loading indicator in the specified container
 * @param {HTMLElement} container - Container to show loading indicator in
 * @param {string} message - Loading message to display
 * @returns {HTMLElement} Loading indicator element
 */
export function showLoading(container, message) {
    const indicator = createLoadingIndicator(message);
    container.appendChild(indicator);
    return indicator;
}

/**
 * Hide a loading indicator
 * @param {HTMLElement} indicator - Loading indicator to hide
 */
export function hideLoading(indicator) {
    if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
    }
}

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHTML(html) {
    const temp = document.createElement('div');
    temp.textContent = html;
    return temp.innerHTML;
}

/**
 * Validate command input
 * @param {string} command - Command to validate
 * @returns {boolean} Whether the command is valid
 */
export function validateCommand(command) {
    // Basic command validation
    if (!command || typeof command !== 'string') {
        return false;
    }

    // Remove leading/trailing whitespace
    command = command.trim();

    // Check for minimum length
    if (command.length === 0) {
        return false;
    }

    // Check for maximum length
    if (command.length > 100) {
        return false;
    }

    // Check for allowed characters
    const allowedChars = /^[a-zA-Z0-9\s\-_.,!?]+$/;
    if (!allowedChars.test(command)) {
        return false;
    }

    return true;
} 