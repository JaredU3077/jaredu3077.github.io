/**
 * Window Management Module
 * Handles window dragging, resizing, and controls
 */

import { CONFIG } from './config.js';

export class WindowManager {
    constructor() {
        this.windowStates = new Map();
        this.snapThreshold = 20; // pixels
        this.snapZones = {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth,
            center: window.innerWidth / 2
        };
        this.loadWindowStates();
        this.initializeDraggable();
        this.initializeResizable();
        this.initializeWindowControls();
        this.initializeWindowConstraints();
        this.initializeWindowSnapping();
    }

    /**
     * Load saved window states from localStorage
     */
    loadWindowStates() {
        const savedStates = localStorage.getItem('windowStates');
        if (savedStates) {
            this.windowStates = new Map(JSON.parse(savedStates));
        }
    }

    /**
     * Save window states to localStorage
     */
    saveWindowStates() {
        localStorage.setItem('windowStates', JSON.stringify(Array.from(this.windowStates.entries())));
    }

    /**
     * Get window state
     * @param {string} windowId - The ID of the window
     * @returns {Object} Window state object
     */
    getWindowState(windowId) {
        return this.windowStates.get(windowId) || {
            x: 0,
            y: 0,
            width: CONFIG.WINDOW.DEFAULT_WIDTH,
            height: CONFIG.WINDOW.DEFAULT_HEIGHT,
            isMaximized: false,
            isMinimized: false
        };
    }

    /**
     * Update window state
     * @param {string} windowId - The ID of the window
     * @param {Object} state - New window state
     */
    updateWindowState(windowId, state) {
        this.windowStates.set(windowId, state);
        this.saveWindowStates();
    }

    /**
     * Initialize window position constraints
     */
    initializeWindowConstraints() {
        document.querySelectorAll('.window').forEach(window => {
            const state = this.getWindowState(window.id);
            
            // Apply saved state
            window.style.width = state.width;
            window.style.height = state.height;
            window.style.transform = `translate(${state.x}px, ${state.y}px)`;
            window.setAttribute('data-x', state.x);
            window.setAttribute('data-y', state.y);
            
            if (state.isMaximized) {
                window.classList.add('maximized');
                window.style.width = CONFIG.WINDOW.MAXIMIZED_WIDTH;
                window.style.height = CONFIG.WINDOW.MAXIMIZED_HEIGHT;
                window.style.left = CONFIG.WINDOW.MAXIMIZED_MARGIN;
                window.style.top = CONFIG.WINDOW.MAXIMIZED_MARGIN;
            }
            
            if (state.isMinimized) {
                window.querySelector('.window-body').style.display = 'none';
            }
        });
    }

    /**
     * Initialize draggable functionality for window headers
     */
    initializeDraggable() {
        interact('.window-header').draggable({
            listeners: {
                move: (event) => {
                    const target = event.target.parentElement;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    
                    // Constrain to viewport
                    const maxX = window.innerWidth - target.offsetWidth;
                    const maxY = window.innerHeight - target.offsetHeight;
                    const constrainedX = Math.max(0, Math.min(x, maxX));
                    const constrainedY = Math.max(0, Math.min(y, maxY));
                    
                    target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
                    target.setAttribute('data-x', constrainedX);
                    target.setAttribute('data-y', constrainedY);
                    
                    // Update window state
                    this.updateWindowState(target.id, {
                        ...this.getWindowState(target.id),
                        x: constrainedX,
                        y: constrainedY
                    });
                }
            }
        });
    }

