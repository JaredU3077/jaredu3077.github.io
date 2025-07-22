# main.js - JavaScript Entry Point Documentation

## File Overview

**Purpose**: Primary JavaScript entry point that initializes all core systems and manages the application lifecycle.

**Type**: ES6 module with comprehensive error handling and fallback mechanisms.

**Role**: Orchestrates the entire application startup sequence, manages global state, and coordinates all subsystems.

## Dependencies and Imports

### Core Module Imports

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| `./apps/terminal.js` | Terminal application | `./config.js`, `./utils/utils.js` |
| `./core/window.js` | Window management system | `./config.js`, `./utils/utils.js` |
| `./utils/help.js` | Help system | `./utils/utils.js` |
| `./core/boot.js` | Boot sequence management | `./core/audioSystem.js`, `./core/particleSystem.js` |
| `./config.js` | Configuration management | None |
| `./utils/utils.js` | Utility functions | None |

### Utility Imports

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| `./utils/mobile.js` | Mobile-specific utilities | `./utils/utils.js` |
| `./core/screensaver.js` | Screensaver functionality | `./core/particleSystem.js` |
| `./core/glassEffect.js` | Glassmorphic effects | `./utils/glassEffects.js` |
| `./utils/glassEffects.js` | Glass effect utilities | `./utils/utils.js` |
| `./utils/draggable.js` | Drag and drop system | `./utils/utils.js` |

## Internal Structure

### Global Namespace

```javascript
// Create namespace for globals to avoid direct window pollution
window.neuOS = window.neuOS || {};
```

### Module Initialization

```javascript
// Core system instances
let windowManager = null;
let helpManager = null;
let terminal = null;
let bootSystem = null;
let glassMorphismSystem = null;
let glassEffects = null;
let draggableSystem = null;
let openWindows = {};
```

### Error Boundary Pattern

```javascript
// Initialize modules with error boundaries
try {
    windowManager = new WindowManager();
    window.neuOS.windowManager = windowManager;
} catch (error) {
    console.error('neuOS: Failed to initialize WindowManager:', error);
}
```

## Core Functions

### UI Initialization

```javascript
/**
 * Initializes the user interface, creating desktop icons.
 */
function initializeUI() {
    const desktopIcons = document.getElementById('desktop-icons');
    
    if (!desktopIcons) {
        console.error('Desktop icons container not found');
        return;
    }
    
    desktopIcons.innerHTML = '';
    
    // Create desktop icons for all apps
    Object.values(CONFIG.applications).forEach(app => {
        desktopIcons.insertAdjacentHTML('beforeend', createAppButton(app, 'desktop'));
    });
}
```

### Desktop Icon State Management

```javascript
/**
 * Resets desktop icon state to default appearance.
 * @param {HTMLElement} icon - The desktop icon element
 */
function resetDesktopIconState(icon) {
    // Remove any inline styles that might interfere with CSS
    icon.style.removeProperty('border-color');
    icon.style.removeProperty('box-shadow');
    icon.style.removeProperty('background');
    icon.style.removeProperty('transform');
    
    // Reset glass reflection and label styles
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
}
```

### Application Launcher

```javascript
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
            // Check if window already open
            let winElem = document.getElementById(windowConfig.id);
            if (winElem) {
                const windowObj = windowManager.windows.get(windowConfig.id);
                if (windowObj && windowObj.isMinimized) {
                    windowManager.restoreWindow(windowObj);
                }
                windowManager.focusWindow(windowObj);
                continue;
            }
            
            // Create new window
            winElem = windowManager.createWindow({
                id: windowConfig.id,
                title: windowConfig.title,
                content: windowConfig.content,
                width: windowConfig.width,
                height: windowConfig.height,
                icon: app.icon,
                autoScroll: ['terminal'].includes(appId),
                type: app.type || 'app',
                defaultSize: app.defaultSize
            });

            openWindows[windowConfig.id] = winElem;
            
            // Initialize application-specific logic
            try {
                switch (appId) {
                    case 'terminal':
                        terminal = new Terminal(
                            winElem.querySelector('#terminalInput input'),
                            winElem.querySelector('#terminalOutput')
                        );
                        window.neuOS.terminalInstance = terminal;
                        break;
                    default:
                        console.warn(`neuOS: No specific initialization for app: ${appId}`);
                        break;
                }
            } catch (error) {
                console.error(`Error initializing application ${appId}:`, error);
                // Show user-friendly error
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
```

### Error Handling

```javascript
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
```

## Connections and References

### Incoming Connections

