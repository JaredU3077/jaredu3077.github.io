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

    // Terminal commands
    COMMANDS: {
        HELP: `Available commands:
• ping [host] - Test network connectivity
• show resume - Display professional resume  
• show experience - Show detailed work history
• show skills - List technical skills
• show certifications - Display certifications
• ifconfig - Show network interface configuration
• netstat - Display network connections
• tracert [host] - Trace route to destination
• nslookup [domain] - DNS lookup
• clear - Clear terminal screen
• help - Show this help message`,
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
UDP    192.168.1.100:53       *:*                    LISTENING`
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
        'welcome': {
            id: 'welcome',
            name: 'Welcome',
            icon: '👋',
            windows: [{
                id: 'welcomeWindow',
                title: 'Welcome - Senior Network Engineer Portfolio',
                width: 500,
                height: 320,
                content: `
                    <div class="welcome-content" style="padding: 20px; text-align: center;">
                        <h2>🖥️ Senior Network Engineer Portfolio</h2>
                        <p><strong>Jared U. (@JaredU_)</strong></p>
                        <p>Welcome to my interactive portfolio featuring a simulated network engineer workstation.</p>
                        <hr style="margin: 15px 0; border: 1px solid #26334d;">
                        <div style="text-align: left; margin-top: 15px;">
                            <h3>🚀 Quick Start:</h3>
                            <ul style="list-style-type: none; padding: 0;">
                                <li>📊 <strong>Network Monitor:</strong> View network topology</li>
                                <li>💻 <strong>Terminal:</strong> Run commands like 'show resume' or 'ping 8.8.8.8'</li>
                                <li>📚 <strong>Codex:</strong> Search network documentation</li>
                                <li>🔧 <strong>Device Manager:</strong> Network device overview</li>
                            </ul>
                        </div>
                        <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                            15+ years experience • CCNA Certified • Python & Ansible Expert
                        </p>
                    </div>
                `
            }]
        },
        'terminal': {
            id: 'terminal',
            name: 'Terminal',
            description: 'Command line interface',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>`,
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
                width: 600,
                height: 400
            }]
        },
        'network-monitor': {
            id: 'network-monitor',
            name: 'Network Monitor',
            description: 'Visualize the network topology',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 12h18M3 6h18M3 18h18"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/></svg>`,
            windows: [{
                id: 'topologyWindow',
                title: 'Network Topology',
                content: `<div id="networkTopology" style="height: 100%;"></div>`,
                width: 800,
                height: 600
            }]
        },
        'device-manager': {
            id: 'device-manager',
            name: 'Device Manager',
            description: 'Manage network devices',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h4"/></svg>`,
            windows: [{
                id: 'devicesWindow',
                title: 'Network Device Manager',
                content: `<div id="deviceList" data-scroll-container style="padding: 20px;">
                    <h3 style="color: #4a90e2; margin-bottom: 20px;">🖥️ Network Infrastructure Overview</h3>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #00d084; margin-bottom: 10px;">🔧 Core Infrastructure</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Core Switch Stack</strong> - Arista 7280R (Active/Standby)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.10 | Status: ✅ Online | Uptime: 247 days</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Distribution Switches</strong> - Cisco Catalyst 9300 Series<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.11-16 | Status: ✅ Online | Load: 34%</span>
                        </div>
                    </div>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #ff6900; margin-bottom: 10px;">🛡️ Security Infrastructure</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Firewall Cluster</strong> - Palo Alto PA-5250 (HA)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.20-21 | Status: ✅ Active/Standby | Threats Blocked: 1,247</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>IPS/IDS</strong> - Fortinet FortiGate 600E<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.22 | Status: ✅ Online | Signatures: Updated</span>
                        </div>
                    </div>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #7c53ff; margin-bottom: 10px;">📡 Wireless Infrastructure</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Wireless Controllers</strong> - Arista Cloud Vision (Primary/Secondary)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.30-31 | Status: ✅ Online | APs: 127/130</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Access Points</strong> - Arista Wi-Fi 6E (Various Models)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Coverage: 99.7% | Clients: 1,847 | Avg Signal: -45 dBm</span>
                        </div>
                    </div>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #00b8d9; margin-bottom: 10px;">🌐 WAN & Connectivity</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Edge Routers</strong> - Cisco ASR 1000 Series<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.40-41 | Status: ✅ Online | BGP Sessions: 8/8</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>SD-WAN Appliances</strong> - Cisco Meraki MX450<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: Cloud Managed | Status: ✅ Online | Tunnels: 12/12</span>
                        </div>
                    </div>
                    
                    <div class="device-category">
                        <h4 style="color: #ff4d4d; margin-bottom: 10px;">📊 Monitoring & Management</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Network Monitoring</strong> - SolarWinds NPM Cluster<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.50-52 | Status: ✅ Online | Devices Monitored: 847</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Log Management</strong> - Splunk Enterprise<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.60 | Status: ✅ Online | Daily Logs: 2.3TB</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 25px; padding: 15px; background: #0f1419; border-radius: 8px; border-left: 4px solid #4a90e2;">
                        <strong>Network Health Summary:</strong><br>
                        <span style="color: #00d084;">● 847 devices monitored</span><br>
                        <span style="color: #00d084;">● 99.97% network uptime</span><br>
                        <span style="color: #ffff00;">● 3 minor alerts pending</span><br>
                        <span style="color: #00d084;">● All critical systems operational</span>
                    </div>
                </div>`,
                width: 700,
                height: 600
            }]
        },
        'codex': {
            id: 'codex',
            name: 'Codex',
            description: 'Search and browse documentation',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/><path d="M10 10l4 4"/></svg>`,
            windows: [{
                id: 'codexWindow',
                title: 'Codex',
                content: `
                    <div class="search-container">
                        <input type="text" id="searchInput" placeholder="Search documentation..." aria-label="Search documentation">
                        <div id="searchResults" data-scroll-container></div>
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
 * Helper function to create application button
 * @param {Object} app - Application configuration
 * @param {string} type - Type of button (desktop, taskbar, or start-menu)
 * @returns {string} Button markup
 */
export function createAppButton(app, type) {
    const config = CONFIG[type === 'desktop' ? 'desktop' : type === 'start-menu' ? 'startMenu' : 'taskbar'];
    const iconSize = config.iconSize;
    
    const button = document.createElement('button');
    button.className = type === 'desktop' ? 'desktop-icon' : type === 'start-menu' ? 'start-menu-item' : 'taskbar-icon';
    button.dataset.tool = app.id;
    button.title = app.description || app.name;
    button.setAttribute('aria-label', app.name);
    button.setAttribute('tabindex', '0');

    if (type === 'desktop') {
        button.innerHTML = `
            <div class="icon">${app.icon}</div>
            <span class="label">${app.name}</span>
        `;
    } else if (type === 'start-menu') {
        button.innerHTML = `
            ${app.icon}
            <span class="label">${app.name}</span>
        `;
    } else {
        button.innerHTML = `
            <div class="icon">${app.icon}</div>
        `;
    }

    return button.outerHTML;
}
