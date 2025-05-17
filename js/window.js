/**
 * Window Management Module
 * Handles window dragging, resizing, and controls
 */

import { CONFIG } from './config.js';

export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.dragState = null;
        this.resizeState = null;
        this.snapThreshold = 20;
        this.snapZones = {
            top: { y: 0, height: this.snapThreshold },
            bottom: { y: window.innerHeight - this.snapThreshold, height: this.snapThreshold },
            left: { x: 0, width: this.snapThreshold },
            right: { x: window.innerWidth - this.snapThreshold, width: this.snapThreshold },
            center: { x: window.innerWidth / 2 - this.snapThreshold, width: this.snapThreshold * 2 }
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Window focus management
        document.addEventListener('mousedown', (e) => {
            const windowElement = e.target.closest('.window');
            if (windowElement) {
                this.focusWindow(windowElement.id);
            } else {
                this.blurAllWindows();
            }
        });

        // Window drag and resize
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', () => this.handleMouseUp());

        // Window context menu
        document.addEventListener('contextmenu', (e) => {
            const windowElement = e.target.closest('.window');
            if (windowElement) {
                e.preventDefault();
                this.showContextMenu(e, windowElement);
            }
        });

        // Close context menu on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.window-context-menu')) {
                this.hideContextMenu();
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => this.handleWindowResize());
    }

    createWindow(id, title, content, options = {}) {
        const windowElement = document.createElement('div');
        windowElement.id = id;
        windowElement.className = 'window';
        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <i class="${options.icon || 'fas fa-window-maximize'}"></i>
                    ${title}
                </div>
                <div class="window-controls">
                    <button class="window-control minimize" title="Minimize"></button>
                    <button class="window-control maximize" title="Maximize"></button>
                    <button class="window-control close" title="Close"></button>
                </div>
            </div>
            <div class="window-content">${content}</div>
            <div class="window-resize n"></div>
            <div class="window-resize e"></div>
            <div class="window-resize s"></div>
            <div class="window-resize w"></div>
            <div class="window-resize ne"></div>
            <div class="window-resize nw"></div>
            <div class="window-resize se"></div>
            <div class="window-resize sw"></div>
        `;

        document.body.appendChild(windowElement);
        this.initializeWindowControls(windowElement);
        this.initializeWindowDragging(windowElement);
        this.initializeWindowResizing(windowElement);
        
        // Set initial position and size
        const { x = 100, y = 100, width = 500, height = 400 } = options;
        windowElement.style.left = `${x}px`;
        windowElement.style.top = `${y}px`;
        windowElement.style.width = `${width}px`;
        windowElement.style.height = `${height}px`;

        // Add opening animation
        windowElement.classList.add('opening');
        setTimeout(() => windowElement.classList.remove('opening'), 300);

        this.windows.set(id, windowElement);
        this.focusWindow(id);
        return windowElement;
    }

    initializeWindowControls(windowElement) {
        const controls = windowElement.querySelector('.window-controls');
        
        controls.querySelector('.minimize').addEventListener('click', () => {
            this.minimizeWindow(windowElement);
        });

        controls.querySelector('.maximize').addEventListener('click', () => {
            this.toggleMaximize(windowElement);
        });

        controls.querySelector('.close').addEventListener('click', () => {
            this.closeWindow(windowElement);
        });
    }

    initializeWindowDragging(windowElement) {
        const header = windowElement.querySelector('.window-header');
        
        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            this.dragState = {
                window: windowElement,
                startX: e.clientX,
                startY: e.clientY,
                startLeft: parseInt(windowElement.style.left),
                startTop: parseInt(windowElement.style.top)
            };

            // Create drag preview
            const preview = document.createElement('div');
            preview.className = 'window-drag-preview';
            document.body.appendChild(preview);
        });
    }

    initializeWindowResizing(windowElement) {
        const resizeHandles = windowElement.querySelectorAll('.window-resize');
        
        resizeHandles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                
                this.resizeState = {
                    window: windowElement,
                    handle: handle.className.split(' ')[1],
                    startX: e.clientX,
                    startY: e.clientY,
                    startWidth: windowElement.offsetWidth,
                    startHeight: windowElement.offsetHeight,
                    startLeft: parseInt(windowElement.style.left),
                    startTop: parseInt(windowElement.style.top)
                };
            });
        });
    }

    handleMouseMove(e) {
        if (this.dragState) {
            const dx = e.clientX - this.dragState.startX;
            const dy = e.clientY - this.dragState.startY;
            
            let newLeft = this.dragState.startLeft + dx;
            let newTop = this.dragState.startTop + dy;

            // Constrain to viewport
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - this.dragState.window.offsetWidth));
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - this.dragState.window.offsetHeight));

            this.dragState.window.style.left = `${newLeft}px`;
            this.dragState.window.style.top = `${newTop}px`;

            // Update drag preview
            const preview = document.querySelector('.window-drag-preview');
            if (preview) {
                preview.style.left = `${newLeft}px`;
                preview.style.top = `${newTop}px`;
                preview.style.width = `${this.dragState.window.offsetWidth}px`;
                preview.style.height = `${this.dragState.window.offsetHeight}px`;
            }

            // Check for snapping
            this.checkSnapping(this.dragState.window);
        }

        if (this.resizeState) {
            const dx = e.clientX - this.resizeState.startX;
            const dy = e.clientY - this.resizeState.startY;
            
            let newWidth = this.resizeState.startWidth;
            let newHeight = this.resizeState.startHeight;
            let newLeft = this.resizeState.startLeft;
            let newTop = this.resizeState.startTop;

            // Handle different resize directions
            if (this.resizeState.handle.includes('e')) {
                newWidth = Math.max(300, this.resizeState.startWidth + dx);
            }
            if (this.resizeState.handle.includes('w')) {
                newWidth = Math.max(300, this.resizeState.startWidth - dx);
                newLeft = this.resizeState.startLeft + (this.resizeState.startWidth - newWidth);
            }
            if (this.resizeState.handle.includes('s')) {
                newHeight = Math.max(200, this.resizeState.startHeight + dy);
            }
            if (this.resizeState.handle.includes('n')) {
                newHeight = Math.max(200, this.resizeState.startHeight - dy);
                newTop = this.resizeState.startTop + (this.resizeState.startHeight - newHeight);
            }

            // Apply new dimensions
            this.resizeState.window.style.width = `${newWidth}px`;
            this.resizeState.window.style.height = `${newHeight}px`;
            this.resizeState.window.style.left = `${newLeft}px`;
            this.resizeState.window.style.top = `${newTop}px`;
        }
    }

    handleMouseUp() {
        if (this.dragState) {
            const preview = document.querySelector('.window-drag-preview');
            if (preview) preview.remove();
        }
        this.dragState = null;
        this.resizeState = null;
    }

    checkSnapping(windowElement) {
        const rect = windowElement.getBoundingClientRect();
        
        // Check screen edges
        if (rect.top <= this.snapThreshold) {
            windowElement.style.top = '0';
        }
        if (rect.bottom >= window.innerHeight - this.snapThreshold) {
            windowElement.style.top = `${window.innerHeight - rect.height}px`;
        }
        if (rect.left <= this.snapThreshold) {
            windowElement.style.left = '0';
        }
        if (rect.right >= window.innerWidth - this.snapThreshold) {
            windowElement.style.left = `${window.innerWidth - rect.width}px`;
        }

        // Check other windows
        this.windows.forEach(otherWindow => {
            if (otherWindow !== windowElement && !otherWindow.classList.contains('minimized')) {
                const otherRect = otherWindow.getBoundingClientRect();
                
                // Snap to other window edges
                if (Math.abs(rect.left - otherRect.right) <= this.snapThreshold) {
                    windowElement.style.left = `${otherRect.right}px`;
                }
                if (Math.abs(rect.right - otherRect.left) <= this.snapThreshold) {
                    windowElement.style.left = `${otherRect.left - rect.width}px`;
                }
                if (Math.abs(rect.top - otherRect.bottom) <= this.snapThreshold) {
                    windowElement.style.top = `${otherRect.bottom}px`;
                }
                if (Math.abs(rect.bottom - otherRect.top) <= this.snapThreshold) {
                    windowElement.style.top = `${otherRect.top - rect.height}px`;
                }
            }
        });
    }

    focusWindow(id) {
        const windowElement = this.windows.get(id);
        if (!windowElement) return;

        this.blurAllWindows();
        windowElement.classList.add('focused');
        windowElement.style.zIndex = this.getNextZIndex();
        this.activeWindow = windowElement;
    }

    blurAllWindows() {
        this.windows.forEach(window => {
            window.classList.remove('focused');
        });
    }

    getNextZIndex() {
        let maxZ = 0;
        this.windows.forEach(window => {
            const z = parseInt(window.style.zIndex) || 0;
            maxZ = Math.max(maxZ, z);
        });
        return maxZ + 1;
    }

    minimizeWindow(windowElement) {
        windowElement.classList.add('minimizing');
        setTimeout(() => {
            windowElement.classList.add('minimized');
            windowElement.style.display = 'none';
            windowElement.classList.remove('minimizing');
        }, 300);
    }

    restoreWindow(windowElement) {
        windowElement.classList.add('restoring');
        windowElement.style.display = 'block';
        setTimeout(() => {
            windowElement.classList.remove('minimized', 'restoring');
        }, 300);
    }

    toggleMaximize(windowElement) {
        if (windowElement.classList.contains('maximized')) {
            windowElement.classList.add('unmaximizing');
            windowElement.classList.remove('maximized');
            setTimeout(() => {
                windowElement.classList.remove('unmaximizing');
            }, 300);
        } else {
            windowElement.classList.add('maximizing');
            windowElement.classList.add('maximized');
            setTimeout(() => {
                windowElement.classList.remove('maximizing');
            }, 300);
        }
    }

    closeWindow(windowElement) {
        windowElement.classList.add('closing');
        setTimeout(() => {
            this.windows.delete(windowElement.id);
            windowElement.remove();
        }, 200);
    }

    showContextMenu(e, windowElement) {
        this.hideContextMenu();

        const menu = document.createElement('div');
        menu.className = 'window-context-menu';
        menu.innerHTML = `
            <div class="window-context-menu-item" data-action="minimize">
                <i class="fas fa-window-minimize"></i> Minimize
            </div>
            <div class="window-context-menu-item" data-action="maximize">
                <i class="fas fa-window-maximize"></i> Maximize
            </div>
            <div class="window-context-menu-item" data-action="close">
                <i class="fas fa-times"></i> Close
            </div>
        `;

        menu.style.left = `${e.clientX}px`;
        menu.style.top = `${e.clientY}px`;
        document.body.appendChild(menu);

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
    }

    hideContextMenu() {
        const menu = document.querySelector('.window-context-menu');
        if (menu) menu.remove();
    }

    handleWindowResize() {
        // Update snap zones
        this.snapZones = {
            top: { y: 0, height: this.snapThreshold },
            bottom: { y: window.innerHeight - this.snapThreshold, height: this.snapThreshold },
            left: { x: 0, width: this.snapThreshold },
            right: { x: window.innerWidth - this.snapThreshold, width: this.snapThreshold },
            center: { x: window.innerWidth / 2 - this.snapThreshold, width: this.snapThreshold * 2 }
        };

        // Constrain windows to viewport
        this.windows.forEach(window => {
            const rect = window.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                window.style.left = `${window.innerWidth - rect.width}px`;
            }
            if (rect.bottom > window.innerHeight) {
                window.style.top = `${window.innerHeight - rect.height}px`;
            }
        });
    }
}
