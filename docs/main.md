# JavaScript Entry Point Documentation

## Overview

The main.js file serves as the primary entry point for the neuOS application, orchestrating the initialization of all core systems, applications, and utilities. It implements a modular architecture with comprehensive error handling and performance optimization.

## File Structure

```
js/
├── main.js                # Application entry point (main file)
├── config.js              # Configuration management
├── howler.min.js          # Audio library
├── core/                  # Core system modules (20 files)
├── apps/                  # Application modules
│   └── terminal/          # Terminal application (11 files)
└── utils/                 # Utility modules (6 files)
```

## Main Entry Point

### main.js
**Purpose**: Application initialization and coordination
**Dependencies**: All core modules, applications, and utilities

**Key Features**:
- Module initialization and coordination
- Error boundary implementation
- Global event handling
- Performance monitoring
- Application lifecycle management

## Initialization Process

### 1. Module Import and Setup
```javascript
// Core system imports
import { Terminal } from './apps/terminal/terminal.js';
import { WindowManager } from './core/window.js';
import { HelpManager } from './utils/help.js';
import { BootSystem } from './core/boot.js';
import { CONFIG, createAppButton } from './config.js';
import { debounce } from './utils/utils.js';

// Additional imports
import './utils/mobile.js';
import './core/screensaver.js';
import './core/glassEffect.js';
import { GlassMorphismSystem } from './core/glassEffect.js';
import GlassEffects from './utils/glassEffects.js';
import DraggableSystem from './utils/draggable.js';
```

### 2. Global Namespace Setup
```javascript
// Create namespace for globals to avoid direct window pollution
window.neuOS = window.neuOS || {};

// Module instances
let windowManager = null;
let helpManager = null;
let terminal = null;
let bootSystem = null;
let glassMorphismSystem = null;
let glassEffects = null;
let draggableSystem = null;
let openWindows = {};
```

### 3. Error-Boundary Initialization
```javascript
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

// ... similar pattern for other modules
```

## Core Systems Initialization

### Window Manager
- **Purpose**: Manages application windows and desktop environment
- **Features**: Window creation, positioning, focus management
- **Dependencies**: utils/draggable.js, core/glassEffect.js

### Help Manager
- **Purpose**: Provides context-sensitive help system
- **Features**: Help content management, search functionality
- **Dependencies**: None

### Glass Morphism System
- **Purpose**: Applies glassmorphic visual effects
- **Features**: Glass effects, backdrop filters, visual enhancements
- **Dependencies**: utils/glassEffects.js

### Draggable System
- **Purpose**: Enables drag and drop functionality
- **Features**: Element dragging, constraints, touch support
- **Dependencies**: utils/utils.js

## Application Management

### Application Launch System
```javascript
function handleAppClick(appId) {
    try {
        switch (appId) {
            case 'terminal':
                if (!terminal) {
                    const terminalInput = document.getElementById('terminal-input');
                    const terminalOutput = document.getElementById('terminal-output');
                    terminal = new Terminal(terminalInput, terminalOutput);
                    window.neuOS.terminalInstance = terminal;
                }
                windowManager.createWindow({
                    id: 'terminal',
                    title: 'terminal',
                    content: document.getElementById('terminal-container'),
                    width: '800px',
                    height: '600px'
                });
                break;
            default:
                console.warn(`neuOS: No specific initialization for app: ${appId}`);
        }
    } catch (error) {
        console.error('neuOS: Application launch error:', error);
    }
}
```

### Window Management
- **Window Creation**: Dynamic window generation with glass effects
- **Window Positioning**: Smart positioning and z-index management
- **Window Focus**: Focus management and window stacking
- **Window States**: Minimize, maximize, restore functionality

## Event Handling

### Global Event Listeners
```javascript
// Window resize handling
window.addEventListener('resize', debounce(() => {
    if (windowManager) {
        windowManager.handleWindowResize();
    }
}, 150));

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Escape key handling
    if (event.key === 'Escape') {
        // Close active windows or modals
    }
    
    // Ctrl/Cmd + R for refresh
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        // Handle refresh
    }
});

// Mobile touch events
document.addEventListener('touchstart', (event) => {
    // Handle touch interactions
}, { passive: true });
```

### Application-Specific Events
- **Terminal Events**: Command execution, input handling
- **Window Events**: Drag, resize, focus changes
- **Audio Events**: Sound effects, background music
- **Theme Events**: Theme switching, color changes

## Performance Optimization

### Critical Performance Areas
1. **Module Loading**: ES6 module optimization
2. **Event Handling**: Debounced and throttled events
3. **Memory Management**: Proper cleanup and garbage collection
4. **Animation Performance**: RequestAnimationFrame usage

