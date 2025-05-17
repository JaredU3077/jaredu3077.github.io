/**
 * Window Management Module
 * Handles window dragging, resizing, and controls
 * Enhanced with accessibility features and smooth transitions
 */

import { CONFIG } from './config.js';

export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.dragState = null;
        this.resizeState = null;
        this.snapThreshold = 20;
        this.snapZones = new Map();
        this.contextMenu = null;
        this.zIndexCounter = 1000;
        this.windowStack = [];
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Make windowManager globally accessible
        window.windowManager = this;
    }

    initEventListeners() {
        // Window focus management
        document.addEventListener('mousedown', (e) => {
            const windowElement = e.target.closest('.window');
            if (windowElement) {
                this.focusWindow(windowElement);
            } else {
                this.blurActiveWindow();
            }
        });

        // Enhanced keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'Tab':
                        e.preventDefault();
                        this.cycleWindows(e.shiftKey);
                        break;
                    case 'F4':
                        e.preventDefault();
                        if (this.activeWindow) {
                            this.closeWindow(this.activeWindow);
                        }
                        break;
                    case 'Space':
                        e.preventDefault();
                        if (this.activeWindow) {
                            this.toggleMaximize(this.activeWindow);
                        }
                        break;
                }
            }
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            const windowElement = e.target.closest('.window');
            if (windowElement) {
                e.preventDefault();
                this.showContextMenu(e, windowElement);
            }
        });

        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (this.contextMenu && !e.target.closest('.window-context-menu')) {
                this.hideContextMenu();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.windows.forEach(window => {
                this.constrainToViewport(window);
            });
        });

        // Handle escape key for closing windows
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeWindow) {
                this.closeWindow(this.activeWindow);
            }
        });
    }

    createWindow(options) {
        const {
            id,
            title,
            content,
            width = 600,
            height = 400,
            x = Math.random() * (window.innerWidth - width),
            y = Math.random() * (window.innerHeight - height - 40),
            icon = 'fa-window-maximize',
            role = 'dialog',
            ariaLabel = title
        } = options;

        // Check if window already exists
        if (this.windows.has(id)) {
            const existingWindow = this.windows.get(id);
            if (existingWindow.style.display === 'none') {
                this.restoreWindow(existingWindow);
                return existingWindow;
            }
            return existingWindow;
        }

        const windowElement = document.createElement('div');
        windowElement.className = 'window';
        windowElement.id = id;
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
        windowElement.style.zIndex = this.getNextZIndex();

        windowElement.innerHTML = `
            <div class="window-header" style="cursor: move; user-select: none;">
                <div class="window-title">
                    <i class="fas ${icon}"></i>
                    ${title}
                </div>
                <div class="window-controls">
                    <button class="window-control minimize" title="Minimize" aria-label="Minimize window">
                        <i class="fas fa-minus"></i>
                    </button>
                    <button class="window-control maximize" title="Maximize" aria-label="Maximize window">
                        <i class="fas fa-expand"></i>
                    </button>
                    <button class="window-control close" title="Close" aria-label="Close window">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="window-content">
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

        windowElement.setAttribute('role', role);
        windowElement.setAttribute('aria-label', ariaLabel);
        windowElement.setAttribute('tabindex', '0');
        
        document.body.appendChild(windowElement);
        this.windows.set(id, windowElement);

        // Add window controls event listeners
        this.initWindowControls(windowElement);

        // Add drag functionality
        this.initDrag(windowElement);

        // Add resize functionality
        this.initResize(windowElement);

        // Focus the new window
        this.focusWindow(windowElement);

        // Add opening animation
        windowElement.classList.add('opening');
        setTimeout(() => windowElement.classList.remove('opening'), 300);

        return windowElement;
    }

    initWindowControls(windowElement) {
        const controls = windowElement.querySelector('.window-controls');
        
        controls.addEventListener('click', (e) => {
            const control = e.target.closest('.window-control');
            if (!control) return;

            if (control.classList.contains('minimize')) {
                this.minimizeWindow(windowElement);
            } else if (control.classList.contains('maximize')) {
                this.toggleMaximize(windowElement);
            } else if (control.classList.contains('close')) {
                this.closeWindow(windowElement);
            }
        });
    }

    focusWindow(windowElement) {
        if (this.activeWindow === windowElement) return;

        if (this.activeWindow) {
            this.activeWindow.classList.remove('focused');
            this.activeWindow.setAttribute('aria-hidden', 'true');
        }

        windowElement.classList.add('focused');
        windowElement.setAttribute('aria-hidden', 'false');
        this.activeWindow = windowElement;
        windowElement.style.zIndex = this.getNextZIndex();
        
        // Update window stack
        this.windowStack = this.windowStack.filter(w => w !== windowElement);
        this.windowStack.unshift(windowElement);
        
        // Focus the window for keyboard navigation
        windowElement.focus();
    }

    blurActiveWindow() {
        if (this.activeWindow) {
            this.activeWindow.classList.remove('focused');
            this.activeWindow.setAttribute('aria-hidden', 'true');
            this.activeWindow = null;
        }
    }

    getNextZIndex() {
        return this.zIndexCounter++;
    }

    minimizeWindow(windowElement) {
        windowElement.classList.add('minimizing');
        setTimeout(() => {
            windowElement.style.display = 'none';
            windowElement.classList.remove('minimizing');
        }, 300);
    }

    restoreWindow(windowElement) {
        windowElement.style.display = 'block';
        windowElement.classList.add('restoring');
        setTimeout(() => {
            windowElement.classList.remove('restoring');
        }, 300);
    }

    toggleMaximize(windowElement) {
        const isMaximized = windowElement.classList.contains('maximized');
        
        if (isMaximized) {
            windowElement.classList.add('unmaximizing');
            windowElement.classList.remove('maximized');
            windowElement.style.width = windowElement.dataset.previousWidth;
            windowElement.style.height = windowElement.dataset.previousHeight;
            windowElement.style.left = windowElement.dataset.previousLeft;
            windowElement.style.top = windowElement.dataset.previousTop;
            setTimeout(() => {
                windowElement.classList.remove('unmaximizing');
            }, 300);
        } else {
            windowElement.dataset.previousWidth = windowElement.style.width;
            windowElement.dataset.previousHeight = windowElement.style.height;
            windowElement.dataset.previousLeft = windowElement.style.left;
            windowElement.dataset.previousTop = windowElement.style.top;
            
            windowElement.classList.add('maximizing');
            windowElement.classList.add('maximized');
            windowElement.style.width = '100%';
            windowElement.style.height = 'calc(100% - 40px)';
            windowElement.style.left = '0';
            windowElement.style.top = '0';
            setTimeout(() => {
                windowElement.classList.remove('maximizing');
            }, 300);
        }
    }

    closeWindow(windowElement) {
        windowElement.classList.add('closing');
        setTimeout(() => {
            windowElement.remove();
            this.windows.delete(windowElement.id);
            if (this.activeWindow === windowElement) {
                this.activeWindow = null;
            }
        }, 200);
    }

    initDrag(windowElement) {
        // IMPORTANT: This window dragging implementation is working correctly.
        // DO NOT modify this function without thorough testing as it affects core window functionality.
        // The current implementation handles:
        // - Proper drag state management
        // - Viewport constraints
        // - Window snapping
        // - Event cleanup
        const header = windowElement.querySelector('.window-header');
        let startX, startY, startLeft, startTop;

        const handleDrag = (e) => {
            if (!this.dragState) return;
            e.preventDefault();
            
            const deltaX = e.clientX - this.dragState.startX;
            const deltaY = e.clientY - this.dragState.startY;

            let newLeft = this.dragState.startLeft + deltaX;
            let newTop = this.dragState.startTop + deltaY;

            // Constrain to viewport
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - windowElement.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - windowElement.offsetHeight - 40));

            windowElement.style.left = `${newLeft}px`;
            windowElement.style.top = `${newTop}px`;

            // Check for snapping
            this.checkSnapping(windowElement);
        };

        const stopDrag = () => {
            if (this.dragState) {
                document.removeEventListener('mousemove', handleDrag);
                document.removeEventListener('mouseup', stopDrag);
                this.dragState = null;
            }
        };

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            e.preventDefault();
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(windowElement.style.left) || 0;
            startTop = parseInt(windowElement.style.top) || 0;

            this.dragState = {
                window: windowElement,
                startX,
                startY,
                startLeft,
                startTop
            };

            document.addEventListener('mousemove', handleDrag);
            document.addEventListener('mouseup', stopDrag);
        });
    }

    initResize(windowElement) {
        const resizeHandles = windowElement.querySelectorAll('.window-resize');
        
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault();
                // Debug log
                console.log('Resize start');
                const direction = handle.className.split(' ')[1];
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = windowElement.offsetWidth;
                const startHeight = windowElement.offsetHeight;
                const startLeft = parseInt(windowElement.style.left);
                const startTop = parseInt(windowElement.style.top);

                this.resizeState = {
                    window: windowElement,
                    direction,
                    startX,
                    startY,
                    startWidth,
                    startHeight,
                    startLeft,
                    startTop
                };

                const handleResize = (e) => {
                    if (!this.resizeState) return;
                    // Debug log
                    console.log('Resizing...');
                    const { window, direction, startX, startY, startWidth, startHeight, startLeft, startTop } = this.resizeState;
                    const deltaX = e.clientX - startX;
                    const deltaY = e.clientY - startY;

                    let newWidth = startWidth;
                    let newHeight = startHeight;
                    let newLeft = startLeft;
                    let newTop = startTop;

                    // Handle horizontal resizing
                    if (direction.includes('e')) {
                        newWidth = Math.max(300, startWidth + deltaX);
                    }
                    if (direction.includes('w')) {
                        const width = Math.max(300, startWidth - deltaX);
                        newWidth = width;
                        newLeft = startLeft + (startWidth - width);
                    }

                    // Handle vertical resizing
                    if (direction.includes('s')) {
                        newHeight = Math.max(200, startHeight + deltaY);
                    }
                    if (direction.includes('n')) {
                        const height = Math.max(200, startHeight - deltaY);
                        newHeight = height;
                        newTop = startTop + (startHeight - height);
                    }

                    // Apply new dimensions
                    window.style.width = `${newWidth}px`;
                    window.style.height = `${newHeight}px`;
                    window.style.left = `${newLeft}px`;
                    window.style.top = `${newTop}px`;

                    // Constrain to viewport
                    this.constrainToViewport(window);
                };

                const stopResize = () => {
                    if (this.resizeState) {
                        // Debug log
                        console.log('Resize stop');
                        document.removeEventListener('mousemove', handleResize);
                        document.removeEventListener('mouseup', stopResize);
                        this.resizeState = null;
                    }
                };

                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', stopResize);
            });
        });
    }

    constrainToViewport(windowElement) {
        const rect = windowElement.getBoundingClientRect();
        let left = parseInt(windowElement.style.left);
        let top = parseInt(windowElement.style.top);

        // Constrain horizontal position
        if (rect.left < 0) {
            left = 0;
        } else if (rect.right > window.innerWidth) {
            left = window.innerWidth - rect.width;
        }

        // Constrain vertical position
        if (rect.top < 0) {
            top = 0;
        } else if (rect.bottom > window.innerHeight - 40) {
            top = window.innerHeight - 40 - rect.height;
        }

        windowElement.style.left = `${left}px`;
        windowElement.style.top = `${top}px`;
    }

    checkSnapping(windowElement) {
        const rect = windowElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 40;

        // Check for edge snapping
        if (Math.abs(rect.left) < this.snapThreshold) {
            windowElement.style.left = '0';
        } else if (Math.abs(viewportWidth - rect.right) < this.snapThreshold) {
            windowElement.style.left = `${viewportWidth - rect.width}px`;
        }

        if (Math.abs(rect.top) < this.snapThreshold) {
            windowElement.style.top = '0';
        } else if (Math.abs(viewportHeight - rect.bottom) < this.snapThreshold) {
            windowElement.style.top = `${viewportHeight - rect.height}px`;
        }

        // Check for window snapping
        this.windows.forEach(otherWindow => {
            if (otherWindow === windowElement) return;

            const otherRect = otherWindow.getBoundingClientRect();

            // Snap to other window's edges
            if (Math.abs(rect.right - otherRect.left) < this.snapThreshold) {
                windowElement.style.left = `${otherRect.left - rect.width}px`;
            } else if (Math.abs(rect.left - otherRect.right) < this.snapThreshold) {
                windowElement.style.left = `${otherRect.right}px`;
            }

            if (Math.abs(rect.bottom - otherRect.top) < this.snapThreshold) {
                windowElement.style.top = `${otherRect.top - rect.height}px`;
            } else if (Math.abs(rect.top - otherRect.bottom) < this.snapThreshold) {
                windowElement.style.top = `${otherRect.bottom}px`;
            }
        });
    }

    showContextMenu(e, windowElement) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.className = 'window-context-menu';
        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;

        menu.innerHTML = `
            <div class="window-context-menu-item" data-action="minimize">
                <i class="fas fa-minus"></i> Minimize
            </div>
            <div class="window-context-menu-item" data-action="maximize">
                <i class="fas fa-expand"></i> Maximize
            </div>
            <div class="window-context-menu-item" data-action="close">
                <i class="fas fa-times"></i> Close
            </div>
        `;

        menu.addEventListener('click', (e) => {
            const action = e.target.closest('.window-context-menu-item')?.dataset.action;
            if (action) {
                switch (action) {
                    case 'minimize':
                        this.minimizeWindow(windowElement);
                        break;
                    case 'maximize':
                        this.toggleMaximize(windowElement);
                        break;
                    case 'close':
                        this.closeWindow(windowElement);
                        break;
                }
            }
            this.hideContextMenu();
        });

        document.body.appendChild(menu);
        this.contextMenu = menu;
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }

    cycleWindows(reverse = false) {
        if (this.windowStack.length < 2) return;
        
        const currentIndex = this.windowStack.indexOf(this.activeWindow);
        const nextIndex = reverse 
            ? (currentIndex + 1) % this.windowStack.length
            : (currentIndex - 1 + this.windowStack.length) % this.windowStack.length;
            
        this.focusWindow(this.windowStack[nextIndex]);
    }
}

// Export the WindowManager class
window.WindowManager = WindowManager;
