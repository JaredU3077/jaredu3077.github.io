// js/apps/terminal/theme.js

export function applyTheme(terminal, themeName) {
    // Use the global theme manager for consistency
    const themeManager = window.themeManagerInstance;
    if (themeManager) {
        themeManager.applyTheme(themeName);
        terminal.currentTheme = themeName;
        localStorage.setItem('neuos-theme', themeName);
    } else {
        // Fallback - create a basic theme manager if none exists
        console.warn('Global theme manager not found, creating fallback');
        terminal.currentTheme = themeName;
        localStorage.setItem('neuos-theme', themeName);
    }
}

export function handleThemeSwitch(terminal, args) {
    const [themeName] = args;
    if (!themeName) {
        const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'].join(', ');
        const currentTheme = getCurrentTheme(terminal);
        return `Available themes: ${availableThemes}\nCurrent theme: ${currentTheme}\nUsage: theme <theme-name>`;
    }

    const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'];
    if (availableThemes.includes(themeName)) {
        // Use the global theme manager
        const themeManager = window.themeManagerInstance;
        if (themeManager) {
            themeManager.applyTheme(themeName);
            terminal.currentTheme = themeName;
            return `Theme switched to: ${themeName}`;
        } else {
            // Fallback to local theme
            applyTheme(terminal, themeName);
            return `Theme switched to: ${themeName}`;
        }
    } else {
        const availableThemes = ['default', 'dracula', 'sunset', 'cyberpunk'].join(', ');
        return `Unknown theme: ${themeName}\nAvailable themes: ${availableThemes}`;
    }
}

export function getCurrentTheme(terminal) {
    // Get theme from global theme manager if available
    const themeManager = window.themeManagerInstance;
    if (themeManager) {
        return themeManager.getCurrentTheme();
    }
    return terminal.currentTheme;
}

export function handleThemes(terminal) {
    const themeList = ['default', 'dracula', 'sunset', 'cyberpunk'].map(theme => {
        const isCurrent = theme === terminal.currentTheme ? ' (current)' : '';
        return `  ${theme}${isCurrent}`;
    }).join('\n');
    
    return `Available themes:\n${themeList}\n\nUsage: theme <theme-name>`;
}