### Optimization Strategies
1. **Lazy Loading**: Load modules on demand
2. **Event Delegation**: Efficient event handling
3. **Memory Monitoring**: Track memory usage
4. **Performance Monitoring**: Monitor key metrics

## Error Handling

### Error Boundaries
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('neuOS: Global error:', event.error);
    // Log error and show user-friendly message
});

// Unhandled promise rejection
window.addEventListener('unhandledrejection', (event) => {
    console.error('neuOS: Unhandled promise rejection:', event.reason);
    // Handle promise rejections
});
```

### Module Error Recovery
- **Graceful Degradation**: Fallback functionality
- **Error Logging**: Comprehensive error tracking
- **User Notification**: User-friendly error messages
- **Automatic Recovery**: Self-healing systems

## Boot Sequence

### Boot Process
1. **System Check**: Verify browser capabilities
2. **Module Initialization**: Initialize core systems
3. **Configuration Load**: Load user preferences
4. **UI Setup**: Prepare user interface
5. **Application Ready**: Signal system readiness

### Login Integration
```javascript
// Boot system integration
if (bootSystem) {
    bootSystem.startBootSequence();
    
    // Handle boot completion
    bootSystem.on('bootComplete', () => {
        console.log('neuOS: Boot sequence completed');
        // Initialize additional features
    });
}
```

## Mobile Support

### Mobile Detection
```javascript
// Mobile utilities integration
import './utils/mobile.js';

// Mobile-specific initialization
if (window.mobileUtils) {
    window.mobileUtils.setupMobileFeatures();
}
```

### Touch Support
- **Touch Events**: Touch gesture recognition
- **Mobile UI**: Responsive design adjustments
- **Performance**: Mobile-optimized performance
- **Accessibility**: Mobile accessibility features

## Audio System Integration

### Audio Initialization
```javascript
// Audio library integration
// howler.min.js is loaded for audio support

// Audio system setup
if (window.audioSystem) {
    window.audioSystem.initialize();
    window.audioSystem.setVolume(0.5);
}
```

### Audio Features
- **Background Music**: Ambient background audio
- **Sound Effects**: UI interaction sounds
- **Mechvibes**: Mechanical keyboard sounds
- **Volume Control**: Adjustable audio levels

## Theme System Integration

### Theme Management
```javascript
// Theme system integration
if (window.themeManager) {
    const savedTheme = localStorage.getItem('neuos-theme') || 'default';
    window.themeManager.setTheme(savedTheme);
}
```

### Theme Features
- **Theme Switching**: Dynamic theme changes
- **Color Schemes**: Multiple color palettes
- **Theme Persistence**: User preference storage
- **Theme Customization**: User-defined themes

## Development Features

### Debug Mode
```javascript
// Development mode detection
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

if (isDevelopment) {
    // Enable debug features
    window.neuOS.debug = true;
    console.log('neuOS: Development mode enabled');
}
```

### Performance Monitoring
- **Load Time Tracking**: Monitor application load times
- **Memory Usage**: Track memory consumption
- **Error Tracking**: Monitor error rates
- **User Interaction**: Track user engagement

## Security Considerations

### Content Security Policy
- **Script Restrictions**: Controlled script execution
- **Resource Loading**: Restricted resource access
- **Data Validation**: Input sanitization
- **Error Handling**: Secure error reporting

### Input Validation
- **Command Sanitization**: Terminal input validation
- **File Path Validation**: Secure file operations
- **Data Validation**: Configuration data validation
- **XSS Prevention**: Cross-site scripting protection

## Browser Compatibility

### Supported Browsers
- **Chrome 80+**: Full feature support
- **Firefox 75+**: Full feature support
- **Safari 13+**: Full feature support
- **Edge 80+**: Full feature support

### Feature Detection
```javascript
// Feature detection
const supportsES6Modules = 'noModule' in HTMLScriptElement.prototype;
const supportsServiceWorker = 'serviceWorker' in navigator;
const supportsWebAudio = 'AudioContext' in window || 'webkitAudioContext' in window;

if (!supportsES6Modules) {
    console.error('neuOS: ES6 modules not supported');
    // Show fallback message
}
```

## Future Enhancements

### Planned Features
1. **Advanced Module System**: Dynamic module loading
2. **Performance Monitoring**: Real-time performance tracking
3. **Advanced Error Handling**: Intelligent error recovery
4. **Plugin System**: Extensible application architecture

### Technical Improvements
1. **Web Workers**: Background processing
2. **Service Workers**: Advanced caching
3. **WebGL**: Hardware acceleration
4. **IndexedDB**: Advanced storage

## Related Documentation

- See [architecture.md](architecture.md) for overall system architecture
- See [config.md](config.md) for configuration management
- See [terminal.md](terminal.md) for terminal application
- See [DOTHISNEXT.md](DOTHISNEXT.md) for main.js specific issues 