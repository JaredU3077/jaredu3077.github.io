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
    }

    /**
     * Sets up drag functionality for a window header.
     * @param {HTMLElement} header - The window header element.
     * @param {object} windowObj - The window object.
     */
    setupDrag(header, windowObj) {
        if (typeof interact === 'undefined') {
            console.warn('interact.js not loaded; dragging disabled for window:', windowObj.id);
            return;
        }

        try {
            const dragInstance = interact(header)
                .draggable({
                    inertia: false,
                    modifiers: [
                        interact.modifiers.restrictRect({
                            restriction: () => {
                                const desktop = document.getElementById('desktop');
                                return {
                                    top: 0,
                                    left: 0,
                                    right: desktop.clientWidth,
                                    bottom: desktop.clientHeight - this.manager.taskbarHeight
                                };
                            },
                            endOnly: true
                        })
                    ],
                    autoScroll: false,
                    allowFrom: '.window-header',
                    ignoreFrom: '.window-controls',
                    listeners: {
                        start: (event) => {
                            const win = this.manager.windows.get(event.target.closest('.window').id);
                            if (win) {
                                win._isDragging = true;
                                win._isResizing = false;
                                win.element.style.willChange = 'transform';
                                this.manager.focusWindow(win);
                            }
                        },
                        move: this.handleDragMove.bind(this),
                        end: this.handleDragEnd.bind(this)
                    }
                });

            // Update the instances map
            const currentInstances = this.manager.interactInstances.get(windowObj.id) || {};
            this.manager.interactInstances.set(windowObj.id, { ...currentInstances, drag: dragInstance });
        } catch (error) {
            console.error('Failed to setup drag for window:', windowObj.id, error);
        }
    }

    /**
     * Handles the drag movement of a window.
     * @param {object} event - The interact.js drag event.
     */
    handleDragMove(event) {
        const windowElement = event.target.closest('.window');
        if (!windowElement) return;

        const windowObj = this.manager.windows.get(windowElement.id);
        if (!windowObj) return;

        const currentLeft = parseFloat(windowElement.style.left) || 0;
        const currentTop = parseFloat(windowElement.style.top) || 0;

        const newLeft = currentLeft + event.dx;
        const newTop = currentTop + event.dy;

        windowElement.style.left = `${newLeft}px`;
        windowElement.style.top = `${newTop}px`;

        windowObj.left = newLeft;
        windowObj.top = newTop;
    }

    /**
     * Handles the end of a window drag event.
     * @param {object} event - The interact.js drag event.
     */
    handleDragEnd(event) {
        const windowElement = event.target.closest('.window');
        if (!windowElement) return;

        const windowObj = this.manager.windows.get(windowElement.id);
        if (!windowObj) return;

        const width = windowElement.offsetWidth;
        const height = windowElement.offsetHeight;
        let left = parseFloat(windowElement.style.left) || 0;
        let top = parseFloat(windowElement.style.top) || 0;

        left = Math.max(0, Math.min(left, window.innerWidth - width));
        top = Math.max(0, Math.min(top, window.innerHeight - height - this.manager.taskbarHeight));

        windowElement.style.left = `${left}px`;
        windowElement.style.top = `${top}px`;
        windowObj.left = left;
        windowObj.top = top;

        windowObj._isDragging = false;
        windowObj.element.style.willChange = 'auto';
        windowObj.element.classList.remove('dragging');

        if (this.manager._dragThrottle) {
            cancelAnimationFrame(this.manager._dragThrottle);
            this.manager._dragThrottle = null;
        }

        if (this.manager.snapHandler.isSnappingEnabled && !windowObj._isResizing && !windowObj._hasBeenResized) {
            const rect = windowObj.element.getBoundingClientRect();
            const threshold = 3;

            if (rect.left <= threshold || rect.right >= window.innerWidth - threshold || 
                rect.top <= threshold || rect.bottom >= window.innerHeight - this.manager.taskbarHeight - threshold) {
                requestAnimationFrame(() => this.manager.snapHandler.checkSnapZones(windowObj));
            }
        }
    }
}