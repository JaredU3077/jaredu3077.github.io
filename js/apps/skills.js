/**
 * @file Skills Application - Interactive skill demonstrations
 * @author Jared U.
 */

export class SkillsApp {
    constructor(container) {
        this.container = container;
        this.activeDemo = null;
        this.skills = {
            'networking': {
                name: 'Network Engineering',
                icon: '🌐',
                level: 95,
                years: '15+',
                description: 'Expert in Cisco, Arista, Juniper, and network architecture',
                demo: () => this.networkingDemo(),
                tags: ['Cisco', 'Arista', 'BGP', 'OSPF', 'VLAN', 'Routing']
            },
            'python': {
                name: 'Python Automation',
                icon: '🐍',
                level: 90,
                years: '8+',
                description: 'Advanced scripting, automation, and network programming',
                demo: () => this.pythonDemo(),
                tags: ['Automation', 'Scripting', 'APIs', 'Libraries']
            },
            'security': {
                name: 'Network Security',
                icon: '🔒',
                level: 88,
                years: '12+',
                description: 'Firewall management, VPN, and security architecture',
                demo: () => this.securityDemo(),
                tags: ['Firewall', 'VPN', 'PCI', 'HIPAA', 'Intrusion Detection']
            },
            'cloud': {
                name: 'Cloud Platforms',
                icon: '☁️',
                level: 85,
                years: '6+',
                description: 'AWS, Azure, and hybrid cloud networking',
                demo: () => this.cloudDemo(),
                tags: ['AWS', 'Azure', 'Hybrid Cloud', 'VPC', 'Transit Gateway']
            },
            'ansible': {
                name: 'Ansible Automation',
                icon: '⚙️',
                level: 87,
                years: '5+',
                description: 'Infrastructure as Code and configuration management',
                demo: () => this.ansibleDemo(),
                tags: ['IaC', 'Playbooks', 'Configuration Management']
            },
            'monitoring': {
                name: 'Network Monitoring',
                icon: '📊',
                level: 92,
                years: '10+',
                description: 'SolarWinds, Splunk, Grafana, and SNMP monitoring',
                demo: () => this.monitoringDemo(),
                tags: ['SolarWinds', 'Splunk', 'Grafana', 'SNMP', 'NetFlow']
            }
        };
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="skills-app">
                <div class="skills-header">
                    <h2>💻 Technical Skills & Expertise</h2>
                    <p>Interactive demonstrations of technical capabilities</p>
                </div>
                
                <div class="skills-grid">
                    ${Object.entries(this.skills).map(([key, skill]) => `
                        <div class="skill-card" data-skill="${key}">
                            <div class="skill-icon">${skill.icon}</div>
                            <div class="skill-info">
                                <h3>${skill.name}</h3>
                                <div class="skill-level">
                                    <div class="level-bar">
                                        <div class="level-fill" style="width: ${skill.level}%"></div>
                                    </div>
                                    <span class="level-text">${skill.level}%</span>
                                </div>
                                <div class="skill-meta">
                                    <span class="years">${skill.years} years</span>
                                </div>
                                <p class="skill-description">${skill.description}</p>
                                <div class="skill-tags">
                                    ${skill.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                                <button class="demo-btn" data-skill="${key}">
                                    <span>Launch Demo</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polygon points="5 3 19 12 5 21 5 3"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="demo-overlay" id="demoOverlay">
                    <div class="demo-container">
                        <div class="demo-header">
                            <h3 id="demoTitle">Skill Demo</h3>
                            <button class="demo-close" id="demoClose">×</button>
                        </div>
                        <div class="demo-content" id="demoContent">
                            <!-- Demo content will be injected here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.injectStyles();
    }

    setupEventListeners() {
        // Demo buttons
        this.container.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillKey = e.target.closest('.demo-btn').dataset.skill;
                this.launchDemo(skillKey);
            });
        });

        // Close demo overlay
        const demoClose = this.container.querySelector('#demoClose');
        const demoOverlay = this.container.querySelector('#demoOverlay');
        
        if (demoClose) {
            demoClose.addEventListener('click', () => this.closeDemo());
        }
        
        if (demoOverlay) {
            demoOverlay.addEventListener('click', (e) => {
                if (e.target === demoOverlay) {
                    this.closeDemo();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeDemo) {
                this.closeDemo();
            }
        });
    }

    launchDemo(skillKey) {
        const skill = this.skills[skillKey];
        if (!skill) return;

        this.activeDemo = skillKey;
        const overlay = this.container.querySelector('#demoOverlay');
        const title = this.container.querySelector('#demoTitle');
        const content = this.container.querySelector('#demoContent');

        title.textContent = `${skill.icon} ${skill.name} - Interactive Demo`;
        overlay.style.display = 'flex';
        
        // Launch specific demo
        skill.demo();
    }

    closeDemo() {
        const overlay = this.container.querySelector('#demoOverlay');
        overlay.style.display = 'none';
        this.activeDemo = null;
    }

    networkingDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="network-demo">
                <div class="demo-section">
                    <h4>Network Topology Simulator</h4>
                    <div class="network-canvas" id="networkCanvas">
                        <div class="device router" style="top: 20%; left: 50%;">
                            <div class="device-icon">🔄</div>
                            <span>Core Router</span>
                        </div>
                        <div class="device switch" style="top: 60%; left: 20%;">
                            <div class="device-icon">📡</div>
                            <span>Switch A</span>
                        </div>
                        <div class="device switch" style="top: 60%; left: 80%;">
                            <div class="device-icon">📡</div>
                            <span>Switch B</span>
                        </div>
                        <div class="device host" style="top: 90%; left: 10%;">
                            <div class="device-icon">💻</div>
                            <span>Host 1</span>
                        </div>
                        <div class="device host" style="top: 90%; left: 30%;">
                            <div class="device-icon">💻</div>
                            <span>Host 2</span>
                        </div>
                        <div class="device host" style="top: 90%; left: 70%;">
                            <div class="device-icon">💻</div>
                            <span>Host 3</span>
                        </div>
                        <div class="device host" style="top: 90%; left: 90%;">
                            <div class="device-icon">💻</div>
                            <span>Host 4</span>
                        </div>
                    </div>
                    <div class="demo-controls">
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('pingTest'))">Send Ping</button>
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('showRoutes'))">Show Routes</button>
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('showVLANs'))">Show VLANs</button>
                    </div>
                </div>
                <div class="demo-output">
                    <h4>Network Output</h4>
                    <div class="console-output" id="networkOutput">
                        <div class="console-line">Network topology initialized...</div>
                        <div class="console-line">All devices online and reachable</div>
                        <div class="console-line">OSPF convergence completed</div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupNetworkingDemo();
    }

    setupNetworkingDemo() {
        const skillsApp = this.container.querySelector('.skills-app');
        
        skillsApp.addEventListener('pingTest', () => {
            this.simulatePingTest();
        });
        
        skillsApp.addEventListener('showRoutes', () => {
            this.showRoutingTable();
        });
        
        skillsApp.addEventListener('showVLANs', () => {
            this.showVLANConfig();
        });
    }

    simulatePingTest() {
        const output = this.container.querySelector('#networkOutput');
        output.innerHTML += '<div class="console-line">$ ping 192.168.1.10</div>';
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line success">64 bytes from 192.168.1.10: icmp_seq=1 time=1.2ms</div>';
        }, 500);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line success">64 bytes from 192.168.1.10: icmp_seq=2 time=1.1ms</div>';
        }, 1000);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line">--- ping statistics ---</div>';
            output.innerHTML += '<div class="console-line">2 packets transmitted, 2 received, 0% packet loss</div>';
        }, 1500);
    }

    showRoutingTable() {
        const output = this.container.querySelector('#networkOutput');
        output.innerHTML += '<div class="console-line">$ show ip route</div>';
        
        setTimeout(() => {
            output.innerHTML += `
                <div class="console-line">Codes: C - connected, S - static, O - OSPF</div>
                <div class="console-line">O    192.168.1.0/24 [110/2] via 10.0.0.2</div>
                <div class="console-line">C    192.168.2.0/24 is directly connected</div>
                <div class="console-line">O    192.168.3.0/24 [110/3] via 10.0.0.3</div>
            `;
        }, 500);
    }

    showVLANConfig() {
        const output = this.container.querySelector('#networkOutput');
        output.innerHTML += '<div class="console-line">$ show vlan brief</div>';
        
        setTimeout(() => {
            output.innerHTML += `
                <div class="console-line">VLAN Name                 Status    Ports</div>
                <div class="console-line">---- -------------------- --------- -------</div>
                <div class="console-line">1    default              active    Gi0/1-4</div>
                <div class="console-line">10   PRODUCTION           active    Gi0/5-8</div>
                <div class="console-line">20   GUEST                active    Gi0/9-12</div>
                <div class="console-line">99   MANAGEMENT           active    Gi0/24</div>
            `;
        }, 500);
    }

    pythonDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="python-demo">
                <div class="demo-section">
                    <h4>Python Network Automation</h4>
                    <div class="code-editor">
                        <div class="editor-header">
                            <span class="file-name">network_automation.py</span>
                        </div>
                        <pre class="code-content" id="pythonCode">#!/usr/bin/env python3
import netmiko
import json
from concurrent.futures import ThreadPoolExecutor

def configure_device(device_info):
    """Configure network device using Netmiko"""
    try:
        connection = netmiko.ConnectHandler(**device_info)
        config_commands = [
            'interface GigabitEthernet0/1',
            'description >>> Configured by Python <<<',
            'no shutdown'
        ]
        output = connection.send_config_set(config_commands)
        connection.disconnect()
        return f"✅ {device_info['host']}: Configuration successful"
    except Exception as e:
        return f"❌ {device_info['host']}: {str(e)}"

# Device inventory
devices = [
    {'device_type': 'cisco_ios', 'host': '192.168.1.1', 'username': 'admin'},
    {'device_type': 'cisco_ios', 'host': '192.168.1.2', 'username': 'admin'},
    {'device_type': 'arista_eos', 'host': '192.168.1.3', 'username': 'admin'}
]

# Parallel execution for faster deployment
with ThreadPoolExecutor(max_workers=5) as executor:
    results = executor.map(configure_device, devices)
    
for result in results:
    print(result)</pre>
                    </div>
                    <div class="demo-controls">
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('runPython'))">▶️ Run Script</button>
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('showAnsible'))">🔧 Show Ansible</button>
                    </div>
                </div>
                <div class="demo-output">
                    <h4>Execution Output</h4>
                    <div class="console-output" id="pythonOutput">
                        <div class="console-line">Python environment ready...</div>
                        <div class="console-line">Loaded network automation libraries</div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupPythonDemo();
    }

    setupPythonDemo() {
        const skillsApp = this.container.querySelector('.skills-app');
        
        skillsApp.addEventListener('runPython', () => {
            this.runPythonScript();
        });
        
        skillsApp.addEventListener('showAnsible', () => {
            this.showAnsiblePlaybook();
        });
    }

    runPythonScript() {
        const output = this.container.querySelector('#pythonOutput');
        output.innerHTML += '<div class="console-line">$ python3 network_automation.py</div>';
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line">Connecting to devices...</div>';
        }, 500);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line success">✅ 192.168.1.1: Configuration successful</div>';
        }, 1200);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line success">✅ 192.168.1.2: Configuration successful</div>';
        }, 1800);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line success">✅ 192.168.1.3: Configuration successful</div>';
        }, 2400);
        
        setTimeout(() => {
            output.innerHTML += '<div class="console-line">Deployment completed in 2.4 seconds</div>';
        }, 3000);
    }

    showAnsiblePlaybook() {
        const codeContent = this.container.querySelector('#pythonCode');
        codeContent.textContent = `---
- name: Network Device Configuration
  hosts: network_devices
  gather_facts: no
  tasks:
    - name: Configure interface descriptions
      ios_config:
        lines:
          - description "Configured by Ansible"
          - no shutdown
        parents: interface {{ item }}
      with_items:
        - GigabitEthernet0/1
        - GigabitEthernet0/2
        
    - name: Configure VLANs
      ios_vlan:
        vlan_id: "{{ item.id }}"
        name: "{{ item.name }}"
        state: present
      with_items:
        - { id: 10, name: "PRODUCTION" }
        - { id: 20, name: "GUEST" }
        
    - name: Save configuration
      ios_config:
        save_when: always`;
        
        const output = this.container.querySelector('#pythonOutput');
        output.innerHTML += '<div class="console-line">Switched to Ansible playbook view</div>';
    }

    securityDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="security-demo">
                <div class="demo-section">
                    <h4>Network Security Analysis</h4>
                    <div class="security-dashboard">
                        <div class="security-metrics">
                            <div class="metric-card threat-level">
                                <div class="metric-value">LOW</div>
                                <div class="metric-label">Threat Level</div>
                            </div>
                            <div class="metric-card blocked-attacks">
                                <div class="metric-value">1,247</div>
                                <div class="metric-label">Blocked Today</div>
                            </div>
                            <div class="metric-card firewall-rules">
                                <div class="metric-value">340</div>
                                <div class="metric-label">Active Rules</div>
                            </div>
                        </div>
                        <div class="security-events" id="securityEvents">
                            <h5>Recent Security Events</h5>
                            <div class="event-list">
                                <div class="event blocked">🔒 Blocked SSH brute force from 203.0.113.5</div>
                                <div class="event allowed">✅ VPN connection established for user jsmith</div>
                                <div class="event blocked">🔒 Suspicious traffic blocked from 198.51.100.10</div>
                                <div class="event warning">⚠️ High bandwidth usage detected on VLAN 20</div>
                            </div>
                        </div>
                    </div>
                    <div class="demo-controls">
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('scanNetwork'))">🔍 Network Scan</button>
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('showFirewall'))">🔥 Firewall Rules</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupSecurityDemo();
    }

    setupSecurityDemo() {
        const skillsApp = this.container.querySelector('.skills-app');
        
        skillsApp.addEventListener('scanNetwork', () => {
            this.runNetworkScan();
        });
        
        skillsApp.addEventListener('showFirewall', () => {
            this.showFirewallRules();
        });
    }

    runNetworkScan() {
        const events = this.container.querySelector('#securityEvents .event-list');
        events.innerHTML += '<div class="event scanning">🔍 Starting network vulnerability scan...</div>';
        
        setTimeout(() => {
            events.innerHTML += '<div class="event success">✅ Scan completed: 0 critical vulnerabilities found</div>';
        }, 2000);
    }

    showFirewallRules() {
        const events = this.container.querySelector('#securityEvents .event-list');
        events.innerHTML += '<div class="event info">📋 Top Firewall Rules:</div>';
        events.innerHTML += '<div class="event info">  Rule 1: Allow HTTPS from any to DMZ</div>';
        events.innerHTML += '<div class="event info">  Rule 2: Block all from untrusted networks</div>';
        events.innerHTML += '<div class="event info">  Rule 3: Allow SSH from management network</div>';
    }

    cloudDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="cloud-demo">
                <h4>☁️ Cloud Infrastructure Management</h4>
                <div class="cloud-architecture">
                    <div class="aws-region">
                        <h5>AWS us-west-2</h5>
                        <div class="vpc">
                            <div class="vpc-label">VPC: 10.0.0.0/16</div>
                            <div class="subnet public">Public Subnet<br>10.0.1.0/24</div>
                            <div class="subnet private">Private Subnet<br>10.0.2.0/24</div>
                            <div class="nat-gateway">NAT Gateway</div>
                        </div>
                    </div>
                    <div class="demo-controls">
                        <button onclick="this.closest('.skills-app').dispatchEvent(new CustomEvent('deployInfra'))">🚀 Deploy Infrastructure</button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupCloudDemo();
    }

    setupCloudDemo() {
        const skillsApp = this.container.querySelector('.skills-app');
        skillsApp.addEventListener('deployInfra', () => {
            alert('Infrastructure deployment simulation would run here!');
        });
    }

    ansibleDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="ansible-demo">
                <h4>⚙️ Ansible Automation Platform</h4>
                <p>Configuration management and infrastructure automation demonstrations</p>
                <div class="demo-controls">
                    <button>📋 Run Playbook</button>
                    <button>📊 View Inventory</button>
                </div>
            </div>
        `;
    }

    monitoringDemo() {
        const content = this.container.querySelector('#demoContent');
        content.innerHTML = `
            <div class="monitoring-demo">
                <h4>📊 Network Monitoring Dashboard</h4>
                <div class="monitoring-charts">
                    <div class="chart-container">
                        <div class="chart-title">Bandwidth Utilization</div>
                        <div class="bandwidth-chart">
                            <div class="chart-bar" style="height: 60%;">
                                <span>60%</span>
                            </div>
                            <div class="chart-bar" style="height: 40%;">
                                <span>40%</span>
                            </div>
                            <div class="chart-bar" style="height: 80%;">
                                <span>80%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    injectStyles() {
        const styles = `
            <style>
            .skills-app {
                padding: 20px;
                font-family: 'Segoe UI', sans-serif;
            }
            
            .skills-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .skills-header h2 {
                color: var(--primary-color);
                margin-bottom: 10px;
            }
            
            .skills-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .skill-card {
                background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid var(--border-color);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .skill-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(74, 144, 226, 0.2);
            }
            
            .skill-icon {
                font-size: 2rem;
                margin-bottom: 15px;
            }
            
            .skill-info h3 {
                color: var(--text-color);
                margin-bottom: 15px;
            }
            
            .skill-level {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .level-bar {
                flex: 1;
                height: 6px;
                background: rgba(74, 144, 226, 0.2);
                border-radius: 3px;
                overflow: hidden;
            }
            
            .level-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--primary-color), var(--accent-green));
                border-radius: 3px;
                transition: width 1s ease;
            }
            
            .level-text {
                color: var(--primary-color);
                font-weight: bold;
                font-size: 0.9rem;
            }
            
            .skill-meta {
                margin-bottom: 10px;
            }
            
            .years {
                color: var(--accent-green);
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .skill-description {
                color: var(--text-color);
                opacity: 0.8;
                margin-bottom: 15px;
                font-size: 0.9rem;
            }
            
            .skill-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
                margin-bottom: 20px;
            }
            
            .tag {
                background: rgba(74, 144, 226, 0.2);
                color: var(--primary-color);
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                border: 1px solid rgba(74, 144, 226, 0.3);
            }
            
            .demo-btn {
                width: 100%;
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--primary-color) 60%, var(--primary-hover) 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            .demo-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
            }
            
