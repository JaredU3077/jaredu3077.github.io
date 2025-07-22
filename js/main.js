// [neuOS]
/**
 * @file Main entry point for the application. Initializes all modules and handles global events.
 * @author jared u.
 */

import { Terminal } from './apps/terminal/terminal.js';
import { WindowManager } from './core/window.js';
import { HelpManager } from './utils/help.js';
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

// Create namespace for globals to avoid direct window pollution
window.neuOS = window.neuOS || {};

// --- MODULE INITIALIZATION ---
/** @type {WindowManager} */
let windowManager = null;
/** @type {HelpManager} */
let helpManager = null;


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
    window.neuOS.windowManager = windowManager;
} catch (error) {
    console.error('neuOS: Failed to initialize WindowManager:', error);
}

try {
    helpManager = new HelpManager();
} catch (error) {
    console.error('neuOS: Failed to initialize HelpManager:', error);
}



try {
    glassMorphismSystem = new GlassMorphismSystem();
    window.neuOS.glassMorphismSystem = glassMorphismSystem;
} catch (error) {
    console.error('neuOS: Failed to initialize GlassMorphismSystem:', error);
}

try {
    glassEffects = new GlassEffects();
    window.neuOS.glassEffects = glassEffects;
} catch (error) {
    console.error('neuOS: Failed to initialize GlassEffects:', error);
}

