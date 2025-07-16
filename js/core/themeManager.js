/**
 * @file Theme Manager - Comprehensive theming system for neuOS
 * @author Jared U.
 * @tags neu-os
 */

export class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('neuos-theme') || 'default';
        this.themes = {
            default: {
                name: 'default',
                // Primary colors
                primary: '#6366f1',
                primaryHover: '#4f46e5',
                primaryLight: '#818cf8',
                primaryDark: '#4338ca',
                primaryGlow: 'rgba(99, 102, 241, 0.15)',
                
                // Background colors
                backgroundDark: '#030712',
                backgroundLight: '#0a0f1a',
                backgroundMedium: '#1a1f2e',
                backgroundElevated: '#2a2f3e',
                backgroundGlass: 'rgba(26, 31, 46, 0.8)',
                backgroundGlassStrong: 'rgba(26, 31, 46, 0.95)',
                
                // UI colors
                windowBg: 'rgba(255, 255, 255, 0.001)',
                windowBackdrop: 'blur(8px) saturate(140%) brightness(110%)',
                windowBorder: 'rgba(255,255,255,0.05)',
                textColor: '#f8fafc',
                textSecondary: '#cbd5e1',
                textMuted: '#94a3b8',
                borderColor: '#475569',
                borderLight: '#64748b',
                
                // Accent colors
                accentGreen: '#10b981',
                accentOrange: '#f59e0b',
                accentPurple: '#8b5cf6',
                accentRed: '#ef4444',
                accentCyan: '#06b6d4',
                accentYellow: '#fbbf24',
                accentBlue: '#3b82f6',
                
                // Terminal specific
                terminalBg: 'rgba(255, 255, 255, 0.001)',
                terminalBackdrop: 'blur(8px) saturate(140%) brightness(110%)',
                terminalBorder: 'rgba(255,255,255,0.05)',
                terminalText: '#f8fafc',
                terminalPrompt: '#6366f1',
                terminalError: '#ef4444',
                terminalSuccess: '#10b981',
                terminalWarning: '#f59e0b'
            },
            dracula: {
                name: 'dracula',
                // Primary colors
                primary: '#bd93f9',
                primaryHover: '#a855f7',
                primaryLight: '#c084fc',
                primaryDark: '#9333ea',
                primaryGlow: 'rgba(189, 147, 249, 0.15)',
                
                // Background colors
                backgroundDark: '#282a36',
                backgroundLight: '#44475a',
                backgroundMedium: '#6272a4',
                backgroundElevated: '#44475a',
                backgroundGlass: 'rgba(68, 71, 90, 0.8)',
                backgroundGlassStrong: 'rgba(68, 71, 90, 0.95)',
                
                // UI colors
                windowBg: 'rgba(40, 42, 54, 0.95)',
                windowBackdrop: 'blur(12px) saturate(120%)',
                windowBorder: 'rgba(189, 147, 249, 0.3)',
                textColor: '#f8f8f2',
                textSecondary: '#f1fa8c',
                textMuted: '#6272a4',
                borderColor: '#44475a',
                borderLight: '#6272a4',
                
                // Accent colors
                accentGreen: '#50fa7b',
                accentOrange: '#ffb86c',
                accentPurple: '#bd93f9',
                accentRed: '#ff5555',
                accentCyan: '#8be9fd',
                accentYellow: '#f1fa8c',
                accentBlue: '#6272a4',
                
                // Terminal specific
                terminalBg: 'rgba(40, 42, 54, 0.95)',
                terminalBackdrop: 'blur(12px) saturate(120%)',
                terminalBorder: 'rgba(189, 147, 249, 0.3)',
                terminalText: '#f8f8f2',
                terminalPrompt: '#bd93f9',
                terminalError: '#ff5555',
                terminalSuccess: '#50fa7b',
                terminalWarning: '#ffb86c'
            },
            sunset: {
                name: 'sunset',
                // Primary colors
                primary: '#ff6347',
                primaryHover: '#dc2626',
                primaryLight: '#f87171',
                primaryDark: '#b91c1c',
                primaryGlow: 'rgba(255, 99, 71, 0.15)',
                
                // Background colors
                backgroundDark: '#1a0f0f',
                backgroundLight: '#2d1b1b',
                backgroundMedium: '#4a2c2c',
                backgroundElevated: '#5a3535',
                backgroundGlass: 'rgba(74, 44, 44, 0.8)',
                backgroundGlassStrong: 'rgba(74, 44, 44, 0.95)',
                
                // UI colors
                windowBg: 'rgba(255, 69, 0, 0.1)',
                windowBackdrop: 'blur(10px) saturate(150%) brightness(120%)',
                windowBorder: 'rgba(255, 140, 0, 0.4)',
                textColor: '#fff8dc',
                textSecondary: '#ffe4b5',
                textMuted: '#deb887',
                borderColor: '#cd853f',
                borderLight: '#daa520',
                
                // Accent colors
                accentGreen: '#32cd32',
                accentOrange: '#ffd700',
                accentPurple: '#9370db',
                accentRed: '#ff4500',
                accentCyan: '#40e0d0',
                accentYellow: '#ffd700',
                accentBlue: '#4169e1',
                
                // Terminal specific
                terminalBg: 'rgba(255, 69, 0, 0.1)',
                terminalBackdrop: 'blur(10px) saturate(150%) brightness(120%)',
                terminalBorder: 'rgba(255, 140, 0, 0.4)',
                terminalText: '#fff8dc',
                terminalPrompt: '#ff6347',
                terminalError: '#ff4500',
                terminalSuccess: '#32cd32',
                terminalWarning: '#ffd700'
            },
            cyberpunk: {
                name: 'cyberpunk',
                // Primary colors
                primary: '#00ffff',
                primaryHover: '#00cccc',
                primaryLight: '#40e0d0',
                primaryDark: '#008b8b',
                primaryGlow: 'rgba(0, 255, 255, 0.15)',
                
                // Background colors
                backgroundDark: '#0a0a0a',
                backgroundLight: '#1a1a1a',
                backgroundMedium: '#2a2a2a',
                backgroundElevated: '#3a3a3a',
                backgroundGlass: 'rgba(42, 42, 42, 0.8)',
                backgroundGlassStrong: 'rgba(42, 42, 42, 0.95)',
                
                // UI colors
                windowBg: 'rgba(0, 255, 255, 0.05)',
                windowBackdrop: 'blur(15px) saturate(200%) brightness(130%)',
                windowBorder: 'rgba(0, 255, 255, 0.3)',
                textColor: '#00ffff',
                textSecondary: '#ff00ff',
                textMuted: '#808080',
                borderColor: '#00ffff',
                borderLight: '#40e0d0',
                
                // Accent colors
                accentGreen: '#00ff00',
                accentOrange: '#ff8000',
                accentPurple: '#ff00ff',
                accentRed: '#ff0000',
                accentCyan: '#00ffff',
                accentYellow: '#ffff00',
                accentBlue: '#0080ff',
                
                // Terminal specific
                terminalBg: 'rgba(0, 255, 255, 0.05)',
                terminalBackdrop: 'blur(15px) saturate(200%) brightness(130%)',
                terminalBorder: 'rgba(0, 255, 255, 0.3)',
                terminalText: '#00ffff',
                terminalPrompt: '#ff00ff',
                terminalError: '#ff0000',
                terminalSuccess: '#00ff00',
                terminalWarning: '#ffff00'
            }
        };
        
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for theme changes from terminal
        window.addEventListener('themeChanged', (e) => {
            this.applyTheme(e.detail.theme);
        });
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) {
            console.warn(`Theme ${themeName} not found, using default`);
            theme = this.themes.default;
        }

        this.currentTheme = themeName;
        localStorage.setItem('neuos-theme', themeName);

        // Apply CSS custom properties
        this.applyCSSVariables(theme);
        
        // Apply theme to specific components
        this.applyWindowThemes(theme);
        this.applyTerminalTheme(theme);
        this.applyDesktopTheme(theme);
        this.applyWidgetTheme(theme);
        
        // Emit theme change event
        window.dispatchEvent(new CustomEvent('neuosThemeChanged', { 
            detail: { theme: themeName, themeData: theme } 
        }));
    }

    applyCSSVariables(theme) {
        const root = document.documentElement;
        
        // Primary colors
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-hover', theme.primaryHover);
        root.style.setProperty('--primary-light', theme.primaryLight);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--primary-glow', theme.primaryGlow);
        
        // Background colors
        root.style.setProperty('--background-dark', theme.backgroundDark);
        root.style.setProperty('--background-light', theme.backgroundLight);
        root.style.setProperty('--background-medium', theme.backgroundMedium);
        root.style.setProperty('--background-elevated', theme.backgroundElevated);
        root.style.setProperty('--background-glass', theme.backgroundGlass);
        root.style.setProperty('--background-glass-strong', theme.backgroundGlassStrong);
        
        // UI colors
        root.style.setProperty('--window-bg', theme.windowBg);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--border-color', theme.borderColor);
        root.style.setProperty('--border-light', theme.borderLight);
        
        // Window-specific variables
        root.style.setProperty('--window-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-border', theme.windowBorder);
        root.style.setProperty('--window-bg-focused', theme.windowBg);
        root.style.setProperty('--window-header-bg', theme.windowBg);
        root.style.setProperty('--window-header-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-control-bg', theme.windowBg);
        root.style.setProperty('--window-control-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-control-border', theme.windowBorder);
        
        // Accent colors
        root.style.setProperty('--accent-green', theme.accentGreen);
        root.style.setProperty('--accent-orange', theme.accentOrange);
        root.style.setProperty('--accent-purple', theme.accentPurple);
        root.style.setProperty('--accent-red', theme.accentRed);
        root.style.setProperty('--accent-cyan', theme.accentCyan);
        root.style.setProperty('--accent-yellow', theme.accentYellow);
        root.style.setProperty('--accent-blue', theme.accentBlue);
    }

    applyWindowThemes(theme) {
        // Apply to all windows
        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            window.style.setProperty('--window-bg', theme.windowBg);
            window.style.setProperty('--window-backdrop', theme.windowBackdrop);
            window.style.setProperty('--window-border', theme.windowBorder);
            window.style.setProperty('--text-color', theme.textColor);
        });

        // Apply to window headers
        const windowHeaders = document.querySelectorAll('.window-header');
        windowHeaders.forEach(header => {
            header.style.setProperty('--window-bg', theme.windowBg);
            header.style.setProperty('--window-backdrop', theme.windowBackdrop);
            header.style.setProperty('--window-border', theme.windowBorder);
        });

        // Apply to window controls
        const windowControls = document.querySelectorAll('.window-control');
        windowControls.forEach(control => {
            control.style.setProperty('--primary-color', theme.primary);
            control.style.setProperty('--text-color', theme.textColor);
        });
    }

    applyTerminalTheme(theme) {
        const terminalWindow = document.getElementById('terminalWindow');
        if (terminalWindow) {
            terminalWindow.style.setProperty('--terminal-bg', theme.terminalBg);
            terminalWindow.style.setProperty('--terminal-backdrop', theme.terminalBackdrop);
            terminalWindow.style.setProperty('--terminal-border', theme.terminalBorder);
            terminalWindow.style.setProperty('--terminal-text', theme.terminalText);
            terminalWindow.style.setProperty('--terminal-prompt', theme.terminalPrompt);
            terminalWindow.style.setProperty('--terminal-error', theme.terminalError);
            terminalWindow.style.setProperty('--terminal-success', theme.terminalSuccess);
            terminalWindow.style.setProperty('--terminal-warning', theme.terminalWarning);
        }
    }

    applyDesktopTheme(theme) {
        // Apply to desktop icons
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        desktopIcons.forEach(icon => {
            const iconElement = icon.querySelector('.icon');
            if (iconElement) {
                iconElement.style.setProperty('--text-color', theme.textColor);
                iconElement.style.setProperty('--primary-color', theme.primary);
            }
        });
    }

    applyWidgetTheme(theme) {
        // Apply to neuOS widget
        const neuOSWidget = document.querySelector('.neuos-widget');
        if (neuOSWidget) {
            neuOSWidget.style.setProperty('--primary-color', theme.primary);
            neuOSWidget.style.setProperty('--text-color', theme.textColor);
            neuOSWidget.style.setProperty('--background-glass', theme.backgroundGlass);
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    getThemeData(themeName = null) {
        const theme = themeName || this.currentTheme;
        return this.themes[theme] || this.themes.default;
    }

    getAllThemes() {
        return Object.keys(this.themes);
    }

    static getInstance() {
        if (!window.themeManagerInstance) {
            window.themeManagerInstance = new ThemeManager();
        }
        return window.themeManagerInstance;
    }
} 