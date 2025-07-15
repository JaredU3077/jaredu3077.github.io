/**
 * Handles auto-scroll functionality for windows.
 * @class AutoScrollHandler
 */
export class AutoScrollHandler {
    /**
     * Creates an instance of AutoScrollHandler.
     * @param {WindowManager} manager - The window manager instance.
     */
    constructor(manager) {
        this.manager = manager;
    }

    /**
     * Sets up auto-scroll for a window.
     * @param {object} windowObj - The window.
     */
    setupAutoScroll(windowObj) {
        const windowContent = windowObj.element.querySelector('.window-content');
        if (!windowContent) return;

        const observer = new MutationObserver((mutations) => {
            let shouldScrollToTop = false;

            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const content = node.textContent || node.innerHTML || '';
                            if (this.shouldScrollToTop(windowObj, content)) {
                                shouldScrollToTop = true;
                            }
                        }
                    });
                }
            });

            if (shouldScrollToTop) {
                setTimeout(() => this.scrollToTop(windowObj), 10);
            } else {
                this.scrollToBottom(windowObj);
            }
        });

        observer.observe(windowContent, { childList: true, subtree: true, characterData: true });
        windowObj.scrollObserver = observer;
    }

    /**
     * Scrolls window content to bottom.
     * @param {object} windowObj - The window.
     */
    scrollToBottom(windowObj) {
        const windowContent = windowObj.element.querySelector('.window-content');
        if (windowContent) {
            const scrollContainer = windowContent.querySelector('[data-scroll-container]') || windowContent;
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }

    /**
     * Scrolls window content to top.
     * @param {object} windowObj - The window.
     */
    scrollToTop(windowObj) {
        const windowContent = windowObj.element.querySelector('.window-content');
        if (windowContent) {
            const scrollContainer = windowContent.querySelector('[data-scroll-container]') || windowContent;
            scrollContainer.scrollTop = 0;
        }
    }

    /**
     * Determines if content should scroll to top.
     * @param {object} windowObj - The window.
     * @param {string} content - Added content.
     * @returns {boolean} True if scroll to top.
     */
    shouldScrollToTop(windowObj, content) {
        return typeof content === 'string' && (
            content.includes('terminal-heading') ||
            content.includes('<h1>') ||
            content.includes('<h2>') ||
            content.includes('<h3>') ||
            content.includes('resume') ||
            content.includes('document')
        );
    }

    /**
     * Enables auto-scroll for a window.
     * @param {string} windowId - Window ID.
     */
    enableAutoScroll(windowId) {
        const windowObj = this.manager.windows.get(windowId);
        if (windowObj && !windowObj.autoScroll) {
            windowObj.autoScroll = true;
            this.setupAutoScroll(windowObj);
        }
    }

    /**
     * Disables auto-scroll for a window.
     * @param {string} windowId - Window ID.
     */
    disableAutoScroll(windowId) {
        const windowObj = this.manager.windows.get(windowId);
        if (windowObj && windowObj.autoScroll) {
            windowObj.autoScroll = false;
            if (windowObj.scrollObserver) {
                windowObj.scrollObserver.disconnect();
                delete windowObj.scrollObserver;
            }
        }
    }
}