# CSS System Documentation

## Overview

The CSS system provides a comprehensive styling framework for the neuOS application, implementing a modern glassmorphic design with responsive layouts, animations, and theme management.

## File Structure

```
css/
├── design-tokens.css      # Design system tokens and variables
├── glass.css              # Glassmorphic effects
├── window-base.css        # Window management styles
├── terminal.css           # Terminal application styles
├── desktop.css            # Desktop layout
├── animations.css         # Animation definitions
├── responsive.css         # Responsive design
├── mobile.css             # Mobile-specific styles
├── apps.css               # Application-specific styles
├── theme.css              # Theme management
├── terminal-icon.css      # Terminal icon styles
└── login.css              # Login screen styles
```

## CSS Components

### design-tokens.css (11KB, 293 lines)
**Purpose**: Design system tokens and variables
**Dependencies**: None (base layer)

**Key Features**:
- Color system variables
- Typography scale
- Spacing scale
- Border radius scale
- Shadow system
- Glass morphism variables

**Main Variables**:
```css
/* Color System */
--color-primary: #6366f1;
--color-primary-hover: #4f46e5;
--color-background-dark: #030712;
--color-background-light: #0a0f1a;
--color-text-primary: #f8fafc;
--color-text-secondary: #cbd5e1;

/* Typography Scale */
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;

/* Spacing Scale */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Glass Morphism */
--glass-background: rgba(255, 255, 255, 0.001);
--glass-backdrop-blur: 8px;
--glass-saturation: 140%;
--glass-brightness: 110%;
```

### glass.css (22KB, 725 lines)
**Purpose**: Glassmorphic effects
**Dependencies**: design-tokens.css

**Key Features**:
- Glass morphism implementation
- Backdrop filter effects
- Glass reflection effects
- Dynamic glass properties
- Performance optimization

**Main Classes**:
```css
.neuos-glass-box {
    background: var(--glass-background);
    backdrop-filter: blur(var(--glass-backdrop-blur)) saturate(var(--glass-saturation)) brightness(var(--glass-brightness));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
}

.glass-reflection {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    border-radius: inherit;
    pointer-events: none;
}
```

### window-base.css (9.4KB, 374 lines)
**Purpose**: Window management styles
**Dependencies**: glass.css

**Key Features**:
- Window container styles
- Window header styles
- Window controls
- Window states (minimize, maximize, restore)
- Window dragging and resizing

**Main Classes**:
```css
.window {
    background: var(--window-background);
    backdrop-filter: var(--window-backdrop);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-strong);
}

.window-header {
    background: var(--window-background-header);
    backdrop-filter: var(--window-backdrop-header);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.window-controls {
    display: flex;
    gap: var(--spacing-xs);
}
```

### terminal.css (42KB, 1641 lines)
**Purpose**: Terminal application styles
**Dependencies**: window-base.css

**Key Features**:
- Terminal interface styling
- Command input styling
- Output formatting
- Syntax highlighting
- Terminal themes
- Responsive terminal design

**Main Classes**:
```css
.terminal {
    background: var(--color-background-dark);
    color: var(--color-text-primary);
    font-family: 'Fira Code', monospace;
    font-size: var(--font-size-sm);
    line-height: 1.5;
}

.terminal-input {
    background: transparent;
    border: none;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    outline: none;
}

.terminal-output {
    white-space: pre-wrap;
    word-wrap: break-word;
}
```

### desktop.css (4.5KB, 208 lines)
**Purpose**: Desktop layout
**Dependencies**: window-base.css

**Key Features**:
- Desktop container layout
- Desktop icon grid
- Icon styling and animations
- Desktop background
- Desktop interactions

**Main Classes**:
```css
.desktop {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: var(--color-background-dark);
}

.desktop-icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
}

.desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-radius: var(--radius-md);
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.2s ease;
}
```

### animations.css (22KB, 863 lines)
**Purpose**: Animation definitions
**Dependencies**: design-tokens.css

**Key Features**:
- Keyframe animations
- Transition definitions
- Animation utilities
- Performance optimizations
- Reduced motion support

**Main Animations**:
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

### responsive.css (6.9KB, 330 lines)
**Purpose**: Responsive design
**Dependencies**: animations.css

**Key Features**:
- Media queries
- Breakpoint definitions
- Responsive layouts
- Mobile-first approach
- Tablet and desktop adaptations

**Main Breakpoints**:
```css
/* Mobile */
@media (max-width: 768px) {
    .desktop-icons {
        grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
    }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
    .desktop-icons {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    }
}

/* Desktop */
@media (min-width: 1025px) {
    .desktop-icons {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    }
}
```

### mobile.css (23KB, 698 lines)
**Purpose**: Mobile-specific styles
**Dependencies**: responsive.css

**Key Features**:
- Mobile-specific layouts
- Touch interactions
- Mobile navigation
- Mobile optimizations
- Mobile accessibility

**Main Features**:
```css
/* Touch-friendly sizing */
.mobile-button {
    min-height: 44px;
    min-width: 44px;
    padding: var(--spacing-sm);
}

/* Mobile navigation */
.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Mobile gestures */
.mobile-swipe {
    touch-action: pan-y;
    user-select: none;
}
```

