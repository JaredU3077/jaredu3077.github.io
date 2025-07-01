/**
 * @file Main entry point for the application. Initializes all modules and handles global events.
 * @author Jared U.
 */

import { ContentParser } from './utils/parser.js';
import { Terminal } from './apps/terminal.js';
import { WindowManager } from './core/window.js';
import { NetworkVisualization } from './apps/network.js';
import { KeyboardManager } from './core/keyboard.js';
import { HelpManager } from './utils/help.js';
import { SearchManager } from './utils/search.js';
import { BootSystem } from './core/boot.js';
import { SkillsApp } from './apps/skills.js';
import { ProjectsApp } from './apps/projects.js';
import { SystemStatus } from './apps/system-status.js';
import { CONFIG, createAppButton } from './config.js';

// --- MODULE INITIALIZATION ---
/** @type {WindowManager} */
const windowManager = new WindowManager();
// Expose windowManager globally for other modules to use
window.windowManager = windowManager;
/** @type {HelpManager} */
const helpManager = new HelpManager();
/** @type {SearchManager} */
const searchManager = new SearchManager();
/** @type {?NetworkVisualization} */
let network = null;
/** @type {?Terminal} */
let terminal = null;
/** @type {BootSystem} */
let bootSystem = null;
/** @type {Object<string, HTMLElement>} */
let openWindows = {};

// --- UI INITIALIZATION ---

/**
 * Initializes the user interface, creating desktop icons and start menu items.
 */
function initializeUI() {
    const startMenu = document.getElementById('startMenu');
    const desktopIcons = document.getElementById('desktop-icons');
    
    // Add null checks to prevent errors
    if (!startMenu) {
        console.error('Start menu element not found');
        return;
    }
    
    if (!desktopIcons) {
        console.error('Desktop icons container not found');
        return;
    }
    
    startMenu.innerHTML = '';
    desktopIcons.innerHTML = '';

    // Create start menu items and desktop icons for all apps
    Object.values(CONFIG.applications).forEach(app => {
        // Create Start Menu buttons
        startMenu.insertAdjacentHTML('beforeend', createAppButton(app, 'start-menu'));
        
        // Create Desktop Icons
        desktopIcons.insertAdjacentHTML('beforeend', createAppButton(app, 'desktop'));
    });

    // Add help button to start menu
    startMenu.insertAdjacentHTML('beforeend', `
        <button class="start-menu-item" title="Help" aria-label="Help" tabindex="0" id="helpBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
            </svg>
            <span class="label">Help</span>
        </button>
    `);
}

// --- EVENT LISTENERS ---

/**
 * Toggles the visibility of the start menu.
 * @param {Event} e - The click or keydown event.
 */
function toggleStartMenu(e) {
    if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            startMenu.classList.toggle('show');
        } else {
            console.error('Start menu element not found');
        }
    }
}

// --- APPLICATION LAUNCHER ---

/**
 * Handles the click event for an application icon or menu item.
 * @param {string} appId - The ID of the application to launch.
 */
function handleAppClick(appId) {
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

    app.windows.forEach(windowConfig => {
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
            autoScroll: ['terminal', 'codex', 'device-manager'].includes(appId) // Enable auto-scroll for apps that benefit from it
        });
        console.log('Window element created:', winElem);
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
                    break;
                case 'network-monitor':
                    if (windowConfig.id === 'topologyWindow') {
                        network = new NetworkVisualization('networkTopology');
                    }
                    break;
                case 'skills':
                    if (windowConfig.id === 'skillsWindow') {
                        new SkillsApp(winElem.querySelector('#skillsContainer'));
                    }
                    break;
                case 'projects':
                    if (windowConfig.id === 'projectsWindow') {
                        new ProjectsApp(winElem.querySelector('#projectsContainer'));
                    }
                    break;
                case 'system-status':
                    if (windowConfig.id === 'statusWindow') {
                        new SystemStatus(winElem.querySelector('#systemStatus'));
                    }
                    break;
                case 'contact':
                    // Contact form needs form handling
                    if (windowConfig.id === 'contactWindow') {
                        setupContactForm(winElem);
                    }
                    break;
                case 'codex':
                    if (windowConfig.id === 'codexWindow') {
                        searchManager.initializeSearch();
                    }
                    break;
                case 'device-manager':
                    // Device manager already has static content
                    break;
                case 'welcome':
                    // Welcome window needs no special initialization
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
 * Handles global click events, particularly for closing the start menu.
 * @param {Event} e - The click event.
 */
function handleGlobalClick(e) {
    const startMenu = document.getElementById('startMenu');
    if (!startMenu) return;
    
    // Close start menu if clicked outside
    if (!e.target.closest('.start-btn') && !e.target.closest('.start-menu')) {
        startMenu.classList.remove('show');
    }
}

/**
 * Handles global keyboard events for shortcuts and navigation.
 * @param {Event} e - The keydown event.
 */
function handleGlobalKeydown(e) {
    const startMenu = document.getElementById('startMenu');
    
    // Close start menu on Escape
    if (e.key === 'Escape' && startMenu && startMenu.classList.contains('show')) {
        startMenu.classList.remove('show');
    }
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize core systems
        const keyboardManager = new KeyboardManager();
        bootSystem = new BootSystem();
        
        // Initialize UI after DOM is ready
        initializeUI();
        
        // Set up global event listeners with null checks
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', toggleStartMenu);
            startBtn.addEventListener('keydown', toggleStartMenu);
        } else {
            console.error('Start button not found');
        }

        const startMenu = document.getElementById('startMenu');
        if (startMenu) {
            // Event delegation for start menu items
            startMenu.addEventListener('click', (e) => {
                const menuItem = e.target.closest('.start-menu-item');
                if (menuItem) {
                    const appId = menuItem.dataset.app;
                    if (appId) {
                        handleAppClick(appId);
                        startMenu.classList.remove('show');
                    } else if (menuItem.id === 'helpBtn') {
                        helpManager.show();
                        startMenu.classList.remove('show');
                    }
                }
            });
        }

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
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        // Show fallback error message
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #181f2a; color: #eaf1fb; font-family: 'Segoe UI', sans-serif; text-align: center; padding: 20px;">
                <div>
                    <h1 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ Neu-OS Initialization Error</h1>
                    <p style="margin-bottom: 15px;">The operating system failed to start properly.</p>
                    <p style="font-size: 0.9em; opacity: 0.8;">Please refresh the page or check the browser console for more details.</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #4a90e2; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                        Restart System
                    </button>
                </div>
            </div>
        `;
    }
}); 