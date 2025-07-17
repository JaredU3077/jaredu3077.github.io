import { CONFIG } from '../config.js';

/**
 * Ultra-optimized throttle function for resize operations
 */
function throttleResize(func, limit) {
    let rafId = null;
    let lastExecTime = 0;
    
    return function executedFunction(...args) {
        const currentTime = performance.now();
        
        if (currentTime - lastExecTime > limit) {
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            rafId = requestAnimationFrame(() => {
                func(...args);
                lastExecTime = currentTime;
                rafId = null;
            });
        }
    };
}

/**
 * Handles resize-related functionality for windows using pure JavaScript.
 * @class ResizeHandler
 */
export class ResizeHandler {
    /**
     * Creates an instance of ResizeHandler.
     * @param {WindowManager} manager - The window manager instance.
     */
    constructor(manager) {
        this.manager = manager;
        this.activeResize = null;
        this.resizeThreshold = 2; // Reduced threshold
        this.isResizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalLeft = 0;
        this.originalTop = 0;
        this.currentDirection = null;
        
        // Pre-cache values for maximum performance
        this.desktopBounds = null;
        this.constraints = null;
        this.taskbarHeight = 0;
        
        // Cache desktop bounds immediately
        this.updateCachedValues();
        
        // Update cache on window resize
        window.addEventListener('resize', () => {
            this.updateCachedValues();
        }, { passive: true });
    }

    /**
     * Updates cached values for better performance
     */
    updateCachedValues() {
        const desktop = document.getElementById('desktop');
        if (desktop) {
            this.desktopBounds = desktop.getBoundingClientRect();
        }
        this.constraints = this.getResizeConstraints();
        this.taskbarHeight = this.manager.taskbarHeight || 0;
    }

    /**
     * Sets up resize functionality for a window.
     * @param {HTMLElement} windowElement - The window element.
     * @param {object} windowObj - The window object.
     */
    setupResize(windowElement, windowObj) {
        // Create resize handles
        this.createResizeHandles(windowElement, windowObj);
        
        // Add resize cursor styles
        this.addResizeStyles(windowElement);
    }