            .demo-overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            
            .demo-container {
                background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
                border-radius: 16px;
                max-width: 900px;
                max-height: 80vh;
                width: 90%;
                overflow: hidden;
                border: 2px solid var(--border-color);
            }
            
            .demo-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .demo-header h3 {
                color: var(--text-color);
                margin: 0;
            }
            
            .demo-close {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .demo-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .demo-content {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .network-demo {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .network-canvas {
                position: relative;
                height: 300px;
                background: #1a1f2a;
                border-radius: 8px;
                border: 2px solid var(--border-color);
            }
            
            .device {
                position: absolute;
                background: var(--primary-color);
                padding: 8px;
                border-radius: 8px;
                text-align: center;
                color: white;
                font-size: 0.8rem;
                cursor: pointer;
                transition: transform 0.3s ease;
            }
            
            .device:hover {
                transform: scale(1.1);
            }
            
            .device-icon {
                font-size: 1.2rem;
                margin-bottom: 4px;
            }
            
            .demo-controls {
                display: flex;
                gap: 10px;
                margin-top: 15px;
            }
            
            .demo-controls button {
                padding: 8px 16px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .demo-controls button:hover {
                background: var(--primary-hover);
            }
            
            .console-output {
                background: #000;
                color: #00ff00;
                padding: 15px;
                border-radius: 8px;
                font-family: 'Monaco', 'Fira Code', monospace;
                font-size: 0.9rem;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .console-line {
                margin-bottom: 5px;
            }
            
            .console-line.success {
                color: #00ff00;
            }
            
            .console-line.error {
                color: #ff4444;
            }
            
            .python-demo {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .code-editor {
                background: #1e1e1e;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .editor-header {
                background: #2d2d2d;
                padding: 10px 15px;
                font-size: 0.9rem;
                color: #cccccc;
            }
            
            .code-content {
                padding: 15px;
                color: #cccccc;
                font-family: 'Monaco', 'Fira Code', monospace;
                font-size: 0.85rem;
                line-height: 1.4;
                max-height: 300px;
                overflow-y: auto;
                margin: 0;
            }
            
            .security-demo {
                max-width: 600px;
            }
            
            .security-dashboard {
                margin-bottom: 20px;
            }
            
            .security-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin-bottom: 20px;
            }
            
            .metric-card {
                text-align: center;
                padding: 15px;
                background: rgba(74, 144, 226, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(74, 144, 226, 0.2);
            }
            
            .metric-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--accent-green);
                margin-bottom: 5px;
            }
            
            .metric-label {
                font-size: 0.9rem;
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .threat-level .metric-value {
                color: var(--accent-green);
            }
            
            .security-events {
                background: #1a1f2a;
                padding: 15px;
                border-radius: 8px;
            }
            
            .security-events h5 {
                color: var(--text-color);
                margin-bottom: 15px;
            }
            
            .event-list {
                max-height: 200px;
                overflow-y: auto;
            }
            
            .event {
                padding: 8px 12px;
                margin-bottom: 8px;
                border-radius: 6px;
                font-size: 0.9rem;
            }
            
            .event.blocked {
                background: rgba(255, 77, 77, 0.1);
                border-left: 3px solid #ff4d4d;
                color: #ffcccc;
            }
            
            .event.allowed {
                background: rgba(0, 208, 132, 0.1);
                border-left: 3px solid #00d084;
                color: #ccffcc;
            }
            
            .event.warning {
                background: rgba(255, 105, 0, 0.1);
                border-left: 3px solid #ff6900;
                color: #ffddcc;
            }
            
            .event.info {
                background: rgba(74, 144, 226, 0.1);
                border-left: 3px solid var(--primary-color);
                color: #cce6ff;
            }
            
            .cloud-demo {
                text-align: center;
            }
            
            .cloud-architecture {
                margin: 20px 0;
            }
            
            .aws-region {
                border: 2px solid var(--primary-color);
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .vpc {
                position: relative;
                border: 2px dashed var(--accent-green);
                border-radius: 8px;
                padding: 20px;
                margin: 15px 0;
            }
            
            .vpc-label {
                position: absolute;
                top: -10px;
                left: 10px;
                background: var(--background-light);
                padding: 0 8px;
                color: var(--accent-green);
                font-size: 0.9rem;
            }
            
            .subnet {
                display: inline-block;
                padding: 15px;
                margin: 10px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
            }
            
            .subnet.public {
                background: var(--primary-color);
            }
            
            .subnet.private {
                background: var(--accent-purple);
            }
            
            .nat-gateway {
                background: var(--accent-orange);
                padding: 10px;
                border-radius: 6px;
                color: white;
                font-weight: 600;
                margin: 10px;
                display: inline-block;
            }
            </style>
        `;
        
        // Inject styles if not already injected
        if (!this.container.querySelector('.skills-app-styles')) {
            const styleElement = document.createElement('div');
            styleElement.className = 'skills-app-styles';
            styleElement.innerHTML = styles;
            this.container.appendChild(styleElement);
        }
    }
} 