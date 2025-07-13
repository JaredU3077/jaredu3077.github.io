// neuOS Draggable System - Fixed 1:1 mouse tracking
// Implements fully draggable glass containers via Pointer Events

class DraggableSystem {
    constructor() {
        console.log('DraggableSystem: Initializing...');
        this.init();
    }

    init() {
        console.log('DraggableSystem: Setting up draggable elements...');
        this.setupDraggableElements();
    }

    setupDraggableElements() {
        // Make boot and login boxes draggable using test1 method
        const bootSequence = document.getElementById('bootSequence');
        const loginScreen = document.getElementById('loginScreen');
        
        console.log('DraggableSystem: Found elements:', {
            bootSequence: !!bootSequence,
            loginScreen: !!loginScreen
        });
        
        if (bootSequence) {
            this.dragElement(bootSequence);
            console.log('DraggableSystem: Boot sequence dragging enabled');
        } else {
            console.warn('DraggableSystem: Boot sequence element not found');
        }
        
        if (loginScreen) {
            this.dragElement(loginScreen);
            console.log('DraggableSystem: Login screen dragging enabled');
        } else {
            console.warn('DraggableSystem: Login screen element not found');
        }
        
        // Also handle any other glass containers
        const glassContainers = document.querySelectorAll('.glass-container, .neuos-glass-box');
        console.log('DraggableSystem: Found glass containers:', glassContainers.length);
        glassContainers.forEach((container, index) => {
            this.dragElement(container);
            console.log(`DraggableSystem: Glass container ${index} dragging enabled`);
        });
    }

    // Fixed 1:1 dragging implementation
    dragElement(elmnt) {
        if (!elmnt) {
            console.warn('DraggableSystem: Element is null, cannot make draggable');
            return;
        }
        
        console.log('DraggableSystem: Making element draggable:', elmnt.id || elmnt.className);
        
        let isDragging = false;
        let initialX = 0, initialY = 0;
        let initialLeft = 0, initialTop = 0;

        const onPointerDown = e => {
            console.log('DraggableSystem: Pointer down on element:', elmnt.id || elmnt.className);
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
            console.log('DraggableSystem: Pointer up, removing event listeners');
            isDragging = false;
            document.removeEventListener('pointermove', onPointerMove);
        };

        elmnt.addEventListener('pointerdown', onPointerDown);
        console.log('DraggableSystem: Event listener added for element:', elmnt.id || elmnt.className);
    }

    // Method to refresh draggable elements when new ones are added
    refresh() {
        console.log('DraggableSystem: Refreshing draggable elements...');
        this.setupDraggableElements();
    }
    
    // Method to enable boot box dragging specifically
    enableBootBoxDragging() {
        const bootSequence = document.getElementById('bootSequence');
        if (bootSequence) {
            this.dragElement(bootSequence);
            console.log('DraggableSystem: Boot sequence dragging enabled');
        } else {
            console.warn('DraggableSystem: Boot sequence element not found for specific enable');
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
    console.log('DraggableSystem: DOM loaded, initializing...');
    window.draggableSystem = new DraggableSystem();
});

// Also initialize after a short delay to ensure all elements are ready
setTimeout(() => {
    if (!window.draggableSystem) {
        console.log('DraggableSystem: Delayed initialization...');
        window.draggableSystem = new DraggableSystem();
    } else {
        console.log('DraggableSystem: Refreshing existing system...');
        window.draggableSystem.refresh();
    }
}, 100);

// Export for use in other modules
export default DraggableSystem; 