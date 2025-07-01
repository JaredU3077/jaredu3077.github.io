import { CONFIG } from '../config.js';
import { debounce, throttle } from '../utils/utils.js';

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
        this.snapThreshold = 15; // Much more conservative threshold
        /** @type {Map<string, object>} */
        this.snapZones = new Map();
        /** @type {?HTMLElement} */
        this.contextMenu = null;
        /** @type {Array<object>} */
        this.windowStack = [];
        /** @type {Set<Function>} */
        this.stateChangeCallbacks = new Set();
        /** @type {boolean} */
        this.isSnappingEnabled = true;
        /** @type {Map<string, object>} */
        this.interactInstances = new Map();
        this.setupEventListeners();
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
     * @returns {HTMLElement} The created window element.
     * @memberof WindowManager
     */
    createWindow({ id, title, content, width = CONFIG.window.defaultWidth, height = CONFIG.window.defaultHeight, icon, autoScroll = false }) {
        // Ensure window dimensions are within bounds with proper fallbacks
        const minWidth = CONFIG.window?.minWidth || 300;
        const maxWidth = CONFIG.window?.maxWidth || 1200;
        const minHeight = CONFIG.window?.minHeight || 200;
        const maxHeight = CONFIG.window?.maxHeight || 800;
        
        width = Math.min(Math.max(width, minWidth), maxWidth);
        height = Math.min(Math.max(height, minHeight), maxHeight);

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
            <div class="window-resize n" title="Resize window"></div>
            <div class="window-resize e" title="Resize window"></div>
            <div class="window-resize s" title="Resize window"></div>
            <div class="window-resize w" title="Resize window"></div>
            <div class="window-resize ne" title="Resize window"></div>
            <div class="window-resize nw" title="Resize window"></div>
            <div class="window-resize se" title="Resize window"></div>
            <div class="window-resize sw" title="Resize window"></div>
        `;

        const desktop = document.getElementById('desktop');
        if (!desktop) {
            throw new Error('Desktop element not found! Cannot create window.');
        }
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
            autoScroll: autoScroll,
            _hasBeenResized: false // New windows start as not manually resized
        };

        this.windows.set(id, windowObj);
        this.windowStack.push(windowObj);
        
        console.log('🪟 Window created:', { 
            id, 
            width, 
            height, 
            left, 
            top,
            zIndex: windowElement.style.zIndex 
        });
        
        this.setupWindowEvents(windowObj);
        this.focusWindow(windowObj);

        // Set up auto-scroll functionality if enabled
        if (autoScroll) {
            this.setupAutoScroll(windowObj);
        }

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

        if (!header || !controls) {
            console.error('Window header or controls not found');
            return;
        }

        // Make window draggable - check if interact.js is available
        if (typeof interact !== 'undefined') {
            try {
                const dragInstance = interact(header)
                    .draggable({
                        inertia: false,
                        modifiers: [
                            interact.modifiers.restrictRect({
                                restriction: 'parent',
                                endOnly: true
                            })
                        ],
                        autoScroll: false, // Disable autoscroll to prevent conflicts
                        listeners: {
                            start: (event) => {
                                // Mark window as being dragged to prevent resize conflicts
                                const windowObj = this.windows.get(event.target.closest('.window').id);
                                if (windowObj) {
                                    windowObj._isDragging = true;
                                    windowObj._isResizing = false;
                                }
                            },
                            move: this.handleDragMove.bind(this),
                            end: this.handleDragEnd.bind(this)
                        }
                    });

                const resizeInstance = interact(window.element)
                    .resizable({
                        edges: { left: true, right: true, bottom: true, top: true },
                        margin: 10,
                        listeners: {
                            start: (event) => {
                                // Mark window as being resized to prevent drag conflicts and disable snapping
                                const windowObj = this.windows.get(event.target.id);
                                if (windowObj) {
                                    windowObj._isResizing = true;
                                    windowObj._isDragging = false;
                                    // Completely disable snapping system during resize
                                    this.isSnappingEnabled = false;
                                    // Add visual feedback
                                    windowObj.element.classList.add('resizing');
                                }
                                console.log('🔄 Resize started on window:', event.target.id);
                            },
                            move: this.handleResizeMove.bind(this),
                            end: this.handleResizeEnd.bind(this)
                        },
                        modifiers: [
                            interact.modifiers.restrictSize({
                                min: { width: 200, height: 150 }
                            })
                        ]
                    });

                // Store interact instances for potential cleanup/reset
                this.interactInstances.set(window.id, { drag: dragInstance, resize: resizeInstance });
            } catch (error) {
                console.error('Failed to setup window interactions:', error);
            }
        } else {
            console.warn('interact.js not loaded - window dragging/resizing will not work');
        }

        // Window control buttons with error handling
        try {
            const minimizeBtn = controls.querySelector('.minimize');
            const maximizeBtn = controls.querySelector('.maximize');
            const closeBtn = controls.querySelector('.close');

            if (minimizeBtn) minimizeBtn.addEventListener('click', () => this.minimizeWindow(window));
            if (maximizeBtn) maximizeBtn.addEventListener('click', () => this.toggleMaximize(window));
            if (closeBtn) closeBtn.addEventListener('click', () => this.closeWindow(window));
        } catch (error) {
            console.error('Failed to setup window controls:', error);
        }

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
        const windowElement = event.target.closest('.window');
        if (!windowElement) return;
        
        const window = this.windows.get(windowElement.id);
        if (!window) return;

        const x = (parseFloat(window.element.style.left) || 0) + event.dx;
        const y = (parseFloat(window.element.style.top) || 0) + event.dy;

        window.element.style.left = `${x}px`;
        window.element.style.top = `${y}px`;
        
        // Update the window object with new position
        window.left = x;
        window.top = y;
    }

    /**
     * Handles the end of a window drag event.
     * @param {object} event - The interact.js drag event.
     * @private
     * @memberof WindowManager
     */
    handleDragEnd(event) {
        const windowElement = event.target.closest('.window');
        if (!windowElement) return;
        
        const windowObj = this.windows.get(windowElement.id);
        if (!windowObj) return;

        // Clear dragging flag
        windowObj._isDragging = false;

        // Update window position
        const left = parseFloat(windowObj.element.style.left) || 0;
        const top = parseFloat(windowObj.element.style.top) || 0;
        
        windowObj.left = left;
        windowObj.top = top;

        // NEVER snap windows that have been manually resized to prevent resize interference
        // Only check snap zones for brand new windows that haven't been resized
        if (this.isSnappingEnabled && !windowObj._isResizing && !windowObj._hasBeenResized) {
            // Only snap if window was dragged to very extreme edges (much more conservative)
            const rect = windowObj.element.getBoundingClientRect();
            const threshold = 3; // Extremely small threshold
            
            if (rect.left <= threshold || rect.right >= window.innerWidth - threshold || 
                rect.top <= threshold || rect.bottom >= window.innerHeight - 54 - threshold) {
                
                // Use a small delay to ensure DOM is fully updated
                setTimeout(() => {
                    this.checkSnapZones(windowObj);
                }, 10);
            }
        }
    }

    /**
     * Handles the end of a window resize event.
     * @param {object} event - The interact.js resize event.
     * @private
     * @memberof WindowManager
     */
    handleResizeEnd(event) {
        const windowObj = this.windows.get(event.target.id);
        if (!windowObj) return;

        // Clear resizing flag and visual feedback
        windowObj._isResizing = false;
        windowObj._hasBeenResized = true; // Mark that this window has been manually resized
        windowObj.element.classList.remove('resizing');

        // Get the actual current dimensions and position from the DOM
        // This is more reliable than trying to calculate deltas
        const rect = windowObj.element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(windowObj.element);
        
        const finalWidth = parseInt(computedStyle.width);
        const finalHeight = parseInt(computedStyle.height);
        const finalLeft = parseInt(computedStyle.left) || rect.left;
        const finalTop = parseInt(computedStyle.top) || rect.top;

        // Apply size constraints manually since we removed the restrictSize modifier
        const minWidth = CONFIG.window?.minWidth || 300;
        const minHeight = CONFIG.window?.minHeight || 200;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = (window.innerHeight - 54) * 0.9;
        
        const constrainedWidth = Math.max(minWidth, Math.min(finalWidth, maxWidth));
        const constrainedHeight = Math.max(minHeight, Math.min(finalHeight, maxHeight));

        // Only update if constraints were violated
        if (constrainedWidth !== finalWidth || constrainedHeight !== finalHeight) {
            windowObj.element.style.width = `${constrainedWidth}px`;
            windowObj.element.style.height = `${constrainedHeight}px`;
        }

        // Update window object properties with final values
        windowObj.width = constrainedWidth;
        windowObj.height = constrainedHeight;
        windowObj.left = finalLeft;
        windowObj.top = finalTop;
        
        // Reset any snapped state since user manually resized
        windowObj.isMaximized = false;
        windowObj._isSnapped = false;
        
        // Store the new position as the original position for future operations
        windowObj.originalPosition = {
            left: finalLeft,
            top: finalTop,
            width: constrainedWidth,
            height: constrainedHeight
        };
        
        // Re-enable snapping but mark this window as having been manually resized
        // This prevents future automatic snapping for this specific window
        setTimeout(() => {
            this.isSnappingEnabled = true;
            console.log('🔄 Snapping re-enabled globally, but window marked as manually resized');
        }, 1000);
        
        console.log('✅ Resize completed successfully - Window dimensions:', { 
            id: windowObj.id,
            width: constrainedWidth, 
            height: constrainedHeight, 
            left: finalLeft, 
            top: finalTop 
        });
    }

    /**
     * Handles the resize event of a window.
     * @param {object} event - The interact.js resize event.
     * @private
     * @memberof WindowManager
     */
    handleResizeMove(event) {
        const windowObj = this.windows.get(event.target.id);
        if (!windowObj) {
            console.warn('⚠️ Window object not found during resize move:', event.target.id);
            return;
        }

        // Ensure snapping is completely disabled during resize
        this.isSnappingEnabled = false;
        
        // Apply the new dimensions and position from interact.js
        // interact.js handles the complex resize calculations, we just apply them
        event.target.style.width = event.rect.width + 'px';
        event.target.style.height = event.rect.height + 'px';
        
        // Update position based on interact.js calculations
        // This handles edge cases like resizing from top/left edges
        event.target.style.left = event.rect.left + 'px';
        event.target.style.top = event.rect.top + 'px';
        
        // Update our window object state to match the new dimensions
        windowObj.width = event.rect.width;
        windowObj.height = event.rect.height;
        windowObj.left = event.rect.left;
        windowObj.top = event.rect.top;
        
        // Mark that this window is no longer in a snapped/maximized state
        windowObj.isMaximized = false;
        windowObj._isSnapped = false;
    }

    /**
     * Checks if a window is in a snap zone and snaps it if it is.
     * @param {object} windowObj - The window to check.
     * @private
     * @memberof WindowManager
     */
    checkSnapZones(windowObj) {
        // Don't snap if window is maximized, currently being resized, has been manually resized, or snapping is disabled
        if (windowObj.isMaximized || windowObj._isResizing || windowObj._hasBeenResized || 
            !this.isSnappingEnabled || windowObj._isSnapped) {
            console.log('🚫 Snap check skipped:', {
                isMaximized: windowObj.isMaximized,
                isResizing: windowObj._isResizing,
                hasBeenResized: windowObj._hasBeenResized,
                snappingEnabled: this.isSnappingEnabled,
                isSnapped: windowObj._isSnapped
            });
            return;
        }

        const rect = windowObj.element.getBoundingClientRect();
        const snapZones = this.getSnapZones();

        for (const [zone, bounds] of snapZones) {
            if (this.isInSnapZone(rect, bounds)) {
                console.log('📌 Snapping window to:', zone);
                this.snapWindowToZone(windowObj, zone);
                return;
            }
        }
    }

    /**
     * Disables snapping temporarily
     * @param {number} duration - How long to disable snapping in milliseconds
     * @memberof WindowManager
     */
    disableSnapping(duration = 1000) {
        this.isSnappingEnabled = false;
        clearTimeout(this._snapTimeout);
        this._snapTimeout = setTimeout(() => {
            this.isSnappingEnabled = true;
        }, duration);
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
        // Much more conservative snap detection - only at extreme edges
        const threshold = this.snapThreshold;
        
        // Left zone - only when window is very close to left edge
        if (zone.left === 0 && zone.width === window.innerWidth / 2) {
            return rect.left <= threshold;
        } 
        // Right zone - only when window is very close to right edge
        else if (zone.left === window.innerWidth / 2 && zone.width === window.innerWidth / 2) {
            return rect.right >= window.innerWidth - threshold;
        } 
        // Top zone - only when window is very close to top edge
        else if (zone.top === 0 && zone.height === (window.innerHeight - 54) / 2) {
            return rect.top <= threshold;
        } 
        // Bottom zone - only when window is very close to bottom edge  
        else if (zone.top === (window.innerHeight - 54) / 2) {
            return rect.bottom >= window.innerHeight - 54 - threshold;
        }
        
        return false;
    }

    /**
     * Snaps a window to a specific zone.
     * @param {object} windowObj - The window to snap.
     * @param {string} zone - The name of the zone to snap to.
     * @private
     * @memberof WindowManager
     */
    snapWindowToZone(windowObj, zone) {
        // Temporarily disable snapping to prevent recursive calls
        this.isSnappingEnabled = false;

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const taskbarHeight = 54;

        let newLeft, newTop, newWidth, newHeight;

        switch (zone) {
            case 'left':
                newLeft = 0;
                newTop = 0;
                newWidth = Math.floor(screenWidth / 2);
                newHeight = screenHeight - taskbarHeight;
                break;
            case 'right':
                newLeft = Math.floor(screenWidth / 2);
                newTop = 0;
                newWidth = Math.floor(screenWidth / 2);
                newHeight = screenHeight - taskbarHeight;
                break;
            case 'top':
                newLeft = 0;
                newTop = 0;
                newWidth = screenWidth;
                newHeight = Math.floor((screenHeight - taskbarHeight) / 2);
                break;
            case 'bottom':
                newLeft = 0;
                newTop = Math.floor((screenHeight - taskbarHeight) / 2);
                newWidth = screenWidth;
                newHeight = Math.floor((screenHeight - taskbarHeight) / 2);
                break;
            default:
                this.isSnappingEnabled = true;
                return;
        }

        // Store original position before snapping
        if (!windowObj.originalPosition || !windowObj._isSnapped) {
            windowObj.originalPosition = {
                left: windowObj.left,
                top: windowObj.top,
                width: windowObj.width,
                height: windowObj.height
            };
        }

        // Apply the new dimensions and position
        windowObj.element.style.left = `${newLeft}px`;
        windowObj.element.style.top = `${newTop}px`;
        windowObj.element.style.width = `${newWidth}px`;
        windowObj.element.style.height = `${newHeight}px`;

        // Update the window object properties
        windowObj.left = newLeft;
        windowObj.top = newTop;
        windowObj.width = newWidth;
        windowObj.height = newHeight;
        windowObj.isMaximized = false;
        windowObj._isSnapped = true;

        // DO NOT reset interact.js instances - this breaks resize functionality!
        // Instead, just update the element properties and let interact.js handle the rest

        // Re-enable snapping after a delay
        setTimeout(() => {
            this.isSnappingEnabled = true;
        }, 100);
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
     * Closes a window and removes it from the desktop.
     * @param {object} window - The window object to close.
     * @memberof WindowManager
     */
    closeWindow(window) {
        if (!window || !window.element) return;

        // Play window closing sound
        if (window.bootSystemInstance) {
            window.bootSystemInstance.playWindowCloseSound();
        }

        // Remove from DOM
        window.element.remove();
        
        // Remove from windows map
        this.windows.delete(window.id);
        
        // Remove from window stack
        this.windowStack = this.windowStack.filter(w => w.id !== window.id);
        
        // Clean up interact instances
        if (this.interactInstances.has(window.id)) {
            const instances = this.interactInstances.get(window.id);
            try {
                if (instances.drag) instances.drag.unset();
                if (instances.resize) instances.resize.unset();
            } catch (error) {
                console.warn('Failed to cleanup interact instances:', error);
            }
            this.interactInstances.delete(window.id);
        }
        
        // Focus the next window in stack if available
        if (this.windowStack.length > 0) {
            this.focusWindow(this.windowStack[this.windowStack.length - 1]);
        } else {
            this.activeWindow = null;
        }
        
        this.notifyStateChange();
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
        this.zIndexCounter += 10; // Use larger increments to avoid conflicts
        console.log('🔢 Assigning z-index:', this.zIndexCounter);
        return this.zIndexCounter;
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
        const safeWidth = CONFIG.window?.minWidth || 300;
        const safeMaxWidth = CONFIG.window?.maxWidth || 1200;
        const safeHeight = CONFIG.window?.minHeight || 200;
        const safeMaxHeight = CONFIG.window?.maxHeight || 800;
        
        width = Math.min(Math.max(width, safeWidth), safeMaxWidth);
        height = Math.min(Math.max(height, safeHeight), safeMaxHeight);
        
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

    /**
     * Sets up auto-scroll functionality for a window.
     * @param {object} window - The window object to set up auto-scroll for.
     * @private
     * @memberof WindowManager
     */
    setupAutoScroll(window) {
        const windowContent = window.element.querySelector('.window-content');
        
        // Create a mutation observer to watch for content changes
        const observer = new MutationObserver((mutations) => {
            // Check if we should scroll to top instead of bottom
            let shouldScrollToTop = false;
            
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const content = node.textContent || node.innerHTML || '';
                            if (this.shouldScrollToTop(window, content)) {
                                shouldScrollToTop = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldScrollToTop) {
                // Use setTimeout to ensure this happens after the content is fully rendered
                setTimeout(() => this.scrollToTop(window), 10);
            } else {
                this.scrollToBottom(window);
            }
        });

        // Observe changes to the window content
        observer.observe(windowContent, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Store the observer so we can disconnect it when the window is closed
        window.scrollObserver = observer;
    }

    /**
     * Scrolls a window's content to the bottom.
     * @param {object} window - The window object to scroll.
     * @memberof WindowManager
     */
    scrollToBottom(window) {
        const windowContent = window.element.querySelector('.window-content');
        if (windowContent) {
            // Check if there's a specific scroll container (like terminal output)
            const scrollContainer = windowContent.querySelector('[data-scroll-container]') || windowContent;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }

    /**
     * Scrolls a window's content to the top.
     * @param {object} window - The window object to scroll.
     * @memberof WindowManager
     */
    scrollToTop(window) {
        const windowContent = window.element.querySelector('.window-content');
        if (windowContent) {
            // Check if there's a specific scroll container (like terminal output)
            const scrollContainer = windowContent.querySelector('[data-scroll-container]') || windowContent;
            scrollContainer.scrollTop = 0;
        }
    }

    /**
     * Determines if content should scroll to top (for document-like content).
     * @param {object} window - The window object.
     * @param {string} content - The content being added.
     * @returns {boolean} True if should scroll to top.
     * @memberof WindowManager
     */
    shouldScrollToTop(window, content) {
        // Check if it's document-like content (contains headings, structured text)
        if (typeof content === 'string' && (
            content.includes('terminal-heading') ||
            content.includes('<h1>') ||
            content.includes('<h2>') ||
            content.includes('<h3>') ||
            content.includes('resume') ||
            content.includes('document')
        )) {
            return true;
        }
        return false;
    }

    /**
     * Enables auto-scroll for an existing window.
     * @param {string} windowId - The ID of the window to enable auto-scroll for.
     * @memberof WindowManager
     */
    enableAutoScroll(windowId) {
        const window = this.windows.get(windowId);
        if (window && !window.autoScroll) {
            window.autoScroll = true;
            this.setupAutoScroll(window);
        }
    }

    /**
     * Disables auto-scroll for an existing window.
     * @param {string} windowId - The ID of the window to disable auto-scroll for.
     * @memberof WindowManager
     */
    disableAutoScroll(windowId) {
        const window = this.windows.get(windowId);
        if (window && window.autoScroll) {
            window.autoScroll = false;
            if (window.scrollObserver) {
                window.scrollObserver.disconnect();
                delete window.scrollObserver;
            }
        }
    }
}
