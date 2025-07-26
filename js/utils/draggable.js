// neuOS Draggable System - Fixed 1:1 mouse tracking
// Implements fully draggable glass containers via Pointer Events

class DraggableSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupDraggableElements();
        this.setupWindowResizeHandler();
        
        // Ensure boot and login containers are properly positioned immediately
        this.refreshBootAndLogin();
    }

    setupWindowResizeHandler() {
        // Reset positions when window is resized to prevent elements from being outside viewport
        window.addEventListener('resize', () => {
            // Debounce the resize event
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                this.resetAllPositions();
            }, 250);
        });

        // Add keyboard shortcut to reset positions (Ctrl+R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r' && !e.shiftKey) {
                e.preventDefault();
                this.resetAllPositions();
                console.log('neuOS: Reset draggable element positions');
            }
        });
    }

    setupDraggableElements() {
        // Make only the actual orb containers draggable, not the full-screen backgrounds
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        const loginContainer = document.querySelector('#loginScreen .login-container');
        
        console.log('DraggableSystem: Found containers:', { bootContainer: !!bootContainer, loginContainer: !!loginContainer });
        
        if (bootContainer) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Making boot container draggable');
            this.dragElement(bootContainer);
        }
        
        if (loginContainer) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Making login container draggable');
            this.dragElement(loginContainer);
        }
        
        // Handle neuOS widget specifically with enhanced interaction
        const neuosWidget = document.getElementById('neuosWidget');
        if (neuosWidget) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Making neuOS widget draggable');
            this.dragElement(neuosWidget);
            this.addInteractiveEffects(neuosWidget);
        }
        
        // Note: Only the actual orb containers are draggable, not the full-screen backgrounds
    }

    // Fixed 1:1 dragging implementation with free movement like terminal window
    dragElement(elmnt) {
        if (!elmnt) {
            return;
        }
        
        let isDragging = false;
        let initialX = 0, initialY = 0;
        let initialLeft = 0, initialTop = 0;

        const onPointerDown = e => {
            e.preventDefault();
            e.stopPropagation();
            
            // Get current position relative to the viewport
            const rect = elmnt.getBoundingClientRect();
            
            // Calculate position relative to viewport (not parent center)
            const viewportLeft = rect.left;
            const viewportTop = rect.top;
            
            // Convert from CSS transform-based centering to absolute positioning for dragging
            elmnt.style.setProperty('position', 'fixed', 'important');
            elmnt.style.setProperty('left', viewportLeft + 'px', 'important');
            elmnt.style.setProperty('top', viewportTop + 'px', 'important');
            elmnt.style.setProperty('transform', 'none', 'important'); // Remove any transform
            elmnt.style.setProperty('transition', 'none', 'important'); // Disable transitions during drag
            elmnt.style.setProperty('cursor', 'grabbing', 'important'); // Show grabbing cursor

            // Store initial positions
            initialX = e.clientX;
            initialY = e.clientY;
            initialLeft = viewportLeft;
            initialTop = viewportTop;
            
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
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            
            // Apply boundary constraints to keep element within viewport
            const elementWidth = elmnt.offsetWidth;
            const elementHeight = elmnt.offsetHeight;
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            // Constrain to viewport boundaries with some padding
            const padding = 20;
            newLeft = Math.max(-elementWidth + padding, Math.min(newLeft, viewportWidth - padding));
            newTop = Math.max(-elementHeight + padding, Math.min(newTop, viewportHeight - padding));
            
            // Apply the new position directly
            elmnt.style.setProperty('left', newLeft + 'px', 'important');
            elmnt.style.setProperty('top', newTop + 'px', 'important');
            
            // Update cursor during drag
            elmnt.style.setProperty('cursor', 'grabbing', 'important');
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            
            isDragging = false;
            document.removeEventListener('pointermove', onPointerMove);
            
            // Re-enable transitions after dragging
            elmnt.style.setProperty('transition', 'all 0.3s ease-in-out', 'important');
            
            // Keep the element in its current absolute position - don't reset to CSS centering
            // The element should stay exactly where the user dropped it
            elmnt.style.setProperty('cursor', 'grab', 'important');
            
            // Store that this element has been moved from its initial position
            elmnt.dataset.hasBeenMoved = 'true';
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
    
    // Method to specifically refresh boot and login containers
    refreshBootAndLogin() {
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        const loginContainer = document.querySelector('#loginScreen .login-container');
        
        if (bootContainer) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Refreshing boot container');
            this.dragElement(bootContainer);
        }
        
        if (loginContainer) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Refreshing login container');
            this.dragElement(loginContainer);
        }
    }
    
    // Method to specifically refresh neuOS widget
    refreshNeuOSWidget() {
        const neuosWidget = document.getElementById('neuosWidget');
        if (neuosWidget) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Refreshing neuOS widget');
            this.dragElement(neuosWidget);
            this.addInteractiveEffects(neuosWidget);
        }
    }
    
    // Method to enable boot box dragging specifically
    enableBootBoxDragging() {
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        if (bootContainer) {
            // CSS centering is now handled by CSS, just make it draggable
            console.log('DraggableSystem: Enabling boot box dragging');
            this.dragElement(bootContainer);
        }
    }

    // Method to reset position of draggable elements if they're outside viewport
    resetElementPosition(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Check if element is outside viewport
        if (rect.right < 0 || rect.bottom < 0 || 
            rect.left > viewportWidth || rect.top > viewportHeight) {
            // Reset to CSS-based centering
            element.style.setProperty('position', 'fixed', 'important');
            element.style.setProperty('top', '50%', 'important');
            element.style.setProperty('left', '50%', 'important');
            element.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            element.style.setProperty('transition', 'all 0.5s ease-in-out', 'important');
            // Clear the moved flag so CSS centering works again
            element.removeAttribute('data-has-been-moved');
        }
    }

    // Method to reset all draggable elements
    resetAllPositions() {
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        const loginContainer = document.querySelector('#loginScreen .login-container');
        const neuosWidget = document.getElementById('neuosWidget');
        
        this.resetElementPosition(bootContainer);
        this.resetElementPosition(loginContainer);
        this.resetElementPosition(neuosWidget);
    }

    // Method to reset elements back to center
    resetToCenter() {
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        const loginContainer = document.querySelector('#loginScreen .login-container');
        const neuosWidget = document.getElementById('neuosWidget');
        
        // Reset to CSS-based centering for all elements
        [bootContainer, loginContainer, neuosWidget].forEach(element => {
            if (element) {
                element.style.setProperty('position', 'fixed', 'important');
                element.style.setProperty('top', '50%', 'important');
                element.style.setProperty('left', '50%', 'important');
                element.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                element.style.setProperty('transition', 'all 0.5s ease-in-out', 'important');
                // Clear the moved flag so CSS centering works again
                element.removeAttribute('data-has-been-moved');
            }
        });
    }

    // Cleanup method
    destroy() {
        const bootContainer = document.querySelector('#bootSequence .boot-container');
        const loginContainer = document.querySelector('#loginScreen .login-container');
        const neuosWidget = document.getElementById('neuosWidget');
        
        // Clean up boot container
        if (bootContainer && bootContainer._draggableHandlers) {
            bootContainer.removeEventListener('pointerdown', bootContainer._draggableHandlers.pointerdown);
            delete bootContainer._draggableHandlers;
        }
        
        // Clean up login container
        if (loginContainer && loginContainer._draggableHandlers) {
            loginContainer.removeEventListener('pointerdown', loginContainer._draggableHandlers.pointerdown);
            delete loginContainer._draggableHandlers;
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
    
    // Immediately position boot and login containers to prevent visual jumps
    setTimeout(() => {
        if (window.draggableSystem) {
            window.draggableSystem.refreshBootAndLogin();
        }
    }, 10);
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