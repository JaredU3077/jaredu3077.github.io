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
        HELP: `Available Commands:

=== SYSTEM NAVIGATION ===
launch <app>          - Launch applications (network, skills, projects, etc.)
apps                  - List available applications
windows               - List open windows
close [app]           - Close window (current or specified)
focus <app>           - Focus on specified window
desktop clear         - Clear desktop and close all windows

=== VISUAL EFFECTS ===
particles <cmd>       - Particle system control
  status             - Show particle system status
  start/stop         - Control particle generation
  burst              - Create particle burst effect
  rain/calm/storm    - Set generation modes
  clear              - Remove all particles
  colors             - Change particle colors
  speed <level>      - Set generation speed (slow/normal/fast/turbo)
  dance              - Fun particle dance mode
  stats              - Detailed particle statistics

effects <cmd>         - Visual effects control
  list               - Show available effects
  status             - Show effects status
  enable <effect>    - Enable specific effect
  disable <effect>   - Disable specific effect
  toggle             - Toggle particle animation
  reset              - Reset to default state
  demo               - Show effects demonstration

=== SYSTEM INFORMATION ===
resume                - Display resume/CV information
show <section>        - Show specific resume section
  experience         - Work experience
  skills             - Technical skills
  certifications     - Professional certifications
  demoscene          - Launch 64MB demoscene with chiptune soundtrack

=== NETWORK TOOLS ===
ping <host>           - Test network connectivity
tracert <host>        - Trace network route
nslookup <host>       - DNS lookup
arp                   - Show ARP table
route                 - Show routing table

=== SYSTEM CONTROL ===
system <cmd>          - System operations
  info               - System information
  restart            - Restart Neu-OS
  shutdown           - System shutdown

theme <cmd>           - Theme control
  dark/light         - Switch themes
  reset              - Reset to default
  particles <show/hide> - Control particle visibility

audio <cmd>           - Audio system control
  on/off             - Enable/disable audio
  test               - Play test sequence
  volume <0-1>       - Set volume level
  status             - Audio system status

performance <cmd>     - Performance monitoring
  fps                - Show current FPS
  optimize           - Optimize performance
  memory             - Show memory usage

=== KEYBOARD SHORTCUTS ===
SPACE                 - Toggle particle animations
R                     - Rotate background
+/-                   - Add/remove particles
C                     - Change particle colors
Ctrl+L                - Clear terminal
Up/Down Arrows        - Command history
Tab                   - Auto-complete

=== HELP ===
help                  - Show this help message
clear                 - Clear terminal output
exit                  - Close terminal (same as window close)

Type any command to get started. Use Tab for auto-completion.
Happy exploring! 🚀`,
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
                        <p><strong>Jared U. (@jaredu_)</strong></p>
                        <p>Welcome to my interactive portfolio featuring a simulated network engineer workstation.</p>
                        
                        <div style="background: linear-gradient(135deg, #ff6b35, #feca57); padding: 10px; border-radius: 8px; margin: 15px 0; color: white; font-weight: bold;">
                            🚧 This is a work in progress - More features coming soon! 🚧
                        </div>
                        
                        <hr style="margin: 15px 0; border: 1px solid #26334d;">
                        
                        <div style="text-align: left; margin-top: 15px;">
                            <h3>🚀 Quick Start:</h3>
                            <ul style="list-style-type: none; padding: 0;">
                                <li>📊 <strong>Network Monitor:</strong> View network topology</li>
                                <li>💻 <strong>Terminal:</strong> Run commands like 'show resume' or 'show jared' to view my resume</li>
                                <li>📚 <strong>Codex:</strong> Search network documentation</li>
                                <li>🔧 <strong>Device Manager:</strong> Network device overview</li>
                            </ul>

                            <h3>📞 Get In Touch:</h3>
                            <div style="background: #1e2530; padding: 15px; border-radius: 8px; margin: 10px 0;">
                                <p style="margin: 0; color: #4a90e2;"><strong>💬 Reach out to me on X.com:</strong></p>
                                <p style="margin: 5px 0 0 0; font-size: 1.1em;"><a href="https://x.com/jaredu_" target="_blank" style="color: #00acee; text-decoration: none;">@jaredu_</a></p>
                            </div>

                            <h3>✨ Interactive Background:</h3>
                            <div style="font-size: 0.85em; margin-left: 10px;">
                                <p><strong>Keyboard Controls:</strong><br>
                                • SPACE - Toggle animations<br>
                                • R - Rotate background<br>
                                • +/- - Add/remove particles<br>
                                • C - Change colors</p>
                                <p><strong>Terminal Commands:</strong><br>
                                • 'bg pause' - Pause/resume effects<br>
                                • 'particles add 50' - Add particles<br>
                                • 'fx status' - Show effects info</p>
                            </div>
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
                        <h4 style="color: #ff6900; margin-bottom: 10px;">🔥 Security Infrastructure</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Primary Firewall</strong> - Palo Alto PA-5250 (HA Primary)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.20 | Status: ✅ Online | Throughput: 2.3 Gbps</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Secondary Firewall</strong> - Palo Alto PA-5250 (HA Secondary)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.21 | Status: ✅ Standby | Ready for failover</span>
                        </div>
                    </div>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #7c53ff; margin-bottom: 10px;">☁️ Wireless Infrastructure</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Wireless Controller</strong> - Cisco 9800-CL (Virtual)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Management: 192.168.1.30 | APs: 47 connected | Clients: 312 active</span>
                        </div>
                    </div>
                    
                    <div class="device-category" style="margin-bottom: 25px;">
                        <h4 style="color: #00d084; margin-bottom: 10px;">🔗 WAN/Internet</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Primary ISP</strong> - Fiber 1Gbps (Comcast Business)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Circuit ID: CMCST-123456 | Status: ✅ Online | Utilization: 23%</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Backup ISP</strong> - Cable 500Mbps (Xfinity Business)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Circuit ID: XFN-789012 | Status: ✅ Standby | Ready for failover</span>
                        </div>
                    </div>
                    
                    <div class="device-category">
                        <h4 style="color: #ff4d4d; margin-bottom: 10px;">⚡ Power & Environmental</h4>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>UPS Systems</strong> - APC Smart-UPS 3000VA (2 units)<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Load: 45% | Battery: 100% | Runtime: 47 minutes</span>
                        </div>
                        <div class="device-item" style="margin: 8px 0; padding: 8px; background: #1e2530; border-radius: 8px;">
                            <strong>Environmental Monitor</strong> - NetBotz Room Monitor 355<br>
                            <span style="color: #a0a0a0; font-size: 0.9em;">Temp: 72°F | Humidity: 45% | All sensors normal</span>
                        </div>
                    </div>
                </div>`,
                width: 700,
                height: 500
            }],
        },
        'skills': {
            id: 'skills',
            name: 'Skills Lab',
            description: 'Interactive technical skill demonstrations',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
            windows: [{
                id: 'skillsWindow',
                title: 'Skills Laboratory - Interactive Demos',
                content: `<div id="skillsContainer" data-scroll-container></div>`,
                width: 900,
                height: 600
            }]
        },
        'projects': {
            id: 'projects',
            name: 'Project Portfolio',
            description: 'Live project demonstrations and case studies',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><folder x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 3v18M16 3v18"/></svg>`,
            windows: [{
                id: 'projectsWindow',
                title: 'Project Portfolio - Live Demos',
                content: `<div id="projectsContainer" data-scroll-container></div>`,
                width: 900,
                height: 650
            }]
        },
        'system-status': {
            id: 'system-status',
            name: 'System Status',
            description: 'Real-time system diagnostics and metrics',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
            windows: [{
                id: 'statusWindow',
                title: 'Neu-OS System Status',
                content: `<div id="systemStatus" data-scroll-container></div>`,
                width: 800,
                height: 500
            }]
        },
        'contact': {
            id: 'contact',
            name: 'Communication Module',
            description: 'Network packet transmitter and messaging system',
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
            windows: [{
                id: 'contactWindow',
                title: 'Network Communication Module',
                content: `
                    <div class="contact-module" style="padding: 30px;">
                        <div class="contact-header" style="text-align: center; margin-bottom: 30px;">
                            <h2 style="color: var(--primary-color); margin-bottom: 10px;">📡 Network Packet Transmitter</h2>
                            <p style="opacity: 0.8;">Secure communication channel established</p>
                        </div>
                        
                        <form class="transmission-form" style="max-width: 500px; margin: 0 auto;">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--primary-color); font-weight: 600;">Sender ID:</label>
                                <input type="text" name="sender" placeholder="Enter your identification" required 
                                       style="width: 100%; padding: 12px; background: #1a1f2a; border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-color); font-family: 'Fira Code', monospace;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--primary-color); font-weight: 600;">Message Protocol:</label>
                                <input type="email" name="email" placeholder="sender@network.domain" required 
                                       style="width: 100%; padding: 12px; background: #1a1f2a; border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-color); font-family: 'Fira Code', monospace;">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--primary-color); font-weight: 600;">Transmission Subject:</label>
                                <input type="text" name="subject" placeholder="Message header classification" required 
                                       style="width: 100%; padding: 12px; background: #1a1f2a; border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-color);">
                            </div>
                            
                            <div class="form-group" style="margin-bottom: 30px;">
                                <label style="display: block; margin-bottom: 8px; color: var(--primary-color); font-weight: 600;">Transmission Content:</label>
                                <textarea name="message" rows="6" placeholder="Enter message payload..." required 
                                          style="width: 100%; padding: 12px; background: #1a1f2a; border: 2px solid var(--border-color); border-radius: 8px; color: var(--text-color); resize: vertical; font-family: inherit;"></textarea>
                            </div>
                            
                            <div class="transmission-status" style="text-align: center; margin-bottom: 20px;">
                                <div class="status-indicator" style="display: inline-flex; align-items: center; gap: 8px; color: var(--accent-green);">
                                    <div class="signal-icon" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; animation: pulse 2s infinite;"></div>
                                    <span>Secure channel established</span>
                                </div>
                            </div>
                            
                            <button type="submit" class="transmit-btn" 
                                    style="width: 100%; padding: 15px; background: linear-gradient(135deg, var(--primary-color) 60%, var(--primary-hover) 100%); color: white; border: none; border-radius: 8px; font-size: 1.1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s ease;">
                                <span>🚀 Transmit Message</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="22" y1="2" x2="11" y2="13"/>
                                    <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                                </svg>
                            </button>
                        </form>
                        
                        <div class="contact-info" style="margin-top: 40px; text-align: center; padding-top: 30px; border-top: 1px solid var(--border-color);">
                            <h3 style="color: var(--primary-color); margin-bottom: 15px;">Direct Communication Channels</h3>
                            <div class="contact-methods" style="display: flex; justify-content: center; gap: 30px; flex-wrap: wrap;">
                                <div class="contact-method">
                                    <div style="color: var(--accent-green); font-size: 1.5rem; margin-bottom: 5px;">📧</div>
                                    <div style="font-size: 0.9rem; opacity: 0.8;">Network Email</div>
                                    <div style="font-family: 'Fira Code', monospace; font-size: 0.9rem;">contact@jaredu.dev</div>
                                </div>
                                <div class="contact-method">
                                    <div style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 5px;">💼</div>
                                    <div style="font-size: 0.9rem; opacity: 0.8;">Professional Network</div>
                                    <div style="font-family: 'Fira Code', monospace; font-size: 0.9rem;">linkedin.com/in/jaredu</div>
                                </div>
                                <div class="contact-method">
                                    <div style="color: var(--accent-purple); font-size: 1.5rem; margin-bottom: 5px;">⚡</div>
                                    <div style="font-size: 0.9rem; opacity: 0.8;">Code Repository</div>
                                    <div style="font-family: 'Fira Code', monospace; font-size: 0.9rem;">github.com/jaredu3077</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <style>
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.7; transform: scale(1.1); }
                    }
                    
                    .transmit-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 8px 25px rgba(74, 144, 226, 0.4);
                    }
                    
                    .form-group input:focus,
                    .form-group textarea:focus {
                        outline: none;
                        border-color: var(--primary-color);
                        box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                    }
                    </style>
                `,
                width: 650,
                height: 700
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
        },
        'conway-game-of-life': {
            id: 'conway-game-of-life',
            name: 'Conway\'s Game of Life',
            description: 'Peaceful cellular automaton simulation',
            type: 'game', // Mark as game for special handling
            icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="13"/></svg>`,
            windows: [{
                id: 'gameOfLifeWindow',
                title: 'Conway\'s Game of Life',
                content: `
                    <div id="gameOfLifeContainer" style="display: flex; flex-direction: column; height: 100%; position: relative; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 8px;">
                        <div id="gameCanvas" style="flex: 1; border-radius: 16px; background: linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 50%, #16213e 100%); position: relative; overflow: hidden; box-shadow: inset 0 0 40px rgba(139, 69, 19, 0.1), 0 0 30px rgba(0,0,0,0.3);">
                            <canvas id="lifeCanvas" style="display: block; width: 100%; height: 100%; border-radius: 16px;"></canvas>
                        </div>
                    </div>
                `,
                width: 800,
                height: 600
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
