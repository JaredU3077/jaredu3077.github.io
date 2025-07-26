// js/apps/terminal/commands/system.js

export function handleShutdown() {
    return 'System shutdown initiated...';
}

export function handleReboot() {
    return 'System reboot initiated...';
}

export function handleLogout() {
    return 'Logging out...';
}

export function handleExit() {
    return 'Exiting terminal...';
}

export function handleSuspend() {
    return 'System suspended...';
}

export function handleHibernate() {
    return 'System hibernated...';
}

export function handleLock() {
    return 'System locked...';
}

export function handleSystemControl() { return 'System control not implemented'; }

export function handlePerformanceControl(args) {
    if (!args || args.length === 0) {
        return `performance monitoring commands:

performance status    - show current performance metrics
performance optimize  - enable performance optimizations
performance reset     - reset performance settings
performance mode      - toggle performance mode
performance help      - show this help message`;
    }

    const command = args[0].toLowerCase();

    switch (command) {
        case 'status':
            return getPerformanceStatus();
        case 'optimize':
            return enablePerformanceOptimizations();
        case 'reset':
            return resetPerformanceSettings();
        case 'mode':
            return togglePerformanceMode();
        case 'help':
            return handlePerformanceControl([]);
        default:
            return `unknown performance command: ${command}. use 'performance help' for available commands.`;
    }
}

function getPerformanceStatus() {
    const fps = window.neuOS?.performanceMonitor?.metrics?.frameRate || 'unknown';
    const memory = window.neuOS?.performanceMonitor?.metrics?.memoryUsage || 'unknown';
    
    return `performance status:
frame rate: ${fps} fps
memory usage: ${memory}
particle system: ${window.particleSystemInstance?.particleAnimationRunning ? 'enabled' : 'disabled'}
glass effects: ${window.neuOS?.glassMorphismSystem?.enableReflections ? 'enabled' : 'disabled'}
performance mode: ${document.documentElement.style.getPropertyValue('--animation-duration') === '0.1s' ? 'enabled' : 'disabled'}`;
}

function enablePerformanceOptimizations() {
    // Enable performance mode
    if (window.enablePerformanceMode) {
        window.enablePerformanceMode();
    }
    
    // Disable particle system
    if (window.particleSystemInstance) {
        window.particleSystemInstance.particleAnimationRunning = false;
        window.particleSystemInstance.maxParticles = 0;
    }
    
    // Disable glass effects
    if (window.neuOS?.glassMorphismSystem) {
        window.neuOS.glassMorphismSystem.enableReflections = false;
        window.neuOS.glassMorphismSystem.enableBreathingAnimations = false;
        window.neuOS.glassMorphismSystem.enableDistortion = false;
    }
    
    return 'performance optimizations enabled. system should run much smoother now.';
}

function resetPerformanceSettings() {
    // Reset animation durations
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--transition-duration');
    
    // Re-enable particle system
    if (window.particleSystemInstance) {
        window.particleSystemInstance.particleAnimationRunning = true;
        window.particleSystemInstance.maxParticles = 30;
    }
    
    // Re-enable glass effects
    if (window.neuOS?.glassMorphismSystem) {
        window.neuOS.glassMorphismSystem.enableReflections = true;
        window.neuOS.glassMorphismSystem.enableBreathingAnimations = true;
        window.neuOS.glassMorphismSystem.enableDistortion = true;
    }
    
    return 'performance settings reset to default. visual effects re-enabled.';
}

function togglePerformanceMode() {
    const isEnabled = document.documentElement.style.getPropertyValue('--animation-duration') === '0.1s';
    
    if (isEnabled) {
        resetPerformanceSettings();
        return 'performance mode disabled. visual effects re-enabled.';
    } else {
        enablePerformanceOptimizations();
        return 'performance mode enabled. visual effects disabled for better performance.';
    }
}

export function handleScreensaverControl() { return 'Screensaver control not implemented'; }