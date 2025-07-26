import { CONFIG } from '../config.js';
import { debounce, throttle } from '../utils/utils.js';
import { DragHandler } from './dragHandler.js';
import { ResizeHandler } from './resizeHandler.js';
import { SnapHandler } from './snapHandler.js';
import { AutoScrollHandler } from './autoScrollHandler.js';

/**
 * Manages windows in the OS-like interface.
 * Handles creation, movement, resizing, and focus of windows with performance optimizations.
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

        // Performance optimizations
        this.domCache = new Map(); // Cache DOM queries
        this.styleCache = new Map(); // Cache computed styles
        this.lastResizeTime = 0;
        this.resizeThrottle = 32; // ~30fps for better performance
        this.batchUpdates = []; // Batch DOM updates
        this.updateScheduled = false;
        this.maxWindows = 5; // Limit number of windows for performance

        this.setupGlobalObservers();
        this.setupEventListeners();
    }

    /**
     * Sets up global observers for resize and position changes (optimized).
     * @private
     * @memberof WindowManager
     */
    setupGlobalObservers() {
        // Throttled resize observer for better performance
        let resizeTimeout;
        this.resizeObserver = new ResizeObserver(entries => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            
            resizeTimeout = setTimeout(() => {
                for (const entry of entries) {
                    const windowObj = this.windows.get(entry.target.id);
                    if (windowObj) {
                        this.updateWindowSize(windowObj);
                    }
                }
            }, 16); // Throttle to ~60fps
        });


        
        // Store observed elements for proper cleanup
        this.observedElements = new Set();
    }

    /**
     * Creates a new window and adds it to the desktop (optimized).
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

        // Create window element with optimized structure
        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = id;
        windowElement.setAttribute('data-window-type', type);
        windowElement.setAttribute('role', 'dialog');
        windowElement.setAttribute('aria-label', title);
        windowElement.setAttribute('aria-modal', 'true');
        
        // Use CSS transform for better performance
        // Special handling for terminal window - use CSS z-index instead of JavaScript counter
        const zIndex = (id === 'terminalWindow') ? 10001 : this.getNextZIndex();
        windowElement.style.cssText = `
            position: absolute;
            width: ${width}px;
            height: ${height}px;
            z-index: ${zIndex};
            will-change: transform;
            transform: translateZ(0);
        `;

        // Create window header with optimized structure
        const header = document.createElement('div');
        header.className = 'window-header';
        header.setAttribute('role', 'banner');
        
        // Create title with icon and text directly in header
        const titleElement = document.createElement('span');
        titleElement.className = 'window-title';
        
        if (icon) {
            const iconElement = document.createElement('span');
            iconElement.className = 'window-icon';
            iconElement.innerHTML = icon;
            titleElement.appendChild(iconElement);
        }
        
        const titleText = document.createElement('span');
        titleText.className = 'title-text';
        titleText.textContent = title;
        titleElement.appendChild(titleText);
        
        header.appendChild(titleElement);

        // Create window controls with optimized event handling
        const controls = document.createElement('div');
        controls.className = 'window-controls';
        
        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'window-control minimize';
        minimizeBtn.setAttribute('aria-label', 'Minimize window');
        minimizeBtn.innerHTML = '−';
        
        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'window-control maximize';
        maximizeBtn.setAttribute('aria-label', 'Maximize window');
        maximizeBtn.innerHTML = '□';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'window-control close';
        closeBtn.setAttribute('aria-label', 'Close window');
        closeBtn.innerHTML = '×';
        
        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);
        header.appendChild(controls);

        // Create window content area
        const contentArea = document.createElement('div');
        contentArea.className = 'window-content';
        contentArea.setAttribute('role', 'main');
        contentArea.innerHTML = content;

        // Assemble window
        windowElement.appendChild(header);
        windowElement.appendChild(contentArea);

        // Add to desktop
        const desktop = this.getDesktopElement();
        if (desktop) {
            desktop.appendChild(windowElement);
        }

        // Create window object with optimized properties
        const windowObj = {
            id,
            element: windowElement,
            title,
            type,
            width,
            height,
            isMinimized: false,
            isMaximized: false,
            isResizable: true,
            isDraggable: true,
            autoScroll,
            zIndex: this.getNextZIndex(),
            position: { x: 0, y: 0 },
            size: { width, height },
            originalSize: { width, height },
            originalPosition: { x: 0, y: 0 }
        };

        // Store window reference
        this.windows.set(id, windowObj);
        this.windowStack.push(windowObj);

        // Cache DOM elements for better performance
        this.cacheWindowElements(windowObj);

        // Setup window events with optimized handlers
        this.setupWindowEvents(windowObj);

        // Position window with performance optimization
        this.positionWindow(windowObj);

        // Focus the new window
        this.focusWindow(windowObj);

        return windowElement;
    }

    /**
     * Cache window DOM elements for better performance
     * @private
     * @memberof WindowManager
     */
    cacheWindowElements(windowObj) {
        const cache = {
            header: windowObj.element.querySelector('.window-header'),
            content: windowObj.element.querySelector('.window-content'),
            title: windowObj.element.querySelector('.window-title'),
            minimizeBtn: windowObj.element.querySelector('.minimize'),
            maximizeBtn: windowObj.element.querySelector('.maximize'),
            closeBtn: windowObj.element.querySelector('.close')
        };
        
        this.domCache.set(windowObj.id, cache);
    }

    /**
     * Get cached DOM element for window
     * @private
     * @memberof WindowManager
     */
    getCachedElement(windowId, elementType) {
        const cache = this.domCache.get(windowId);
        return cache ? cache[elementType] : null;
    }

    /**
     * Position window with performance optimization
     * @private
     * @memberof WindowManager
     */
    positionWindow(windowObj) {
        // Calculate centered position
        const desktop = this.getDesktopElement();
        if (!desktop) return;
        
        const desktopRect = desktop.getBoundingClientRect();
        const x = Math.max(0, (desktopRect.width - windowObj.width) / 2);
        const y = Math.max(0, (desktopRect.height - windowObj.height) / 2);
        
        // Use transform for better performance
        windowObj.element.style.transform = `translate(${x}px, ${y}px)`;
        windowObj.position = { x, y };
        windowObj.originalPosition = { x, y };
    }

    /**
     * Setup window events with optimized handlers
     * @private
     * @memberof WindowManager
     */
    setupWindowEvents(windowObj) {
        const element = windowObj.element;
        const header = this.getCachedElement(windowObj.id, 'header');
        
        if (!header) return;

        // Setup drag functionality using the drag handler
        this.dragHandler.setupDrag(header, windowObj);

        // Control button events
        const minimizeBtn = this.getCachedElement(windowObj.id, 'minimizeBtn');
        const maximizeBtn = this.getCachedElement(windowObj.id, 'maximizeBtn');
        const closeBtn = this.getCachedElement(windowObj.id, 'closeBtn');

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimizeWindow(windowObj), { passive: true });
        }
        
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', () => this.toggleMaximize(windowObj), { passive: true });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                this.closeWindow(windowObj);
            }, { passive: true });
        }

        // Context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, windowObj);
        });

        // Focus handling
        element.addEventListener('mousedown', () => {
            this.focusWindow(windowObj);
        }, { passive: true });

        // Observe for size changes
        this.resizeObserver.observe(element);
        this.observedElements.add(element);
    }

    /**
     * Show context menu (optimized)
     * @private
     * @memberof WindowManager
     */
    showContextMenu(e, windowObj) {
        // Remove existing context menu
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Create context menu with optimized structure
        this.contextMenu = document.createElement('div');
        this.contextMenu.className = 'context-menu';
        this.contextMenu.style.cssText = `
            position: fixed;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            z-index: 10000;
            will-change: transform;
        `;

        // Add menu items
        const menuItems = [
            { text: 'Minimize', action: () => this.minimizeWindow(windowObj) },
            { text: 'Maximize', action: () => this.toggleMaximize(windowObj) },
            { text: 'Close', action: () => this.closeWindow(windowObj) }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'context-menu-item';
            menuItem.textContent = item.text;
            menuItem.addEventListener('click', item.action, { passive: true });
            this.contextMenu.appendChild(menuItem);
        });

        document.body.appendChild(this.contextMenu);

        // Remove context menu on click outside
        const removeContextMenu = () => {
            if (this.contextMenu) {
                this.contextMenu.remove();
                this.contextMenu = null;
            }
            document.removeEventListener('click', removeContextMenu);
        };

        setTimeout(() => {
            document.addEventListener('click', removeContextMenu, { passive: true });
        }, 0);
    }

    /**
     * Minimize window (optimized)
     * @memberof WindowManager
     */
    minimizeWindow(windowObj) {
        if (windowObj.isMinimized) return;

        windowObj.isMinimized = true;
        windowObj.element.classList.add('minimized');
        
        // Add close animation
        windowObj.element.style.animation = 'windowClose 0.3s ease-in-out forwards';
        
        setTimeout(() => {
            windowObj.element.style.display = 'none';
            windowObj.element.style.animation = '';
        }, 300);
        
        // Update window stack
        const index = this.windowStack.indexOf(windowObj);
        if (index > -1) {
            this.windowStack.splice(index, 1);
        }

        // Focus next window in stack
        if (this.activeWindow === windowObj) {
            const nextWindow = this.windowStack[this.windowStack.length - 1];
            if (nextWindow) {
                this.focusWindow(nextWindow);
            }
        }

        this.notifyStateChange();
    }

    /**
     * Restore window (optimized)
     * @memberof WindowManager
     */
    restoreWindow(windowObj) {
        if (!windowObj.isMinimized) return;

        windowObj.isMinimized = false;
        windowObj.element.style.display = 'block';
        windowObj.element.classList.remove('minimized');
        
        // Add open animation
        windowObj.element.style.animation = 'windowSlideIn 0.3s ease-out forwards';
        
        setTimeout(() => {
            windowObj.element.style.animation = '';
        }, 300);
        
        // Add back to window stack
        if (!this.windowStack.includes(windowObj)) {
            this.windowStack.push(windowObj);
        }

        this.focusWindow(windowObj);
        this.notifyStateChange();
    }

    /**
     * Toggle maximize window (optimized)
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
     * Maximize window (optimized)
     * @memberof WindowManager
     */
    maximizeWindow(windowObj) {
        if (windowObj.isMaximized) return;

        // Store original size and position
        windowObj.originalSize = { ...windowObj.size };
        windowObj.originalPosition = { ...windowObj.position };

        // Calculate maximized size
        const desktop = this.getDesktopElement();
        if (!desktop) return;

        const desktopRect = desktop.getBoundingClientRect();
        const maxWidth = desktopRect.width;
        const maxHeight = desktopRect.height - this.taskbarHeight;

        // Add maximized class and set high z-index
        windowObj.element.classList.add('maximized');
        windowObj.element.style.zIndex = (windowObj.id === 'terminalWindow') ? '10001' : '9999';
        
        // Use transform for better performance
        windowObj.element.style.transform = 'translate(0px, 0px)';
        windowObj.element.style.width = `${maxWidth}px`;
        windowObj.element.style.height = `${maxHeight}px`;
        windowObj.element.style.borderRadius = '0';
        windowObj.element.style.transition = 'all 0.3s ease-in-out';

        windowObj.size = { width: maxWidth, height: maxHeight };
        windowObj.position = { x: 0, y: 0 };
        windowObj.isMaximized = true;

        // Update maximize button
        const maximizeBtn = this.getCachedElement(windowObj.id, 'maximizeBtn');
        if (maximizeBtn) {
            maximizeBtn.innerHTML = '❐';
        }

        this.notifyStateChange();
    }

    /**
     * Unmaximize window (optimized)
     * @memberof WindowManager
     */
    unmaximizeWindow(windowObj) {
        if (!windowObj.isMaximized) return;

        // Restore original size and position
        const { width, height } = windowObj.originalSize;
        const { x, y } = windowObj.originalPosition;

        // Remove maximized class and restore z-index
        windowObj.element.classList.remove('maximized');
        windowObj.element.style.zIndex = (windowObj.id === 'terminalWindow') ? '10001' : this.getNextZIndex();
        
        // Use transform for better performance
        windowObj.element.style.transform = `translate(${x}px, ${y}px)`;
        windowObj.element.style.width = `${width}px`;
        windowObj.element.style.height = `${height}px`;
        windowObj.element.style.borderRadius = '';
        windowObj.element.style.transition = 'all 0.3s ease-in-out';

        windowObj.size = { width, height };
        windowObj.position = { x, y };
        windowObj.isMaximized = false;

        // Update maximize button
        const maximizeBtn = this.getCachedElement(windowObj.id, 'maximizeBtn');
        if (maximizeBtn) {
            maximizeBtn.innerHTML = '□';
        }

        this.notifyStateChange();
    }

    /**
     * Close window (optimized)
     * @memberof WindowManager
     */
    closeWindow(windowObj) {
        // Add close animation
        windowObj.element.style.animation = 'windowClose 0.3s ease-in-out forwards';
        
        setTimeout(() => {
            // Remove from observers
            if (this.observedElements.has(windowObj.element)) {
                this.resizeObserver.unobserve(windowObj.element);
                this.observedElements.delete(windowObj.element);
            }

            // Remove from window stack
            const stackIndex = this.windowStack.indexOf(windowObj);
            if (stackIndex > -1) {
                this.windowStack.splice(stackIndex, 1);
            }

            // Remove from windows map
            this.windows.delete(windowObj.id);

            // Clear cache
            this.domCache.delete(windowObj.id);
            this.styleCache.delete(windowObj.id);

            // Remove element from DOM
            if (windowObj.element.parentNode) {
                windowObj.element.parentNode.removeChild(windowObj.element);
            }

            // Focus next window in stack
            if (this.activeWindow === windowObj) {
                const nextWindow = this.windowStack[this.windowStack.length - 1];
                if (nextWindow) {
                    this.focusWindow(nextWindow);
                }
            }

            this.notifyStateChange();
        }, 300);
    }

    /**
     * Focus window (optimized)
     * @memberof WindowManager
     */
    focusWindow(windowObj) {
        if (!windowObj || windowObj.isMinimized) return;

        // Update active window
        this.activeWindow = windowObj;

        // Update z-index - preserve terminal window's high z-index
        const newZIndex = (windowObj.id === 'terminalWindow') ? 10001 : this.getNextZIndex();
        windowObj.element.style.zIndex = newZIndex;
        windowObj.zIndex = newZIndex;

        // Move to top of stack
        const stackIndex = this.windowStack.indexOf(windowObj);
        if (stackIndex > -1) {
            this.windowStack.splice(stackIndex, 1);
        }
        this.windowStack.push(windowObj);

        // Add focus class
        windowObj.element.classList.add('focused');

        // Remove focus from other windows
        this.windows.forEach(otherWindow => {
            if (otherWindow !== windowObj) {
                otherWindow.element.classList.remove('focused');
            }
        });

        this.notifyStateChange();
    }

    /**
     * Get next z-index (optimized)
     * @private
     * @memberof WindowManager
     */
    getNextZIndex() {
        return ++this.zIndexCounter;
    }

    /**
     * Setup event listeners (optimized)
     * @private
     * @memberof WindowManager
     */
    setupEventListeners() {
        // Global click handler for context menu
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                this.contextMenu.remove();
                this.contextMenu = null;
            }
        }, { passive: true });
    }

    /**
     * Update window size (optimized)
     * @private
     * @memberof WindowManager
     */
    updateWindowSize(windowObj) {
        const rect = windowObj.element.getBoundingClientRect();
        windowObj.size = { width: rect.width, height: rect.height };
        
        // Cache the size for future use
        this.styleCache.set(`${windowObj.id}-size`, windowObj.size);
    }

    /**
     * Update window position (optimized)
     * @private
     * @memberof WindowManager
     */
    updateWindowPosition(windowObj) {
        const rect = windowObj.element.getBoundingClientRect();
        windowObj.position = { x: rect.left, y: rect.top };
        
        // Cache the position for future use
        this.styleCache.set(`${windowObj.id}-position`, windowObj.position);
    }

    /**
     * Get desktop element (cached)
     * @private
     * @memberof WindowManager
     */
    getDesktopElement() {
        if (!this._desktopElement) {
            this._desktopElement = document.getElementById('desktop');
        }
        return this._desktopElement;
    }

    /**
     * Notify state change (optimized)
     * @private
     * @memberof WindowManager
     */
    notifyStateChange() {
        // Batch state change notifications
        if (!this.updateScheduled) {
            this.updateScheduled = true;
            requestAnimationFrame(() => {
                this.stateChangeCallbacks.forEach(callback => {
                    try {
                        callback();
                    } catch (error) {
                        console.error('State change callback error:', error);
                    }
                });
                this.updateScheduled = false;
            });
        }
    }

    /**
     * Register state change callback
     * @param {Function} callback - The callback function to register.
     * @memberof WindowManager
     */
    onStateChange(callback) {
        this.stateChangeCallbacks.add(callback);
    }
}