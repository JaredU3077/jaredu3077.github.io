import { CONFIG } from '../config.js';
import { debounce, throttle } from '../utils/utils.js';
import { DragHandler } from './dragHandler.js';
import { ResizeHandler } from './resizeHandler.js';
import { SnapHandler } from './snapHandler.js';
import { AutoScrollHandler } from './autoScrollHandler.js';

/**
 * Manages windows in the OS-like interface.
 * Handles creation, movement, resizing, and focus of windows.
 * @class WindowManager
 */
export class WindowManager {
    /**
     * Creates an instance of WindowManager.
     * @memberof WindowManager
     */
    constructor() {
        /** @type {Map<string, object>} */
        this.windows = new Map();
        /** @type {?object} */
        this.activeWindow = null;
        /** @type {number} */
        this.zIndexCounter = CONFIG.window?.zIndex || 1000;
        /** @type {number} */
        this.taskbarHeight = 54; // Assumed taskbar height; consider moving to CONFIG if variable
        /** @type {?HTMLElement} */
        this.contextMenu = null;
        /** @type {Array<object>} */
        this.windowStack = [];
        /** @type {Set<Function>} */
        this.stateChangeCallbacks = new Set();
        // Removed interactInstances - no longer using interact.js

        this.dragHandler = new DragHandler(this);
        this.resizeHandler = new ResizeHandler(this);
        this.snapHandler = new SnapHandler(this);
        this.autoScrollHandler = new AutoScrollHandler(this);

        this.setupGlobalObservers();
        this.setupEventListeners();
    }

