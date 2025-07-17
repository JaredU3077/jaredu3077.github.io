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
        RESUME: 'assets/content/resume.txt',

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
            icon: `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Modern Terminal Icon with 3D effect -->
                <defs>
                    <linearGradient id="terminalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--primary-color);stop-opacity:1" />
                        <stop offset="50%" style="stop-color:var(--primary-light);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:var(--primary-dark);stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="screenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:var(--background-dark);stop-opacity:1" />
                        <stop offset="50%" style="stop-color:var(--background-medium);stop-opacity:1" />
                        <stop offset="100%" style="stop-color:var(--background-light);stop-opacity:1" />
                    </linearGradient>
                    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="2" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.3)"/>
                    </filter>
                </defs>
                
                <!-- Terminal body with 3D effect -->
                <g filter="url(#dropShadow)">
                    <!-- Terminal base (bottom face) -->
                    <rect x="4" y="42" width="40" height="4" rx="2" fill="var(--primary-dark)" opacity="0.8"/>
                    
                    <!-- Terminal back (right face) -->
                    <rect x="42" y="6" width="4" height="36" rx="2" fill="var(--primary-dark)" opacity="0.6"/>
                    
                    <!-- Terminal main body -->
                    <rect x="6" y="6" width="36" height="36" rx="4" fill="url(#terminalGradient)" stroke="var(--primary-color)" stroke-width="1"/>
                    
                    <!-- Screen area -->
                    <rect x="10" y="10" width="28" height="20" rx="2" fill="url(#screenGradient)" stroke="var(--border-color)" stroke-width="0.5"/>
                    
                    <!-- Terminal text lines -->
                    <g fill="var(--text-color)">
                        <!-- Command prompt line -->
                        <rect x="12" y="12" width="2" height="2" rx="0.5"/>
                        <rect x="15" y="12" width="1" height="2" rx="0.5"/>
                        <rect x="17" y="12" width="8" height="2" rx="0.5"/>
                        
                        <!-- Output lines -->
                        <rect x="12" y="16" width="20" height="1" rx="0.5"/>
                        <rect x="12" y="18" width="16" height="1" rx="0.5"/>
                        <rect x="12" y="20" width="18" height="1" rx="0.5"/>
                        <rect x="12" y="22" width="14" height="1" rx="0.5"/>
                        <rect x="12" y="24" width="12" height="1" rx="0.5"/>
                    </g>
                    
                    <!-- Cursor blink effect -->
                    <rect x="12" y="28" width="2" height="2" rx="0.5" fill="var(--accent-green)" opacity="0.8">
                        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite"/>
                    </rect>
                    
                    <!-- Terminal buttons -->
                    <circle cx="16" cy="34" r="1.5" fill="var(--accent-red)" opacity="0.8"/>
                    <circle cx="20" cy="34" r="1.5" fill="var(--accent-yellow)" opacity="0.8"/>
                    <circle cx="24" cy="34" r="1.5" fill="var(--accent-green)" opacity="0.8"/>
                    
                    <!-- High-tech details -->
                    <rect x="28" y="32" width="6" height="4" rx="1" fill="var(--primary-color)" opacity="0.3"/>
                    <rect x="29" y="33" width="4" height="2" rx="0.5" fill="var(--text-color)" opacity="0.6"/>
                    
                    <!-- Corner accent -->
                    <path d="M 6 6 L 10 6 L 10 10 L 6 10 Z" fill="var(--accent-cyan)" opacity="0.6"/>
                </g>
                
                <!-- Glow effect -->
                <rect x="6" y="6" width="36" height="36" rx="4" fill="none" stroke="var(--primary-glow)" stroke-width="2" opacity="0.5"/>
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
                    <div class="terminal-status">
                        <div class="status-item">
                            <span class="status-indicator"></span>
                            <span class="status-text">ready</span>
                        </div>
                        <div class="status-item">
                            <span class="status-text">theme: default</span>
                        </div>
                        <div class="status-item">
                            <span class="status-text">history: 0</span>
                        </div>
                        <div class="status-item">
                            <span class="status-text">uptime: 00:00:00</span>
                        </div>
                    </div>
                `,
                width: 700,
                height: 500
            }]
        }
    },

    // Window configuration
    window: {
        defaultWidth: 500,
        defaultHeight: 400,
        minWidth: 300,
        minHeight: 200,
        maxWidth: 2000,
        maxHeight: 1500,
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

// GitHub Pages specific configuration
const isGitHubPages = window.location.hostname.includes('github.io');
const isLocalhost = window.location.hostname === 'localhost';

// Environment-specific settings
const ENV_CONFIG = {
    isGitHubPages,
    isLocalhost,
    // Reduce features on GitHub Pages for better performance
    maxParticles: isGitHubPages ? 50 : 100,
    audioEnabled: isLocalhost, // Disable audio on GitHub Pages initially
    debugMode: isLocalhost,
    // Service worker path
    swPath: isLocalhost ? '/sw.js' : './sw.js'
};

// Export for use in other modules
window.ENV_CONFIG = ENV_CONFIG;

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
