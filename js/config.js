/**
 * Configuration Module TEST
 * Contains constants and configuration values used across the application
 */

export const CONFIG = {
    // Window defaults
    WINDOW: {
        DEFAULT_WIDTH: '500px',
        DEFAULT_HEIGHT: '400px',
        MAXIMIZED_WIDTH: '90%',
        MAXIMIZED_HEIGHT: '80%',
        MAXIMIZED_MARGIN: '5%'
    },

    // Network visualization
    NETWORK: {
        UPDATE_INTERVAL: 3000,
        DEFAULT_NODES: [
            { id: 1, label: 'Router 1', group: 'router' },
            { id: 2, label: 'Router 2', group: 'router' },
            { id: 3, label: 'Switch 1', group: 'switch' },
            { id: 4, label: 'Switch 2', group: 'switch' },
            { id: 5, label: 'Server 1', group: 'server' },
            { id: 6, label: 'Server 2', group: 'server' }
        ],
        DEFAULT_EDGES: [
            { from: 1, to: 2, label: '10Gbps' },
            { from: 1, to: 3, label: '1Gbps' },
            { from: 2, to: 4, label: '1Gbps' },
            { from: 3, to: 5, label: '1Gbps' },
            { from: 4, to: 6, label: '1Gbps' }
        ],
        DEFAULT_OPTIONS: {
            nodes: {
                shape: 'dot',
                size: 20,
                font: {
                    size: 12
                }
            },
            edges: {
                width: 2,
                font: {
                    size: 10
                }
            },
            groups: {
                router: { color: { background: '#ff0000' } },
                switch: { color: { background: '#00ff00' } },
                server: { color: { background: '#0000ff' } }
            },
            physics: {
                stabilization: {
                    iterations: 100
                }
            },
            interaction: {
                dragNodes: true,
                dragView: true,
                zoomView: true
            }
        }
    },

    // Terminal commands
    COMMANDS: {
        HELP: 'Available commands: ping, clear, help, show resume, show jared',
        PING: 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms'
    },

    // File paths
    PATHS: {
        RESUME: 'resume.txt',
        CODEX: 'codex.txt'
    }
};

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
        return {
            // Window defaults
            WINDOW: {
                DEFAULT_WIDTH: '500px',
                DEFAULT_HEIGHT: '400px',
                MAXIMIZED_WIDTH: '90%',
                MAXIMIZED_HEIGHT: '80%',
                MAXIMIZED_MARGIN: '5%'
            },

            // Network visualization
            NETWORK: {
                UPDATE_INTERVAL: 3000,
                DEFAULT_NODES: [
                    { id: 1, label: 'Router 1', group: 'router' },
                    { id: 2, label: 'Router 2', group: 'router' },
                    { id: 3, label: 'Switch 1', group: 'switch' },
                    { id: 4, label: 'Switch 2', group: 'switch' },
                    { id: 5, label: 'Server 1', group: 'server' },
                    { id: 6, label: 'Server 2', group: 'server' }
                ],
                DEFAULT_EDGES: [
                    { from: 1, to: 2, label: '10Gbps' },
                    { from: 1, to: 3, label: '1Gbps' },
                    { from: 2, to: 4, label: '1Gbps' },
                    { from: 3, to: 5, label: '1Gbps' },
                    { from: 4, to: 6, label: '1Gbps' }
                ],
                DEFAULT_OPTIONS: {
                    nodes: {
                        shape: 'dot',
                        size: 20,
                        font: {
                            size: 12
                        }
                    },
                    edges: {
                        width: 2,
                        font: {
                            size: 10
                        }
                    },
                    groups: {
                        router: { color: { background: '#ff0000' } },
                        switch: { color: { background: '#00ff00' } },
                        server: { color: { background: '#0000ff' } }
                    },
                    physics: {
                        stabilization: {
                            iterations: 100
                        }
                    },
                    interaction: {
                        dragNodes: true,
                        dragView: true,
                        zoomView: true
                    }
                }
            },

            // Terminal commands
            COMMANDS: {
                HELP: 'Available commands: ping, clear, help, show resume, show jared',
                PING: 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms'
            },

            // File paths
            PATHS: {
                RESUME: 'resume.txt',
                CODEX: 'codex.txt'
            },

            // Environment-specific settings
            ENV: {
                development: {
                    DEBUG: true,
                    LOG_LEVEL: 'debug',
                    NETWORK: {
                        UPDATE_INTERVAL: 1000,
                        MOCK_DATA: true
                    }
                },
                staging: {
                    DEBUG: true,
                    LOG_LEVEL: 'info',
                    NETWORK: {
                        UPDATE_INTERVAL: 2000,
                        MOCK_DATA: true
                    }
                },
                testing: {
                    DEBUG: true,
                    LOG_LEVEL: 'debug',
                    NETWORK: {
                        UPDATE_INTERVAL: 1000,
                        MOCK_DATA: true
                    }
                },
                production: {
                    DEBUG: false,
                    LOG_LEVEL: 'error',
                    NETWORK: {
                        UPDATE_INTERVAL: 5000,
                        MOCK_DATA: false
                    }
                }
            }
        };
    }

    /**
     * Apply environment-specific configuration
     */
    applyEnvironmentConfig() {
        const envConfig = this.config.ENV[this.environment];
        if (envConfig) {
            // Merge environment config with base config
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

// Create and export a singleton instance
export const configManager = new ConfigManager();

/**
 * UI Configuration
 * This file contains all UI-related configurations including icons, window settings,
 * and application definitions.
 */

export const UI_CONFIG = {
    // Application definitions
    applications: {
        'network-monitor': {
            id: 'network-monitor',
            title: 'Network Monitor',
            description: 'Monitor network topology and traffic',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`,
            windows: [{
                id: 'topologyWindow',
                title: 'Network Topology',
                content: '<div id="networkTopology" style="width: 100%; height: 100%;"></div>',
                width: 800,
                height: 600
            }]
        },
        'device-manager': {
            id: 'device-manager',
            title: 'Device Manager',
            description: 'Manage network devices',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>`,
            windows: [{
                id: 'devicesWindow',
                title: 'Device Manager',
                content: '<div id="deviceList"></div>',
                width: 600,
                height: 400
            }]
        },
        'terminal': {
            id: 'terminal',
            title: 'Terminal',
            description: 'Command line interface',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>`,
            windows: [{
                id: 'terminalWindow',
                title: 'Terminal',
                content: `
                    <div id="terminalOutput"></div>
                    <div id="terminalInput">
                        <span class="prompt">$</span>
                        <input type="text" autofocus aria-label="Terminal input">
                    </div>
                `,
                width: 600,
                height: 400
            }]
        },
        'codex': {
            id: 'codex',
            title: 'Codex',
            description: 'Search and browse documentation',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path d="M10 10l4 4"/></svg>`,
            windows: [{
                id: 'codexWindow',
                title: 'Codex',
                content: `
                    <div class="search-container">
                        <input type="text" id="searchInput" placeholder="Search documentation..." aria-label="Search documentation">
                        <div id="searchResults"></div>
                    </div>
                `,
                width: 800,
                height: 600
            }]
        }
    },

    // Window configuration
    window: {
        minWidth: 300,
        maxWidth: window.innerWidth * 0.9,
        minHeight: 200,
        maxHeight: window.innerHeight * 0.9,
        defaultWidth: 800,
        defaultHeight: 600,
        snapThreshold: 50,
        zIndex: 1000
    },

    // Start menu configuration
    startMenu: {
        width: 300,
        itemHeight: 40,
        iconSize: 24
    },

    // Taskbar configuration
    taskbar: {
        height: 40,
        iconSize: 20,
        spacing: 4
    },

    // Desktop configuration
    desktop: {
        iconSize: 64,
        iconSpacing: 20,
        labelHeight: 40
    }
};

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
 * Helper function to create application button
 * @param {Object} app - Application configuration
 * @param {string} type - Type of button (desktop, taskbar, or start-menu)
 * @returns {string} Button markup
 */
export function createAppButton(app, type) {
    const config = UI_CONFIG[type === 'desktop' ? 'desktop' : type === 'start-menu' ? 'startMenu' : 'taskbar'];
    const iconSize = config.iconSize;
    
    const button = document.createElement('button');
    button.className = type === 'desktop' ? 'desktop-icon' : type === 'start-menu' ? 'start-menu-item' : 'taskbar-icon';
    button.dataset.tool = app.id;
    button.title = app.description;
    button.setAttribute('aria-label', app.title);
    button.setAttribute('tabindex', '0');

    if (type === 'desktop') {
        button.innerHTML = `
            <div class="icon">${app.icon}</div>
            <span class="label">${app.title}</span>
        `;
    } else {
        button.innerHTML = `
            <div class="icon">${app.icon}</div>
            ${type === 'start-menu' ? `<span class="label">${app.title}</span>` : ''}
        `;
    }

    return button.outerHTML;
}