    /**
     * Sets up global observers for resize and position changes.
     * @private
     * @memberof WindowManager
     */
    setupGlobalObservers() {
        // Resize observer for window size changes
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const windowObj = this.windows.get(entry.target.id);
                if (windowObj) {
                    this.updateWindowSize(windowObj);
                }
            }
        });

        // Mutation observer for position changes via style attributes
        this.moveObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const windowObj = this.windows.get(mutation.target.id);
                    if (windowObj) {
                        this.updateWindowPosition(windowObj);
                    }
                }
            }
        });
        
        // Store observed elements for proper cleanup
        this.observedElements = new Set();
    }

    /**
     * Creates a new window and adds it to the desktop.
     * @param {object} options - The options for the new window.
     * @param {string} options.id - The unique ID for the window.
     * @param {string} options.title - The title of the window.
     * @param {string} options.content - The HTML content of the window.
     * @param {number} [options.width=CONFIG.window.defaultWidth] - The width of the window.
     * @param {number} [options.height=CONFIG.window.defaultHeight] - The height of the window.
     * @param {string} [options.icon] - The icon for the window header.
     * @param {boolean} [options.autoScroll=false] - Whether to enable auto-scroll to bottom on content updates.
     * @param {string} [options.type='app'] - The type of window (e.g., 'app' or 'game').
     * @param {object} [options.defaultSize=null] - Default size override.
     * @returns {HTMLElement} The created window element.
     * @memberof WindowManager
     */
    createWindow({ id, title, content, width = CONFIG.window.defaultWidth, height = CONFIG.window.defaultHeight, icon, autoScroll = false, type = 'app', defaultSize = null }) {
        if (defaultSize) {
            width = defaultSize.width;
            height = defaultSize.height;
        }

        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            width = window.innerWidth - 40;
            height = window.innerHeight - 100;
        }

        const minWidth = isMobile ? 300 : (CONFIG.window?.minWidth || 300);
        const maxWidth = isMobile ? window.innerWidth : (CONFIG.window?.maxWidth || 2000);
        const minHeight = isMobile ? 200 : (CONFIG.window?.minHeight || 200);
        const maxHeight = isMobile ? window.innerHeight : (CONFIG.window?.maxHeight || 1500);

        width = Math.min(Math.max(width, minWidth), maxWidth);
        height = Math.min(Math.max(height, minHeight), maxHeight);

        const desktop = document.getElementById('desktop');
        if (!desktop) {
            throw new Error('Desktop element not found! Cannot create window.');
        }

        let left = (desktop.clientWidth - width) / 2;
        let top = (desktop.clientHeight - height) / 2;

        if (isMobile) {
            left = 0;
            top = 0;
        } else {
            left = Math.max(0, Math.min(left, desktop.clientWidth - width));
            top = Math.max(0, Math.min(top, desktop.clientHeight - height));
        }

        const windowElement = document.createElement('div');
        windowElement.className = type === 'game' ? 'window game-window' : 'window';
        windowElement.id = id;
        windowElement.setAttribute('role', 'dialog');
        windowElement.setAttribute('aria-label', title);
        windowElement.style.position = 'absolute';
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
        windowElement.style.left = `${left}px`;
        windowElement.style.top = `${top}px`;
        windowElement.style.zIndex = this.getNextZIndex();

        windowElement.innerHTML = `
            <div class="window-header" role="banner" aria-label="${title} window header">
                <div class="window-title">
                    <span class="icon">${icon || ''}</span>
                    <span class="label">${title}</span>
                </div>
                <div class="window-controls">
                    <button class="window-control minimize" title="Minimize" aria-label="Minimize window">-</button>
                    <button class="window-control maximize" title="Maximize" aria-label="Maximize window">□</button>
                    <button class="window-control close" title="Close" aria-label="Close window">×</button>
                </div>
            </div>
            <div class="window-content" tabindex="0" data-scroll-container>
                ${content}
            </div>
            <!-- Resize handles will be created by ResizeHandler -->
        `;
        desktop.appendChild(windowElement);

        const windowObj = {
            element: windowElement,
            id,
            title,
            content,
            width,
            height,
            left,
            top,
            isMaximized: false,
            isMinimized: false,
            originalPosition: { left, top, width, height },
            autoScroll,
            type,
            _hasBeenResized: false,
            _isSnapped: false,
            _isDragging: false,
            _isResizing: false
        };

        this.windows.set(id, windowObj);
        this.windowStack.push(windowObj);

        this.setupWindowEvents(windowObj);
        this.focusWindow(windowObj);

        if (autoScroll) {
            this.autoScrollHandler.setupAutoScroll(windowObj);
        }

        // Attach observers
        this.resizeObserver.observe(windowElement);
        this.moveObserver.observe(windowElement, { attributes: true });
        this.observedElements.add(windowElement);

        return windowElement;
    }

    /**
     * Sets up event listeners for a window (drag, resize, controls).
     * @param {object} windowObj - The window object to set up events for.
     * @private
     * @memberof WindowManager
     */
    setupWindowEvents(windowObj) {
        const header = windowObj.element.querySelector('.window-header');
        const controls = windowObj.element.querySelector('.window-controls');

        if (!header || !controls) {
            console.error('Window header or controls not found for:', windowObj.id);
            return;
        }

        // Initialize window events (no longer using interact.js)

        this.dragHandler.setupDrag(header, windowObj);
        this.resizeHandler.setupResize(windowObj.element, windowObj);

        try {
            const minimizeBtn = controls.querySelector('.minimize');
            const maximizeBtn = controls.querySelector('.maximize');
            const closeBtn = controls.querySelector('.close');

            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', (e) => { 
                    e.stopPropagation(); 
                    this.minimizeWindow(windowObj); 
                });
            }
            if (maximizeBtn) {
                maximizeBtn.addEventListener('click', (e) => { 
                    e.stopPropagation(); 
                    this.toggleMaximize(windowObj); 
                });
            }
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => { 
                    e.stopPropagation(); 
                    this.closeWindow(windowObj); 
                });
            }
        } catch (error) {
            console.error('Failed to setup controls for window:', windowObj.id, error);
        }

        windowObj.element.addEventListener('mousedown', () => this.focusWindow(windowObj));
        windowObj.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, windowObj);
        });
    }

    /**
     * Placeholder for showing context menu.
     * @param {Event} e - The event.
     * @param {object} windowObj - The window.
     * @private
     * @memberof WindowManager
     */
    showContextMenu(e, windowObj) {
        // Implement context menu logic here if needed
    }

    /**
     * Minimizes a window.
     * @param {object} windowObj - The window to minimize.
     * @memberof WindowManager
     */
    minimizeWindow(windowObj) {
        if (windowObj.isMinimized) {
            this.restoreWindow(windowObj);
        } else {
            windowObj.isMinimized = true;
            windowObj.element.classList.add('minimizing');
            windowObj.element.style.transform = 'translateY(100vh)';
            setTimeout(() => {
                windowObj.element.style.display = 'none';
                windowObj.element.classList.remove('minimizing');
            }, 300);
        }
    }

    /**
     * Restores a window from minimized or maximized state.
     * @param {object} windowObj - The window to restore.
     * @memberof WindowManager
     */
    restoreWindow(windowObj) {
        windowObj.isMinimized = false;
        windowObj.element.style.display = '';
        windowObj.element.classList.add('restoring');
        windowObj.element.style.transform = '';
        windowObj.element.style.left = `${windowObj.originalPosition.left}px`;
        windowObj.element.style.top = `${windowObj.originalPosition.top}px`;
        windowObj.element.style.width = `${windowObj.originalPosition.width}px`;
        windowObj.element.style.height = `${windowObj.originalPosition.height}px`;
        setTimeout(() => {
            windowObj.element.classList.remove('restoring');
        }, 300);
    }

    /**
     * Toggles the maximized state of a window.
     * @param {object} windowObj - The window to toggle.
     * @memberof WindowManager
     */
    toggleMaximize(windowObj) {
        if (windowObj.isMaximized) {
            this.unmaximizeWindow(windowObj);
        } else {
            this.maximizeWindow(windowObj);
        }
    }

    /**
     * Maximizes a window to fill the screen.
     * @param {object} windowObj - The window to maximize.
     * @private
     * @memberof WindowManager
     */
    maximizeWindow(windowObj) {
        windowObj.isMaximized = true;
        windowObj.originalPosition = {
            left: windowObj.left,
            top: windowObj.top,
            width: windowObj.width,
            height: windowObj.height
        };

        // Move window to body to break out of desktop container constraints
        const desktop = document.getElementById('desktop');
        if (desktop && windowObj.element.parentNode === desktop) {
            document.body.appendChild(windowObj.element);
        }

        windowObj.element.classList.add('maximizing', 'maximized');
        windowObj.element.style.position = 'fixed';
        windowObj.element.style.left = '0px';
        windowObj.element.style.top = '0px';
        windowObj.element.style.right = '0px';
        windowObj.element.style.bottom = '0px';
        windowObj.element.style.width = '100vw';
        windowObj.element.style.height = '100vh';
        windowObj.element.style.margin = '0px';
        windowObj.element.style.padding = '0px';

        setTimeout(() => {
            windowObj.element.classList.remove('maximizing');
        }, 300);
    }

    /**
     * Restores a window from maximized state.
     * @param {object} windowObj - The window to unmaximize.
     * @private
     * @memberof WindowManager
     */
    unmaximizeWindow(windowObj) {
        windowObj.isMaximized = false;
        windowObj.element.classList.add('unmaximizing');
        windowObj.element.classList.remove('maximized');

        // Move window back to desktop if it was moved to body
        const desktop = document.getElementById('desktop');
        if (desktop && windowObj.element.parentNode === document.body) {
            desktop.appendChild(windowObj.element);
        }

        // Reset positioning to absolute for normal window behavior
        windowObj.element.style.position = 'absolute';
        windowObj.element.style.left = `${windowObj.originalPosition.left}px`;
        windowObj.element.style.top = `${windowObj.originalPosition.top}px`;
        windowObj.element.style.right = '';
        windowObj.element.style.bottom = '';
        windowObj.element.style.width = `${windowObj.originalPosition.width}px`;
        windowObj.element.style.height = `${windowObj.originalPosition.height}px`;
        windowObj.element.style.margin = '';
        windowObj.element.style.padding = '';
        
        // Update window object properties
        windowObj.left = windowObj.originalPosition.left;
        windowObj.top = windowObj.originalPosition.top;
        windowObj.width = windowObj.originalPosition.width;
        windowObj.height = windowObj.originalPosition.height;

        setTimeout(() => {
            windowObj.element.classList.remove('unmaximizing');
        }, 300);
    }

    /**
     * Closes a window and removes it from the desktop.
     * @param {object} windowObj - The window to close.
     * @memberof WindowManager
     */
    closeWindow(windowObj) {
        if (!windowObj || !windowObj.element) return;

        // Play closing sound using global namespace if available
        if (window.neuOS && window.neuOS.bootSystemInstance) {
            window.neuOS.bootSystemInstance.playWindowCloseSound();
        }

        // Disconnect observers and auto-scroll BEFORE removing the element
        try {
            this.resizeObserver.unobserve(windowObj.element);
        } catch (e) {
            console.warn('ResizeObserver unobserve failed:', e);
        }
        
        try {
            // For MutationObserver, we need to disconnect and reconnect to remove specific elements
            if (this.observedElements.has(windowObj.element)) {
                this.moveObserver.disconnect();
                this.observedElements.delete(windowObj.element);
                
                // Reconnect to remaining elements
                this.observedElements.forEach(element => {
                    this.moveObserver.observe(element, { attributes: true });
                });
            }
        } catch (e) {
            console.warn('MoveObserver cleanup failed:', e);
        }
        
        this.autoScrollHandler.disableAutoScroll(windowObj.id);

        // Remove the element after disconnecting observers
        windowObj.element.remove();

        this.windows.delete(windowObj.id);
        this.windowStack = this.windowStack.filter(w => w.id !== windowObj.id);

        // Cleanup for pure JS drag/resize handlers (no interact.js)

        if (this.windowStack.length > 0) {
            this.focusWindow(this.windowStack[this.windowStack.length - 1]);
        } else {
            this.activeWindow = null;
        }

        this.notifyStateChange();
    }

    /**
     * Brings a window to the front and sets it as active.
     * @param {object} windowObj - The window to focus.
     * @memberof WindowManager
     */
    focusWindow(windowObj) {
        if (this.activeWindow) {
            this.activeWindow.element.classList.remove('focused');
        }
        windowObj.element.classList.add('focused');
        this.activeWindow = windowObj;
        this.windowStack = this.windowStack.filter(w => w.id !== windowObj.id);
        this.windowStack.push(windowObj);
        this.notifyStateChange();
    }

    /**
     * Gets the next z-index for a new window.
     * @returns {number} The next z-index.
     * @private
     * @memberof WindowManager
     */
    getNextZIndex() {
        this.zIndexCounter += 10;
        return this.zIndexCounter;
    }

    /**
     * Sets up global event listeners for the window manager (placeholder for future expansions).
     * @private
     * @memberof WindowManager
     */
    setupEventListeners() {
        // Currently empty; add global listeners (e.g., keyboard shortcuts) here if needed
    }

    /**
     * Updates the size of a window, enforcing bounds based on outer dimensions.
     * @param {object} windowObj - The window to update.
     * @private
     * @memberof WindowManager
     */
    updateWindowSize(windowObj) {
        const currentWidth = windowObj.element.offsetWidth;
        const currentHeight = windowObj.element.offsetHeight;

        const minWidth = CONFIG.window?.minWidth || 300;
        const maxWidth = CONFIG.window?.maxWidth || 2000;
        const minHeight = CONFIG.window?.minHeight || 200;
        const maxHeight = CONFIG.window?.maxHeight || 1500;

        const clampedWidth = Math.min(Math.max(currentWidth, minWidth), maxWidth);
        const clampedHeight = Math.min(Math.max(currentHeight, minHeight), maxHeight);

        if (clampedWidth !== currentWidth || clampedHeight !== currentHeight) {
            windowObj.element.style.width = `${clampedWidth}px`;
            windowObj.element.style.height = `${clampedHeight}px`;
            windowObj.width = clampedWidth;
            windowObj.height = clampedHeight;
        }
    }

    /**
     * Updates the position of a window, enforcing viewport bounds.
     * @param {object} windowObj - The window to update.
     * @private
     * @memberof WindowManager
     */
    updateWindowPosition(windowObj) {
        const currentLeft = parseFloat(windowObj.element.style.left) || 0;
        const currentTop = parseFloat(windowObj.element.style.top) || 0;
        const maxX = window.innerWidth - windowObj.element.offsetWidth;
        const maxY = window.innerHeight - windowObj.element.offsetHeight;

        let left = Math.max(0, Math.min(currentLeft, maxX));
        let top = Math.max(0, Math.min(currentTop, maxY));

        windowObj.element.style.left = `${left}px`;
        windowObj.element.style.top = `${top}px`;
        windowObj.left = left;
        windowObj.top = top;
    }

    /**
     * Notifies registered callbacks of state changes.
     * @private
     * @memberof WindowManager
     */
    notifyStateChange() {
        this.stateChangeCallbacks.forEach(callback => callback());
    }

    /**
     * Registers a callback for window state changes.
     * @param {Function} callback - The callback.
     * @returns {Function} Unsubscribe function.
     * @memberof WindowManager
     */
    onStateChange(callback) {
        this.stateChangeCallbacks.add(callback);
        return () => this.stateChangeCallbacks.delete(callback);
    }
}