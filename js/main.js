// Initialize window manager
const windowManager = new WindowManager();

// Initialize start menu functionality
const startBtn = document.getElementById('startBtn');
const startMenu = document.querySelector('.start-menu');

startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    startMenu.style.display = startMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.start-menu') && !e.target.closest('.start-btn')) {
        startMenu.style.display = 'none';
    }
});

// Handle desktop icon clicks
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const appId = icon.dataset.app;
        switch (appId) {
            case 'network-monitor':
                createNetworkMonitorWindow();
                break;
            case 'device-manager':
                createDeviceManagerWindow();
                break;
            case 'terminal':
                createTerminalWindow();
                break;
            case 'codex':
                createCodexWindow();
                break;
        }
    });
});

// Handle taskbar button clicks
document.querySelectorAll('.taskbar-icon').forEach(button => {
    button.addEventListener('click', () => {
        const appId = button.dataset.app;
        switch (appId) {
            case 'network-monitor':
                createNetworkMonitorWindow();
                break;
            case 'device-manager':
                createDeviceManagerWindow();
                break;
            case 'terminal':
                createTerminalWindow();
                break;
            case 'codex':
                createCodexWindow();
                break;
        }
    });
});

// Window creation functions
function createNetworkMonitorWindow() {
    const existingWindow = document.getElementById('network-monitor-window');
    if (existingWindow) {
        windowManager.focusWindow(existingWindow);
        return;
    }

    windowManager.createWindow({
        id: 'network-monitor-window',
        title: 'Network Monitor',
        icon: 'fa-network-wired',
        content: `
            <div class="network-monitor">
                <div class="network-status">
                    <h3>Network Status</h3>
                    <div class="status-indicator online">
                        <span class="status-dot"></span>
                        Online
                    </div>
                    <div class="network-stats">
                        <div class="stat">
                            <span class="label">Uptime:</span>
                            <span class="value">99.9%</span>
                        </div>
                        <div class="stat">
                            <span class="label">Latency:</span>
                            <span class="value">15ms</span>
                        </div>
                        <div class="stat">
                            <span class="label">Packets:</span>
                            <span class="value">1.2M/s</span>
                        </div>
                    </div>
                </div>
                <div class="network-graph">
                    <canvas id="networkGraph"></canvas>
                </div>
            </div>
        `
    });
}

function createDeviceManagerWindow() {
    const existingWindow = document.getElementById('device-manager-window');
    if (existingWindow) {
        windowManager.focusWindow(existingWindow);
        return;
    }

    windowManager.createWindow({
        id: 'device-manager-window',
        title: 'Device Manager',
        icon: 'fa-server',
        content: `
            <div class="device-manager">
                <div class="device-list">
                    <h3>Connected Devices</h3>
                    <div class="device">
                        <i class="fas fa-router"></i>
                        <span class="device-name">Core Router</span>
                        <span class="device-status online">Online</span>
                    </div>
                    <div class="device">
                        <i class="fas fa-switch"></i>
                        <span class="device-name">Distribution Switch</span>
                        <span class="device-status online">Online</span>
                    </div>
                    <div class="device">
                        <i class="fas fa-wifi"></i>
                        <span class="device-name">Access Point</span>
                        <span class="device-status online">Online</span>
                    </div>
                </div>
                <div class="device-details">
                    <h3>Device Details</h3>
                    <div class="details-content">
                        Select a device to view details
                    </div>
                </div>
            </div>
        `
    });
}

function createTerminalWindow() {
    const existingWindow = document.getElementById('terminal-window');
    if (existingWindow) {
        windowManager.focusWindow(existingWindow);
        return;
    }

    windowManager.createWindow({
        id: 'terminal-window',
        title: 'Terminal',
        icon: 'fa-terminal',
        content: `
            <div class="terminal">
                <div id="terminalOutput"></div>
                <div class="terminal-input">
                    <span class="prompt">$</span>
                    <input type="text" id="terminalInput" autofocus>
                </div>
            </div>
        `
    });

    // Initialize terminal functionality
    const terminal = new Terminal();
    terminal.init();
}

function createCodexWindow() {
    const existingWindow = document.getElementById('codex-window');
    if (existingWindow) {
        windowManager.focusWindow(existingWindow);
        return;
    }

    windowManager.createWindow({
        id: 'codex-window',
        title: 'Network Codex',
        icon: 'fa-book',
        content: `
            <div class="codex">
                <div class="codex-sidebar">
                    <div class="search-box">
                        <input type="text" placeholder="Search...">
                        <i class="fas fa-search"></i>
                    </div>
                    <div class="category-list">
                        <div class="category active">Protocols</div>
                        <div class="category">Routing</div>
                        <div class="category">Security</div>
                        <div class="category">Tools</div>
                    </div>
                </div>
                <div class="codex-content">
                    <div class="content-header">
                        <h2>Network Protocols</h2>
                    </div>
                    <div class="content-body">
                        <div class="protocol-card">
                            <h3>TCP/IP</h3>
                            <p>The fundamental protocol suite of the Internet.</p>
                        </div>
                        <div class="protocol-card">
                            <h3>OSPF</h3>
                            <p>Open Shortest Path First routing protocol.</p>
                        </div>
                        <div class="protocol-card">
                            <h3>BGP</h3>
                            <p>Border Gateway Protocol for inter-domain routing.</p>
                        </div>
                    </div>
                </div>
            </div>
        `
    });
}

// Start network updates
function startNetworkUpdates() {
    // Update network status every 5 seconds
    setInterval(() => {
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            const isOnline = Math.random() > 0.1; // 90% chance of being online
            statusIndicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
            statusIndicator.innerHTML = `
                <span class="status-dot"></span>
                ${isOnline ? 'Online' : 'Offline'}
            `;
        }
    }, 5000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    startNetworkUpdates();
}); 