    /**
     * Creates resize handles for the window.
     * @param {HTMLElement} windowElement - The window element.
     * @param {object} windowObj - The window object.
     */
    createResizeHandles(windowElement, windowObj) {
        const handles = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        
        handles.forEach(direction => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${direction}`;
            handle.dataset.direction = direction;
            handle.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.05);
                z-index: 1000;
                transition: background-color 0.15s ease;
                border-radius: 2px;
                transform: translateZ(0);
                will-change: background-color;
                pointer-events: auto;
            `;
            
            // Position handles
            this.positionHandle(handle, direction);
            
            // Add event listeners
            this.addResizeListeners(handle, windowElement, windowObj, direction);
            
            windowElement.appendChild(handle);
        });
    }

    /**
     * Positions a resize handle based on direction.
     * @param {HTMLElement} handle - The resize handle element.
     * @param {string} direction - The resize direction.
     */
    positionHandle(handle, direction) {
        const size = 8; // Smaller size for better precision
        const edgeSize = 4; // Size for edge handles
        
        switch (direction) {
            case 'n':
                handle.style.cssText += `
                    top: -${edgeSize}px; left: 0; transform: translateZ(0);
                    width: 100%; height: ${size + edgeSize}px; cursor: n-resize;
                    border-radius: 0;
                `;
                break;
            case 's':
                handle.style.cssText += `
                    bottom: -${edgeSize}px; left: 0; transform: translateZ(0);
                    width: 100%; height: ${size + edgeSize}px; cursor: s-resize;
                    border-radius: 0;
                `;
                break;
            case 'e':
                handle.style.cssText += `
                    right: -${edgeSize}px; top: 0; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: 100%; cursor: e-resize;
                    border-radius: 0;
                `;
                break;
            case 'w':
                handle.style.cssText += `
                    left: -${edgeSize}px; top: 0; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: 100%; cursor: w-resize;
                    border-radius: 0;
                `;
                break;
            case 'ne':
                handle.style.cssText += `
                    top: -${edgeSize}px; right: -${edgeSize}px; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: ${size + edgeSize}px; cursor: ne-resize;
                    border-radius: 0;
                `;
                break;
            case 'nw':
                handle.style.cssText += `
                    top: -${edgeSize}px; left: -${edgeSize}px; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: ${size + edgeSize}px; cursor: nw-resize;
                    border-radius: 0;
                `;
                break;
            case 'se':
                handle.style.cssText += `
                    bottom: -${edgeSize}px; right: -${edgeSize}px; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: ${size + edgeSize}px; cursor: se-resize;
                    border-radius: 0;
                `;
                break;
            case 'sw':
                handle.style.cssText += `
                    bottom: -${edgeSize}px; left: -${edgeSize}px; transform: translateZ(0);
                    width: ${size + edgeSize}px; height: ${size + edgeSize}px; cursor: sw-resize;
                    border-radius: 0;
                `;
                break;
        }
    }

    /**
     * Adds resize event listeners to a handle.
     * @param {HTMLElement} handle - The resize handle element.
     * @param {HTMLElement} windowElement - The window element.
     * @param {object} windowObj - The window object.
     * @param {string} direction - The resize direction.
     */
    addResizeListeners(handle, windowElement, windowObj, direction) {
        const startResize = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Update cached values before starting resize
            this.updateCachedValues();
            
            this.resizeStartX = e.clientX;
            this.resizeStartY = e.clientY;
            this.originalWidth = windowElement.offsetWidth;
            this.originalHeight = windowElement.offsetHeight;
            this.originalLeft = windowElement.offsetLeft;
            this.originalTop = windowElement.offsetTop;
            this.currentDirection = direction;
            
            // Special handling for terminal window
            if (windowElement.id === 'terminalWindow') {
                windowElement.classList.add('resizing');
                // Disable terminal interactions during resize
                const terminalOutput = windowElement.querySelector('#terminalOutput');
                const terminalInput = windowElement.querySelector('#terminalInput');
                if (terminalOutput) terminalOutput.style.pointerEvents = 'none';
                if (terminalInput) terminalInput.style.pointerEvents = 'none';
            }
            this.activeResize = { handle, windowElement, windowObj, direction };
            
            // Add event listeners with passive option
            document.addEventListener('mousemove', handleResize, { passive: true });
            document.addEventListener('mouseup', stopResize, { once: true, passive: true });
            
            // Prevent text selection during resize
            e.preventDefault();
        };

        // Ultra-optimized resize handler
        const handleResize = throttleResize((e) => {
            const deltaX = e.clientX - this.resizeStartX;
            const deltaY = e.clientY - this.resizeStartY;
            
            // Check if we've moved enough to start resizing
            if (!this.isResizing && Math.abs(deltaX) < this.resizeThreshold && Math.abs(deltaY) < this.resizeThreshold) {
                return;
            }
            
            if (!this.isResizing) {
                this.startResizing();
            }
            
            this.updateResizePosition(e.clientX, e.clientY);
        }, 4); // Ultra-fast throttle for maximum responsiveness

        const stopResize = () => {
            if (this.isResizing) {
                this.stopResizing();
            }
            
            // Clean up
            document.removeEventListener('mousemove', handleResize);
            this.activeResize = null;
        };

        handle.addEventListener('mousedown', startResize, { passive: false });
        
        // Store handler for cleanup if needed
        handle._resizeHandler = startResize;
    }

    startResizing() {
        if (!this.activeResize) return;
        
        // Prevent resizing if window is being dragged
        if (this.activeResize.windowObj._isDragging) {
            return;
        }
        
        this.isResizing = true;
        this.activeResize.windowObj._isResizing = true;
        this.activeResize.windowObj._isDragging = false;
        
        // Disable snapping during resize
        this.manager.snapHandler.isSnappingEnabled = false;
        
        // Add resizing class for visual feedback
        this.activeResize.windowElement.classList.add('resizing');
        
        // Bring window to front
        this.manager.focusWindow(this.activeResize.windowObj);
        
        // Emit resize start event
        window.dispatchEvent(new CustomEvent('windowResizeStart', {
            detail: { window: this.activeResize.windowObj }
        }));
    }

    updateResizePosition(clientX, clientY) {
        if (!this.isResizing || !this.activeResize) return;
        
        const deltaX = clientX - this.resizeStartX;
        const deltaY = clientY - this.resizeStartY;
        
        let newWidth = this.originalWidth;
        let newHeight = this.originalHeight;
        let newLeft = this.originalLeft;
        let newTop = this.originalTop;
        
        // Calculate new dimensions based on direction
        switch (this.currentDirection) {
            case 'e':
                newWidth = this.originalWidth + deltaX;
                break;
            case 'w':
                newWidth = this.originalWidth - deltaX;
                newLeft = this.originalLeft + deltaX;
                break;
            case 's':
                newHeight = this.originalHeight + deltaY;
                break;
            case 'n':
                newHeight = this.originalHeight - deltaY;
                newTop = this.originalTop + deltaY;
                break;
            case 'se':
                newWidth = this.originalWidth + deltaX;
                newHeight = this.originalHeight + deltaY;
                break;
            case 'sw':
                newWidth = this.originalWidth - deltaX;
                newHeight = this.originalHeight + deltaY;
                newLeft = this.originalLeft + deltaX;
                break;
            case 'ne':
                newWidth = this.originalWidth + deltaX;
                newHeight = this.originalHeight - deltaY;
                newTop = this.originalTop + deltaY;
                break;
            case 'nw':
                newWidth = this.originalWidth - deltaX;
                newHeight = this.originalHeight - deltaY;
                newLeft = this.originalLeft + deltaX;
                newTop = this.originalTop + deltaY;
                break;
        }
        
        // Apply constraints using cached values
        newWidth = Math.max(this.constraints.minWidth, Math.min(newWidth, this.constraints.maxWidth));
        newHeight = Math.max(this.constraints.minHeight, Math.min(newHeight, this.constraints.maxHeight));
        
        // Apply position constraints using cached desktop bounds
        if (this.desktopBounds) {
            const maxLeft = this.desktopBounds.width - newWidth;
            const maxTop = this.desktopBounds.height - newHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
        }
        
        // Adjust position if size was constrained
        if (this.currentDirection.includes('w') && newWidth < this.originalWidth - deltaX) {
            newLeft = this.originalLeft + (this.originalWidth - newWidth);
        }
        if (this.currentDirection.includes('n') && newHeight < this.originalHeight - deltaY) {
            newTop = this.originalTop + (this.originalHeight - newHeight);
        }
        
        // Use CSS transform for maximum performance during resize
        const transformX = newLeft - this.originalLeft;
        const transformY = newTop - this.originalTop;
        
        // Apply all changes in one operation for maximum performance
        const element = this.activeResize.windowElement;
        element.style.cssText += `
            transform: translate(${transformX}px, ${transformY}px) translateZ(0) !important;
            width: ${newWidth}px !important;
            height: ${newHeight}px !important;
        `;
        
        // Update window object properties (minimal DOM access)
        const windowObj = this.activeResize.windowObj;
        windowObj.width = newWidth;
        windowObj.height = newHeight;
        windowObj.left = newLeft;
        windowObj.top = newTop;
        windowObj.isMaximized = false;
        windowObj._isSnapped = false;
        
        // Only emit events very occasionally to reduce overhead
        if (!this._lastEventTime || performance.now() - this._lastEventTime > 100) {
            this._lastEventTime = performance.now();
            // Use a more efficient event dispatch
            if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('windowResizeUpdate', {
                    detail: { 
                        window: windowObj,
                        size: { width: newWidth, height: newHeight },
                        position: { left: newLeft, top: newTop }
                    }
                }));
            }
        }
    }

    stopResizing() {
        if (!this.isResizing || !this.activeResize) return;
        
        this.isResizing = false;
        this.activeResize.windowObj._isResizing = false;
        
        // Remove transform and set actual position
        const finalLeft = this.activeResize.windowObj.left;
        const finalTop = this.activeResize.windowObj.top;
        const finalWidth = this.activeResize.windowObj.width;
        const finalHeight = this.activeResize.windowObj.height;
        
        this.activeResize.windowElement.style.transform = '';
        this.activeResize.windowElement.style.left = `${finalLeft}px`;
        this.activeResize.windowElement.style.top = `${finalTop}px`;
        this.activeResize.windowElement.style.width = `${finalWidth}px`;
        this.activeResize.windowElement.style.height = `${finalHeight}px`;
        
        // Remove resizing class
        this.activeResize.windowElement.classList.remove('resizing');
        
        // Special cleanup for terminal window
        if (this.activeResize.windowElement.id === 'terminalWindow') {
            const terminalOutput = this.activeResize.windowElement.querySelector('#terminalOutput');
            const terminalInput = this.activeResize.windowElement.querySelector('#terminalInput');
            if (terminalOutput) terminalOutput.style.pointerEvents = '';
            if (terminalInput) terminalInput.style.pointerEvents = '';
        }
        
        // Re-enable snapping
        this.manager.snapHandler.isSnappingEnabled = true;
        
        // Mark window as resized
        this.activeResize.windowObj._hasBeenResized = true;
        
        // Emit resize end event
        window.dispatchEvent(new CustomEvent('windowResizeEnd', {
            detail: { 
                window: this.activeResize.windowObj,
                size: { width: finalWidth, height: finalHeight },
                position: { left: finalLeft, top: finalTop }
            }
        }));
    }

    getResizeConstraints() {
        const isMobile = window.innerWidth <= 768;
        const minWidth = isMobile ? 300 : (CONFIG.window?.minWidth || 300);
        const maxWidth = isMobile ? window.innerWidth : (CONFIG.window?.maxWidth || 1200);
        const minHeight = isMobile ? 200 : (CONFIG.window?.minHeight || 200);
        const maxHeight = isMobile ? window.innerHeight : (CONFIG.window?.maxHeight || 800);
        
        return {
            minWidth,
            maxWidth,
            minHeight,
            maxHeight
        };
    }

    /**
     * Adds resize cursor styles to the window.
     * @param {HTMLElement} windowElement - The window element.
     */
    addResizeStyles(windowElement) {
        // Add hover effects for resize handles
        const style = document.createElement('style');
        style.textContent = `
            .resize-handle:hover {
                background: rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(2px) saturate(150%) brightness(110%) !important;
                -webkit-backdrop-filter: blur(2px) saturate(150%) brightness(110%) !important;
            }
            
            .window.resizing .resize-handle {
                background: rgba(99, 102, 241, 0.2) !important;
                backdrop-filter: blur(4px) saturate(200%) brightness(120%) !important;
                -webkit-backdrop-filter: blur(4px) saturate(200%) brightness(120%) !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Handles the end of a resize operation.
     * @param {HTMLElement} windowElement - The window element.
     * @param {object} windowObj - The window object.
     */
    handleResizeEnd(windowElement, windowObj) {
        // Update window size in the manager
        this.manager.updateWindowSize(windowObj);
        
        // Trigger any resize callbacks
        windowObj._hasBeenResized = true;
        
        // Emit resize complete event
        window.dispatchEvent(new CustomEvent('windowResizeComplete', {
            detail: { window: windowObj }
        }));
    }

    // Method to cancel resizing (useful for window operations)
    cancelResize() {
        if (this.isResizing) {
            this.stopResizing();
        }
    }
}