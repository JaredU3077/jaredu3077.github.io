/**
 * @file Projects Application - Interactive project portfolio and case studies
 * @author Jared U.
 */

export class ProjectsApp {
    constructor(container) {
        this.container = container;
        this.projects = {
            'network-modernization': {
                title: 'Enterprise Network Modernization',
                company: 'ArenaNet',
                duration: '2019-2022',
                status: 'Completed',
                icon: '🏗️',
                category: 'Infrastructure',
                technologies: ['Arista', 'Leaf-Spine', 'BGP', 'EVPN', 'Cloud Vision'],
                description: 'Complete network infrastructure overhaul replacing legacy equipment with modern Arista leaf-spine architecture.',
                impact: {
                    'Performance': '+300% throughput improvement',
                    'Reliability': '99.99% uptime achieved',
                    'Scalability': 'Future-ready for 10+ years',
                    'Cost': '$2.3M infrastructure investment'
                },
                demo: () => this.networkModernizationDemo(),
                details: `
                    Led the complete transformation of ArenaNet's network infrastructure, replacing aging equipment 
                    with a state-of-the-art Arista leaf-spine architecture. This project included:
                    
                    • Design and implementation of scalable leaf-spine topology
                    • Migration of 500+ network endpoints with zero downtime
                    • Integration of Arista Cloud Vision for centralized management
                    • Implementation of EVPN for Layer 2/3 services
                    • Staff training and documentation creation
                `
            },
            'security-infrastructure': {
                title: 'Next-Generation Security Platform',
                company: 'ArenaNet',
                duration: '2020-2021',
                status: 'Completed',
                icon: '🔒',
                category: 'Security',
                technologies: ['Palo Alto', 'NGFW', 'GlobalProtect VPN', 'Zero Trust'],
                description: 'Deployed enterprise-grade security infrastructure with next-generation firewalls and VPN.',
                impact: {
                    'Security': '99.8% threat detection rate',
                    'Remote Access': '300+ concurrent VPN users',
                    'Compliance': 'SOC 2 Type II certified',
                    'Incidents': '95% reduction in security events'
                },
                demo: () => this.securityInfrastructureDemo(),
                details: `
                    Designed and deployed comprehensive security infrastructure featuring Palo Alto 5250 NGFWs 
                    in high availability configuration. Key achievements include:
                    
                    • Zero-downtime deployment of HA firewall cluster
                    • Implementation of hundreds of security policies
                    • GlobalProtect VPN supporting remote workforce
                    • Advanced threat prevention and URL filtering
                    • 24/7 security monitoring and incident response
                `
            },
            'automation-platform': {
                title: 'Network Automation & Orchestration',
                company: 'Sound Transit',
                duration: '2022-2023',
                status: 'Completed',
                icon: '🤖',
                category: 'Automation',
                technologies: ['Python', 'Ansible', 'GitLab CI/CD', 'SolarWinds API'],
                description: 'Built comprehensive automation platform for network configuration and monitoring.',
                impact: {
                    'Efficiency': '80% reduction in manual tasks',
                    'Accuracy': '99.5% configuration success rate',
                    'Speed': 'Hours to minutes deployment time',
                    'Visibility': '100% device inventory accuracy'
                },
                demo: () => this.automationPlatformDemo(),
                details: `
                    Developed enterprise automation platform transforming manual network operations into 
                    streamlined, automated processes:
                    
                    • Python-based network device management system
                    • Ansible playbooks for configuration management
                    • GitLab CI/CD pipeline for change management
                    • SolarWinds API integration for monitoring
                    • Custom dashboards and reporting tools
                `
            },
            'cloud-migration': {
                title: 'Hybrid Cloud Network Integration',
                company: 'Denali Advanced Integration',
                duration: '2023-Present',
                status: 'In Progress',
                icon: '☁️',
                category: 'Cloud',
                technologies: ['AWS', 'Azure', 'Direct Connect', 'VPN Gateway', 'Terraform'],
                description: 'Architecting hybrid cloud connectivity for space-to-ground communications.',
                impact: {
                    'Connectivity': 'Multi-cloud redundancy',
                    'Latency': '<50ms space-to-cloud',
                    'Bandwidth': '10Gbps dedicated circuits',
                    'Reliability': '99.99% uptime SLA'
                },
                demo: () => this.cloudMigrationDemo(),
                details: `
                    Currently leading hybrid cloud network architecture for mission-critical space 
                    communications infrastructure:
                    
                    • AWS and Azure multi-region connectivity
                    • Direct Connect and ExpressRoute circuits
                    • Site-to-site VPN backup connectivity
                    • Terraform infrastructure as code
                    • Network segmentation for security compliance
                `
            },
            'disaster-recovery': {
                title: 'Emergency Network Recovery System',
                company: 'Bealls Inc.',
                duration: '2017-2018',
                status: 'Completed',
                icon: '🚨',
                category: 'Disaster Recovery',
                technologies: ['Cradlepoint', '4G LTE', 'SD-WAN', 'Meraki'],
                description: 'Rapid deployment network recovery system for retail locations during disasters.',
                impact: {
                    'Recovery Time': '< 4 hours average',
                    'Stores Protected': '550+ locations',
                    'Revenue Protected': '$100K-$4M per store daily',
                    'Success Rate': '98% restoration success'
                },
                demo: () => this.disasterRecoveryDemo(),
                details: `
                    Engineered and deployed emergency network recovery capabilities protecting retail 
                    operations during natural disasters:
                    
                    • Rapid deployment 4G LTE backup systems
                    • Automated failover to cellular connectivity
                    • Remote troubleshooting and management
                    • Post-disaster network assessment tools
                    • 24/7 emergency response procedures
                `
            },
            'iot-network': {
                title: 'IoT & Smart Building Integration',
                company: 'Multi-Client Project',
                duration: '2021-2022',
                status: 'Completed',
                icon: '🏢',
                category: 'IoT',
                technologies: ['LoRaWAN', 'MQTT', 'Edge Computing', 'Time Series DB'],
                description: 'IoT network infrastructure for smart building automation and monitoring.',
                impact: {
                    'Devices': '1000+ IoT sensors deployed',
                    'Energy Savings': '23% reduction in usage',
                    'Monitoring': 'Real-time building analytics',
                    'Scalability': 'Platform-ready for expansion'
                },
                demo: () => this.iotNetworkDemo(),
                details: `
                    Designed and implemented IoT network infrastructure supporting smart building 
                    automation across multiple facilities:
                    
                    • LoRaWAN gateway deployment and configuration
                    • MQTT broker cluster for device communication
                    • Edge computing nodes for data processing
                    • Time series database for sensor analytics
                    • Custom dashboards for facility management
                `
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
            <div class="projects-app">
                <div class="projects-header">
                    <h2>🚀 Project Portfolio</h2>
                    <p>Real-world network engineering projects and case studies</p>
                    <div class="project-stats">
                        <div class="stat">
                            <div class="stat-value">${Object.keys(this.projects).length}</div>
                            <div class="stat-label">Major Projects</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">15+</div>
                            <div class="stat-label">Years Experience</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">$50M+</div>
                            <div class="stat-label">Infrastructure Value</div>
                        </div>
                    </div>
                </div>
                
                <div class="projects-grid">
                    ${Object.entries(this.projects).map(([key, project]) => `
                        <div class="project-card" data-project="${key}">
                            <div class="project-header">
                                <div class="project-icon">${project.icon}</div>
                                <div class="project-status ${project.status.toLowerCase().replace(' ', '-')}">${project.status}</div>
                            </div>
                            <div class="project-content">
                                <h3>${project.title}</h3>
                                <div class="project-meta">
                                    <span class="company">${project.company}</span>
                                    <span class="duration">${project.duration}</span>
                                </div>
                                <p class="project-description">${project.description}</p>
                                <div class="project-technologies">
                                    ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                                </div>
                                <div class="project-impact-preview">
                                    <h4>Key Impact:</h4>
                                    <div class="impact-item">
                                        <strong>${Object.keys(project.impact)[0]}:</strong> 
                                        ${Object.values(project.impact)[0]}
                                    </div>
                                </div>
                                <div class="project-actions">
                                    <button class="demo-btn" data-project="${key}">
                                        <span>📺 Live Demo</span>
                                    </button>
                                    <button class="details-btn" data-project="${key}">
                                        <span>📋 Case Study</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="project-overlay" id="projectOverlay">
                    <div class="project-modal">
                        <div class="project-modal-header">
                            <h3 id="modalTitle">Project Details</h3>
                            <button class="modal-close" id="modalClose">×</button>
                        </div>
                        <div class="project-modal-content" id="modalContent">
                            <!-- Content will be injected here -->
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
                const projectKey = e.target.closest('.demo-btn').dataset.project;
                this.showDemo(projectKey);
            });
        });

        // Details buttons
        this.container.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const projectKey = e.target.closest('.details-btn').dataset.project;
                this.showDetails(projectKey);
            });
        });

        // Close modal
        const modalClose = this.container.querySelector('#modalClose');
        const overlay = this.container.querySelector('#projectOverlay');
        
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeModal();
                }
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    showDemo(projectKey) {
        const project = this.projects[projectKey];
        if (!project) return;

        const modal = this.container.querySelector('#projectOverlay');
        const title = this.container.querySelector('#modalTitle');
        const content = this.container.querySelector('#modalContent');

        title.textContent = `${project.icon} ${project.title} - Live Demo`;
        modal.style.display = 'flex';

        // Launch specific demo
        project.demo();
    }

    showDetails(projectKey) {
        const project = this.projects[projectKey];
        if (!project) return;

        const modal = this.container.querySelector('#projectOverlay');
        const title = this.container.querySelector('#modalTitle');
        const content = this.container.querySelector('#modalContent');

        title.textContent = `${project.icon} ${project.title} - Case Study`;
        
        content.innerHTML = `
            <div class="case-study">
                <div class="case-study-header">
                    <div class="project-info">
                        <h4>${project.title}</h4>
                        <div class="project-meta">
                            <span><strong>Company:</strong> ${project.company}</span>
                            <span><strong>Duration:</strong> ${project.duration}</span>
                            <span><strong>Category:</strong> ${project.category}</span>
                            <span><strong>Status:</strong> ${project.status}</span>
                        </div>
                    </div>
                </div>
                
                <div class="case-study-content">
                    <div class="section">
                        <h5>Project Overview</h5>
                        <p>${project.description}</p>
                        <div class="details-text">${project.details}</div>
                    </div>
                    
                    <div class="section">
                        <h5>Technologies Used</h5>
                        <div class="tech-grid">
                            ${project.technologies.map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="section">
                        <h5>Business Impact</h5>
                        <div class="impact-grid">
                            ${Object.entries(project.impact).map(([key, value]) => `
                                <div class="impact-card">
                                    <div class="impact-metric">${value}</div>
                                    <div class="impact-label">${key}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = this.container.querySelector('#projectOverlay');
        modal.style.display = 'none';
    }

    // Demo methods for each project
    networkModernizationDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="network-demo">
                <h4>🏗️ Network Architecture Transformation</h4>
                <div class="demo-content">
                    <div class="architecture-comparison">
                        <div class="arch-section">
                            <h5>Legacy Network (Before)</h5>
                            <div class="legacy-topology">
                                <div class="legacy-device core">Core Switch<br>Single Point of Failure</div>
                                <div class="legacy-device access">Access Switch 1</div>
                                <div class="legacy-device access">Access Switch 2</div>
                                <div class="legacy-device access">Access Switch 3</div>
                            </div>
                        </div>
                        <div class="arch-section">
                            <h5>Modern Leaf-Spine (After)</h5>
                            <div class="modern-topology">
                                <div class="spine-tier">
                                    <div class="spine-device">Spine 1</div>
                                    <div class="spine-device">Spine 2</div>
                                </div>
                                <div class="leaf-tier">
                                    <div class="leaf-device">Leaf 1</div>
                                    <div class="leaf-device">Leaf 2</div>
                                    <div class="leaf-device">Leaf 3</div>
                                    <div class="leaf-device">Leaf 4</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="demo-metrics">
                        <h5>Performance Improvements</h5>
                        <div class="metrics-grid">
                            <div class="metric">
                                <div class="metric-before">1 Gbps</div>
                                <div class="metric-arrow">→</div>
                                <div class="metric-after">40 Gbps</div>
                                <div class="metric-label">Core Bandwidth</div>
                            </div>
                            <div class="metric">
                                <div class="metric-before">99.5%</div>
                                <div class="metric-arrow">→</div>
                                <div class="metric-after">99.99%</div>
                                <div class="metric-label">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    securityInfrastructureDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="security-demo">
                <h4>🔒 Security Infrastructure Overview</h4>
                <div class="security-dashboard">
                    <div class="security-metrics">
                        <div class="security-metric">
                            <div class="metric-icon">🛡️</div>
                            <div class="metric-data">
                                <div class="metric-value">99.8%</div>
                                <div class="metric-label">Threat Detection</div>
                            </div>
                        </div>
                        <div class="security-metric">
                            <div class="metric-icon">🚫</div>
                            <div class="metric-data">
                                <div class="metric-value">1,247</div>
                                <div class="metric-label">Threats Blocked Today</div>
                            </div>
                        </div>
                        <div class="security-metric">
                            <div class="metric-icon">🔗</div>
                            <div class="metric-data">
                                <div class="metric-value">300+</div>
                                <div class="metric-label">VPN Connections</div>
                            </div>
                        </div>
                    </div>
                    <div class="security-topology">
                        <div class="firewall-cluster">
                            <div class="firewall active">Palo Alto PA-5250<br>Primary (Active)</div>
                            <div class="firewall standby">Palo Alto PA-5250<br>Secondary (Standby)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    automationPlatformDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="automation-demo">
                <h4>🤖 Network Automation Pipeline</h4>
                <div class="pipeline-flow">
                    <div class="pipeline-stage">
                        <div class="stage-icon">📝</div>
                        <div class="stage-title">Configuration Request</div>
                        <div class="stage-desc">Engineer submits change via GitLab</div>
                    </div>
                    <div class="pipeline-arrow">→</div>
                    <div class="pipeline-stage">
                        <div class="stage-icon">✅</div>
                        <div class="stage-title">Automated Testing</div>
                        <div class="stage-desc">CI/CD validates configuration</div>
                    </div>
                    <div class="pipeline-arrow">→</div>
                    <div class="pipeline-stage">
                        <div class="stage-icon">🚀</div>
                        <div class="stage-title">Deployment</div>
                        <div class="stage-desc">Ansible applies configuration</div>
                    </div>
                    <div class="pipeline-arrow">→</div>
                    <div class="pipeline-stage">
                        <div class="stage-icon">📊</div>
                        <div class="stage-title">Monitoring</div>
                        <div class="stage-desc">SolarWinds verifies changes</div>
                    </div>
                </div>
                <div class="automation-stats">
                    <div class="stat-card">
                        <div class="stat-value">80%</div>
                        <div class="stat-label">Manual Tasks Eliminated</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">99.5%</div>
                        <div class="stat-label">Configuration Success Rate</div>
                    </div>
                </div>
            </div>
        `;
    }

    cloudMigrationDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="cloud-demo">
                <h4>☁️ Hybrid Cloud Architecture</h4>
                <div class="cloud-architecture">
                    <div class="cloud-region aws">
                        <h5>AWS us-west-2</h5>
                        <div class="vpc">
                            <div class="subnet">Production VPC<br>10.0.0.0/16</div>
                        </div>
                        <div class="connection direct-connect">Direct Connect<br>10 Gbps</div>
                    </div>
                    <div class="cloud-region azure">
                        <h5>Azure West US 2</h5>
                        <div class="vnet">
                            <div class="subnet">VNet<br>10.1.0.0/16</div>
                        </div>
                        <div class="connection express-route">ExpressRoute<br>10 Gbps</div>
                    </div>
                    <div class="on-premises">
                        <h5>On-Premises</h5>
                        <div class="datacenter">Primary DC<br>192.168.0.0/16</div>
                    </div>
                </div>
            </div>
        `;
    }

    disasterRecoveryDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="disaster-demo">
                <h4>🚨 Emergency Response System</h4>
                <div class="recovery-timeline">
                    <div class="timeline-event">
                        <div class="event-time">T+0</div>
                        <div class="event-desc">Disaster Detection</div>
                        <div class="event-status emergency">🚨 Alert Triggered</div>
                    </div>
                    <div class="timeline-event">
                        <div class="event-time">T+15min</div>
                        <div class="event-desc">Site Assessment</div>
                        <div class="event-status">📊 Damage Evaluation</div>
                    </div>
                    <div class="timeline-event">
                        <div class="event-time">T+1hr</div>
                        <div class="event-desc">Emergency Deployment</div>
                        <div class="event-status">🚛 Equipment Dispatch</div>
                    </div>
                    <div class="timeline-event">
                        <div class="event-time">T+4hr</div>
                        <div class="event-desc">Service Restoration</div>
                        <div class="event-status success">✅ Network Online</div>
                    </div>
                </div>
            </div>
        `;
    }

    iotNetworkDemo() {
        const content = this.container.querySelector('#modalContent');
        content.innerHTML = `
            <div class="iot-demo">
                <h4>🏢 Smart Building IoT Network</h4>
                <div class="iot-topology">
                    <div class="iot-gateway">
                        <div class="gateway-icon">📡</div>
                        <div class="gateway-label">LoRaWAN Gateway</div>
                    </div>
                    <div class="iot-devices">
                        <div class="iot-device temp">🌡️ Temperature</div>
                        <div class="iot-device humidity">💧 Humidity</div>
                        <div class="iot-device air">💨 Air Quality</div>
                        <div class="iot-device light">💡 Lighting</div>
                        <div class="iot-device occupancy">👥 Occupancy</div>
                        <div class="iot-device energy">⚡ Energy</div>
                    </div>
                </div>
                <div class="iot-metrics">
                    <div class="iot-metric">
                        <div class="metric-value">1,000+</div>
                        <div class="metric-label">Active Sensors</div>
                    </div>
                    <div class="iot-metric">
                        <div class="metric-value">23%</div>
                        <div class="metric-label">Energy Savings</div>
                    </div>
                </div>
            </div>
        `;
    }

    injectStyles() {
        const styles = `
            <style>
            .projects-app {
                padding: 20px;
                font-family: 'Segoe UI', sans-serif;
            }
            
            .projects-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .projects-header h2 {
                color: var(--primary-color);
                margin-bottom: 10px;
            }
            
            .project-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin: 20px 0;
            }
            
            .stat {
                text-align: center;
            }
            
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: var(--accent-green);
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .projects-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 20px;
            }
            
            .project-card {
                background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
                border-radius: 16px;
                padding: 20px;
                border: 1px solid var(--border-color);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            
            .project-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(74, 144, 226, 0.2);
            }
            
            .project-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .project-icon {
                font-size: 2rem;
            }
            
            .project-status {
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .project-status.completed {
                background: var(--accent-green);
                color: white;
            }
            
            .project-status.in-progress {
                background: var(--accent-orange);
                color: white;
            }
            
            .project-content h3 {
                color: var(--text-color);
                margin-bottom: 10px;
            }
            
            .project-meta {
                display: flex;
                gap: 15px;
                margin-bottom: 15px;
                font-size: 0.9rem;
            }
            
            .company {
                color: var(--primary-color);
                font-weight: 600;
            }
            
            .duration {
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .project-description {
                color: var(--text-color);
                opacity: 0.9;
                margin-bottom: 15px;
                font-size: 0.95rem;
                line-height: 1.4;
            }
            
            .project-technologies {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 15px;
            }
            
            .tech-tag {
                background: rgba(74, 144, 226, 0.2);
                color: var(--primary-color);
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
                border: 1px solid rgba(74, 144, 226, 0.3);
            }
            
            .project-impact-preview {
                margin-bottom: 20px;
                padding: 12px;
                background: rgba(0, 208, 132, 0.1);
                border-radius: 8px;
                border-left: 3px solid var(--accent-green);
            }
            
            .project-impact-preview h4 {
                margin: 0 0 8px 0;
                color: var(--accent-green);
                font-size: 0.9rem;
            }
            
            .impact-item {
                font-size: 0.85rem;
                color: var(--text-color);
            }
            
            .project-actions {
                display: flex;
                gap: 10px;
            }
            
            .demo-btn, .details-btn {
                flex: 1;
                padding: 10px 15px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .demo-btn {
                background: linear-gradient(135deg, var(--primary-color) 60%, var(--primary-hover) 100%);
                color: white;
            }
            
            .details-btn {
                background: rgba(74, 144, 226, 0.2);
                color: var(--primary-color);
                border: 1px solid rgba(74, 144, 226, 0.3);
            }
            
            .demo-btn:hover, .details-btn:hover {
                transform: translateY(-2px);
            }
            
            .project-overlay {
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
            
            .project-modal {
                background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
                border-radius: 16px;
                max-width: 900px;
                max-height: 80vh;
                width: 90%;
                overflow: hidden;
                border: 2px solid var(--border-color);
            }
            
            .project-modal-header {
                padding: 20px;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .project-modal-header h3 {
                color: var(--text-color);
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                color: var(--text-color);
                font-size: 1.5rem;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                transition: background 0.3s ease;
            }
            
            .modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .project-modal-content {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            /* Demo-specific styles */
            .architecture-comparison {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 20px 0;
            }
            
            .arch-section {
                text-align: center;
            }
            
            .legacy-topology, .modern-topology {
                padding: 20px;
                border: 2px solid var(--border-color);
                border-radius: 12px;
                margin: 10px 0;
            }
            
            .legacy-device, .spine-device, .leaf-device {
                background: var(--primary-color);
                color: white;
                padding: 10px;
                margin: 8px;
                border-radius: 8px;
                font-size: 0.85rem;
                text-align: center;
            }
            
            .spine-tier, .leaf-tier {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin: 10px 0;
            }
            
            .security-metrics {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                margin: 20px 0;
            }
            
            .security-metric {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 15px;
                background: rgba(74, 144, 226, 0.1);
                border-radius: 8px;
            }
            
            .metric-icon {
                font-size: 1.5rem;
            }
            
            .metric-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: var(--accent-green);
            }
            
            .pipeline-flow {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
            }
            
            .pipeline-stage {
                text-align: center;
                padding: 15px;
                background: rgba(74, 144, 226, 0.1);
                border-radius: 12px;
                min-width: 120px;
            }
            
            .stage-icon {
                font-size: 1.5rem;
                margin-bottom: 8px;
            }
            
            .stage-title {
                font-weight: 600;
                color: var(--text-color);
                margin-bottom: 5px;
            }
            
            .stage-desc {
                font-size: 0.8rem;
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .pipeline-arrow {
                font-size: 1.5rem;
                color: var(--primary-color);
            }
            
            .case-study-content {
                line-height: 1.6;
            }
            
            .section {
                margin-bottom: 25px;
            }
            
            .section h5 {
                color: var(--primary-color);
                margin-bottom: 15px;
                font-size: 1.1rem;
            }
            
            .tech-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .tech-badge {
                background: var(--primary-color);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.9rem;
                font-weight: 600;
            }
            
            .impact-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .impact-card {
                text-align: center;
                padding: 20px;
                background: rgba(0, 208, 132, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(0, 208, 132, 0.3);
            }
            
            .impact-metric {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--accent-green);
                margin-bottom: 8px;
            }
            
            .impact-label {
                color: var(--text-color);
                font-size: 0.9rem;
            }
            
            .details-text {
                white-space: pre-line;
                color: var(--text-color);
                opacity: 0.9;
                line-height: 1.6;
            }
            </style>
        `;
        
        if (!this.container.querySelector('.projects-app-styles')) {
            const styleElement = document.createElement('div');
            styleElement.className = 'projects-app-styles';
            styleElement.innerHTML = styles;
            this.container.appendChild(styleElement);
        }
    }
} 