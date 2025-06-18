/**
 * Configuration Module
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
