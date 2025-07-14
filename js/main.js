// [neuOS]
/**
 * @file Main entry point for the application. Initializes all modules and handles global events.
 * @author jared u.
 */

import { Terminal } from './apps/terminal.js';
import { WindowManager } from './core/window.js';
import { HelpManager } from './utils/help.js';
import { SearchManager } from './utils/search.js';
import { BootSystem } from './core/boot.js';
import { CONFIG, createAppButton } from './config.js';
import { debounce } from './utils/utils.js';

// Import mobile utilities
import './utils/mobile.js';

// Import screensaver
import './core/screensaver.js';

// Import glass effect system
import './core/glassEffect.js';
import { GlassMorphismSystem } from './core/glassEffect.js';
import GlassEffects from './utils/glassEffects.js';
import DraggableSystem from './utils/draggable.js';

// --- MODULE INITIALIZATION ---
/** @type {WindowManager} */
let windowManager = null;
/** @type {HelpManager} */
let helpManager = null;
/** @type {SearchManager} */
let searchManager = null;

/** @type {?Terminal} */
let terminal = null;
/** @type {BootSystem} */
let bootSystem = null;
/** @type {GlassMorphismSystem} */
let glassMorphismSystem = null;
/** @type {GlassEffects} */
let glassEffects = null;
/** @type {DraggableSystem} */
let draggableSystem = null;
/** @type {Object<string, HTMLElement>} */
let openWindows = {};

// Initialize modules with error boundaries
try {
    windowManager = new WindowManager();
    // Expose windowManager globally for other modules to use
    window.windowManager = windowManager;
} catch (error) {
    console.error('neuOS: Failed to initialize WindowManager:', error);
}

try {
    helpManager = new HelpManager();
} catch (error) {
    console.error('neuOS: Failed to initialize HelpManager:', error);
}

try {
    searchManager = new SearchManager();
} catch (error) {
    console.error('neuOS: Failed to initialize SearchManager:', error);
}

try {
    glassMorphismSystem = new GlassMorphismSystem();
    window.glassMorphismSystem = glassMorphismSystem;
} catch (error) {
    console.error('neuOS: Failed to initialize GlassMorphismSystem:', error);
}

try {
    glassEffects = new GlassEffects();
    window.glassEffects = glassEffects;
} catch (error) {
    console.error('neuOS: Failed to initialize GlassEffects:', error);
}

try {
    draggableSystem = new DraggableSystem();
    window.draggableSystem = draggableSystem;
} catch (error) {
    console.error('neuOS: Failed to initialize DraggableSystem:', error);
}

// --- UI INITIALIZATION ---

/**
 * Initializes the user interface, creating desktop icons.
 */
function initializeUI() {
    const desktopIcons = document.getElementById('desktop-icons');
    
    // Add null check to prevent errors
    if (!desktopIcons) {
        console.error('Desktop icons container not found');
        return;
    }
    
    desktopIcons.innerHTML = '';

    // Create desktop icons for all apps
    Object.values(CONFIG.applications).forEach(app => {
        // Create Desktop Icons
        desktopIcons.insertAdjacentHTML('beforeend', createAppButton(app, 'desktop'));
    });
    
    // Desktop is now ready but hidden until boot completes
}

// --- DESKTOP ICON STATE MANAGEMENT ---
function resetDesktopIconState(icon) {
    // Remove any inline styles that might interfere with CSS
    icon.style.removeProperty('border-color');
    icon.style.removeProperty('box-shadow');
    icon.style.removeProperty('background');
    icon.style.removeProperty('transform');
    icon.style.setProperty('background', '', 'important');
    icon.style.setProperty('box-shadow', '', 'important');
    icon.style.setProperty('border-color', '', 'important');
    icon.style.setProperty('transform', '', 'important');
    
    // Also reset any glass-reflection child
    const reflection = icon.querySelector('.glass-reflection');
    if (reflection) {
        reflection.style.removeProperty('transform');
    }
    
    const label = icon.querySelector('.label');
    if (label) {
        label.style.removeProperty('opacity');
        label.style.removeProperty('transform');
        label.style.removeProperty('color');
    }
    
    const iconEl = icon.querySelector('.icon');
    if (iconEl) {
        iconEl.style.removeProperty('color');
    }
}

/**
 * Refreshes desktop icon event handlers after dynamic creation
 */
function refreshDesktopIconHandlers() {
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach(icon => {
        // Remove any existing handlers to prevent duplicates
        icon.removeEventListener('mouseleave', resetDesktopIconState);
        icon.removeEventListener('blur', resetDesktopIconState);
        icon.removeEventListener('mouseenter', resetDesktopIconState);
        
        // Re-attach handlers
        icon.addEventListener('mouseleave', () => resetDesktopIconState(icon));
        icon.addEventListener('blur', () => resetDesktopIconState(icon));
        icon.addEventListener('mouseenter', () => {
            setTimeout(() => resetDesktopIconState(icon), 10);
        });
    });
}

// --- EVENT LISTENERS ---



