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
                windowBg: 'rgba(40, 42, 54, 0.1)',
                windowBackdrop: 'blur(12px) saturate(120%) brightness(110%)',
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
                
                // Terminal specific - Fixed to have proper glass effect
                terminalBg: 'rgba(40, 42, 54, 0.1)',
                terminalBackdrop: 'blur(12px) saturate(120%) brightness(110%)',
                terminalBorder: 'rgba(189, 147, 249, 0.3)',
                terminalText: '#f8f8f2',
                terminalPrompt: '#bd93f9',
                terminalError: '#ff5555',
                terminalSuccess: '#50fa7b',
                terminalWarning: '#ffb86c'
            },
            sunset: {
                name: 'sunset',
                // Primary colors - Warm sunset palette
                primary: '#ff6347',
                primaryHover: '#dc2626',
                primaryLight: '#f87171',
                primaryDark: '#b91c1c',
                primaryGlow: 'rgba(255, 99, 71, 0.15)',
                
                // Background colors - Deep warm tones
                backgroundDark: '#1a0f0f',
                backgroundLight: '#2d1b1b',
                backgroundMedium: '#4a2c2c',
                backgroundElevated: '#5a3535',
                backgroundGlass: 'rgba(74, 44, 44, 0.8)',
                backgroundGlassStrong: 'rgba(74, 44, 44, 0.95)',
                
                // UI colors - Warm, readable palette
                windowBg: 'rgba(255, 69, 0, 0.1)',
                windowBackdrop: 'blur(10px) saturate(150%) brightness(120%)',
                windowBorder: 'rgba(255, 140, 0, 0.4)',
                textColor: '#fff8dc',
                textSecondary: '#ffe4b5',
                textMuted: '#deb887',
                borderColor: '#cd853f',
                borderLight: '#daa520',
                
                // Accent colors - Complementary warm tones
                accentGreen: '#32cd32',
                accentOrange: '#ffd700',
                accentPurple: '#9370db',
                accentRed: '#ff4500',
                accentCyan: '#40e0d0',
                accentYellow: '#ffd700',
                accentBlue: '#4169e1',
                
                // Terminal specific - Complete sunset experience
                terminalBg: 'rgba(255, 69, 0, 0.1)',
                terminalBackdrop: 'blur(10px) saturate(150%) brightness(120%)',
                terminalBorder: 'rgba(255, 140, 0, 0.4)',
                terminalText: '#fff8dc',
                terminalPrompt: '#ff6347',
                terminalError: '#ff4500',
                terminalSuccess: '#32cd32',
                terminalWarning: '#ff8c00'
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
                terminalWarning: '#ff8000'
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
        
        // Primary colors - Use new standardized names
        root.style.setProperty('--color-primary', theme.primary);
        root.style.setProperty('--color-primary-hover', theme.primaryHover);
        root.style.setProperty('--color-primary-light', theme.primaryLight);
        root.style.setProperty('--color-primary-dark', theme.primaryDark);
        root.style.setProperty('--color-primary-glow', theme.primaryGlow);
        
        // Background colors - Use new standardized names
        root.style.setProperty('--color-background-dark', theme.backgroundDark);
        root.style.setProperty('--color-background-light', theme.backgroundLight);
        root.style.setProperty('--color-background-medium', theme.backgroundMedium);
        root.style.setProperty('--color-background-elevated', theme.backgroundElevated);
        root.style.setProperty('--color-background-glass', theme.backgroundGlass);
        root.style.setProperty('--color-background-glass-strong', theme.backgroundGlassStrong);
        
        // UI colors - Use new standardized names
        root.style.setProperty('--color-text-primary', theme.textColor);
        root.style.setProperty('--color-text-secondary', theme.textSecondary);
        root.style.setProperty('--color-text-muted', theme.textMuted);
        root.style.setProperty('--color-border-primary', theme.borderColor);
        root.style.setProperty('--color-border-light', theme.borderLight);
        
        // Window system - Use new standardized names
        root.style.setProperty('--window-background', theme.windowBg);
        root.style.setProperty('--window-background-focused', theme.windowBg);
        root.style.setProperty('--window-background-header', theme.windowBg);
        root.style.setProperty('--window-background-control', theme.windowBg);
        root.style.setProperty('--window-background-content', theme.windowBg);
        root.style.setProperty('--window-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-backdrop-header', theme.windowBackdrop);
        root.style.setProperty('--window-backdrop-control', theme.windowBackdrop);
        root.style.setProperty('--window-backdrop-content', theme.windowBackdrop);
        root.style.setProperty('--window-border', theme.windowBorder);
        
        // Terminal system - Use new standardized names
        root.style.setProperty('--terminal-background', theme.terminalBg);
        root.style.setProperty('--terminal-backdrop', theme.terminalBackdrop);
        root.style.setProperty('--terminal-border', theme.terminalBorder);
        root.style.setProperty('--terminal-text', theme.terminalText);
        root.style.setProperty('--terminal-prompt', theme.terminalPrompt);
        root.style.setProperty('--terminal-error', theme.terminalError);
        root.style.setProperty('--terminal-success', theme.terminalSuccess);
        root.style.setProperty('--terminal-warning', theme.terminalWarning);
        
        // Accent colors - Use new standardized names
        root.style.setProperty('--color-accent-green', theme.accentGreen);
        root.style.setProperty('--color-accent-orange', theme.accentOrange);
        root.style.setProperty('--color-accent-purple', theme.accentPurple);
        root.style.setProperty('--color-accent-red', theme.accentRed);
        root.style.setProperty('--color-accent-cyan', theme.accentCyan);
        root.style.setProperty('--color-accent-yellow', theme.accentYellow);
        root.style.setProperty('--color-accent-blue', theme.accentBlue);
        
        // Glass morphism system - Apply theme colors to glass effects
        // Create theme-aware glass backgrounds that adapt to the current theme
        const glassBaseColor = this.extractGlassColor(theme.windowBg);
        const glassLight = this.createGlassBackground(glassBaseColor, 0.04);
        const glassMedium = this.createGlassBackground(glassBaseColor, 0.08);
        const glassHeavy = this.createGlassBackground(glassBaseColor, 0.12);
        const glassUltra = this.createGlassBackground(glassBaseColor, 0.16);
        
        root.style.setProperty('--glass-background', glassMedium);
        root.style.setProperty('--glass-background-light', glassLight);
        root.style.setProperty('--glass-background-medium', glassMedium);
        root.style.setProperty('--glass-background-heavy', glassHeavy);
        root.style.setProperty('--glass-background-ultra', glassUltra);
        
        // Update glass shadows to use theme colors
        const glassShadowColor = this.extractGlassColor(theme.primary);
        root.style.setProperty('--glass-shadow-color', glassShadowColor);
        root.style.setProperty('--glass-edge-glow', `0 0 8px ${glassShadowColor}`);
        
        // Update glass outer and hover shadows to use theme colors
        const glassBorderColor = this.createGlassBackground(glassShadowColor, 0.08);
        const glassHoverBorderColor = this.createGlassBackground(glassShadowColor, 0.12);
        root.style.setProperty('--glass-outer-shadow', `0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px ${glassBorderColor}`);
        root.style.setProperty('--glass-hover-shadow', `0 16px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px ${glassHoverBorderColor}`);
        
        // Update glass inner shadow to use theme colors
        const glassInnerColor = this.createGlassBackground(glassShadowColor, 0.15);
        root.style.setProperty('--glass-inner-shadow', `inset 0 1px 0 ${glassInnerColor}`);
        
        // Update glass tint to use theme colors
        const tintColor = this.extractRGB(theme.primary);
        root.style.setProperty('--glass-tint-color', tintColor);
        
        // Update glass reflection colors to use theme colors
        const reflectionBaseColor = this.extractRGB(theme.textColor);
        root.style.setProperty('--glass-reflection-light', `rgba(${reflectionBaseColor}, 0.4)`);
        root.style.setProperty('--glass-reflection-medium', `rgba(${reflectionBaseColor}, 0.2)`);
        root.style.setProperty('--glass-reflection-subtle', `rgba(${reflectionBaseColor}, 0.1)`);
        root.style.setProperty('--glass-reflection-faint', `rgba(${reflectionBaseColor}, 0.05)`);
        
        // Shadow system - Theme-aware shadows
        const shadowColor = theme.primaryGlow || theme.primary;
        root.style.setProperty('--shadow-glow', `0 0 20px ${shadowColor}`);
        root.style.setProperty('--shadow-glow-strong', `0 0 40px ${shadowColor}`);
        
        // Border system - Theme-aware borders
        root.style.setProperty('--color-border-subtle', theme.windowBorder);
        root.style.setProperty('--color-border-strong', theme.windowBorder);
        
        // Text accent colors
        root.style.setProperty('--color-text-accent', theme.textSecondary);
        
        // Legacy compatibility variables
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--primary-hover', theme.primaryHover);
        root.style.setProperty('--primary-light', theme.primaryLight);
        root.style.setProperty('--primary-dark', theme.primaryDark);
        root.style.setProperty('--primary-glow', theme.primaryGlow);
        root.style.setProperty('--background-dark', theme.backgroundDark);
        root.style.setProperty('--background-light', theme.backgroundLight);
        root.style.setProperty('--background-medium', theme.backgroundMedium);
        root.style.setProperty('--background-elevated', theme.backgroundElevated);
        root.style.setProperty('--background-glass', theme.backgroundGlass);
        root.style.setProperty('--background-glass-strong', theme.backgroundGlassStrong);
        root.style.setProperty('--text-color', theme.textColor);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--border-color', theme.borderColor);
        root.style.setProperty('--border-light', theme.borderLight);
        root.style.setProperty('--accent-green', theme.accentGreen);
        root.style.setProperty('--accent-orange', theme.accentOrange);
        root.style.setProperty('--accent-purple', theme.accentPurple);
        root.style.setProperty('--accent-red', theme.accentRed);
        root.style.setProperty('--accent-cyan', theme.accentCyan);
        root.style.setProperty('--accent-yellow', theme.accentYellow);
        root.style.setProperty('--accent-blue', theme.accentBlue);
        root.style.setProperty('--window-bg', theme.windowBg);
        root.style.setProperty('--window-bg-focused', theme.windowBg);
        root.style.setProperty('--window-header-bg', theme.windowBg);
        root.style.setProperty('--window-control-bg', theme.windowBg);
        root.style.setProperty('--window-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-header-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-control-backdrop', theme.windowBackdrop);
        root.style.setProperty('--window-border', theme.windowBorder);
        root.style.setProperty('--window-control-border', theme.windowBorder);
        root.style.setProperty('--terminal-bg', theme.terminalBg);
        root.style.setProperty('--terminal-backdrop', theme.terminalBackdrop);
        root.style.setProperty('--terminal-border', theme.terminalBorder);
        root.style.setProperty('--terminal-text', theme.terminalText);
        root.style.setProperty('--terminal-prompt', theme.terminalPrompt);
        root.style.setProperty('--terminal-error', theme.terminalError);
        root.style.setProperty('--terminal-success', theme.terminalSuccess);
        root.style.setProperty('--terminal-warning', theme.terminalWarning);
    }

    applyWindowThemes(theme) {
        // Windows now inherit from CSS variables - no direct manipulation needed
        // The CSS variables are applied at the root level and cascade down
    }

    applyTerminalTheme(theme) {
        // Terminal now inherits from CSS variables - no direct manipulation needed
        // The CSS variables are applied at the root level and cascade down
    }

    applyDesktopTheme(theme) {
        // Desktop icons now inherit from CSS variables - no direct manipulation needed
        // The CSS variables are applied at the root level and cascade down
    }

    applyWidgetTheme(theme) {
        // Widget now inherits from CSS variables - no direct manipulation needed
        // The CSS variables are applied at the root level and cascade down
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
    
    // Helper methods for glass morphism theming
    
    /**
     * Extract the base color from a CSS color value for glass effects
     * @param {string} color - CSS color value (hex, rgb, rgba)
     * @returns {string} - RGB color string
     */
    extractGlassColor(color) {
        // Handle rgba values
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba?\(([^)]+)\)/);
            if (match) {
                const parts = match[1].split(',').map(p => p.trim());
                const r = parseInt(parts[0]);
                const g = parseInt(parts[1]);
                const b = parseInt(parts[2]);
                return `${r}, ${g}, ${b}`;
            }
        }
        
        // Handle rgb values
        if (color.startsWith('rgb')) {
            const match = color.match(/rgb\(([^)]+)\)/);
            if (match) {
                return match[1];
            }
        }
        
        // Handle hex values
        if (color.startsWith('#')) {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return `${r}, ${g}, ${b}`;
        }
        
        // Default fallback
        return '255, 255, 255';
    }
    
    /**
     * Extract RGB values from a CSS color
     * @param {string} color - CSS color value
     * @returns {string} - RGB values as comma-separated string
     */
    extractRGB(color) {
        return this.extractGlassColor(color);
    }
    
    /**
     * Create a glass background color with specified opacity
     * @param {string} baseColor - RGB color string
     * @param {number} opacity - Opacity value (0-1)
     * @returns {string} - RGBA color string
     */
    createGlassBackground(baseColor, opacity) {
        return `rgba(${baseColor}, ${opacity})`;
    }
} 