    /**
     * Initialize resizable functionality for windows
     */
    initializeResizable() {
        interact('.window').resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move: (event) => {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0);
                    let y = (parseFloat(target.getAttribute('data-y')) || 0);

                    // Constrain minimum size
                    const minWidth = 200;
                    const minHeight = 150;
                    const width = Math.max(event.rect.width, minWidth);
                    const height = Math.max(event.rect.height, minHeight);

                    target.style.width = width + 'px';
                    target.style.height = height + 'px';

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    // Constrain to viewport
                    const maxX = window.innerWidth - width;
                    const maxY = window.innerHeight - height;
                    const constrainedX = Math.max(0, Math.min(x, maxX));
                    const constrainedY = Math.max(0, Math.min(y, maxY));

                    target.style.transform = `translate(${constrainedX}px, ${constrainedY}px)`;
                    target.setAttribute('data-x', constrainedX);
                    target.setAttribute('data-y', constrainedY);

                    // Update window state
                    this.updateWindowState(target.id, {
                        ...this.getWindowState(target.id),
                        x: constrainedX,
                        y: constrainedY,
                        width: width + 'px',
                        height: height + 'px'
                    });

                    if (target.id === 'topologyWindow') {
                        const topology = document.getElementById('networkTopology');
                        topology.style.width = width + 'px';
                        topology.style.height = (height - 40) + 'px';
                        if (window.network) {
                            window.network.fit();
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize window controls (minimize, maximize, close)
     */
    initializeWindowControls() {
        document.querySelectorAll('.window').forEach(window => {
            const minimizeBtn = window.querySelector('.minimize-btn');
            const maximizeBtn = window.querySelector('.maximize-btn');
            const closeBtn = window.querySelector('.close-btn');
            const body = window.querySelector('.window-body');

            window.addEventListener('click', () => {
                if (window.style.display === 'block' && !window.classList.contains('maximized') && window.id !== 'codexWindow') {
                    const state = this.getWindowState(window.id);
                    window.style.width = state.width;
                    window.style.height = state.height;
                    window.style.transform = `translate(${state.x}px, ${state.y}px)`;
                    window.setAttribute('data-x', state.x);
                    window.setAttribute('data-y', state.y);
                    window.scrollTop = 0;
                }
            });

            minimizeBtn.addEventListener('click', () => {
                const isMinimized = body.style.display === 'none';
                
                if (!isMinimized) {
                    // Minimize animation
                    const x = parseFloat(window.getAttribute('data-x')) || 0;
                    const y = parseFloat(window.getAttribute('data-y')) || 0;
                    window.style.setProperty('--x', `${x}px`);
                    window.style.setProperty('--y', `${y}px`);
                    window.classList.add('minimizing');
                    
                    // Wait for animation to complete
                    setTimeout(() => {
                        body.style.display = 'none';
                        window.classList.remove('minimizing');
                    }, 300);
                } else {
                    // Restore animation
                    const x = parseFloat(window.getAttribute('data-x')) || 0;
                    const y = parseFloat(window.getAttribute('data-y')) || 0;
                    window.style.setProperty('--x', `${x}px`);
                    window.style.setProperty('--y', `${y}px`);
                    window.classList.add('restoring');
                    body.style.display = 'block';
                    
                    // Wait for animation to complete
                    setTimeout(() => {
                        window.classList.remove('restoring');
                    }, 300);
                }
                
                // Update window state
                this.updateWindowState(window.id, {
                    ...this.getWindowState(window.id),
                    isMinimized: !isMinimized
                });
            });

            maximizeBtn.addEventListener('click', () => {
                const state = this.getWindowState(window.id);
                const isMaximized = window.classList.contains('maximized');
                
                if (isMaximized) {
                    window.style.width = state.width;
                    window.style.height = state.height;
                    window.style.transform = `translate(${state.x}px, ${state.y}px)`;
                    window.classList.remove('maximized');
                } else {
                    // Save current state before maximizing
                    this.updateWindowState(window.id, {
                        ...state,
                        width: window.style.width,
                        height: window.style.height,
                        x: parseFloat(window.getAttribute('data-x')) || 0,
                        y: parseFloat(window.getAttribute('data-y')) || 0
                    });
                    
                    window.style.width = CONFIG.WINDOW.MAXIMIZED_WIDTH;
                    window.style.height = CONFIG.WINDOW.MAXIMIZED_HEIGHT;
                    window.style.left = CONFIG.WINDOW.MAXIMIZED_MARGIN;
                    window.style.top = CONFIG.WINDOW.MAXIMIZED_MARGIN;
                    window.style.transform = 'translate(0, 0)';
                    window.setAttribute('data-x', 0);
                    window.setAttribute('data-y', 0);
                    window.classList.add('maximized');
                }
                
                // Update window state
                this.updateWindowState(window.id, {
                    ...state,
                    isMaximized: !isMaximized
                });

                if (window.id === 'topologyWindow') {
                    const topology = document.getElementById('networkTopology');
                    topology.style.width = '100%';
                    topology.style.height = (window.offsetHeight - 40) + 'px';
                    if (window.network) {
                        window.network.fit();
                    }
                }
                window.scrollTop = 0;
            });

            closeBtn.addEventListener('click', () => {
                window.style.display = 'none';
                window.classList.remove('maximized');
                
                // Update window state
                this.updateWindowState(window.id, {
                    ...this.getWindowState(window.id),
                    isMaximized: false
                });
            });
        });
    }

    /**
     * Show a window
     * @param {string} windowId - The ID of the window to show
     */
    showWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            const state = this.getWindowState(windowId);
            window.style.display = 'block';
            
            // Restore window state
            if (state.isMaximized) {
                window.classList.add('maximized');
                window.style.width = CONFIG.WINDOW.MAXIMIZED_WIDTH;
                window.style.height = CONFIG.WINDOW.MAXIMIZED_HEIGHT;
                window.style.left = CONFIG.WINDOW.MAXIMIZED_MARGIN;
                window.style.top = CONFIG.WINDOW.MAXIMIZED_MARGIN;
                window.style.transform = 'translate(0, 0)';
            } else {
                window.style.width = state.width;
                window.style.height = state.height;
                window.style.transform = `translate(${state.x}px, ${state.y}px)`;
                window.setAttribute('data-x', state.x);
                window.setAttribute('data-y', state.y);
            }
            
            if (state.isMinimized) {
                window.querySelector('.window-body').style.display = 'none';
            }
            
            window.scrollTop = 0;
        }
    }

    /**
     * Hide a window
     * @param {string} windowId - The ID of the window to hide
     */
    hideWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            window.style.display = 'none';
        }
    }

    /**
     * Initialize window snapping functionality
     */
    initializeWindowSnapping() {
        interact('.window').on('dragmove', (event) => {
            const target = event.target;
            const rect = target.getBoundingClientRect();
            
            // Check for snapping to edges
            this.checkSnapToEdges(target, rect);
            
            // Check for snapping to other windows
            this.checkSnapToWindows(target, rect);
        });
    }

    /**
     * Check and apply snapping to screen edges
     * @param {HTMLElement} window - The window element
     * @param {DOMRect} rect - The window's bounding rectangle
     */
    checkSnapToEdges(window, rect) {
        const x = parseFloat(window.getAttribute('data-x')) || 0;
        const y = parseFloat(window.getAttribute('data-y')) || 0;
        let newX = x;
        let newY = y;

        // Snap to top
        if (Math.abs(rect.top - this.snapZones.top) < this.snapThreshold) {
            newY = 0;
        }
        // Snap to bottom
        else if (Math.abs(rect.bottom - this.snapZones.bottom) < this.snapThreshold) {
            newY = window.innerHeight - rect.height;
        }

        // Snap to left
        if (Math.abs(rect.left - this.snapZones.left) < this.snapThreshold) {
            newX = 0;
        }
        // Snap to right
        else if (Math.abs(rect.right - this.snapZones.right) < this.snapThreshold) {
            newX = window.innerWidth - rect.width;
        }
        // Snap to center
        else if (Math.abs(rect.left + rect.width/2 - this.snapZones.center) < this.snapThreshold) {
            newX = (window.innerWidth - rect.width) / 2;
        }

        if (newX !== x || newY !== y) {
            window.style.transform = `translate(${newX}px, ${newY}px)`;
            window.setAttribute('data-x', newX);
            window.setAttribute('data-y', newY);
            
            // Update window state
            this.updateWindowState(window.id, {
                ...this.getWindowState(window.id),
                x: newX,
                y: newY
            });
        }
    }

    /**
     * Check and apply snapping to other windows
     * @param {HTMLElement} window - The window element
     * @param {DOMRect} rect - The window's bounding rectangle
     */
    checkSnapToWindows(window, rect) {
        const x = parseFloat(window.getAttribute('data-x')) || 0;
        const y = parseFloat(window.getAttribute('data-y')) || 0;
        let newX = x;
        let newY = y;

        document.querySelectorAll('.window').forEach(otherWindow => {
            if (otherWindow === window || otherWindow.style.display === 'none') return;

            const otherRect = otherWindow.getBoundingClientRect();
            
            // Snap to other window's edges
            if (Math.abs(rect.left - otherRect.right) < this.snapThreshold) {
                newX = parseFloat(otherWindow.getAttribute('data-x')) + otherRect.width;
            }
            else if (Math.abs(rect.right - otherRect.left) < this.snapThreshold) {
                newX = parseFloat(otherWindow.getAttribute('data-x')) - rect.width;
            }
            else if (Math.abs(rect.top - otherRect.bottom) < this.snapThreshold) {
                newY = parseFloat(otherWindow.getAttribute('data-y')) + otherRect.height;
            }
            else if (Math.abs(rect.bottom - otherRect.top) < this.snapThreshold) {
                newY = parseFloat(otherWindow.getAttribute('data-y')) - rect.height;
            }
        });

        if (newX !== x || newY !== y) {
            window.style.transform = `translate(${newX}px, ${newY}px)`;
            window.setAttribute('data-x', newX);
            window.setAttribute('data-y', newY);
            
            // Update window state
            this.updateWindowState(window.id, {
                ...this.getWindowState(window.id),
                x: newX,
                y: newY
            });
        }
    }

    /**
     * Update snap zones when window is resized
     */
    updateSnapZones() {
        this.snapZones = {
            top: 0,
            bottom: window.innerHeight,
            left: 0,
            right: window.innerWidth,
            center: window.innerWidth / 2
        };
    }
}
