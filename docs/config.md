# config.js - Configuration Management Documentation

## File Overview

**Purpose**: Centralized configuration management system that provides constants, application settings, and environment-specific configurations.

**Type**: ES6 module with singleton pattern for configuration management.

**Role**: Single source of truth for all application settings, window configurations, terminal commands, and environment-specific behavior.

## Dependencies and Imports

### Internal Dependencies

| Module | Purpose | Dependencies |
|--------|---------|--------------|
| None | Standalone configuration module | None |

### External Dependencies

| Resource | Type | Purpose | Version |
|----------|------|---------|---------|
| `localStorage` | Browser API | Configuration persistence | Native |
| `window.location` | Browser API | Environment detection | Native |

## Internal Structure

### Configuration Object Structure

```javascript
export const CONFIG = {
    // Window defaults
    WINDOW: {
        DEFAULT_WIDTH: '500px',
        DEFAULT_HEIGHT: '400px',
        MAXIMIZED_WIDTH: '90%',
        MAXIMIZED_HEIGHT: '80%',
        MAXIMIZED_MARGIN: '5%'
    },

    // Window configuration (lowercase for compatibility)
    window: {
        defaultWidth: 500,
        defaultHeight: 400,
        minWidth: 300,
        minHeight: 200,
        maxWidth: 1200,
        maxHeight: 800,
        zIndex: 1000
    },

    // Terminal commands
    COMMANDS: {
        HELP: `available commands:...`,
        PING: 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms',
        IFCONFIG: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>...`,
        NETSTAT: `Active Connections...`,
        ROUTE: `Kernel IP routing table:...`
    },

    // File paths
    PATHS: {
        RESUME: 'assets/content/resume.txt'
    },

    // Network visualization
    NETWORK: {
        UPDATE_INTERVAL: 3000,
        nodes: [...],
        edges: [...],
        options: {...}
    },

    // Application configurations
    applications: {
        'terminal': {
            id: 'terminal',
            name: 'Terminal',
            description: 'Command line interface',
            icon: `<svg>...</svg>`,
            defaultSize: { width: 700, height: 500 },
            windows: [...]
        }
    },

    // Desktop configuration
    desktop: {
        iconSize: 64,
        iconSpacing: 20,
        labelHeight: 40
    },

    // Environment-specific settings
    ENV: {
        development: {...},
        production: {...}
    }
};
```

### ConfigManager Class

```javascript
class ConfigManager {
    constructor() {
        this.config = this.loadConfig();
        this.environment = this.detectEnvironment();
        this.applyEnvironmentConfig();
    }

    /**
     * Detect the current environment
     * @returns {string} Environment name
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging')) {
            return 'staging';
        } else if (hostname.includes('test')) {
            return 'testing';
        }
        return 'production';
    }

    /**
     * Load configuration from localStorage or use defaults
     * @returns {Object} Configuration object
     */
    loadConfig() {
        const savedConfig = localStorage.getItem('appConfig');
        if (savedConfig) {
            return JSON.parse(savedConfig);
        }
        return this.getDefaultConfig();
    }

    /**
     * Get default configuration
     * @returns {Object} Default configuration object
     */
    getDefaultConfig() {
        return CONFIG;
    }

    /**
     * Apply environment-specific configuration
     */
    applyEnvironmentConfig() {
        const envConfig = this.config.ENV[this.environment];
        if (envConfig) {
            this.config = this.mergeConfigs(this.config, envConfig);
        }
    }

    /**
     * Merge two configuration objects
     * @param {Object} base - Base configuration
     * @param {Object} override - Override configuration
     * @returns {Object} Merged configuration
     */
    mergeConfigs(base, override) {
        const result = { ...base };
        for (const key in override) {
            if (typeof override[key] === 'object' && override[key] !== null) {
                result[key] = this.mergeConfigs(result[key] || {}, override[key]);
            } else {
                result[key] = override[key];
            }
        }
        return result;
    }

    /**
     * Update configuration at runtime
     * @param {Object} updates - Configuration updates
     */
    updateConfig(updates) {
        this.config = this.mergeConfigs(this.config, updates);
        localStorage.setItem('appConfig', JSON.stringify(this.config));
        this.notifyConfigChange();
    }

