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
        
        // Handle neuOS widget specifically with enhanced interaction
        const neuosWidget = document.getElementById('neuosWidget');
        if (neuosWidget) {
            this.dragElement(neuosWidget);
            this.addInteractiveEffects(neuosWidget);
        }
        
        // Note: Removed glass containers dragging to prevent conflicts
        // Only the main containers (bootSequence, loginScreen, neuosWidget) should be draggable
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
            elmnt.style.setProperty('position', 'absolute', 'important');
            elmnt.style.setProperty('top', rect.top + 'px', 'important');
            elmnt.style.setProperty('left', rect.left + 'px', 'important');
            
            // Clear any existing transform and set to none
            elmnt.style.setProperty('transform', 'none', 'important');
            elmnt.style.setProperty('transition', 'none', 'important'); // Disable transitions during drag
            elmnt.style.setProperty('cursor', 'grabbing', 'important'); // Show grabbing cursor

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
            
            elmnt.style.setProperty('left', newLeft + 'px', 'important');
            elmnt.style.setProperty('top', newTop + 'px', 'important');
            
            // Update cursor during drag
            elmnt.style.setProperty('cursor', 'grabbing', 'important');
        };

        const onPointerUp = () => {
            isDragging = false;
            document.removeEventListener('pointermove', onPointerMove);
            
            // Re-enable transitions after dragging
            elmnt.style.setProperty('transition', '', 'important');
            
            // Ensure cursor is correct after dragging
            elmnt.style.setProperty('cursor', 'grab', 'important');
        };

        elmnt.addEventListener('pointerdown', onPointerDown);
        
        // Store handler for cleanup
        elmnt._draggableHandlers = {
            pointerdown: onPointerDown
        };
    }

    // Add simple interactive effects that don't interfere with dragging
    addInteractiveEffects(element) {
        if (!element) return;
        
        // Simple cursor feedback only - no complex effects that interfere with dragging
        const mouseenterHandler = () => {
            element.style.setProperty('cursor', 'grab', 'important');
        };
        
        const mouseleaveHandler = () => {
            element.style.setProperty('cursor', 'grab', 'important');
        };
        
        const keydownHandler = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Simple click feedback without interfering with dragging
                element.style.setProperty('box-shadow', '0px 8px 20px rgba(0, 0, 0, 0.3)', 'important');
                setTimeout(() => {
                    element.style.setProperty('box-shadow', '0px 6px 24px rgba(0, 0, 0, 0.2)', 'important');
                }, 150);
            }
        };
        
        // Add event listeners
        element.addEventListener('mouseenter', mouseenterHandler);
        element.addEventListener('mouseleave', mouseleaveHandler);
        element.addEventListener('keydown', keydownHandler);
        
        // Store handlers for cleanup
        element._interactiveHandlers = {
            mouseenter: mouseenterHandler,
            mouseleave: mouseleaveHandler,
            keydown: keydownHandler
        };
        
        // Make it focusable for accessibility
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('aria-label', 'neuOS desktop widget - click to interact');
    }

    // Method to refresh draggable elements when new ones are added
    refresh() {
        this.setupDraggableElements();
    }
    
    // Method to specifically refresh neuOS widget
    refreshNeuOSWidget() {
        const neuosWidget = document.getElementById('neuosWidget');
        if (neuosWidget) {
            this.dragElement(neuosWidget);
            this.addInteractiveEffects(neuosWidget);
        }
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
        const bootSequence = document.getElementById('bootSequence');
        const loginScreen = document.getElementById('loginScreen');
        const neuosWidget = document.getElementById('neuosWidget');
        
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
        
        // Clean up neuOS widget
        if (neuosWidget) {
            // Clean up pointer events
            if (neuosWidget._draggableHandlers) {
                neuosWidget.removeEventListener('pointerdown', neuosWidget._draggableHandlers.pointerdown);
                delete neuosWidget._draggableHandlers;
            }
            
            // Clean up interactive effects
            if (neuosWidget._interactiveHandlers) {
                neuosWidget.removeEventListener('mouseenter', neuosWidget._interactiveHandlers.mouseenter);
                neuosWidget.removeEventListener('mouseleave', neuosWidget._interactiveHandlers.mouseleave);
                neuosWidget.removeEventListener('keydown', neuosWidget._interactiveHandlers.keydown);
                delete neuosWidget._interactiveHandlers;
            }
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