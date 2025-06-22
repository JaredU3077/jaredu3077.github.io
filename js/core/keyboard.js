/**
 * @file Manages global keyboard shortcuts for the application.
 * @author Jared U.
 */

import { CONFIG } from '../config.js';

/**
 * Handles the registration and execution of global keyboard shortcuts.
 * @class KeyboardManager
 */
export class KeyboardManager {
    /**
     * Creates an instance of KeyboardManager.
     * @param {WindowManager} windowManager - An instance of the WindowManager.
     * @param {Terminal} terminal - An instance of the Terminal.
     * @param {NetworkVisualization} network - An instance of the NetworkVisualization.
     * @memberof KeyboardManager
     */
    constructor(windowManager, terminal, network) {
        this.windowManager = windowManager;
        this.terminal = terminal;
        this.network = network;
        this.shortcuts = new Map();
        this.initializeShortcuts();
        this.initializeEventListeners();
    }

    /**
     * Initializes the default keyboard shortcuts.
     * @private
     * @memberof KeyboardManager
     */
    initializeShortcuts() {
        // Window management shortcuts
        this.shortcuts.set('Alt+T', () => this.windowManager.createWindow(CONFIG.applications.terminal.windows[0]));
        this.shortcuts.set('Alt+N', () => this.windowManager.createWindow(CONFIG.applications['network-monitor'].windows[0]));
        this.shortcuts.set('Escape', () => this.closeActiveWindow());

        // Terminal shortcuts (Note: a focused terminal will handle its own shortcuts)
        this.shortcuts.set('Ctrl+L', () => {
            if (this.terminal) this.terminal.clear();
        });

        // Network shortcuts
        this.shortcuts.set('Ctrl+F', () => this.network.fit());
        this.shortcuts.set('Ctrl+Plus', () => this.network.zoomIn());
        this.shortcuts.set('Ctrl+Minus', () => this.network.zoomOut());
        this.shortcuts.set('Ctrl+0', () => this.network.resetZoom());
    }

    /**
     * Sets up the global keydown event listener.
     * @private
     * @memberof KeyboardManager
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
     * Generates a consistent string representation of a key combination from a keyboard event.
     * @param {KeyboardEvent} e - The keyboard event.
     * @returns {string} The key combination string (e.g., "Ctrl+Shift+C").
     * @private
     * @memberof KeyboardManager
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
     * Closes the currently active window.
     * @private
     * @memberof KeyboardManager
     */
    closeActiveWindow() {
        const activeWindow = document.querySelector('.window:not([style*="display: none"])');
        if (activeWindow) {
            const closeBtn = activeWindow.querySelector('.window-control.close');
            if (closeBtn) {
                closeBtn.click();
            } else {
                activeWindow.style.display = 'none';
            }
        }
    }

    /**
     * Adds a new keyboard shortcut.
     * @param {string} keyCombo - The key combination string (e.g., "Ctrl+S").
     * @param {Function} callback - The function to execute when the shortcut is pressed.
     * @memberof KeyboardManager
     */
    addShortcut(keyCombo, callback) {
        this.shortcuts.set(keyCombo, callback);
    }

    /**
     * Removes a keyboard shortcut.
     * @param {string} keyCombo - The key combination string to remove.
     * @memberof KeyboardManager
     */
    removeShortcut(keyCombo) {
        this.shortcuts.delete(keyCombo);
    }
} 