    /**
     * Notify subscribers of configuration changes
     */
    notifyConfigChange() {
        const event = new CustomEvent('configChanged', { detail: this.config });
        window.dispatchEvent(event);
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration
     */
    getConfig() {
        return this.config;
    }

    /**
     * Get current environment
     * @returns {string} Current environment
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * Reset configuration to defaults
     */
    resetConfig() {
        this.config = this.getDefaultConfig();
        this.applyEnvironmentConfig();
        localStorage.removeItem('appConfig');
        this.notifyConfigChange();
    }
}
```

### Helper Functions

```javascript
/**
 * Helper function to create SVG icon
 * @param {Object} config - Icon configuration
 * @param {string} size - Size of the icon
 * @returns {string} SVG markup
 */
export function createIcon(config, size = '16') {
    const { viewBox, paths } = config;
    return `
        <svg width="${size}" height="${size}" viewBox="${viewBox}" fill="none" stroke="currentColor" stroke-width="2">
            ${paths.map(path => `<path d="${path}"/>`).join('')}
        </svg>
    `;
}

/**
 * Helper function to create desktop application icon
 * @param {Object} app - Application configuration
 * @param {string} type - Type of button (desktop)
 * @returns {string} Desktop icon markup
 */
export function createAppButton(app, type) {
    return `
        <div class="desktop-icon" data-app="${app.id}" title="${app.name}" aria-label="${app.name}">
            <div class="icon">${app.icon}</div>
            <div class="label">${app.name}</div>
        </div>
    `;
}
```

## Connections and References

### Incoming Connections

| Referencing File | Description | Connection Type |
|------------------|-------------|-----------------|
| `js/main.js` | Imports CONFIG and helper functions | Module import |
| `js/core/window.js` | Uses window configuration | Module import |
| `js/apps/terminal.js` | Uses terminal commands and config | Module import |
| `js/core/boot.js` | Uses application configuration | Module import |
| `js/utils/help.js` | Uses command help text | Module import |

### Outgoing Connections

| Referenced File | Description | Connection Type |
|-----------------|-------------|-----------------|
| `localStorage` | Configuration persistence | Browser API |
| `window.location` | Environment detection | Browser API |
| `assets/content/resume.txt` | Resume content path | File reference |

### Bidirectional Connections

| Element | CSS Class | JavaScript Handler | Description |
|---------|-----------|-------------------|-------------|
| Desktop icons | Icon styles | `createAppButton()` | Application icons |
| Terminal | Terminal styles | Command handlers | Terminal interface |
| Windows | Window styles | Window manager | Window configuration |

## Data Flow and Architecture

### Configuration Loading Flow

```javascript
// 1. Detect environment
const environment = detectEnvironment();

// 2. Load saved config or defaults
const savedConfig = localStorage.getItem('appConfig');
const config = savedConfig ? JSON.parse(savedConfig) : getDefaultConfig();

// 3. Apply environment-specific overrides
const envConfig = config.ENV[environment];
if (envConfig) {
    config = mergeConfigs(config, envConfig);
}

// 4. Notify subscribers of changes
notifyConfigChange();
```

### Configuration Update Flow

```javascript
// 1. Update configuration
updateConfig(newSettings);

// 2. Persist to localStorage
localStorage.setItem('appConfig', JSON.stringify(config));

// 3. Notify subscribers
const event = new CustomEvent('configChanged', { detail: config });
window.dispatchEvent(event);

// 4. Subscribers react to changes
window.addEventListener('configChanged', (event) => {
    const newConfig = event.detail;
    // Update UI based on new configuration
});
```

### Environment Detection

```javascript
function detectEnvironment() {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'development';
    } else if (hostname.includes('staging')) {
        return 'staging';
    } else if (hostname.includes('test')) {
        return 'testing';
    }
    return 'production';
}
```

## Configuration Sections

### Window Configuration

```javascript
window: {
    defaultWidth: 500,
    defaultHeight: 400,
    minWidth: 300,
    minHeight: 200,
    maxWidth: 2000,
    maxHeight: 1500,
    zIndex: 1000
}
```

### Terminal Commands

```javascript
COMMANDS: {
    HELP: `available commands:

=== network engineering ===
ssh <target>           - connect to network devices
show <command>         - display system information
ping <target>          - test network connectivity
logging [on|off|debug] - control system logging

=== network tools ===
traceroute <host>      - trace network route
nslookup <host>        - dns lookup
arp                   - show arp table
route                 - show routing table

=== system navigation ===
launch <app>          - launch applications
apps                  - list available applications
windows               - list open windows
close [app]           - close window
focus <app>           - focus on specified window
desktop clear         - clear desktop and close all windows

=== visual effects ===
particles <cmd>       - particle system control
effects <cmd>         - visual effects control

=== system information ===
resume                - display resume information
show <section>        - show specific resume section

=== system control ===
system <cmd>          - system operations
theme <cmd>           - theme control
audio <cmd>           - audio system control
performance <cmd>     - performance monitoring
screensaver <cmd>     - space screensaver control
ss <cmd>              - screensaver shortcut

=== help ===
help                  - show this help message
clear                 - clear terminal output
exit                  - close terminal

type any command to get started. use tab for auto-completion.
happy exploring! 🚀`
}
```

### Application Configuration

```javascript
applications: {
    'terminal': {
        id: 'terminal',
        name: 'Terminal',
        description: 'Command line interface',
        icon: `<svg>...</svg>`,
        defaultSize: { width: 700, height: 500 },
        windows: [{
            id: 'terminalWindow',
            title: 'Terminal',
            content: `...`,
            width: 700,
            height: 500
        }]
    }
}
```

### Network Visualization

```javascript
NETWORK: {
    UPDATE_INTERVAL: 3000,
    nodes: [
        { id: 1, label: 'Router', group: 'routers' },
        { id: 2, label: 'Switch', group: 'switches' },
        { id: 3, label: 'Server 1', group: 'servers' },
        { id: 4, label: 'Server 2', group: 'servers' },
        { id: 5, label: 'PC-1', group: 'pcs' },
        { id: 6, label: 'PC-2', group: 'pcs' },
        { id: 7, label: 'PC-3', group: 'pcs' },
        { id: 8, label: 'Firewall', group: 'firewalls' }
    ],
    edges: [
        { from: 8, to: 1 }, // Firewall -> Router
        { from: 1, to: 2 }, // Router -> Switch
        { from: 2, to: 3 }, // Switch -> Server 1
        { from: 2, to: 4 }, // Switch -> Server 2
        { from: 2, to: 5 }, // Switch -> PC-1
        { from: 2, to: 6 }, // Switch -> PC-2
        { from: 2, to: 7 }  // Switch -> PC-3
    ],
    options: {
        nodes: {
            shape: 'dot',
            size: 16,
            font: {
                size: 14,
                color: '#ffffff'
            },
            borderWidth: 2
        },
        edges: {
            width: 2,
            color: {
                color: '#848484',
                highlight: '#a8a8a8'
            }
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -10000,
                centralGravity: 0.1,
                springLength: 150
            }
        },
        interaction: {
            hover: true,
            dragNodes: true
        },
        groups: {
            routers: { color: { background: '#ff6900', border: '#ff8a38' }, shape: 'diamond' },
            switches: { color: { background: '#7c53ff', border: '#9b7dff' }, shape: 'square' },
            servers: { color: { background: '#00d084', border: '#33da9c' }, shape: 'box' },
            pcs: { color: { background: '#00b8d9', border: '#33c9e3' } },
            firewalls: { color: { background: '#ff4d4d', border: '#ff7070' }, shape: 'triangle' }
        }
    }
}
```

### Environment-Specific Settings

```javascript
ENV: {
    development: {
        DEBUG: true,
        LOG_LEVEL: 'debug',
        NETWORK: {
            UPDATE_INTERVAL: 1000,
            MOCK_DATA: true
        }
    },
    production: {
        DEBUG: false,
        LOG_LEVEL: 'warn',
        NETWORK: {
            UPDATE_INTERVAL: 5000,
            MOCK_DATA: false
        }
    }
}
```

## Potential Issues and Recommendations

### Standards Compliance Issues

1. **Configuration Structure**: Well-organized and documented
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add TypeScript interfaces for type safety

2. **Environment Detection**: Automatic environment detection
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add more environment types

3. **Configuration Persistence**: localStorage usage
   - **Status**: ✅ Properly implemented
   - **Recommendation**: Add configuration validation

### Performance Issues

1. **Large Configuration Object**: 494 lines of configuration
   - **Issue**: Large object may impact initial load
   - **Fix**: Consider lazy loading of non-critical config

2. **Environment Detection**: Synchronous environment detection
   - **Issue**: Blocking operation
   - **Fix**: Implement async environment detection

3. **Configuration Merging**: Deep object merging
   - **Issue**: Performance impact on large configs
   - **Fix**: Implement shallow merge for performance

### Architecture Issues

1. **Singleton Pattern**: Global configuration instance
   - **Issue**: Tight coupling to global state
   - **Fix**: Implement dependency injection

2. **Configuration Validation**: No validation of config values
   - **Issue**: Invalid config may cause runtime errors
   - **Fix**: Add configuration schema validation

3. **Configuration Updates**: Direct mutation of config object
   - **Issue**: Potential side effects
   - **Fix**: Implement immutable configuration updates

## Related Documentation

- See [main.md](main.md) for JavaScript entry point details
- See [architecture.md](architecture.md) for overall system architecture
- See [js/core/window.md](js/core/window.md) for window management
- See [js/apps/terminal.md](js/apps/terminal.md) for terminal application 