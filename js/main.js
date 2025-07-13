// [neuOS]
/**
 * @file Main entry point for the application. Initializes all modules and handles global events.
 * @author jared u.
 */

console.log('neuOS: Starting module imports...');

import { Terminal } from './apps/terminal.js';
import { WindowManager } from './core/window.js';
import { HelpManager } from './utils/help.js';
import { SearchManager } from './utils/search.js';
import { BootSystem } from './core/boot.js';
import { CONFIG, createAppButton } from './config.js';
import { debounce } from './utils/utils.js';

// Import screensaver
import './core/screensaver.js';

// Import glass effect system
import './core/glassEffect.js';
import { GlassMorphismSystem } from './core/glassEffect.js';
import GlassEffects from './utils/glassEffects.js';
import DraggableSystem from './utils/draggable.js';

console.log('neuOS: All modules imported successfully');

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
    console.log('neuOS: WindowManager initialized successfully');
} catch (error) {
    console.error('neuOS: Failed to initialize WindowManager:', error);
}

try {
    helpManager = new HelpManager();
    console.log('neuOS: HelpManager initialized successfully');
} catch (error) {
    console.error('neuOS: Failed to initialize HelpManager:', error);
}

try {
    searchManager = new SearchManager();
    console.log('neuOS: SearchManager initialized successfully');
} catch (error) {
    console.error('neuOS: Failed to initialize SearchManager:', error);
}

try {
    glassMorphismSystem = new GlassMorphismSystem();
    window.glassMorphismSystem = glassMorphismSystem;
    console.log('neuOS: GlassMorphismSystem initialized successfully');
} catch (error) {
    console.error('neuOS: Failed to initialize GlassMorphismSystem:', error);
}

try {
    glassEffects = new GlassEffects();
    window.glassEffects = glassEffects;
    console.log('neuOS: GlassEffects initialized successfully');
} catch (error) {
    console.error('neuOS: Failed to initialize GlassEffects:', error);
}

try {
    draggableSystem = new DraggableSystem();
    window.draggableSystem = draggableSystem;
    console.log('neuOS: DraggableSystem initialized successfully');
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
    console.log('neuOS: Desktop UI initialized (hidden until boot complete)');
    console.log('neuOS: Created desktop icons for:', Object.keys(CONFIG.applications));
    console.log('neuOS: Desktop icons count:', desktopIcons.children.length);
    console.log('neuOS: Desktop icons HTML:', desktopIcons.innerHTML.substring(0, 200) + '...');
}

// --- EVENT LISTENERS ---



// --- APPLICATION LAUNCHER ---

/**
 * Handles the click event for an application icon or menu item.
 * @param {string} appId - The ID of the application to launch.
 */
async function handleAppClick(appId) {
    try {
        console.log(`handleAppClick called for appId: ${appId}`);
        
        // Play UI sound effect
        if (window.bootSystemInstance) {
            window.bootSystemInstance.playUIClickSound();
        }
        
        const app = CONFIG.applications[appId];
        if (!app) {
            console.error(`No application config found for appId: ${appId}`);
            return;
        }
        console.log(`App config found:`, app);

    app.windows.forEach(async windowConfig => {
        console.log(`Processing window config:`, windowConfig);
        // If window already open, focus it and do not re-initialize
        let winElem = document.getElementById(windowConfig.id);
        if (winElem) {
            console.log(`Window already open, focusing: ${windowConfig.id}`);
            windowManager.focusWindow(windowManager.windows.get(windowConfig.id));
            return;
        }
        
        // Play window opening sound
        if (window.bootSystemInstance) {
            window.bootSystemInstance.playWindowOpenSound();
        }
        
        // Create window and initialize app logic
        console.log(`Creating new window for: ${windowConfig.id}`);
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
        console.log('Window element created:', winElem);
        console.log('📱 Window created with default size:', {
            appId,
            windowId: windowConfig.id,
            width: windowConfig.width,
            height: windowConfig.height,
            defaultSize: app.defaultSize
        });
        

        openWindows[windowConfig.id] = winElem;
        try {
            switch (appId) {
                case 'terminal':
                    console.log('Initializing terminal...');
                    terminal = new Terminal(
                        winElem.querySelector('#terminalInput input'),
                        winElem.querySelector('#terminalOutput')
                    );
                    console.log('Terminal initialized:', terminal);
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
            console.log('neuOS: Starting system initialization...');
    try {
        // Initialize core systems
        bootSystem = BootSystem.getInstance();
        
        // Initialize UI after DOM is ready
        initializeUI();
        
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
                
                // Log the current responsive state for debugging
                const computedStyle = getComputedStyle(desktopIcons);
                console.log('🖥️ Desktop icons responsive update:', {
                    width: window.innerWidth,
                    columns: computedStyle.gridTemplateColumns,
                    gap: computedStyle.gap,
                    iconMinWidth: computedStyle.getPropertyValue('--icon-min-width')
                });
            }
        }, 150));
        
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