### apps.css (11KB, 536 lines)
**Purpose**: Application-specific styles
**Dependencies**: mobile.css

**Key Features**:
- Application window styles
- Application-specific layouts
- Application interactions
- Application themes
- Application accessibility

**Main Classes**:
```css
.app-window {
    background: var(--window-background);
    backdrop-filter: var(--window-backdrop);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-strong);
}

.app-content {
    padding: var(--spacing-lg);
    overflow: auto;
}

.app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
```

### theme.css (12KB, 494 lines)
**Purpose**: Theme management
**Dependencies**: apps.css

**Key Features**:
- Theme switching
- Color scheme management
- Theme variables
- Theme transitions
- Theme persistence

**Main Features**:
```css
/* Theme variables */
[data-theme="dark"] {
    --color-background: var(--color-background-dark);
    --color-text: var(--color-text-primary);
}

[data-theme="light"] {
    --color-background: var(--color-background-light);
    --color-text: var(--color-text-secondary);
}

/* Theme transitions */
* {
    transition: background-color 0.3s ease, color 0.3s ease;
}
```

### terminal-icon.css (1.4KB, 60 lines)
**Purpose**: Terminal icon styles
**Dependencies**: theme.css

**Key Features**:
- Terminal icon design
- Icon animations
- Icon states
- Icon accessibility

**Main Classes**:
```css
.terminal-icon {
    width: 48px;
    height: 48px;
    background: var(--color-primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: monospace;
    font-size: var(--font-size-lg);
    font-weight: bold;
}
```

### login.css (23KB, 910 lines)
**Purpose**: Login screen styles
**Dependencies**: terminal-icon.css

**Key Features**:
- Login screen layout
- Login form styling
- Login animations
- Login accessibility
- Login responsiveness

**Main Classes**:
```css
.login-screen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--color-background-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.login-container {
    background: var(--glass-background);
    backdrop-filter: var(--glass-backdrop);
    border-radius: var(--radius-xl);
    padding: var(--spacing-2xl);
    text-align: center;
    max-width: 400px;
    width: 90%;
}
```

## CSS Architecture

### Load Order
```
design-tokens.css → glass.css → window-base.css → terminal.css → desktop.css → animations.css → responsive.css → mobile.css → apps.css → theme.css → terminal-icon.css → login.css
```

### CSS Methodology
- **Design Tokens**: Single source of truth for design values
- **Component-Based**: Modular CSS components
- **Mobile-First**: Responsive design approach
- **Performance-Focused**: Optimized for performance
- **Accessibility**: WCAG compliant

### CSS Organization
1. **Base Layer**: Design tokens and variables
2. **Component Layer**: Reusable components
3. **Layout Layer**: Page layouts and grids
4. **Utility Layer**: Helper classes and utilities
5. **Theme Layer**: Theme-specific styles

## Performance Considerations

### Critical Performance Areas
1. **CSS File Size**: Total CSS bundle size
2. **Selector Performance**: CSS selector efficiency
3. **Animation Performance**: Smooth animations
4. **Mobile Performance**: Mobile-specific optimizations

### Optimization Strategies
1. **CSS Minification**: Reduce file size
2. **Critical CSS**: Inline critical styles
3. **CSS Splitting**: Load CSS on demand
4. **GPU Acceleration**: Hardware-accelerated animations

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### CSS Features
- CSS Custom Properties (variables)
- CSS Grid
- Flexbox
- CSS Animations
- Backdrop Filter
- CSS Filters

## Accessibility Features

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio
- **Focus Indicators**: Visible focus states
- **Reduced Motion**: Respects user preferences
- **Screen Reader**: Proper ARIA support

### Accessibility Classes
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Theme System

### Theme Variables
```css
:root {
    /* Light Theme */
    --color-background-light: #ffffff;
    --color-text-light: #000000;
    
    /* Dark Theme */
    --color-background-dark: #030712;
    --color-text-dark: #f8fafc;
    
    /* Accent Colors */
    --color-primary: #6366f1;
    --color-secondary: #8b5cf6;
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
}
```

### Theme Switching
```css
[data-theme="light"] {
    --color-background: var(--color-background-light);
    --color-text: var(--color-text-light);
}

[data-theme="dark"] {
    --color-background: var(--color-background-dark);
    --color-text: var(--color-text-dark);
}
```

## Future Enhancements

### Planned Features
1. **CSS-in-JS**: Component-based styling
2. **CSS Modules**: Scoped CSS classes
3. **Advanced Animations**: Complex animation sequences
4. **CSS Houdini**: Custom CSS properties and values

### Performance Improvements
1. **CSS Optimization**: Advanced minification
2. **Critical CSS**: Inline critical styles
3. **CSS Caching**: Service worker caching
4. **CSS Compression**: Advanced compression

## Related Documentation

- See [THEMING_STANDARDIZATION.md](THEMING_STANDARDIZATION.md) for theming system
- See [architecture.md](architecture.md) for overall system architecture
- See [DOTHISNEXT.md](DOTHISNEXT.md) for CSS-specific issues 