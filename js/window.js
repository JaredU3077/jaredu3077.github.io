/**
 * Window Management Module
 * Handles window dragging, resizing, and controls
 */

export class WindowManager {
    constructor() {
        this.initializeDraggable();
        this.initializeResizable();
        this.initializeWindowControls();
    }

    /**
     * Initialize draggable functionality for window headers
     */
    initializeDraggable() {
        interact('.window-header').draggable({
            listeners: {
                move: (event) => {
                    const target = event.target.parentElement;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                }
            }
        });
    }

    /**
     * Initialize resizable functionality for windows
     */
    initializeResizable() {
        interact('.window').resizable({
            edges: { left: true, right: true, bottom: true, top: true },
            listeners: {
                move: (event) => {
                    const target = event.target;
                    let x = (parseFloat(target.getAttribute('data-x')) || 0);
                    let y = (parseFloat(target.getAttribute('data-y')) || 0);

                    target.style.width = event.rect.width + 'px';
                    target.style.height = event.rect.height + 'px';

                    x += event.deltaRect.left;
                    y += event.deltaRect.top;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    if (target.id === 'topologyWindow') {
                        const topology = document.getElementById('networkTopology');
                        topology.style.width = event.rect.width + 'px';
                        topology.style.height = (event.rect.height - 40) + 'px';
                        if (window.network) {
                            window.network.fit();
                        }
                    }
                }
            }
        });
    }

    /**
     * Initialize window controls (minimize, maximize, close)
     */
    initializeWindowControls() {
        document.querySelectorAll('.window').forEach(window => {
            const minimizeBtn = window.querySelector('.minimize-btn');
            const maximizeBtn = window.querySelector('.maximize-btn');
            const closeBtn = window.querySelector('.close-btn');
            const body = window.querySelector('.window-body');

            window.addEventListener('click', () => {
                if (window.style.display === 'block' && !window.classList.contains('maximized') && window.id !== 'codexWindow') {
                    window.style.width = window.dataset.initialWidth || '500px';
                    window.style.height = window.dataset.initialHeight || '400px';
                    window.style.transform = 'translate(0, 0)';
                    window.setAttribute('data-x', 0);
                    window.setAttribute('data-y', 0);
                    window.scrollTop = 0;
                }
            });

            minimizeBtn.addEventListener('click', () => {
                body.style.display = body.style.display === 'none' ? 'block' : 'none';
            });

            maximizeBtn.addEventListener('click', () => {
                if (window.classList.contains('maximized')) {
                    window.style.width = window.dataset.initialWidth || '500px';
                    window.style.height = window.dataset.initialHeight || '400px';
                    window.classList.remove('maximized');
                } else {
                    window.dataset.initialWidth = window.style.width || '500px';
                    window.dataset.initialHeight = window.style.height || '400px';
                    window.style.width = '90%';
                    window.style.height = '80%';
                    window.style.left = '5%';
                    window.style.top = '5%';
                    window.style.transform = 'translate(0, 0)';
                    window.setAttribute('data-x', 0);
                    window.setAttribute('data-y', 0);
                    window.classList.add('maximized');
                }
                if (window.id === 'topologyWindow') {
                    const topology = document.getElementById('networkTopology');
                    topology.style.width = '100%';
                    topology.style.height = (window.offsetHeight - 40) + 'px';
                    if (window.network) {
                        window.network.fit();
                    }
                }
                window.scrollTop = 0;
            });

            closeBtn.addEventListener('click', () => {
                window.style.display = 'none';
                window.classList.remove('maximized');
            });
        });
    }

    /**
     * Show a window
     * @param {string} windowId - The ID of the window to show
     */
    showWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            window.style.display = 'block';
            window.scrollTop = 0;
        }
    }

    /**
     * Hide a window
     * @param {string} windowId - The ID of the window to hide
     */
    hideWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            window.style.display = 'none';
        }
    }
}