| Referencing File | Description | Connection Type |
|------------------|-------------|-----------------|
| `index.html` | Loads main.js as ES6 module | Script import |
| `sw.js` | Service worker caches main.js | Caching |
| `js/core/*.js` | Core systems imported by main.js | Module import |
| `js/apps/*.js` | Application modules imported by main.js | Module import |
| `js/utils/*.js` | Utility modules imported by main.js | Module import |

### Outgoing Connections

| Referenced File | Description | Connection Type |
|-----------------|-------------|-----------------|
| `js/apps/terminal.js` | Terminal application | Module import |
| `js/core/window.js` | Window management | Module import |
| `js/utils/help.js` | Help system | Module import |
| `js/core/boot.js` | Boot sequence | Module import |
| `js/config.js` | Configuration | Module import |
| `js/utils/utils.js` | Utility functions | Module import |
| `js/utils/mobile.js` | Mobile utilities | Module import |
| `js/core/screensaver.js` | Screensaver | Module import |
| `js/core/glassEffect.js` | Glass effects | Module import |
| `js/utils/glassEffects.js` | Glass utilities | Module import |
| `js/utils/draggable.js` | Drag and drop | Module import |

### Bidirectional Connections

| Element | CSS Class | JavaScript Handler | Description |
|---------|-----------|-------------------|-------------|
| `#desktop-icons` | Icon styles | `handleAppClick()` | Desktop icon management |
| `#desktop` | Desktop styles | Window manager | Desktop interface |
| `#neuosWidget` | Widget styles | Draggable system | Desktop widget |
| `#audioControls` | Audio styles | Audio system | Audio controls |

## Data Flow and Architecture

### Initialization Flow

```javascript
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Initialize core systems
        bootSystem = BootSystem.getInstance();
        
        // 2. Setup window manager
        if (windowManager) {
            windowManager.setupEventListeners();
        }
        
        // 3. Initialize UI
        initializeUI();
        
        // 4. Refresh handlers
        refreshDesktopIconHandlers();
        
        // 5. Setup fallbacks
        setTimeout(() => {
            if (!document.body.classList.contains('boot-active')) {
                console.warn('neuOS: Boot system may be stuck, forcing login screen...');
                if (window.bootSystemInstance) {
                    window.bootSystemInstance.showLoginScreen();
                }
            }
        }, 3000);
        
        // 6. Initialize background systems
        new window.StarfieldBackground();
        
        // 7. Setup global event listeners
        setupGlobalEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showFallbackError();
    }
});
```

### Event Handling Architecture

```javascript
// Global event listeners
document.addEventListener('click', handleGlobalClick);
document.addEventListener('keydown', handleGlobalKeydown);

// Desktop icon event delegation
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

// Window resize handling
window.addEventListener('resize', debounce(() => {
    const desktopIcons = document.getElementById('desktop-icons');
    if (desktopIcons) {
        // Force reflow to update grid layout
        desktopIcons.style.display = 'none';
        desktopIcons.offsetHeight; // Force reflow
        desktopIcons.style.display = 'grid';
    }
}, 150));
```

### State Management

- **Application State**: Tracks open windows and active applications
- **UI State**: Manages desktop icons and widget visibility
- **Audio State**: Controls background music and sound effects
- **Theme State**: Manages current theme and visual effects

## Potential Issues and Recommendations

### Standards Compliance Issues

1. **Error Handling**: Comprehensive error boundaries implemented
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add more specific error types

2. **Module Loading**: ES6 modules with fallback
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Consider bundling for production

3. **Event Delegation**: Efficient event handling
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add more keyboard shortcuts

### Performance Issues

1. **Large File Size**: 625 lines in single file
   - **Issue**: Violates single responsibility principle
   - **Fix**: Split into smaller, focused modules

2. **Module Dependencies**: Complex dependency graph
   - **Issue**: Tight coupling between modules
   - **Fix**: Implement dependency injection pattern

3. **Event Listeners**: Multiple global listeners
   - **Issue**: Potential memory leaks
   - **Fix**: Implement proper cleanup on unmount

### Architecture Issues

1. **Global State**: Direct window object pollution
   - **Issue**: `window.neuOS` namespace usage
   - **Fix**: Implement proper state management

2. **Error Boundaries**: Basic error handling
   - **Issue**: Generic error messages
   - **Fix**: Add specific error types and recovery

3. **Module Initialization**: Synchronous initialization
   - **Issue**: Blocking main thread
   - **Fix**: Implement async initialization

## Related Documentation

- See [index.md](index.md) for HTML entry point details
- See [architecture.md](architecture.md) for overall system architecture
- See [config.md](config.md) for configuration management
- See [js/core/](js/core/) for core system documentation
- See [js/apps/](js/apps/) for application documentation 