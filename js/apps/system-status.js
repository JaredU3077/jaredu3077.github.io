/**
 * @file System Status Application - Real-time system diagnostics
 * @author Jared U.
 */

export class SystemStatus {
    constructor(container) {
        this.container = container;
        this.updateInterval = null;
        this.metrics = {
            system: {
                uptime: Date.now(),
                version: 'Neu-OS v1.0.3',
                kernel: 'Linux 5.15.0-neuos',
                architecture: 'x86_64'
            },
            network: {
                status: 'online',
                connections: 42,
                throughput: { rx: 0, tx: 0 },
                latency: 0
            },
            security: {
                status: 'secured',
                threats: 0,
                lastScan: new Date(),
                firewall: 'active'
            },
            performance: {
                cpu: 0,
                memory: 0,
                disk: 0,
                temperature: 0
            }
        };
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('System Status container not found');
            return;
        }

        this.render();
        this.startMonitoring();
        this.attachEventListeners();
    }

    render() {
        const statusHTML = `
            <div class="system-status-app" style="padding: 20px;">
                <div class="status-header" style="text-align: center; margin-bottom: 25px;">
                    <h2 style="color: var(--primary-color); margin-bottom: 10px;">📊 System Status Dashboard</h2>
                    <p style="opacity: 0.8;">Real-time network and system diagnostics</p>
                </div>
                
                <div class="status-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <!-- System Information -->
                    <div class="status-card" style="background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div class="card-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <div style="font-size: 1.5em;">🖥️</div>
                            <h3 style="margin: 0; font-size: 1.1em;">System Information</h3>
                            <div class="status-indicator online" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; margin-left: auto; animation: pulse 2s infinite;"></div>
                        </div>
                        <div class="metric-list">
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>OS Version:</span>
                                <span style="color: var(--primary-color);">${this.metrics.system.version}</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Kernel:</span>
                                <span style="color: var(--primary-color);">${this.metrics.system.kernel}</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Architecture:</span>
                                <span style="color: var(--primary-color);">${this.metrics.system.architecture}</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Uptime:</span>
                                <span id="uptime" style="color: var(--accent-green);">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Network Status -->
                    <div class="status-card" style="background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div class="card-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <div style="font-size: 1.5em;">🌐</div>
                            <h3 style="margin: 0; font-size: 1.1em;">Network Status</h3>
                            <div class="status-indicator online" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; margin-left: auto; animation: pulse 2s infinite;"></div>
                        </div>
                        <div class="metric-list">
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Connection:</span>
                                <span style="color: var(--accent-green);">✅ Online</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Active Connections:</span>
                                <span id="connections" style="color: var(--primary-color);">${this.metrics.network.connections}</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Latency:</span>
                                <span id="latency" style="color: var(--primary-color);">--ms</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Throughput:</span>
                                <span id="throughput" style="color: var(--primary-color);">-- KB/s</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Security Status -->
                    <div class="status-card" style="background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div class="card-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <div style="font-size: 1.5em;">🔒</div>
                            <h3 style="margin: 0; font-size: 1.1em;">Security Status</h3>
                            <div class="status-indicator secure" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; margin-left: auto; animation: pulse 2s infinite;"></div>
                        </div>
                        <div class="metric-list">
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Firewall:</span>
                                <span style="color: var(--accent-green);">🛡️ Active</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Threats Detected:</span>
                                <span style="color: var(--accent-green);">0</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Last Scan:</span>
                                <span id="lastScan" style="color: var(--primary-color);">--</span>
                            </div>
                            <div class="metric" style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9em;">
                                <span>Security Level:</span>
                                <span style="color: var(--accent-green);">🔐 High</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Performance Metrics -->
                    <div class="status-card" style="background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%); border-radius: 12px; padding: 20px; border: 1px solid var(--border-color);">
                        <div class="card-header" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <div style="font-size: 1.5em;">⚡</div>
                            <h3 style="margin: 0; font-size: 1.1em;">Performance</h3>
                            <div class="status-indicator optimal" style="width: 12px; height: 12px; background: var(--accent-green); border-radius: 50%; margin-left: auto; animation: pulse 2s infinite;"></div>
                        </div>
                        <div class="performance-meters">
                            <div class="meter" style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em;">
                                    <span>CPU Usage</span>
                                    <span id="cpu-value" style="color: var(--primary-color);">--</span>
                                </div>
                                <div class="progress-bar" style="background: rgba(74, 144, 226, 0.1); border-radius: 10px; height: 6px;">
                                    <div id="cpu-bar" style="background: linear-gradient(90deg, var(--accent-green), var(--primary-color)); height: 100%; width: 0%; border-radius: 10px; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                            <div class="meter" style="margin-bottom: 15px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em;">
                                    <span>Memory</span>
                                    <span id="memory-value" style="color: var(--primary-color);">--</span>
                                </div>
                                <div class="progress-bar" style="background: rgba(74, 144, 226, 0.1); border-radius: 10px; height: 6px;">
                                    <div id="memory-bar" style="background: linear-gradient(90deg, var(--accent-green), var(--primary-color)); height: 100%; width: 0%; border-radius: 10px; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                            <div class="meter">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9em;">
                                    <span>Disk Usage</span>
                                    <span id="disk-value" style="color: var(--primary-color);">--</span>
                                </div>
                                <div class="progress-bar" style="background: rgba(74, 144, 226, 0.1); border-radius: 10px; height: 6px;">
                                    <div id="disk-bar" style="background: linear-gradient(90deg, var(--accent-green), var(--primary-color)); height: 100%; width: 0%; border-radius: 10px; transition: width 0.5s ease;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions" style="margin-top: 25px; text-align: center;">
                    <h3 style="color: var(--primary-color); margin-bottom: 15px;">Quick Actions</h3>
                    <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                        <button id="refresh-btn" style="background: var(--primary-color); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em;">🔄 Refresh</button>
                        <button id="network-test" style="background: var(--accent-green); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em;">🌐 Network Test</button>
                        <button id="security-scan" style="background: var(--accent-orange); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 0.9em;">🔍 Security Scan</button>
                    </div>
                </div>
                
                <div class="status-footer" style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                    <p style="margin: 0; font-size: 0.8em; opacity: 0.7;">
                        Last updated: <span id="last-updated">--</span> | Auto-refresh: <span style="color: var(--accent-green);">Enabled</span>
                    </p>
                </div>
            </div>
        `;

        this.container.innerHTML = statusHTML;
    }

    startMonitoring() {
        this.updateMetrics();
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 2000);
    }

    updateMetrics() {
        // Update uptime
        const uptime = Math.floor((Date.now() - this.metrics.system.uptime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        const uptimeElement = this.container.querySelector('#uptime');
        if (uptimeElement) {
            uptimeElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
        }

        // Simulate dynamic metrics
        this.metrics.performance.cpu = Math.floor(Math.random() * 30) + 15; // 15-45%
        this.metrics.performance.memory = Math.floor(Math.random() * 25) + 35; // 35-60%
        this.metrics.performance.disk = Math.floor(Math.random() * 10) + 45; // 45-55%
        this.metrics.network.latency = Math.floor(Math.random() * 20) + 5; // 5-25ms
        this.metrics.network.connections = Math.floor(Math.random() * 20) + 35; // 35-55

        // Update performance meters
        this.updatePerformanceBar('cpu', this.metrics.performance.cpu);
        this.updatePerformanceBar('memory', this.metrics.performance.memory);
        this.updatePerformanceBar('disk', this.metrics.performance.disk);

        // Update network metrics
        const latencyElement = this.container.querySelector('#latency');
        if (latencyElement) {
            latencyElement.textContent = `${this.metrics.network.latency}ms`;
        }

        const connectionsElement = this.container.querySelector('#connections');
        if (connectionsElement) {
            connectionsElement.textContent = this.metrics.network.connections.toString();
        }

        const throughputElement = this.container.querySelector('#throughput');
        if (throughputElement) {
            const rx = Math.floor(Math.random() * 500) + 100;
            const tx = Math.floor(Math.random() * 200) + 50;
            throughputElement.textContent = `↓${rx} ↑${tx} KB/s`;
        }

        // Update last scan time
        const lastScanElement = this.container.querySelector('#lastScan');
        if (lastScanElement) {
            lastScanElement.textContent = new Date().toLocaleTimeString();
        }

        // Update last updated time
        const lastUpdatedElement = this.container.querySelector('#last-updated');
        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = new Date().toLocaleTimeString();
        }
    }

    updatePerformanceBar(type, value) {
        const valueElement = this.container.querySelector(`#${type}-value`);
        const barElement = this.container.querySelector(`#${type}-bar`);
        
        if (valueElement && barElement) {
            valueElement.textContent = `${value}%`;
            barElement.style.width = `${value}%`;
            
            // Change color based on usage level
            if (value > 80) {
                barElement.style.background = 'linear-gradient(90deg, var(--accent-red), var(--accent-orange))';
            } else if (value > 60) {
                barElement.style.background = 'linear-gradient(90deg, var(--accent-orange), var(--accent-green))';
            } else {
                barElement.style.background = 'linear-gradient(90deg, var(--accent-green), var(--primary-color))';
            }
        }
    }

    attachEventListeners() {
        const refreshBtn = this.container.querySelector('#refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.updateMetrics();
                refreshBtn.textContent = '✅ Refreshed';
                setTimeout(() => {
                    refreshBtn.textContent = '🔄 Refresh';
                }, 1000);
            });
        }

        const networkTestBtn = this.container.querySelector('#network-test');
        if (networkTestBtn) {
            networkTestBtn.addEventListener('click', () => {
                networkTestBtn.textContent = '🔄 Testing...';
                networkTestBtn.disabled = true;
                
                setTimeout(() => {
                    networkTestBtn.textContent = '✅ Test Complete';
                    setTimeout(() => {
                        networkTestBtn.textContent = '🌐 Network Test';
                        networkTestBtn.disabled = false;
                    }, 2000);
                }, 1500);
            });
        }

        const securityScanBtn = this.container.querySelector('#security-scan');
        if (securityScanBtn) {
            securityScanBtn.addEventListener('click', () => {
                securityScanBtn.textContent = '🔍 Scanning...';
                securityScanBtn.disabled = true;
                
                setTimeout(() => {
                    securityScanBtn.textContent = '✅ No Threats';
                    setTimeout(() => {
                        securityScanBtn.textContent = '🔍 Security Scan';
                        securityScanBtn.disabled = false;
                    }, 2000);
                }, 2000);
            });
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
} 