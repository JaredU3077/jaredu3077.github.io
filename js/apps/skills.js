/**
 * @file Skills Application - Interactive skills demonstration
 * @author Jared U.
 */

export class SkillsApp {
    constructor(container) {
        this.container = container;
        this.skills = {
            'Network Engineering': {
                level: 95,
                years: 15,
                technologies: ['Cisco', 'Juniper', 'OSPF', 'BGP', 'MPLS', 'VPN'],
                description: 'Expert-level network design, troubleshooting, and optimization'
            },
            'Python Automation': {
                level: 90,
                years: 8,
                technologies: ['Ansible', 'Netmiko', 'Paramiko', 'Flask', 'Django'],
                description: 'Network automation, API development, and infrastructure scripting'
            },
            'Security': {
                level: 85,
                years: 12,
                technologies: ['Firewall', 'IDS/IPS', 'VPN', 'PKI', 'Zero Trust'],
                description: 'Network security implementation and threat mitigation'
            },
            'Cloud Platforms': {
                level: 80,
                years: 6,
                technologies: ['AWS', 'Azure', 'GCP', 'Terraform', 'Docker'],
                description: 'Cloud infrastructure and hybrid network deployment'
            },
            'Monitoring & Analytics': {
                level: 88,
                years: 10,
                technologies: ['SolarWinds', 'PRTG', 'Nagios', 'ELK Stack', 'Grafana'],
                description: 'Network performance monitoring and data analysis'
            },
            'Linux Administration': {
                level: 82,
                years: 12,
                technologies: ['RHEL', 'Ubuntu', 'CentOS', 'Shell Scripting', 'Docker'],
                description: 'Server administration and infrastructure management'
            }
        };
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Skills container not found');
            return;
        }

        this.render();
        this.attachEventListeners();
    }

    render() {
        const skillsHTML = `
            <div class="skills-app" style="padding: 20px;">
                <div class="skills-header" style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: var(--primary-color); margin-bottom: 10px;">🛠️ Technical Skills Matrix</h2>
                    <p style="opacity: 0.8;">15+ years of network engineering expertise</p>
                </div>
                
                <div class="skills-grid" style="display: grid; gap: 20px;">
                    ${Object.entries(this.skills).map(([skill, data]) => `
                        <div class="skill-card" style="background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color); transition: all 0.3s ease;">
                            <div class="skill-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h3 style="margin: 0; font-size: 1.1em;">${skill}</h3>
                                <span class="skill-level" style="background: var(--primary-color); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.9em; font-weight: bold;">${data.level}%</span>
                            </div>
                            
                            <div class="skill-progress" style="background: rgba(74, 144, 226, 0.1); border-radius: 10px; height: 8px; margin-bottom: 15px; overflow: hidden;">
                                <div class="progress-bar" style="background: linear-gradient(90deg, var(--primary-color), var(--primary-hover)); height: 100%; width: ${data.level}%; border-radius: 10px; transition: width 1s ease-out;"></div>
                            </div>
                            
                            <p style="margin: 10px 0; font-size: 0.9em; opacity: 0.9;">${data.description}</p>
                            
                            <div class="skill-meta" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; font-size: 0.85em; opacity: 0.7;">
                                <span>⏱️ ${data.years} years experience</span>
                                <button class="expand-btn" data-skill="${skill}" style="background: transparent; border: 1px solid var(--primary-color); color: var(--primary-color); padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.8em;">
                                    View Technologies
                                </button>
                            </div>
                            
                            <div class="technologies" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                                <p style="margin-bottom: 8px; font-weight: bold; font-size: 0.85em;">Technologies & Tools:</p>
                                <div class="tech-tags" style="display: flex; flex-wrap: wrap; gap: 6px;">
                                    ${data.technologies.map(tech => `
                                        <span style="background: rgba(74, 144, 226, 0.2); color: var(--primary-color); padding: 2px 6px; border-radius: 4px; font-size: 0.75em;">${tech}</span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="skills-footer" style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color);">
                    <h3 style="color: var(--accent-green); margin-bottom: 15px;">📋 Certifications</h3>
                    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 15px;">
                        <div class="cert-badge" style="background: linear-gradient(135deg, #00d084 60%, #00a86b 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9em; font-weight: bold;">
                            🌐 CCNA R&S
                        </div>
                        <div class="cert-badge" style="background: linear-gradient(135deg, #4a90e2 60%, #357ab8 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9em; font-weight: bold;">
                            ☁️ AWS Cloud
                        </div>
                        <div class="cert-badge" style="background: linear-gradient(135deg, #7c53ff 60%, #6a3eff 100%); color: white; padding: 8px 16px; border-radius: 8px; font-size: 0.9em; font-weight: bold;">
                            🔒 Security+
                        </div>
                    </div>
                    <p style="margin-top: 15px; font-size: 0.9em; opacity: 0.8;">
                        Use terminal command 'show skills' for detailed technical breakdown
                    </p>
                </div>
            </div>
        `;

        this.container.innerHTML = skillsHTML;
    }

    attachEventListeners() {
        const expandButtons = this.container.querySelectorAll('.expand-btn');
        expandButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillName = e.target.getAttribute('data-skill');
                const skillCard = e.target.closest('.skill-card');
                const techSection = skillCard.querySelector('.technologies');
                
                if (techSection.style.display === 'none') {
                    techSection.style.display = 'block';
                    e.target.textContent = 'Hide Technologies';
                    skillCard.style.transform = 'translateY(-2px)';
                    skillCard.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.3)';
                } else {
                    techSection.style.display = 'none';
                    e.target.textContent = 'View Technologies';
                    skillCard.style.transform = '';
                    skillCard.style.boxShadow = '';
                }
            });
        });

        // Add hover effects to skill cards
        const skillCards = this.container.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-2px)';
                card.style.boxShadow = '0 8px 25px rgba(74, 144, 226, 0.2)';
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.querySelector('.technologies[style*="block"]')) {
                    card.style.transform = '';
                    card.style.boxShadow = '';
                }
            });
        });
    }
} 