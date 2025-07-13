// neuOS Draggable System - Fixed 1:1 mouse tracking
// Implements fully draggable glass containers via Pointer Events

class DraggableSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupDraggableElements();
    }

    setupDraggableElements() {
        // Make boot and login boxes draggable using test1 method
        const bootSequence = document.getElementById('bootSequence');
        const loginScreen = document.getElementById('loginScreen');
        

        
        if (bootSequence) {
            this.dragElement(bootSequence);
        }
        
        if (loginScreen) {
            this.dragElement(loginScreen);
        }
        
        // Also handle any other glass containers
        const glassContainers = document.querySelectorAll('.glass-container, .neuos-glass-box');
        glassContainers.forEach((container, index) => {
            this.dragElement(container);
        });
    }

    // Fixed 1:1 dragging implementation
    dragElement(elmnt) {
        if (!elmnt) {
            return;
        }
        
        let isDragging = false;
        let initialX = 0, initialY = 0;
        let initialLeft = 0, initialTop = 0;

        const onPointerDown = e => {
            e.preventDefault();
            
            // Get current position
            const rect = elmnt.getBoundingClientRect();
            elmnt.style.position = 'absolute';
            elmnt.style.top = rect.top + 'px';
            elmnt.style.left = rect.left + 'px';
            elmnt.style.transform = 'none';

            // Store initial positions
            initialX = e.clientX;
            initialY = e.clientY;
            initialLeft = rect.left;
            initialTop = rect.top;
            
            isDragging = true;
            document.addEventListener('pointermove', onPointerMove);
            document.addEventListener('pointerup', onPointerUp, { once: true });
        };

        const onPointerMove = e => {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // Calculate new position based on mouse movement from initial position
            const deltaX = e.clientX - initialX;
            const deltaY = e.clientY - initialY;
            
            // Apply the delta to the initial position for 1:1 tracking
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            
            elmnt.style.left = newLeft + 'px';
            elmnt.style.top = newTop + 'px';
        };

        const onPointerUp = () => {
            isDragging = false;
            document.removeEventListener('pointermove', onPointerMove);
        };

        elmnt.addEventListener('pointerdown', onPointerDown);
    }

    // Method to refresh draggable elements when new ones are added
    refresh() {
        this.setupDraggableElements();
    }
    
    // Method to enable boot box dragging specifically
    enableBootBoxDragging() {
        const bootSequence = document.getElementById('bootSequence');
        if (bootSequence) {
            this.dragElement(bootSequence);
        }
    }

    // Cleanup method
    destroy() {
        const glassContainers = document.querySelectorAll('.glass-container, .neuos-glass-box');
        const bootSequence = document.getElementById('bootSequence');
        const loginScreen = document.getElementById('loginScreen');
        
        // Clean up glass containers
        glassContainers.forEach(container => {
            if (container._draggableHandlers) {
                container.removeEventListener('pointerdown', container._draggableHandlers.pointerdown);
                delete container._draggableHandlers;
            }
        });
        
        // Clean up boot sequence
        if (bootSequence && bootSequence._draggableHandlers) {
            bootSequence.removeEventListener('pointerdown', bootSequence._draggableHandlers.pointerdown);
            delete bootSequence._draggableHandlers;
        }
        
        // Clean up login screen
        if (loginScreen && loginScreen._draggableHandlers) {
            loginScreen.removeEventListener('pointerdown', loginScreen._draggableHandlers.pointerdown);
            delete loginScreen._draggableHandlers;
        }
    }
}

// Initialize draggable system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.draggableSystem = new DraggableSystem();
});

// Also initialize after a short delay to ensure all elements are ready
setTimeout(() => {
    if (!window.draggableSystem) {
        window.draggableSystem = new DraggableSystem();
    } else {
        window.draggableSystem.refresh();
    }
}, 100);

// Export for use in other modules
export default DraggableSystem; 