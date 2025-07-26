import { NeuOSLogger } from '../../utils/utils.js';

// js/apps/terminal/environment.js

/**
 * Terminal environment management
 * @author jared u.
 */

/**
 * Update the terminal environment
 */
export function updateEnvironment(terminal) {
    const logger = NeuOSLogger.getInstance();
    logger.debug('updateEnvironment called with terminal:', terminal);
    logger.debug('terminal.workingDirectory:', terminal?.workingDirectory);
    
    // Update current working directory display
    const cwdElement = document.querySelector('.terminal-cwd');
    if (cwdElement) {
        cwdElement.textContent = terminal.workingDirectory || '~';
    }
    
    // Update environment variables if needed
    terminal.environment = {
        ...terminal.environment,
        PWD: terminal.workingDirectory || '~',
        USER: 'jared',
        HOME: '~',
        TERM: 'xterm-256color'
    };
}

/**
 * Get the current prompt string
 * @returns {string} The formatted prompt
 */
export function getPrompt(terminal) {
    const logger = NeuOSLogger.getInstance();
    logger.debug('getPrompt called with terminal:', terminal);
    logger.debug('terminal.workingDirectory:', terminal?.workingDirectory);
    
    const cwd = terminal.workingDirectory || '~';
    const user = terminal.environment?.USER || 'jared';
    const host = window.location.hostname || 'neuOS';
    
    return `${user}@${host}:${cwd}$ `;
} 