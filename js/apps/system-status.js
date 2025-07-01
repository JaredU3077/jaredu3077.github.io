/**
 * @file System Status Application - Real-time system diagnostics and monitoring
 * @author Jared U.
 */

export class SystemStatus {
    constructor(container) {
        this.container = container;
        this.updateInterval = null;
        this.startTime = Date.now();
        this.metrics = {
            cpu: 0,
            memory: 0,
            network: 0,
            disk: 0
        };
        this.init();
    }

    init() {
        this.render();
        this.setupEventListeners();
        this.startMonitoring();
    }

    render() {
        this.container.innerHTML = `
            <div class="system-status-app">
                <div class="status-header">
                    <h2>⚡ Neu-OS System Status</h2>
                    <p>Real-time system diagnostics and performance monitoring</p>
                    <div class="system-time" id="systemTime">${new Date().toLocaleString()}</div>
                </div>
                
                <div class="status-grid">
                    <div class="status-section system-overview">
                        <h3>🖥️ System Overview</h3>
                        <div class="overview-metrics">
                            <div class="metric-card">
                                <div class="metric-icon">⏱️</div>
                                <div class="metric-info">
                                    <div class="metric-label">System Uptime</div>
                                    <div class="metric-value" id="uptime">0d 0h 0m</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">🔧</div>
                                <div class="metric-info">
                                    <div class="metric-label">OS Version</div>
                                    <div class="metric-value">Neu-OS v2.1.4</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">👤</div>
                                <div class="metric-info">
                                    <div class="metric-label">Current User</div>
                                    <div class="metric-value">jared.u@senior-engineer</div>
                                </div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-icon">🌐</div>
                                <div class="metric-info">
                                    <div class="metric-label">Network Status</div>
                                    <div class="metric-value status-online">Online</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-section performance-metrics">
                        <h3>📊 Performance Metrics</h3>
                        <div class="performance-grid">
                            <div class="perf-metric">
                                <div class="perf-header">
                                    <span class="perf-label">🔥 CPU Usage</span>
                                    <span class="perf-value" id="cpuValue">0%</span>
                                </div>
                                <div class="perf-bar">
                                    <div class="perf-fill cpu" id="cpuBar"></div>
                                </div>
                            </div>
                            <div class="perf-metric">
                                <div class="perf-header">
                                    <span class="perf-label">💾 Memory Usage</span>
                                    <span class="perf-value" id="memoryValue">0%</span>
                                </div>
                                <div class="perf-bar">
                                    <div class="perf-fill memory" id="memoryBar"></div>
                                </div>
                            </div>
                            <div class="perf-metric">
                                <div class="perf-header">
                                    <span class="perf-label">🌐 Network I/O</span>
                                    <span class="perf-value" id="networkValue">0%</span>
                                </div>
                                <div class="perf-bar">
                                    <div class="perf-fill network" id="networkBar"></div>
                                </div>
                            </div>
                            <div class="perf-metric">
                                <div class="perf-header">
                                    <span class="perf-label">💿 Disk Usage</span>
                                    <span class="perf-value" id="diskValue">0%</span>
                                </div>
                                <div class="perf-bar">
                                    <div class="perf-fill disk" id="diskBar"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-section active-processes">
                        <h3>⚙️ Running Applications</h3>
                        <div class="process-list" id="processList">
                            <div class="process-item">
                                <div class="process-info">
                                    <div class="process-name">neu-os-kernel</div>
                                    <div class="process-details">PID: 1 | CPU: 2.1% | Memory: 45.2 MB</div>
                                </div>
                                <div class="process-status running">Running</div>
                            </div>
                            <div class="process-item">
                                <div class="process-info">
                                    <div class="process-name">window-manager</div>
                                    <div class="process-details">PID: 247 | CPU: 1.8% | Memory: 28.7 MB</div>
                                </div>
                                <div class="process-status running">Running</div>
                            </div>
                            <div class="process-item">
                                <div class="process-info">
                                    <div class="process-name">network-stack</div>
                                    <div class="process-details">PID: 156 | CPU: 0.9% | Memory: 15.3 MB</div>
                                </div>
                                <div class="process-status running">Running</div>
                            </div>
                            <div class="process-item">
                                <div class="process-info">
                                    <div class="process-name">terminal-service</div>
                                    <div class="process-details">PID: 892 | CPU: 0.5% | Memory: 12.1 MB</div>
                                </div>
                                <div class="process-status running">Running</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-section network-status">
                        <h3>🌐 Network Information</h3>
                        <div class="network-info">
                            <div class="network-interface">
                                <div class="interface-header">
                                    <span class="interface-name">eth0 (Primary)</span>
                                    <span class="interface-status active">Active</span>
                                </div>
                                <div class="interface-details">
                                    <div class="detail-row">
                                        <span class="detail-label">IP Address:</span>
                                        <span class="detail-value">192.168.1.100</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Subnet Mask:</span>
                                        <span class="detail-value">255.255.255.0</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">Gateway:</span>
                                        <span class="detail-value">192.168.1.1</span>
                                    </div>
                                    <div class="detail-row">
                                        <span class="detail-label">DNS:</span>
                                        <span class="detail-value">8.8.8.8, 1.1.1.1</span>
                                    </div>
                                </div>
                            </div>
                            <div class="network-stats">
                                <div class="stat-item">
                                    <div class="stat-icon">📥</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="bytesReceived">0 MB</div>
                                        <div class="stat-label">Bytes Received</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-icon">📤</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="bytesSent">0 MB</div>
                                        <div class="stat-label">Bytes Sent</div>
                                    </div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-icon">📶</div>
                                    <div class="stat-info">
                                        <div class="stat-value" id="connectionSpeed">1 Gbps</div>
                                        <div class="stat-label">Link Speed</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-section system-health">
                        <h3>🏥 System Health</h3>
                        <div class="health-indicators">
                            <div class="health-item">
                                <div class="health-icon status-good">✅</div>
                                <div class="health-info">
                                    <div class="health-name">Core System</div>
                                    <div class="health-status">Optimal</div>
                                </div>
                            </div>
                            <div class="health-item">
                                <div class="health-icon status-good">✅</div>
                                <div class="health-info">
                                    <div class="health-name">Memory Management</div>
                                    <div class="health-status">Stable</div>
                                </div>
                            </div>
                            <div class="health-item">
                                <div class="health-icon status-good">✅</div>
                                <div class="health-info">
                                    <div class="health-name">Network Stack</div>
                                    <div class="health-status">Connected</div>
                                </div>
                            </div>
                            <div class="health-item">
                                <div class="health-icon status-warning">⚠️</div>
                                <div class="health-info">
                                    <div class="health-name">Temperature</div>
                                    <div class="health-status">Normal (72°F)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-section system-logs">
                        <h3>📋 Recent System Events</h3>
                        <div class="log-container" id="logContainer">
                            <div class="log-entry info">
                                <span class="log-time">${this.formatTime(new Date())}</span>
                                <span class="log-level">INFO</span>
                                <span class="log-message">System status application initialized</span>
                            </div>
                            <div class="log-entry success">
                                <span class="log-time">${this.formatTime(new Date(Date.now() - 30000))}</span>
                                <span class="log-level">SUCCESS</span>
                                <span class="log-message">Network connection established</span>
                            </div>
                            <div class="log-entry info">
                                <span class="log-time">${this.formatTime(new Date(Date.now() - 60000))}</span>
                                <span class="log-level">INFO</span>
                                <span class="log-message">User session started</span>
                            </div>
                            <div class="log-entry success">
                                <span class="log-time">${this.formatTime(new Date(Date.now() - 120000))}</span>
                                <span class="log-level">SUCCESS</span>
                                <span class="log-message">Boot sequence completed successfully</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="status-controls">
                    <button class="control-btn" id="refreshBtn">
                        <span>🔄 Refresh</span>
                    </button>
                    <button class="control-btn" id="exportBtn">
                        <span>📊 Export Report</span>
                    </button>
                    <button class="control-btn" id="clearLogsBtn">
                        <span>🗑️ Clear Logs</span>
                    </button>
                </div>
            </div>
        `;
        
        this.injectStyles();
    }