try {
    draggableSystem = new DraggableSystem();
    window.neuOS.draggableSystem = draggableSystem;
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
// (Reserved for future global event handling expansions)

// --- APPLICATION LAUNCHER ---

/**
 * Displays a temporary error notification to the user.
 * @param {string} title - The error title.
 * @param {string} message - The error message.
 * @param {string} [details] - Optional additional details.
 */
function showErrorNotification(title, message, details = '') {
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
        <h3>⚠️ ${title}</h3>
        <p>${message}</p>
        ${details ? `<p style="font-size: 0.9em; opacity: 0.8;">${details}</p>` : ''}
    `;
    document.body.appendChild(errorMessage);
    setTimeout(() => errorMessage.remove(), 5000);
}

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

        for (const windowConfig of app.windows) {
            // If window already open, focus it and do not re-initialize
            let winElem = document.getElementById(windowConfig.id);
            if (winElem) {
                // Check if window is minimized and restore it
                const windowObj = windowManager.windows.get(windowConfig.id);
                if (windowObj && windowObj.isMinimized) {
                    windowManager.restoreWindow(windowObj);
                }
                windowManager.focusWindow(windowObj);
                continue;
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
                        window.neuOS.terminalInstance = terminal;
                        break;
                    default:
                        console.warn(`neuOS: No specific initialization for app: ${appId}`);
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
        }
    } catch (error) {
        console.error('neuOS: Application launch error:', error);
        showErrorNotification('Application Error', `Failed to launch application: ${appId}`, error.message);
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
                desktop.style.opacity = '1';
                desktop.style.visibility = 'visible';
            }
        }, 5000);
        

        
        // Initialize starfield background globally
        new window.StarfieldBackground();
        
        // Ensure draggable system is properly initialized for boot and login
        if (window.neuOS && window.neuOS.draggableSystem) {
            setTimeout(() => {
                window.neuOS.draggableSystem.refreshBootAndLogin();
            }, 200);
        }
        
        // GitHub Pages specific optimizations
        if (window.location.hostname.includes('github.io')) {
            // Disable heavy features on GitHub Pages to improve performance
            if (window.particleSystemInstance) {
                window.particleSystemInstance.maxParticles = 50; // Reduce particle count
            }
        }
        
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

        // Add audio controls after login
        function addAudioControls() {
            if (document.getElementById('audioControls')) return; // Prevent duplicates
            
            const audioControls = document.createElement('div');
            audioControls.id = 'audioControls';
            audioControls.className = 'audio-controls';
            audioControls.innerHTML = `
                <div class="audio-orb-container">
                    <!-- Volume slider ring -->
                    <svg class="volume-slider" viewBox="0 0 120 120" width="120" height="120">
                        <defs>
                            <!-- Volume progress gradient -->
                            <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:1" />
                                <stop offset="50%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                                <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:1" />
                            </linearGradient>
                            <!-- Indicator gradient -->
                            <radialGradient id="indicatorGradient" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" style="stop-color:var(--color-text-primary);stop-opacity:1" />
                                <stop offset="70%" style="stop-color:var(--primary-color);stop-opacity:1" />
                                <stop offset="100%" style="stop-color:var(--primary-color);stop-opacity:0.8" />
                            </radialGradient>
                            <!-- Smoke/cloud filter -->
                            <filter id="smokeFilter">
                                <feGaussianBlur stdDeviation="3" result="blur"/>
                                <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 0.3 0" result="smoke"/>
                                <feMerge>
                                    <feMergeNode in="blur"/>
                                    <feMergeNode in="smoke"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <!-- Background track -->
                        <circle class="volume-track" cx="60" cy="60" r="50" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="6"/>
                        <!-- Volume progress -->
                        <circle class="volume-progress" cx="60" cy="60" r="50" fill="none" stroke="url(#volumeGradient)" stroke-width="6" 
                                stroke-dasharray="0 314" stroke-linecap="round" transform="rotate(-90 60 60)"/>
                        <!-- Volume indicator -->
                        <circle class="volume-indicator" cx="60" cy="10" r="6" fill="url(#indicatorGradient)" opacity="0.9"/>
                        <!-- Smoke/cloud effect -->
                        <circle class="smoke-effect" cx="60" cy="60" r="55" fill="none" stroke="var(--primary-color)" stroke-width="2" opacity="0" filter="url(#smokeFilter)"/>
                    </svg>
                    
                    <!-- Central audio button orb -->
                    <button id="audioToggle" class="audio-orb-button" title="Toggle Background Music">
                        <div class="audio-orb-inner">
                            <svg class="audio-on" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08"/>
                            </svg>
                            <svg class="audio-off" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                                <line x1="23" y1="9" x2="17" y2="15"/>
                                <line x1="17" y1="9" x2="23" y2="15"/>
                            </svg>
                        </div>
                    </button>
                </div>
            `;
            
            // Add to body
            document.body.appendChild(audioControls);
            
            // Show the audio controls with a fade-in effect
            setTimeout(() => {
                audioControls.classList.add('show');
            }, 100);
            
            // Try to setup volume slider immediately after DOM insertion
            if (window.backgroundMusicInstance) {
                window.backgroundMusicInstance.setupVolumeSlider();
            }
            
            // Initialize audio controls after they're added to DOM
            setTimeout(() => {
                if (window.backgroundMusicInstance) {
                    window.backgroundMusicInstance.setupVolumeSliderAfterLogin();
                } else {
                    console.error('Background music instance not found');
                }
            }, 200);
            
            // Additional retry mechanism to ensure volume slider is set up
            const setupVolumeSliderWithRetry = () => {
                if (window.backgroundMusicInstance) {
                    window.backgroundMusicInstance.setupVolumeSlider();
                    if (!window.backgroundMusicInstance.volumeSlider) {
                        // If still not found, retry after a longer delay
                        setTimeout(() => {
                            if (window.backgroundMusicInstance) {
                                window.backgroundMusicInstance.setupVolumeSlider();
                            }
                        }, 500);
                    }
                }
            };
            
            // Try multiple times to ensure setup
            setTimeout(setupVolumeSliderWithRetry, 300);
            setTimeout(setupVolumeSliderWithRetry, 600);
        }

        // Show widget only after login completion
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            const loginObserver = new MutationObserver(() => {
                if (loginScreen.style.display === 'none' && !document.getElementById('neuosWidget')) {
                    // Ensure desktop is visible
                    const desktop = document.getElementById('desktop');
                    if (desktop) {
                        desktop.style.opacity = '1';
                        desktop.style.visibility = 'visible';
                    }
                    
                    addNeuOSWidget();
                    addAudioControls(); // Add audio controls after login
                    // Refresh desktop icon handlers after login
                    refreshDesktopIconHandlers();
                    // Refresh draggable system to ensure all widgets are draggable
                    if (window.neuOS.draggableSystem) {
                        window.neuOS.draggableSystem.refresh();
                        // Specifically refresh neuOS widget to ensure it's draggable
                        setTimeout(() => {
                            window.neuOS.draggableSystem.refreshNeuOSWidget();
                        }, 100);
                    }
                    // Also refresh glass effects for the new widget
                    if (window.neuOS.glassMorphismSystem) {
                        window.neuOS.glassMorphismSystem.enhanceAllGlassElements();
                    }
                    loginObserver.disconnect();
                }
            });
            loginObserver.observe(loginScreen, { attributes: true, attributeFilter: ['style'] });
        }
        
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