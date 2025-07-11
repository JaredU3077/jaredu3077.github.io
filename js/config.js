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
        HELP: `available commands:

=== network engineering ===
ssh <target>           - connect to network devices
  core-switch-01      - Core switch (192.168.1.1)
  edge-router-01      - Edge router (192.168.1.254)
  firewall-01         - Firewall (192.168.1.10)
  server-01           - Management server (192.168.1.100)
  wireless-controller - Wireless controller (192.168.1.50)

show <command>         - display system information
  running-config      - Current configuration
  ip route           - Routing table
  interface brief    - Interface status
  logging            - Logging configuration
  version            - System version
  help               - Show command help

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
  experience         - work experience
  skills             - technical skills
  certifications     - professional certifications
  demoscene          - launch 64mb demoscene

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
happy exploring! 🚀`,
        PING: 'Pinging 8.8.8.8... Reply from 8.8.8.8: 32ms',
        IFCONFIG: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 1234567  bytes 987654321 (941.1 MiB)
        TX packets 987654   bytes 123456789 (117.7 MiB)`,
        NETSTAT: `Active Connections
Proto  Local Address          Foreign Address        State
TCP    192.168.1.100:22       192.168.1.1:54321     ESTABLISHED
TCP    192.168.1.100:80       0.0.0.0:0              LISTENING
TCP    192.168.1.100:443      0.0.0.0:0              LISTENING
UDP    192.168.1.100:53       *:*                    LISTENING`,
        ROUTE: `Kernel IP routing table:
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0
169.254.0.0     0.0.0.0         255.255.0.0     U     1000   0        0 eth0`
    },

    // File paths
    PATHS: {
        RESUME: 'resume.txt',
        CODEX: 'codex.txt'
    },

    // Network visualization
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
    },

    // Application configurations
    applications: {
        'terminal': {
            id: 'terminal',
            name: 'Terminal',
            description: 'Command line interface',
            icon: `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <!-- Terminal window - white -->
                <rect x="3" y="6" width="26" height="20" rx="3" stroke="white" fill="none"/>
                <!-- Terminal lines - purple -->
                <path d="M10 12h12" stroke="#8b5cf6" stroke-width="2"/>
                <path d="M10 18h12" stroke="#8b5cf6" stroke-width="2"/>
                <path d="M10 24h8" stroke="#8b5cf6" stroke-width="2"/>
            </svg>`,
            defaultSize: { width: 700, height: 500 },
            windows: [{
                id: 'terminalWindow',
                title: 'Terminal',
                content: `
                    <div id="terminalOutput" data-scroll-container></div>
                    <div id="terminalInput">
                        <span class="prompt">$</span>
                        <input type="text" autofocus aria-label="Terminal input">
                    </div>
                `,
                width: 700,
                height: 500
            }]
        },
        'codex': {
            id: 'codex',
            name: 'Codex',
            description: '200 Layers of Financial Control',
            icon: `<svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
                <!-- Jail cell - white -->
                <rect x="3" y="3" width="26" height="26" stroke="white" fill="none" stroke-width="1.5"/>
                <!-- Two vertical bars - white -->
                <line x1="11" y1="3" x2="11" y2="29" stroke="white" fill="none" stroke-width="2.5"/>
                <line x1="21" y1="3" x2="21" y2="29" stroke="white" fill="none" stroke-width="2.5"/>
                <!-- Dollar sign - purple, perfectly centered -->
                <text x="16" y="18" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="#8b5cf6" stroke="none" font-family="Arial, sans-serif" font-weight="bold">$</text>
            </svg>`,
            category: 'knowledge',
            defaultSize: { width: 1000, height: 700 },
            windows: [{
                id: 'codexWindow',
                title: 'Codex - 200 Layers of Financial Control',
                content: `
                    <div class="codex-container">
                        <div class="codex-header">
                            <div class="search-container">
                                <input type="text" class="search-input" placeholder="Search layers, instruments, concepts...">
                                <button class="search-btn">🔍</button>
                            </div>
                            <div class="layer-navigation">
                                <button class="nav-btn prev-btn">◀</button>
                                <span class="layer-info">Layer <span class="current-layer">1</span> of <span class="total-layers">200</span></span>
                                <button class="nav-btn next-btn">▶</button>
                            </div>
                        </div>
                        <div class="codex-content">
                            <div class="layers-container"></div>
                            <div class="loading-indicator">Loading knowledge base...</div>
                        </div>
                    </div>
                `,
                width: 1000,
                height: 700
            }]
        }
    },

    // Window configuration
    window: {
        defaultWidth: 500,
        defaultHeight: 400,
        minWidth: 300,
        minHeight: 200,
        maxWidth: 1200,
        maxHeight: 800,
        zIndex: 1000
    },

    // Desktop configuration
    desktop: {
        iconSize: 64,
        iconSpacing: 20,
        labelHeight: 40
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
        production: {
            DEBUG: false,
            LOG_LEVEL: 'warn',
            NETWORK: {
                UPDATE_INTERVAL: 5000,
                MOCK_DATA: false
            }
        }
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
        return CONFIG;
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

// Export CONFIG as UI_CONFIG for backward compatibility  
export { CONFIG as UI_CONFIG };

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
