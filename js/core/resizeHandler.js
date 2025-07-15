import { CONFIG } from '../config.js';
import { throttle } from '../utils/utils.js';

/**
 * Handles resize-related functionality for windows.
 * @class ResizeHandler
 */
export class ResizeHandler {
    /**
     * Creates an instance of ResizeHandler.
     * @param {WindowManager} manager - The window manager instance.
     */
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * Sets up resize functionality for a window.
     * @param {HTMLElement} windowElement - The window element.
     * @param {object} windowObj - The window object.
     */
    setupResize(windowElement, windowObj) {
        if (typeof interact === 'undefined') {
            console.warn('interact.js not loaded; resizing disabled for window:', windowObj.id);
            return;
        }

        try {
            const resizeInstance = interact(windowElement)
                .resizable({
                    edges: { left: true, right: true, bottom: true, top: true },
                    margin: 10,
                    inertia: false,
                    listeners: {
                        start: (event) => {
                            const win = this.manager.windows.get(event.target.id);
                            if (win) {
                                win._isResizing = true;
                                win._isDragging = false;
                                this.manager.snapHandler.isSnappingEnabled = false;
                                win.element.classList.add('resizing');
                            }
                        },
                        move: throttle(this.handleResizeMove.bind(this), 16),
                        end: this.handleResizeEnd.bind(this)
                    },
                    modifiers: [
                        interact.modifiers.restrictSize({
                            min: { width: 200, height: 150 }
                        })
                    ]
                });

            // Update the instances map
            const currentInstances = this.manager.interactInstances.get(windowObj.id) || {};
            this.manager.interactInstances.set(windowObj.id, { ...currentInstances, resize: resizeInstance });
        } catch (error) {
            console.error('Failed to setup resize for window:', windowObj.id, error);
        }
    }

    /**
     * Handles the resize movement of a window.
     * @param {object} event - The interact.js resize event.
     */
    handleResizeMove(event) {
        const windowObj = this.manager.windows.get(event.target.id);
        if (!windowObj) return;

        this.manager.snapHandler.isSnappingEnabled = false;

        event.target.style.width = `${event.rect.width}px`;
        event.target.style.height = `${event.rect.height}px`;
        event.target.style.left = `${event.rect.left}px`;
        event.target.style.top = `${event.rect.top}px`;

        windowObj.width = event.rect.width;
        windowObj.height = event.rect.height;
        windowObj.left = event.rect.left;
        windowObj.top = event.rect.top;

        windowObj.isMaximized = false;
        windowObj._isSnapped = false;
    }

    /**
     * Handles the end of a window resize event.
     * @param {object} event - The interact.js resize event.
     */
    handleResizeEnd(event) {
        const windowObj = this.manager.windows.get(event.target.id);
        if (!windowObj) return;

        windowObj._isResizing = false;
        windowObj._hasBeenResized = true;
        windowObj.element.classList.remove('resizing');

        const rect = windowObj.element.getBoundingClientRect();
        const computedStyle = getComputedStyle(windowObj.element);

        let finalWidth = parseInt(computedStyle.width, 10);
        let finalHeight = parseInt(computedStyle.height, 10);
        let finalLeft = parseInt(computedStyle.left, 10) || rect.left;
        let finalTop = parseInt(computedStyle.top, 10) || rect.top;

        const minWidth = CONFIG.window?.minWidth || 300;
        const minHeight = CONFIG.window?.minHeight || 200;
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = (window.innerHeight - this.manager.taskbarHeight) * 0.9;

        finalWidth = Math.max(minWidth, Math.min(finalWidth, maxWidth));
        finalHeight = Math.max(minHeight, Math.min(finalHeight, maxHeight));

        if (finalWidth !== parseInt(computedStyle.width, 10) || finalHeight !== parseInt(computedStyle.height, 10)) {
            windowObj.element.style.width = `${finalWidth}px`;
            windowObj.element.style.height = `${finalHeight}px`;
        }

        windowObj.width = finalWidth;
        windowObj.height = finalHeight;
        windowObj.left = finalLeft;
        windowObj.top = finalTop;

        windowObj.isMaximized = false;
        windowObj._isSnapped = false;

        windowObj.originalPosition = {
            left: finalLeft,
            top: finalTop,
            width: finalWidth,
            height: finalHeight
        };

        setTimeout(() => {
            this.manager.snapHandler.isSnappingEnabled = true;
        }, 1000);

        console.log('Resize completed for window:', windowObj.id, { width: finalWidth, height: finalHeight, left: finalLeft, top: finalTop });
    }
}