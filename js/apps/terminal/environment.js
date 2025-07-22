// js/apps/terminal/environment.js

/**
 * Terminal environment management
 * @author jared u.
 */

/**
 * Update the terminal environment
 */
export function updateEnvironment() {
    // Update current working directory display
    const cwdElement = document.querySelector('.terminal-cwd');
    if (cwdElement) {
        cwdElement.textContent = this.currentDirectory || '~';
    }
    
    // Update environment variables if needed
    this.environment = {
        ...this.environment,
        PWD: this.currentDirectory || '~',
        USER: 'jared',
        HOME: '~',
        TERM: 'xterm-256color'
    };
}

/**
 * Get the current prompt string
 * @returns {string} The formatted prompt
 */
export function getPrompt() {
    const cwd = this.currentDirectory || '~';
    const user = this.environment?.USER || 'jared';
    const host = window.location.hostname || 'neuOS';
    
    return `${user}@${host}:${cwd}$ `;
} 