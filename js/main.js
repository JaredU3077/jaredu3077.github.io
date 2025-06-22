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
import { CONFIG as UI_CONFIG, createAppButton } from './config.js';

// --- MODULE INITIALIZATION ---
/** @type {WindowManager} */
const windowManager = new WindowManager();
/** @type {HelpManager} */
const helpManager = new HelpManager();
/** @type {SearchManager} */
const searchManager = new SearchManager();
/** @type {?NetworkVisualization} */
let network = null;
/** @type {?Terminal} */
let terminal = null;

// --- UI INITIALIZATION ---

/**
 * Initializes the user interface, creating desktop icons and start menu items.
 */
function initializeUI() {
    const startMenu = document.getElementById('startMenu');
    const desktopIcons = document.getElementById('desktop-icons');
    startMenu.innerHTML = '';
    desktopIcons.innerHTML = '';

    // Create start menu items and desktop icons for all apps
    Object.values(UI_CONFIG.applications).forEach(app => {
        // Create Start Menu buttons
        startMenu.insertAdjacentHTML('beforeend', createAppButton(app, 'start-menu'));
        
        // Create Desktop Icons
        desktopIcons.insertAdjacentHTML('beforeend', createAppButton(app, 'desktop'));
    });

    // Add help button to start menu
    startMenu.insertAdjacentHTML('beforeend', `
        <button class="start-menu-item" title="Help" aria-label="Help" tabindex="0" id="helpBtn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
        startMenu.classList.toggle('show');
    }
}

document.getElementById('startBtn').addEventListener('click', toggleStartMenu);
document.getElementById('startBtn').addEventListener('keydown', toggleStartMenu);

document.addEventListener('click', (e) => {
    const startMenu = document.getElementById('startMenu');
    if (!e.target.closest('.start-btn') && !e.target.closest('.start-menu')) {
        startMenu.classList.remove('show');
    }
});

// --- APPLICATION LAUNCHER ---

/**
 * Handles the click event for an application icon or menu item.
 * @param {string} appId - The ID of the application to launch.
 */
function handleAppClick(appId) {
    console.log(`handleAppClick called for appId: ${appId}`);
    const app = UI_CONFIG.applications[appId];
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
        // Create window and initialize app logic
        console.log(`Creating new window for: ${windowConfig.id}`);
        winElem = windowManager.createWindow({
            id: windowConfig.id,
            title: windowConfig.title,
            content: windowConfig.content,
            width: windowConfig.width,
            height: windowConfig.height,
            icon: app.icon
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
                case 'codex':
                    if (windowConfig.id === 'codexWindow') {
                        searchManager.initializeSearch();
                    }
                    break;
                case 'device-manager':
                    // Future: initialize device manager logic here
                    break;
            }
        } catch (error) {
            alert(`Error initializing application ${appId}: ${error.message}`);
            console.error(`Error initializing application ${appId}:`, error);
            winElem.remove();
        }
    });
}

/**
 * Handles global click events to launch applications or the help menu.
 * @param {MouseEvent} e - The click event.
 */
function handleGlobalClick(e) {
    const button = e.target.closest('[data-tool]');
    if (button) {
        handleAppClick(button.dataset.tool);
        if (button.classList.contains('start-menu-item')) {
            document.getElementById('startMenu').classList.remove('show');
        }
    }

    if (e.target.closest('#helpBtn')) {
        helpManager.showHelp();
        document.getElementById('startMenu').classList.remove('show');
    }
}

/**
 * Handles global keydown events for accessibility.
 * @param {KeyboardEvent} e - The keydown event.
 */
function handleGlobalKeydown(e) {
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.hasAttribute('data-tool')) {
        handleAppClick(document.activeElement.dataset.tool);
        if (document.activeElement.classList.contains('start-menu-item')) {
            document.getElementById('startMenu').classList.remove('show');
        }
    }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.id === 'helpBtn') {
        helpManager.showHelp();
        document.getElementById('startMenu').classList.remove('show');
    }
}

document.addEventListener('click', handleGlobalClick);
document.addEventListener('keydown', handleGlobalKeydown);

// --- INITIALIZATION ---

// Initialize UI on load
initializeUI(); 