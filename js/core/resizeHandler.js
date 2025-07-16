import { CONFIG } from '../config.js';
import { throttle } from '../utils/utils.js';

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
        this.resizeThreshold = 3; // Minimum distance to start resizing
        this.isResizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.originalWidth = 0;
        this.originalHeight = 0;
        this.originalLeft = 0;
        this.originalTop = 0;
        this.currentDirection = null;
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
        const size = 12; // Increased from 8 for better visibility
        const halfSize = size / 2;
        
        switch (direction) {
            case 'n':
                handle.style.top = '0';
                handle.style.left = '50%';
                handle.style.transform = 'translateX(-50%)';
                handle.style.width = '100%';
                handle.style.height = `${size}px`;
                handle.style.cursor = 'n-resize';
                break;
            case 's':
                handle.style.bottom = '0';
                handle.style.left = '50%';
                handle.style.transform = 'translateX(-50%)';
                handle.style.width = '100%';
                handle.style.height = `${size}px`;
                handle.style.cursor = 's-resize';
                break;
            case 'e':
                handle.style.right = '0';
                handle.style.top = '50%';
                handle.style.transform = 'translateY(-50%)';
                handle.style.width = `${size}px`;
                handle.style.height = '100%';
                handle.style.cursor = 'e-resize';
                break;
            case 'w':
                handle.style.left = '0';
                handle.style.top = '50%';
                handle.style.transform = 'translateY(-50%)';
                handle.style.width = `${size}px`;
                handle.style.height = '100%';
                handle.style.cursor = 'w-resize';
                break;
            case 'ne':
                handle.style.top = '0';
                handle.style.right = '0';
                handle.style.width = `${size}px`;
                handle.style.height = `${size}px`;
                handle.style.cursor = 'ne-resize';
                break;
            case 'nw':
                handle.style.top = '0';
                handle.style.left = '0';
                handle.style.width = `${size}px`;
                handle.style.height = `${size}px`;
                handle.style.cursor = 'nw-resize';
                break;
            case 'se':
                handle.style.bottom = '0';
                handle.style.right = '0';
                handle.style.width = `${size}px`;
                handle.style.height = `${size}px`;
                handle.style.cursor = 'se-resize';
                break;
            case 'sw':
                handle.style.bottom = '0';
                handle.style.left = '0';
                handle.style.width = `${size}px`;
                handle.style.height = `${size}px`;
                handle.style.cursor = 'sw-resize';
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
            
            this.resizeStartX = e.clientX;
            this.resizeStartY = e.clientY;
            this.originalWidth = windowElement.offsetWidth;
            this.originalHeight = windowElement.offsetHeight;
            this.originalLeft = windowElement.offsetLeft;
            this.originalTop = windowElement.offsetTop;
            this.currentDirection = direction;
            this.activeResize = { handle, windowElement, windowObj, direction };
            
            // Add event listeners
            document.addEventListener('mousemove', handleResize, { passive: true });
            document.addEventListener('mouseup', stopResize, { once: true });
            
            // Prevent text selection during resize
            e.preventDefault();
        };

        const handleResize = throttle((e) => {
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
        }, 16);

        const stopResize = () => {
            if (this.isResizing) {
                this.stopResizing();
            }
            
            // Clean up
            document.removeEventListener('mousemove', handleResize);
            this.activeResize = null;
        };

        handle.addEventListener('mousedown', startResize);
        
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
        
        // Apply constraints
        const constraints = this.getResizeConstraints();
        newWidth = Math.max(constraints.minWidth, Math.min(newWidth, constraints.maxWidth));
        newHeight = Math.max(constraints.minHeight, Math.min(newHeight, constraints.maxHeight));
        
        // Get desktop bounds for position constraints
        const desktop = document.getElementById('desktop');
        if (desktop) {
            const desktopRect = desktop.getBoundingClientRect();
            
            // Ensure window doesn't go off-screen
            const maxLeft = desktopRect.width - newWidth;
            const maxTop = desktopRect.height - newHeight - this.manager.taskbarHeight;
            
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
        
        // Apply changes with transform for better performance
        // Calculate transform relative to original position
        const transformX = newLeft - this.originalLeft;
        const transformY = newTop - this.originalTop;
        

        
        this.activeResize.windowElement.style.transform = `translate(${transformX}px, ${transformY}px)`;
        this.activeResize.windowElement.style.width = `${newWidth}px`;
        this.activeResize.windowElement.style.height = `${newHeight}px`;
        
        // Update window object
        this.activeResize.windowObj.width = newWidth;
        this.activeResize.windowObj.height = newHeight;
        this.activeResize.windowObj.left = newLeft;
        this.activeResize.windowObj.top = newTop;
        
        // Mark as not maximized
        this.activeResize.windowObj.isMaximized = false;
        this.activeResize.windowObj._isSnapped = false;
        
        // Emit resize update event
        window.dispatchEvent(new CustomEvent('windowResizeUpdate', {
            detail: { 
                window: this.activeResize.windowObj,
                size: { width: newWidth, height: newHeight },
                position: { left: newLeft, top: newTop }
            }
        }));
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