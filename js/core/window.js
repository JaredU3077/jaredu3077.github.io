import { CONFIG as UI_CONFIG } from './config.js';
import { debounce, throttle } from './utils.js';

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
        this.zIndexCounter = UI_CONFIG.window.zIndex;
        /** @type {number} */
        this.snapThreshold = UI_CONFIG.window.snapThreshold;
        /** @type {Map<string, object>} */
        this.snapZones = new Map();
        /** @type {?HTMLElement} */
        this.contextMenu = null;
        /** @type {Array<object>} */
        this.windowStack = [];
        /** @type {Set<Function>} */
        this.stateChangeCallbacks = new Set();
        this.setupEventListeners();
    }

    /**
     * Creates a new window and adds it to the desktop.
     * @param {object} options - The options for the new window.
     * @param {string} options.id - The unique ID for the window.
     * @param {string} options.title - The title of the window.
     * @param {string} options.content - The HTML content of the window.
     * @param {number} [options.width=UI_CONFIG.window.defaultWidth] - The width of the window.
     * @param {number} [options.height=UI_CONFIG.window.defaultHeight] - The height of the window.
     * @param {string} [options.icon] - The icon for the window header.
     * @returns {HTMLElement} The created window element.
     * @memberof WindowManager
     */
    createWindow({ id, title, content, width = UI_CONFIG.window.defaultWidth, height = UI_CONFIG.window.defaultHeight, icon }) {
        // Ensure window dimensions are within bounds
        width = Math.min(Math.max(width, UI_CONFIG.window.minWidth), UI_CONFIG.window.maxWidth);
        height = Math.min(Math.max(height, UI_CONFIG.window.minHeight), UI_CONFIG.window.maxHeight);

        // Center the window on screen
        const left = (window.innerWidth - width) / 2;
        const top = (window.innerHeight - height) / 2;

        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = id;
        windowElement.setAttribute('role', 'dialog');
        windowElement.setAttribute('aria-label', title);
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
            <div class="window-content" tabindex="0">
                ${content}
            </div>
            <div class="window-resize n"></div>
            <div class="window-resize e"></div>
            <div class="window-resize s"></div>
            <div class="window-resize w"></div>
            <div class="window-resize ne"></div>
            <div class="window-resize nw"></div>
            <div class="window-resize se"></div>
            <div class="window-resize sw"></div>
        `;

        document.getElementById('desktop').appendChild(windowElement);

        const window = {
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
            originalPosition: { left, top, width, height }
        };

        this.windows.set(id, window);
        this.windowStack.push(window);
        this.setupWindowEvents(window);
        this.focusWindow(window);

        return windowElement;
    }

    /**
     * Sets up event listeners for a window (drag, resize, controls).
     * @param {object} window - The window object to set up events for.
     * @private
     * @memberof WindowManager
     */
    setupWindowEvents(window) {
        const header = window.element.querySelector('.window-header');
        const controls = window.element.querySelector('.window-controls');
        const resizeHandles = window.element.querySelectorAll('.window-resize');

        // Make window draggable
        interact(header)
            .draggable({
                inertia: true,
                modifiers: [
                    interact.modifiers.restrictRect({
                        restriction: 'parent',
                        endOnly: true
                    })
                ],
                autoScroll: true,
                listeners: {
                    move: this.handleDragMove.bind(this),
                    end: this.handleDragEnd.bind(this)
                }
            });

        // Make window resizable
        interact(window.element)
            .resizable({
                edges: { left: true, right: true, bottom: true, top: true },
                listeners: {
                    move: this.handleResizeMove.bind(this)
                },
                modifiers: [
                    interact.modifiers.restrictEdges({
                        outer: 'parent',
                        endOnly: true
                    }),
                    interact.modifiers.restrictSize({
                        min: { width: UI_CONFIG.window.minWidth, height: UI_CONFIG.window.minHeight },
                        max: { width: UI_CONFIG.window.maxWidth, height: UI_CONFIG.window.maxHeight }
                    })
                ]
            });

        // Window control buttons
        controls.querySelector('.minimize').addEventListener('click', () => this.minimizeWindow(window));
        controls.querySelector('.maximize').addEventListener('click', () => this.toggleMaximize(window));
        controls.querySelector('.close').addEventListener('click', () => this.closeWindow(window));

        // Focus window on click
        window.element.addEventListener('mousedown', () => this.focusWindow(window));

        // Context menu
        window.element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, window);
        });
    }

    /**
     * Handles the drag movement of a window.
     * @param {object} event - The interact.js drag event.
     * @private
     * @memberof WindowManager
     */
    handleDragMove(event) {
        const window = this.windows.get(event.target.closest('.window').id);
        if (!window) return;

        const x = (parseFloat(window.element.style.left) || 0) + event.dx;
        const y = (parseFloat(window.element.style.top) || 0) + event.dy;

        window.element.style.transform = `translate(${x}px, ${y}px)`;
    }

    /**
     * Handles the end of a window drag event.
     * @param {object} event - The interact.js drag event.
     * @private
     * @memberof WindowManager
     */
    handleDragEnd(event) {
        const window = this.windows.get(event.target.closest('.window').id);
        if (!window) return;

        const x = (parseFloat(window.element.style.left) || 0) + event.dx;
        const y = (parseFloat(window.element.style.top) || 0) + event.dy;

        window.element.style.transform = '';
        window.element.style.left = `${x}px`;
        window.element.style.top = `${y}px`;

        this.checkSnapZones(window);
    }

    /**
     * Handles the resize event of a window.
     * @param {object} event - The interact.js resize event.
     * @private
     * @memberof WindowManager
     */
    handleResizeMove(event) {
        const window = this.windows.get(event.target.id);
        if (!window) return;

        const x = (parseFloat(window.element.style.left) || 0);
        const y = (parseFloat(window.element.style.top) || 0);

        Object.assign(window.element.style, {
            width: `${event.rect.width}px`,
            height: `${event.rect.height}px`,
            transform: `translate(${x + event.deltaRect.left}px, ${y + event.deltaRect.top}px)`
        });
    }

    /**
     * Checks if a window is in a snap zone and snaps it if it is.
     * @param {object} window - The window to check.
     * @private
     * @memberof WindowManager
     */
    checkSnapZones(window) {
        const rect = window.element.getBoundingClientRect();
        const snapZones = this.getSnapZones();

        for (const [zone, bounds] of snapZones) {
            if (this.isInSnapZone(rect, bounds)) {
                this.snapWindowToZone(window, zone);
                return;
            }
        }
    }

    /**
     * Gets the defined screen snap zones.
     * @returns {Map<string, object>} A map of snap zones.
     * @private
     * @memberof WindowManager
     */
    getSnapZones() {
        const zones = new Map();
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Left half
        zones.set('left', {
            left: 0,
            top: 0,
            width: screenWidth / 2,
            height: screenHeight
        });

        // Right half
        zones.set('right', {
            left: screenWidth / 2,
            top: 0,
            width: screenWidth / 2,
            height: screenHeight
        });

        // Top half
        zones.set('top', {
            left: 0,
            top: 0,
            width: screenWidth,
            height: screenHeight / 2
        });

        // Bottom half
        zones.set('bottom', {
            left: 0,
            top: screenHeight / 2,
            width: screenWidth,
            height: screenHeight / 2
        });

        return zones;
    }

    /**
     * Checks if a rectangle is within a snap zone.
     * @param {DOMRect} rect - The rectangle to check.
     * @param {object} zone - The snap zone to check against.
     * @returns {boolean} True if the rectangle is in the snap zone.
     * @private
     * @memberof WindowManager
     */
    isInSnapZone(rect, zone) {
        return (
            Math.abs(rect.left - zone.left) < this.snapThreshold &&
            Math.abs(rect.top - zone.top) < this.snapThreshold
        );
    }

    /**
     * Snaps a window to a specific zone.
     * @param {object} window - The window to snap.
     * @param {string} zone - The name of the zone to snap to.
     * @private
     * @memberof WindowManager
     */
    snapWindowToZone(window, zone) {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        switch (zone) {
            case 'left':
                window.element.style.left = '0';
                window.element.style.top = '0';
                window.element.style.width = `${screenWidth / 2}px`;
                window.element.style.height = `${screenHeight}px`;
                break;
            case 'right':
                window.element.style.left = `${screenWidth / 2}px`;
                window.element.style.top = '0';
                window.element.style.width = `${screenWidth / 2}px`;
                window.element.style.height = `${screenHeight}px`;
                break;
            case 'top':
                window.element.style.left = '0';
                window.element.style.top = '0';
                window.element.style.width = `${screenWidth}px`;
                window.element.style.height = `${screenHeight / 2}px`;
                break;
            case 'bottom':
                window.element.style.left = '0';
                window.element.style.top = `${screenHeight / 2}px`;
                window.element.style.width = `${screenWidth}px`;
                window.element.style.height = `${screenHeight / 2}px`;
                break;
        }
    }

    /**
     * Minimizes a window.
     * @param {object} window - The window to minimize.
     * @memberof WindowManager
     */
    minimizeWindow(window) {
        if (window.isMinimized) {
            this.restoreWindow(window);
        } else {
            window.isMinimized = true;
            window.element.classList.add('minimizing');
            window.element.style.transform = 'translateY(100vh)';
            setTimeout(() => {
                window.element.style.display = 'none';
                window.element.classList.remove('minimizing');
            }, 300);
        }
    }

    /**
     * Restores a window from a minimized or maximized state.
     * @param {object} window - The window to restore.
     * @memberof WindowManager
     */
    restoreWindow(window) {
        window.isMinimized = false;
        window.element.style.display = '';
        window.element.classList.add('restoring');
        window.element.style.transform = '';
        setTimeout(() => {
            window.element.classList.remove('restoring');
        }, 300);
    }

    /**
     * Toggles the maximized state of a window.
     * @param {object} window - The window to toggle.
     * @memberof WindowManager
     */
    toggleMaximize(window) {
        if (window.isMaximized) {
            this.unmaximizeWindow(window);
        } else {
            this.maximizeWindow(window);
        }
    }

    /**
     * Maximizes a window to fill the screen.
     * @param {object} window - The window to maximize.
     * @private
     * @memberof WindowManager
     */
    maximizeWindow(window) {
        window.isMaximized = true;
        window.originalPosition = {
            left: window.element.style.left,
            top: window.element.style.top,
            width: window.element.style.width,
            height: window.element.style.height
        };

        window.element.classList.add('maximizing');
        window.element.style.left = '0';
        window.element.style.top = '0';
        window.element.style.width = '100%';
        window.element.style.height = '100%';
        setTimeout(() => {
            window.element.classList.remove('maximizing');
        }, 300);
    }

    /**
     * Restores a window from the maximized state.
     * @param {object} window - The window to unmaximize.
     * @private
     * @memberof WindowManager
     */
    unmaximizeWindow(window) {
        window.isMaximized = false;
        window.element.classList.add('unmaximizing');
        window.element.style.left = window.originalPosition.left;
        window.element.style.top = window.originalPosition.top;
        window.element.style.width = window.originalPosition.width;
        window.element.style.height = window.originalPosition.height;
        setTimeout(() => {
            window.element.classList.remove('unmaximizing');
        }, 300);
    }

    /**
     * Closes and removes a window.
     * @param {object} window - The window to close.
     * @memberof WindowManager
     */
    closeWindow(window) {
        window.element.classList.add('closing');
        setTimeout(() => {
            window.element.remove();
            this.windows.delete(window.id);
            this.windowStack = this.windowStack.filter(w => w.id !== window.id);
            this.notifyStateChange();
        }, 200);
    }

    /**
     * Brings a window to the front and sets it as the active window.
     * @param {object} window - The window to focus.
     * @memberof WindowManager
     */
    focusWindow(window) {
        if (this.activeWindow) {
            this.activeWindow.element.classList.remove('focused');
        }
        window.element.classList.add('focused');
        this.activeWindow = window;
        this.windowStack = this.windowStack.filter(w => w.id !== window.id);
        this.windowStack.push(window);
        this.notifyStateChange();
    }

    /**
     * Gets the next z-index for a new window.
     * @returns {number} The next z-index.
     * @private
     * @memberof WindowManager
     */
    getNextZIndex() {
        return this.zIndexCounter++;
    }

    /**
     * Sets up global event listeners for the window manager.
     * @private
     * @memberof WindowManager
     */
    setupEventListeners() {
        // Add window resize observer
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const window = this.windows.get(entry.target.id);
                if (window) {
                    this.updateWindowSize(window, entry.contentRect.width, entry.contentRect.height);
                }
            }
        });

        // Add window move observer
        const moveObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const window = this.windows.get(mutation.target.id);
                    if (window) {
                        this.updateWindowPosition(window);
                    }
                }
            }
        });

        // Observe all windows
        this.windows.forEach(window => {
            resizeObserver.observe(window.element);
            moveObserver.observe(window.element, { attributes: true });
        });
    }

    /**
     * Updates the size of a window.
     * @param {object} window - The window to update.
     * @param {number} width - The new width.
     * @param {number} height - The new height.
     * @memberof WindowManager
     */
    updateWindowSize(window, width, height) {
        // Ensure window stays within bounds
        width = Math.min(Math.max(width, UI_CONFIG.window.minWidth), UI_CONFIG.window.maxWidth);
        height = Math.min(Math.max(height, UI_CONFIG.window.minHeight), UI_CONFIG.window.maxHeight);
        
        window.element.style.width = `${width}px`;
        window.element.style.height = `${height}px`;
    }

    /**
     * Updates the position of a window.
     * @param {object} window - The window to update.
     * @private
     * @memberof WindowManager
     */
    updateWindowPosition(window) {
        // Ensure window stays within viewport
        const rect = window.element.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;

        let left = Math.max(0, Math.min(rect.left, maxX));
        let top = Math.max(0, Math.min(rect.top, maxY));

        window.element.style.left = `${left}px`;
        window.element.style.top = `${top}px`;
    }

    /**
     * Notifies all registered callbacks that the window state has changed.
     * @private
     * @memberof WindowManager
     */
    notifyStateChange() {
        this.stateChangeCallbacks.forEach(callback => callback());
    }

    /**
     * Registers a callback to be called when the window state changes.
     * @param {Function} callback - The callback function.
     * @memberof WindowManager
     */
    onStateChange(callback) {
        this.stateChangeCallbacks.add(callback);
        return () => this.stateChangeCallbacks.delete(callback);
    }
}