// --- APPLICATION LAUNCHER ---

/**
 * Handles the click event for an application icon or menu item.
 * @param {string} appId - The ID of the application to launch.
 */
async function handleAppClick(appId) {
    try {
        // Play UI sound effect
        if (window.bootSystemInstance) {
            window.bootSystemInstance.playUIClickSound();
        }
        
        const app = CONFIG.applications[appId];
        if (!app) {
            console.error(`No application config found for appId: ${appId}`);
            return;
        }

    app.windows.forEach(async windowConfig => {
        // If window already open, focus it and do not re-initialize
        let winElem = document.getElementById(windowConfig.id);
        if (winElem) {
            // Check if window is minimized and restore it
            const windowObj = windowManager.windows.get(windowConfig.id);
            if (windowObj && windowObj.isMinimized) {
                windowManager.restoreWindow(windowObj);
            }
            windowManager.focusWindow(windowObj);
            return;
        }
        
        // Play window opening sound
        if (window.bootSystemInstance) {
            window.bootSystemInstance.playWindowOpenSound();
        }
        
        // Create window and initialize app logic
        winElem = windowManager.createWindow({
            id: windowConfig.id,
            title: windowConfig.title,
            content: windowConfig.content,
            width: windowConfig.width,
            height: windowConfig.height,
            icon: app.icon,
            autoScroll: ['terminal'].includes(appId), // Enable auto-scroll for apps that benefit from it
            type: app.type || 'app', // Pass the application type (e.g., 'game' vs 'app')
            defaultSize: app.defaultSize // Pass the default size for this application
        });
        

        openWindows[windowConfig.id] = winElem;
        try {
            switch (appId) {
                case 'terminal':
                    terminal = new Terminal(
                        winElem.querySelector('#terminalInput input'),
                        winElem.querySelector('#terminalOutput')
                    );
                    // Expose terminal globally for demoscene access
                    window.terminalInstance = terminal;
                    break;
                case 'codex':
                    console.log('Initializing codex...');
                    const codexApp = new CodexApp();
                    await codexApp.init();
                    
                    // Store reference to codex app
                    window.codexInstance = codexApp;
                    
                    // Attach the Codex app to the window element
                    codexApp.attachToWindow(winElem);
                    
                    console.log('Codex initialized:', codexApp);
                    
                    console.log('Codex initialized:', codexApp);
                    break;
            }
        } catch (error) {
            console.error(`Error initializing application ${appId}:`, error);
            // Show user-friendly error instead of alert
            const errorContent = `
                <div class="error-content" style="padding: 20px; text-align: center; color: #ff6b6b;">
                    <h3>⚠️ Application Error</h3>
                    <p>Failed to initialize ${app.name}</p>
                    <p style="font-size: 0.9em; opacity: 0.8;">${error.message}</p>
                    <button onclick="this.closest('.window').querySelector('.close').click()" 
                            style="margin-top: 10px; padding: 5px 15px; background: #ff6b6b; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Close
                    </button>
                </div>
            `;
            winElem.querySelector('.window-content').innerHTML = errorContent;
        }
    });
    } catch (error) {
        console.error('neuOS: Application launch error:', error);
        // Show user-friendly error message
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: 'Segoe UI', sans-serif;
            text-align: center;
        `;
        errorMessage.innerHTML = `
            <h3>⚠️ Application Error</h3>
            <p>Failed to launch application: ${appId}</p>
            <p style="font-size: 0.9em; opacity: 0.8;">${error.message}</p>
        `;
        document.body.appendChild(errorMessage);
        
        // Remove error message after 5 seconds
        setTimeout(() => {
            if (errorMessage.parentNode) {
                errorMessage.remove();
            }
        }, 5000);
    }
}

// Expose handleAppClick globally for boot system
window.handleAppClick = handleAppClick;

/**
 * Sets up the contact form functionality
 * @param {HTMLElement} winElem - The window element containing the contact form
 */
function setupContactForm(winElem) {
    const form = winElem.querySelector('.transmission-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const submitBtn = form.querySelector('.transmit-btn');
            const originalText = submitBtn.innerHTML;
            
            // Show transmission in progress
            submitBtn.innerHTML = '<span>📡 Transmitting...</span>';
            submitBtn.disabled = true;
            
            // Simulate transmission delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success message
            submitBtn.innerHTML = '<span>✅ Message Transmitted!</span>';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                form.reset();
                
                // Show success notification
                const statusDiv = winElem.querySelector('.transmission-status .status-indicator');
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div class="signal-icon" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; animation: pulse 2s infinite;"></div>
                        <span>Message delivered successfully</span>
                    `;
                    
                    setTimeout(() => {
                        statusDiv.innerHTML = `
                            <div class="signal-icon" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; animation: pulse 2s infinite;"></div>
                            <span>Secure channel established</span>
                        `;
                    }, 3000);
                }
            }, 1500);
        });
    }
}

/**
 * Handles global click events.
 * @param {Event} e - The click event.
 */
function handleGlobalClick(e) {
    // Reserved for future global click handling
}

