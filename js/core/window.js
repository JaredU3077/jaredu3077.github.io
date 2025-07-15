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
        /** @type {Map<string, object>} */
        this.interactInstances = new Map();

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
                    console.log('Resize observer triggered for window:', windowObj.id, { newWidth: entry.contentRect.width, newHeight: entry.contentRect.height });
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
            height = window.innerHeight - 100 - this.taskbarHeight;
        }

        const minWidth = isMobile ? 300 : (CONFIG.window?.minWidth || 300);
        const maxWidth = isMobile ? window.innerWidth : (CONFIG.window?.maxWidth || 1200);
        const minHeight = isMobile ? 200 : (CONFIG.window?.minHeight || 200);
        const maxHeight = isMobile ? window.innerHeight : (CONFIG.window?.maxHeight || 800);

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
            top = Math.max(0, Math.min(top, desktop.clientHeight - height - this.taskbarHeight));
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
        windowElement.style.transform = 'translateZ(0)';
        windowElement.style.willChange = 'transform';

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
            <div class="window-resize n" title="Resize window"></div>
            <div class="window-resize e" title="Resize window"></div>
            <div class="window-resize s" title="Resize window"></div>
            <div class="window-resize w" title="Resize window"></div>
            <div class="window-resize ne" title="Resize window"></div>
            <div class="window-resize nw" title="Resize window"></div>
            <div class="window-resize se" title="Resize window"></div>
            <div class="window-resize sw" title="Resize window"></div>
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

        console.log('Window created:', { id: windowObj.id, title: windowObj.title });

        this.setupWindowEvents(windowObj);
        this.focusWindow(windowObj);

        if (autoScroll) {
            this.autoScrollHandler.setupAutoScroll(windowObj);
        }

        // Attach observers
        this.resizeObserver.observe(windowElement);
        this.moveObserver.observe(windowElement, { attributes: true });

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

        // Initialize interactInstances entry for this window
        this.interactInstances.set(windowObj.id, {});

        this.dragHandler.setupDrag(header, windowObj);
        this.resizeHandler.setupResize(windowObj.element, windowObj);

        try {
            const minimizeBtn = controls.querySelector('.minimize');
            const maximizeBtn = controls.querySelector('.maximize');
            const closeBtn = controls.querySelector('.close');

            if (minimizeBtn) minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.minimizeWindow(windowObj); });
            if (maximizeBtn) maximizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMaximize(windowObj); });
            if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.closeWindow(windowObj); });
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
        console.log('Context menu requested for window:', windowObj.id);
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
     * Maximizes a window to fill the screen, accounting for taskbar.
     * @param {object} windowObj - The window to maximize.
     * @private
     * @memberof WindowManager
     */
    maximizeWindow(windowObj) {
        windowObj.isMaximized = true;
        windowObj.originalPosition = {
            left: windowObj.element.style.left,
            top: windowObj.element.style.top,
            width: windowObj.element.style.width,
            height: windowObj.element.style.height
        };

        windowObj.element.classList.add('maximizing', 'maximized');
        windowObj.element.style.left = '0px';
        windowObj.element.style.top = '0px';
        windowObj.element.style.width = '100vw';
        windowObj.element.style.height = `calc(100vh - ${this.taskbarHeight}px)`;

        setTimeout(() => {
            windowObj.element.classList.remove('maximizing');
        }, 300);

        console.log('Window maximized:', { id: windowObj.id });
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

        windowObj.element.style.left = `${windowObj.originalPosition.left}px`;
        windowObj.element.style.top = `${windowObj.originalPosition.top}px`;
        windowObj.element.style.width = `${windowObj.originalPosition.width}px`;
        windowObj.element.style.height = `${windowObj.originalPosition.height}px`;

        setTimeout(() => {
            windowObj.element.classList.remove('unmaximizing');
        }, 300);

        console.log('Window unmaximized:', { id: windowObj.id });
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

        windowObj.element.remove();

        // Disconnect observers and auto-scroll
        this.resizeObserver.unobserve(windowObj.element);
        this.moveObserver.unobserve(windowObj.element);
        this.autoScrollHandler.disableAutoScroll(windowObj.id);

        this.windows.delete(windowObj.id);
        this.windowStack = this.windowStack.filter(w => w.id !== windowObj.id);

        if (this.interactInstances.has(windowObj.id)) {
            const instances = this.interactInstances.get(windowObj.id);
            if (instances.drag) instances.drag.unset();
            if (instances.resize) instances.resize.unset();
            this.interactInstances.delete(windowObj.id);
        }

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
        const maxWidth = CONFIG.window?.maxWidth || 1200;
        const minHeight = CONFIG.window?.minHeight || 200;
        const maxHeight = CONFIG.window?.maxHeight || 800;

        const clampedWidth = Math.min(Math.max(currentWidth, minWidth), maxWidth);
        const clampedHeight = Math.min(Math.max(currentHeight, minHeight), maxHeight);

        if (clampedWidth !== currentWidth || clampedHeight !== currentHeight) {
            console.log('Clamping window size:', windowObj.id, { from: {width: currentWidth, height: currentHeight}, to: {width: clampedWidth, height: clampedHeight} });
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
        const rect = windowObj.element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height - this.taskbarHeight;

        let left = Math.max(0, Math.min(rect.left, maxX));
        let top = Math.max(0, Math.min(rect.top, maxY));

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