    setupEventListeners() {
        const refreshBtn = this.container.querySelector('#refreshBtn');
        const exportBtn = this.container.querySelector('#exportBtn');
        const clearLogsBtn = this.container.querySelector('#clearLogsBtn');

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }

        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => this.clearLogs());
        }
    }

    startMonitoring() {
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
            this.updateUptime();
            this.updateTime();
            this.simulateNetworkTraffic();
        }, 2000);

        // Initial update
        this.updateMetrics();
        this.updateUptime();
    }

    updateMetrics() {
        // Simulate realistic system metrics
        this.metrics.cpu = Math.max(5, Math.min(95, this.metrics.cpu + (Math.random() - 0.5) * 10));
        this.metrics.memory = Math.max(20, Math.min(80, this.metrics.memory + (Math.random() - 0.5) * 8));
        this.metrics.network = Math.max(0, Math.min(100, Math.random() * 30));
        this.metrics.disk = Math.max(35, Math.min(75, 45 + Math.sin(Date.now() / 10000) * 10));

        // Update CPU
        const cpuValue = this.container.querySelector('#cpuValue');
        const cpuBar = this.container.querySelector('#cpuBar');
        if (cpuValue && cpuBar) {
            cpuValue.textContent = `${Math.round(this.metrics.cpu)}%`;
            cpuBar.style.width = `${this.metrics.cpu}%`;
        }

        // Update Memory
        const memoryValue = this.container.querySelector('#memoryValue');
        const memoryBar = this.container.querySelector('#memoryBar');
        if (memoryValue && memoryBar) {
            memoryValue.textContent = `${Math.round(this.metrics.memory)}%`;
            memoryBar.style.width = `${this.metrics.memory}%`;
        }

        // Update Network
        const networkValue = this.container.querySelector('#networkValue');
        const networkBar = this.container.querySelector('#networkBar');
        if (networkValue && networkBar) {
            networkValue.textContent = `${Math.round(this.metrics.network)}%`;
            networkBar.style.width = `${this.metrics.network}%`;
        }

        // Update Disk
        const diskValue = this.container.querySelector('#diskValue');
        const diskBar = this.container.querySelector('#diskBar');
        if (diskValue && diskBar) {
            diskValue.textContent = `${Math.round(this.metrics.disk)}%`;
            diskBar.style.width = `${this.metrics.disk}%`;
        }
    }

    updateUptime() {
        const uptimeElement = this.container.querySelector('#uptime');
        if (uptimeElement) {
            const uptime = Date.now() - this.startTime;
            const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
            const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            uptimeElement.textContent = `${days}d ${hours}h ${minutes}m`;
        }
    }

    updateTime() {
        const timeElement = this.container.querySelector('#systemTime');
        if (timeElement) {
            timeElement.textContent = new Date().toLocaleString();
        }
    }

    simulateNetworkTraffic() {
        const bytesReceived = this.container.querySelector('#bytesReceived');
        const bytesSent = this.container.querySelector('#bytesSent');
        
        if (bytesReceived && bytesSent) {
            const received = Math.floor(Math.random() * 1000 + 500);
            const sent = Math.floor(Math.random() * 800 + 300);
            bytesReceived.textContent = `${received} MB`;
            bytesSent.textContent = `${sent} MB`;
        }
    }

    refreshData() {
        this.addLogEntry('INFO', 'Manual system refresh initiated');
        this.updateMetrics();
        this.updateUptime();
        this.updateTime();
        
        // Visual feedback
        const refreshBtn = this.container.querySelector('#refreshBtn');
        if (refreshBtn) {
            const originalText = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<span>🔄 Refreshing...</span>';
            refreshBtn.disabled = true;
            
            setTimeout(() => {
                refreshBtn.innerHTML = originalText;
                refreshBtn.disabled = false;
                this.addLogEntry('SUCCESS', 'System data refreshed successfully');
            }, 1000);
        }
    }

    exportReport() {
        this.addLogEntry('INFO', 'System report export requested');
        
        const reportData = {
            timestamp: new Date().toISOString(),
            uptime: this.container.querySelector('#uptime')?.textContent,
            metrics: this.metrics,
            networkInfo: {
                ip: '192.168.1.100',
                gateway: '192.168.1.1',
                dns: '8.8.8.8, 1.1.1.1'
            }
        };

        // Simulate report generation
        const exportBtn = this.container.querySelector('#exportBtn');
        if (exportBtn) {
            const originalText = exportBtn.innerHTML;
            exportBtn.innerHTML = '<span>📊 Generating...</span>';
            exportBtn.disabled = true;
            
            setTimeout(() => {
                exportBtn.innerHTML = '<span>✅ Report Ready</span>';
                this.addLogEntry('SUCCESS', 'System report generated successfully');
                
                setTimeout(() => {
                    exportBtn.innerHTML = originalText;
                    exportBtn.disabled = false;
                }, 2000);
            }, 1500);
        }
    }

    clearLogs() {
        const logContainer = this.container.querySelector('#logContainer');
        if (logContainer) {
            logContainer.innerHTML = '';
            this.addLogEntry('INFO', 'System logs cleared by user');
        }
    }

    addLogEntry(level, message) {
        const logContainer = this.container.querySelector('#logContainer');
        if (logContainer) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${level.toLowerCase()}`;
            logEntry.innerHTML = `
                <span class="log-time">${this.formatTime(new Date())}</span>
                <span class="log-level">${level}</span>
                <span class="log-message">${message}</span>
            `;
            
            logContainer.insertBefore(logEntry, logContainer.firstChild);
            
            // Keep only last 10 entries
            while (logContainer.children.length > 10) {
                logContainer.removeChild(logContainer.lastChild);
            }
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString();
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    injectStyles() {
        const styles = `
            <style>
            .system-status-app {
                padding: 20px;
                font-family: 'Fira Code', 'Monaco', monospace;
                color: var(--text-color);
            }
            
            .status-header {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .status-header h2 {
                color: var(--primary-color);
                margin-bottom: 10px;
                font-size: 1.8rem;
            }
            
            .system-time {
                font-size: 1rem;
                color: var(--accent-green);
                font-weight: 600;
                margin-top: 10px;
            }
            
            .status-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .status-section {
                background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid var(--border-color);
                box-shadow: var(--neu-shadow);
            }
            
            .status-section h3 {
                color: var(--primary-color);
                margin-bottom: 20px;
                font-size: 1.1rem;
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 10px;
            }
            
            .overview-metrics {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
            }
            
            .metric-card {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 15px;
                background: rgba(74, 144, 226, 0.1);
                border-radius: 8px;
                border: 1px solid rgba(74, 144, 226, 0.2);
            }
            
            .metric-icon {
                font-size: 1.5rem;
            }
            
            .metric-label {
                font-size: 0.85rem;
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .metric-value {
                font-size: 1rem;
                font-weight: 600;
                color: var(--text-color);
            }
            
            .status-online {
                color: var(--accent-green) !important;
            }
            
            .performance-grid {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .perf-metric {
                background: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 8px;
            }
            
            .perf-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .perf-label {
                font-size: 0.9rem;
                color: var(--text-color);
            }
            
            .perf-value {
                font-weight: 600;
                color: var(--accent-green);
            }
            
            .perf-bar {
                height: 8px;
                background: rgba(74, 144, 226, 0.2);
                border-radius: 4px;
                overflow: hidden;
            }
            
            .perf-fill {
                height: 100%;
                border-radius: 4px;
                transition: width 0.5s ease;
            }
            
            .perf-fill.cpu {
                background: linear-gradient(90deg, var(--accent-green), var(--accent-orange));
            }
            
            .perf-fill.memory {
                background: linear-gradient(90deg, var(--primary-color), var(--accent-purple));
            }
            
            .perf-fill.network {
                background: linear-gradient(90deg, var(--accent-green), var(--primary-color));
            }
            
            .perf-fill.disk {
                background: linear-gradient(90deg, var(--accent-orange), var(--accent-red));
            }
            
            .process-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .process-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: rgba(0, 0, 0, 0.2);
                border-radius: 6px;
                border-left: 3px solid var(--accent-green);
            }
            
            .process-name {
                font-weight: 600;
                color: var(--text-color);
                font-size: 0.9rem;
            }
            
            .process-details {
                font-size: 0.8rem;
                color: var(--text-color);
                opacity: 0.7;
                margin-top: 3px;
            }
            
            .process-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .process-status.running {
                background: var(--accent-green);
                color: white;
            }
            
            .network-interface {
                margin-bottom: 20px;
            }
            
            .interface-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .interface-name {
                font-weight: 600;
                color: var(--text-color);
            }
            
            .interface-status {
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .interface-status.active {
                background: var(--accent-green);
                color: white;
            }
            
            .interface-details {
                background: rgba(0, 0, 0, 0.2);
                padding: 15px;
                border-radius: 8px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            
            .detail-row:last-child {
                margin-bottom: 0;
            }
            
            .detail-label {
                color: var(--text-color);
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            .detail-value {
                color: var(--primary-color);
                font-weight: 600;
                font-size: 0.9rem;
            }
            
            .network-stats {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
            }
            
            .stat-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 12px;
                background: rgba(74, 144, 226, 0.1);
                border-radius: 8px;
            }
            
            .stat-icon {
                font-size: 1.2rem;
            }
            
            .stat-value {
                font-weight: 600;
                color: var(--accent-green);
                font-size: 0.9rem;
            }
            
            .stat-label {
                font-size: 0.8rem;
                color: var(--text-color);
                opacity: 0.8;
            }
            
            .health-indicators {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            
            .health-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 12px;
                background: rgba(0, 208, 132, 0.1);
                border-radius: 8px;
                border-left: 3px solid var(--accent-green);
            }
            
            .health-icon {
                font-size: 1.2rem;
            }
            
            .health-name {
                font-weight: 600;
                color: var(--text-color);
                font-size: 0.9rem;
            }
            
            .health-status {
                font-size: 0.8rem;
                color: var(--accent-green);
                opacity: 0.9;
            }
            
            .log-container {
                max-height: 200px;
                overflow-y: auto;
                background: rgba(0, 0, 0, 0.3);
                border-radius: 8px;
                padding: 10px;
            }
            
            .log-entry {
                display: flex;
                gap: 10px;
                padding: 8px;
                margin-bottom: 5px;
                border-radius: 4px;
                font-size: 0.85rem;
                font-family: 'Fira Code', monospace;
            }
            
            .log-entry.info {
                background: rgba(74, 144, 226, 0.1);
                border-left: 3px solid var(--primary-color);
            }
            
            .log-entry.success {
                background: rgba(0, 208, 132, 0.1);
                border-left: 3px solid var(--accent-green);
            }
            
            .log-entry.warning {
                background: rgba(255, 105, 0, 0.1);
                border-left: 3px solid var(--accent-orange);
            }
            
            .log-time {
                color: var(--text-color);
                opacity: 0.7;
                min-width: 80px;
            }
            
            .log-level {
                font-weight: 600;
                min-width: 60px;
            }
            
            .log-entry.info .log-level {
                color: var(--primary-color);
            }
            
            .log-entry.success .log-level {
                color: var(--accent-green);
            }
            
            .log-entry.warning .log-level {
                color: var(--accent-orange);
            }
            
            .log-message {
                color: var(--text-color);
                flex: 1;
            }
            
            .status-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 20px;
            }
            
            .control-btn {
                padding: 12px 20px;
                background: linear-gradient(135deg, var(--primary-color) 60%, var(--primary-hover) 100%);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .control-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(74, 144, 226, 0.4);
            }
            
            .control-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }
            
            /* Scrollbar styling */
            .log-container::-webkit-scrollbar {
                width: 6px;
            }
            
            .log-container::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }
            
            .log-container::-webkit-scrollbar-thumb {
                background: var(--primary-color);
                border-radius: 3px;
            }
            
            .log-container::-webkit-scrollbar-thumb:hover {
                background: var(--primary-hover);
            }
            </style>
        `;
        
        if (!this.container.querySelector('.system-status-styles')) {
            const styleElement = document.createElement('div');
            styleElement.className = 'system-status-styles';
            styleElement.innerHTML = styles;
            this.container.appendChild(styleElement);
        }
    }
} 