/**
 * Handles global keyboard events for shortcuts and navigation.
 * @param {Event} e - The keydown event.
 */
function handleGlobalKeydown(e) {
    // Reserved for future global keyboard shortcuts
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize core systems
        bootSystem = BootSystem.getInstance();
        
        // Ensure window manager is properly initialized
        if (windowManager) {
            windowManager.setupEventListeners();
        }
        
        // Initialize UI after DOM is ready
        initializeUI();
        
        // Refresh desktop icon handlers after initialization
        refreshDesktopIconHandlers();
        
        // Fallback: If boot system doesn't start within 3 seconds, force it
        setTimeout(() => {
            if (!document.body.classList.contains('boot-active')) {
                console.warn('neuOS: Boot system may be stuck, forcing login screen...');
                if (window.bootSystemInstance) {
                    window.bootSystemInstance.showLoginScreen();
                } else {
                    // Emergency fallback
                    document.getElementById('bootSequence').style.display = 'none';
                    document.getElementById('loginScreen').style.display = 'flex';
                }
            }
        }, 3000);

        // Additional fallback: Ensure desktop becomes visible after login
        setTimeout(() => {
            const desktop = document.getElementById('desktop');
            if (desktop && !document.body.classList.contains('boot-active') && !document.body.classList.contains('login-active')) {
                console.log('neuOS: Ensuring desktop is visible...');
                desktop.style.opacity = '1';
                desktop.style.visibility = 'visible';
            }
        }, 5000);
        

        
        // Initialize starfield background globally
        new window.StarfieldBackground();
        
        // Set up global event listeners with null checks

        // Event delegation for desktop icons
        const desktopIcons = document.getElementById('desktop-icons');
        if (desktopIcons) {
            desktopIcons.addEventListener('click', (e) => {
                const desktopIcon = e.target.closest('.desktop-icon');
                if (desktopIcon) {
                    const appId = desktopIcon.dataset.app;
                    if (appId) {
                        handleAppClick(appId);
                    }
                }
            });
        }

        // Global event listeners
        document.addEventListener('click', handleGlobalClick);
        document.addEventListener('keydown', handleGlobalKeydown);
        
        // Add window resize listener for responsive desktop icons
        window.addEventListener('resize', debounce(() => {
            const desktopIcons = document.getElementById('desktop-icons');
            if (desktopIcons) {
                // Force a reflow to update the grid layout
                desktopIcons.style.display = 'none';
                desktopIcons.offsetHeight; // Force reflow
                desktopIcons.style.display = 'grid';
                
                        // Responsive desktop icons updated
            }
        }, 150));

        // Add neuOS glass widget after login
        function addNeuOSWidget() {
            if (document.getElementById('neuosWidget')) return; // Prevent duplicates
            
            const widget = document.createElement('div');
            widget.id = 'neuosWidget';
            widget.className = 'neuos-widget glass-interactive';
            widget.setAttribute('tabindex', '0');
            widget.setAttribute('role', 'button');
            widget.setAttribute('aria-label', 'neuOS desktop widget - click to interact');
            widget.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; width: 100%;">
                    <span class="neuos-glass-title" style="font-size: 1.8rem; margin: 0; text-align: center;">neuOS</span>
                </div>
            `;
            
            // Add to body
            document.body.appendChild(widget);
            
            // Let the DraggableSystem handle the dragging
            // The widget will be automatically picked up by the draggable system
        }

        // Show widget only after login completion
        const loginObserver = new MutationObserver(() => {
            const loginScreen = document.getElementById('loginScreen');
            if (loginScreen && loginScreen.style.display === 'none' && !document.getElementById('neuosWidget')) {
                // Ensure desktop is visible
                const desktop = document.getElementById('desktop');
                if (desktop) {
                    desktop.style.opacity = '1';
                    desktop.style.visibility = 'visible';
                    console.log('neuOS: Desktop made visible via login observer');
                }
                
                addNeuOSWidget();
                // Refresh desktop icon handlers after login
                refreshDesktopIconHandlers();
                // Refresh draggable system to ensure all widgets are draggable
                if (window.draggableSystem) {
                    window.draggableSystem.refresh();
                    // Specifically refresh neuOS widget to ensure it's draggable
                    setTimeout(() => {
                        window.draggableSystem.refreshNeuOSWidget();
                    }, 100);
                }
                // Also refresh glass effects for the new widget
                if (window.glassMorphismSystem) {
                    window.glassMorphismSystem.enhanceAllGlassElements();
                }
                loginObserver.disconnect();
            }
        });
        loginObserver.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['style'] });
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #181f2a; color: #eaf1fb; font-family: 'Segoe UI', sans-serif; text-align: center; padding: 20px;">
                <div>
                    <h1 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ neuOS initialization error</h1>
                    <p style="margin-bottom: 15px;">the operating system failed to start properly.</p>
                    <p style="font-size: 0.9em; opacity: 0.8;">please refresh the page or check the browser console for more details.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                        restart system
                    </button>
                </div>
            </div>
        `;
    }
}); 