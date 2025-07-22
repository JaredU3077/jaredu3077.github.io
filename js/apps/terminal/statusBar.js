// js/apps/terminal/statusBar.js

export function initializeStatusBar(terminal) {
    terminal.statusBar = document.querySelector('.terminal-status');
    if (terminal.statusBar) {
        updateStatusBar(terminal);
        // Update status bar every 5 seconds instead of every second for better performance
        setInterval(() => updateStatusBar(terminal), 5000);
    }
}

export function updateStatusBar(terminal) {
    if (!terminal.statusBar || terminal._statusBarDisabled) return;
    
    const statusItems = terminal.statusBar.querySelectorAll('.status-item');
    if (statusItems.length >= 4) {
        // Update status indicator
        const statusIndicator = statusItems[0].querySelector('.status-indicator');
        const statusText = statusItems[0].querySelector('.status-text');
        
        if (terminal.isProcessing) {
            statusIndicator.style.background = '#f59e0b';
            statusText.textContent = 'processing...';
        } else {
            statusIndicator.style.background = '#10b981';
            statusText.textContent = 'ready';
        }
        
        // Update theme
        statusItems[1].querySelector('.status-text').textContent = `theme: ${terminal.currentTheme}`;
        
        // Update history count
        statusItems[2].querySelector('.status-text').textContent = `history: ${terminal.history.length}`;
        
        // Update uptime
        const uptime = calculateUptime(terminal);
        statusItems[3].querySelector('.status-text').textContent = `uptime: ${uptime}`;
    }
}

export function calculateUptime(terminal) {
    const now = Date.now();
    const uptimeMs = now - terminal.commandStartTime;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}