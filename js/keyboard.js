/**
 * Keyboard Shortcuts Module
 * Handles keyboard shortcuts for common operations
 */

import { CONFIG } from './config.js';

export class KeyboardManager {
    constructor(windowManager, terminal, network) {
        this.windowManager = windowManager;
        this.terminal = terminal;
        this.network = network;
        this.shortcuts = new Map();
        this.initializeShortcuts();
        this.initializeEventListeners();
    }

    /**
     * Initialize keyboard shortcuts
     */
    initializeShortcuts() {
        // Window management shortcuts
        this.shortcuts.set('Alt+N', () => this.windowManager.showWindow('topologyWindow'));
        this.shortcuts.set('Alt+T', () => this.windowManager.showWindow('terminalWindow'));
        this.shortcuts.set('Alt+C', () => this.windowManager.showWindow('codexWindow'));
        this.shortcuts.set('Alt+W', () => this.windowManager.showWindow('widgetsWindow'));
        this.shortcuts.set('Escape', () => this.closeActiveWindow());
        this.shortcuts.set('Alt+F4', () => this.closeActiveWindow());

        // Terminal shortcuts
        this.shortcuts.set('Ctrl+L', () => this.terminal.clear());
        this.shortcuts.set('Ctrl+U', () => this.terminal.clearInput());
        this.shortcuts.set('Ctrl+R', () => this.terminal.reload());

        // Network shortcuts
        this.shortcuts.set('Ctrl+F', () => this.network.fit());
        this.shortcuts.set('Ctrl+Plus', () => this.network.zoomIn());
        this.shortcuts.set('Ctrl+Minus', () => this.network.zoomOut());
        this.shortcuts.set('Ctrl+0', () => this.network.resetZoom());
    }

    /**
     * Initialize keyboard event listeners
     */
    initializeEventListeners() {
        document.addEventListener('keydown', (e) => {
            // Don't trigger shortcuts if user is typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const key = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(key);

            if (shortcut) {
                e.preventDefault();
                shortcut();
            }
        });
    }

    /**
     * Get key combination string from event
     * @param {KeyboardEvent} e - Keyboard event
     * @returns {string} Key combination string
     */
    getKeyCombo(e) {
        const modifiers = [];
        if (e.altKey) modifiers.push('Alt');
        if (e.ctrlKey) modifiers.push('Ctrl');
        if (e.shiftKey) modifiers.push('Shift');
        if (e.metaKey) modifiers.push('Meta');

        const key = e.key.toUpperCase();
        if (modifiers.length > 0) {
            return modifiers.join('+') + '+' + key;
        }
        return key;
    }

    /**
     * Close the active window
     */
    closeActiveWindow() {
        const activeWindow = document.querySelector('.window:not([style*="display: none"])');
        if (activeWindow) {
            const closeBtn = activeWindow.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }

    /**
     * Add a new keyboard shortcut
     * @param {string} keyCombo - Key combination string
     * @param {Function} callback - Function to execute
     */
    addShortcut(keyCombo, callback) {
        this.shortcuts.set(keyCombo, callback);
    }

    /**
     * Remove a keyboard shortcut
     * @param {string} keyCombo - Key combination string
     */
    removeShortcut(keyCombo) {
        this.shortcuts.delete(keyCombo);
    }
} 