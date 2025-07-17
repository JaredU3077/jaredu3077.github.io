/**
 * Handles drag-related functionality for windows.
 * @class DragHandler
 */
export class DragHandler {
    /**
     * Creates an instance of DragHandler.
     * @param {WindowManager} manager - The window manager instance.
     */
    constructor(manager) {
        this.manager = manager;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.originalLeft = 0;
        this.originalTop = 0;
        this.currentWindow = null;
        this.dragThreshold = 3; // Minimum distance to start dragging
        this.hasMoved = false;
    }

    // Enhanced drag system with better performance and UX
    setupDrag(header, windowObj) {
        const windowEl = windowObj.element;

        const onPointerDown = (e) => {
            if (e.button !== 0) return; // Only left mouse button
            if (e.target.closest('.window-control')) return; // Don't drag when clicking controls
            
            this.dragStartX = e.clientX;
            this.dragStartY = e.clientY;
            this.originalLeft = parseFloat(windowEl.style.left) || 0;
            this.originalTop = parseFloat(windowEl.style.top) || 0;
            this.currentWindow = windowObj;
            this.hasMoved = false;
            
            // Add event listeners
            document.addEventListener('pointermove', onPointerMove, { passive: true });
            document.addEventListener('pointerup', onPointerUp, { once: true });
            
            // Prevent text selection during drag
            e.preventDefault();
        };

        const onPointerMove = (e) => {
            const deltaX = e.clientX - this.dragStartX;
            const deltaY = e.clientY - this.dragStartY;
            
            // Check if we've moved enough to start dragging
            if (!this.hasMoved && Math.abs(deltaX) < this.dragThreshold && Math.abs(deltaY) < this.dragThreshold) {
                return;
            }
            
            if (!this.hasMoved) {
                this.startDragging();
            }
            
            this.updateDragPosition(e.clientX, e.clientY);
        };

        const onPointerUp = () => {
            if (this.hasMoved) {
                this.stopDragging();
            }
            
            // Clean up
            document.removeEventListener('pointermove', onPointerMove);
            this.currentWindow = null;
        };

        header.addEventListener('pointerdown', onPointerDown);
        
        // Store handler for cleanup if needed
        header._dragHandler = onPointerDown;
    }

    startDragging() {
        if (!this.currentWindow) return;
        
        // Prevent dragging if window is being resized
        if (this.currentWindow._isResizing) {
            return;
        }
        
        this.isDragging = true;
        this.hasMoved = true;
        this.currentWindow._isDragging = true;
        this.currentWindow._isResizing = false;
        
        // Disable snapping during drag
        this.manager.snapHandler.isSnappingEnabled = false;
        
        // Add dragging class for visual feedback
        this.currentWindow.element.classList.add('dragging');
        
        // Bring window to front
        this.manager.focusWindow(this.currentWindow);
        
        // Emit drag start event
        window.dispatchEvent(new CustomEvent('windowDragStart', {
            detail: { window: this.currentWindow }
        }));
    }

    updateDragPosition(clientX, clientY) {
        if (!this.isDragging || !this.currentWindow) return;
        
        const deltaX = clientX - this.dragStartX;
        const deltaY = clientY - this.dragStartY;
        
        let newLeft = this.originalLeft + deltaX;
        let newTop = this.originalTop + deltaY;
        
        // Get desktop bounds
        const desktop = document.getElementById('desktop');
        if (desktop) {
            const desktopRect = desktop.getBoundingClientRect();
            const windowRect = this.currentWindow.element.getBoundingClientRect();
            
            // Calculate bounds
            const minLeft = 0;
            const maxLeft = desktopRect.width - windowRect.width;
            const minTop = 0;
            const maxTop = desktopRect.height - windowRect.height;
            
            // Clamp to desktop bounds
            newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
            newTop = Math.max(minTop, Math.min(newTop, maxTop));
        }
        
        // Apply position directly using left/top for natural movement
        this.currentWindow.element.style.left = `${newLeft}px`;
        this.currentWindow.element.style.top = `${newTop}px`;
        
        // Update window object
        this.currentWindow.left = newLeft;
        this.currentWindow.top = newTop;
        
        // Emit drag update event
        window.dispatchEvent(new CustomEvent('windowDragUpdate', {
            detail: { 
                window: this.currentWindow,
                position: { left: newLeft, top: newTop }
            }
        }));
    }

    stopDragging() {
        if (!this.isDragging || !this.currentWindow) return;
        
        this.isDragging = false;
        this.currentWindow._isDragging = false;
        
        // Remove dragging class
        this.currentWindow.element.classList.remove('dragging');
        
        // Re-enable snapping
        this.manager.snapHandler.isSnappingEnabled = true;
        
        // Mark window as moved
        this.currentWindow._hasBeenMoved = true;
        
        // Emit drag end event
        window.dispatchEvent(new CustomEvent('windowDragEnd', {
            detail: { 
                window: this.currentWindow,
                position: { left: this.currentWindow.left, top: this.currentWindow.top }
            }
        }));
    }

    // Method to cancel dragging (useful for window operations)
    cancelDrag() {
        if (this.isDragging) {
            this.stopDragging();
        }
    }
}