# CSS System Documentation

## Overview

The CSS system provides a comprehensive design framework for the neuOS application, implementing modern design principles with glassmorphic effects, responsive design, and accessibility features. The system is organized into 12 modular files that work together to create a cohesive visual experience.

## File Structure

```
css/
├── design-tokens.css      # Design system tokens (9.2KB, 234 lines)
├── glass.css              # Glassmorphic effects (7.8KB, 297 lines)
├── window-base.css        # Window management styles (4.6KB, 174 lines)
├── terminal.css           # Terminal application styles (42KB, 1641 lines)
├── desktop.css            # Desktop layout (4.5KB, 208 lines)
├── animations.css         # Animation definitions (22KB, 863 lines)
├── responsive.css         # Responsive design (6.9KB, 330 lines)
├── mobile.css             # Mobile-specific styles (23KB, 698 lines)
├── apps.css               # Application-specific styles (11KB, 536 lines)
├── theme.css              # Theme management (12KB, 494 lines)
├── terminal-icon.css      # Terminal icon styles (1.4KB, 60 lines)
└── login.css              # Login screen styles (23KB, 910 lines)
```

## Load Order and Dependencies

### CSS Loading Sequence
```
design-tokens.css → glass.css → window-base.css → terminal.css → 
desktop.css → animations.css → responsive.css → mobile.css → 
apps.css → theme.css → terminal-icon.css → login.css
```

### Dependency Chain
- **design-tokens.css**: Foundation for all other styles
- **glass.css**: Depends on design tokens
- **window-base.css**: Depends on glass effects
- **terminal.css**: Depends on window base and design tokens
- **desktop.css**: Depends on window base
- **animations.css**: Depends on design tokens
- **responsive.css**: Depends on all base styles
- **mobile.css**: Depends on responsive design
- **apps.css**: Depends on window base and design tokens
- **theme.css**: Depends on all other styles
- **terminal-icon.css**: Depends on design tokens
- **login.css**: Depends on glass effects and design tokens

## Core Components

### design-tokens.css (9.2KB, 234 lines)
**Purpose**: Design system foundation
**Dependencies**: None

**Key Features**:
- CSS Custom Properties (variables)
- Color palette definitions
- Typography scale
- Spacing system
- Breakpoint definitions

**Main Categories**:
```css
/* Color System */
:root {
    --primary-color: #007AFF;
    --secondary-color: #5856D6;
    --success-color: #34C759;
    --warning-color: #FF9500;
    --error-color: #FF3B30;
    --background-dark: #000000;
    --background-light: #FFFFFF;
    --text-color: #FFFFFF;
    --text-secondary: #8E8E93;
}

/* Typography */
:root {
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-4xl: 2.25rem;
}

/* Spacing */
:root {
    --spacing-1: 0.25rem;
    --spacing-2: 0.5rem;
    --spacing-3: 0.75rem;
    --spacing-4: 1rem;
    --spacing-6: 1.5rem;
    --spacing-8: 2rem;
    --spacing-12: 3rem;
    --spacing-16: 4rem;
}

/* Breakpoints */
:root {
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;
}
```

### glass.css (7.8KB, 297 lines)
**Purpose**: Glassmorphic effects
**Dependencies**: design-tokens.css

**Key Features**:
- Glass morphism implementation
- Backdrop filters
- Glass reflections
- Transparency effects
- Performance optimization

**Main Classes**:
```css
/* Glass Container */
.glass-container {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* neuOS Glass Box */
.neuos-glass-box {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* neuOS Widget */
.neuos-widget {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}
```

### window-base.css (4.6KB, 174 lines)
**Purpose**: Window management styles
**Dependencies**: glass.css

**Key Features**:
- Window container styles
- Window controls
- Window states
- Window interactions
- Glass integration

**Main Classes**:
```css
/* Window Container */
.window {
    background: var(--background-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    position: absolute;
    min-width: 300px;
    min-height: 200px;
}

/* Window Header */
.window-header {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-3) var(--spacing-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

/* Window Controls */
.window-controls {
    display: flex;
    gap: var(--spacing-2);
}

.window-control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
}
```

### terminal.css (42KB, 1641 lines)
**Purpose**: Terminal application styles
**Dependencies**: window-base.css, design-tokens.css

**Key Features**:
- Terminal interface styling
- Command input/output
- Syntax highlighting
- Terminal themes
- Responsive terminal

**Main Classes**:
```css
/* Terminal Container */
.terminal {
    background: var(--background-dark);
    color: var(--text-color);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: var(--text-sm);
    line-height: 1.4;
    padding: var(--spacing-4);
    height: 100%;
    overflow-y: auto;
}

/* Terminal Input */
.terminal-input {
    background: transparent;
    border: none;
    color: var(--text-color);
    font-family: inherit;
    font-size: inherit;
    outline: none;
    width: 100%;
    caret-color: var(--primary-color);
}

/* Command Output */
.command-output {
    margin: var(--spacing-2) 0;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* Syntax Highlighting */
.keyword { color: #FF6B6B; }
.string { color: #4ECDC4; }
.number { color: #45B7D1; }
.comment { color: #95A5A6; }
```

### desktop.css (4.5KB, 208 lines)
**Purpose**: Desktop layout
**Dependencies**: window-base.css

**Key Features**:
- Desktop background
- Application icons
- Desktop interactions
- Layout management
- Icon positioning

**Main Classes**:
```css
/* Desktop Container */
#desktop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-dark);
    overflow: hidden;
    z-index: 1;
}

/* Application Icons */
.app-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-2);
    padding: var(--spacing-3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;
}

.app-icon:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
}

/* Icon Grid */
.icon-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: var(--spacing-4);
    padding: var(--spacing-6);
}
```

### animations.css (22KB, 863 lines)
**Purpose**: Animation definitions
**Dependencies**: design-tokens.css

**Key Features**:
- Keyframe animations
- Transition definitions
- Animation utilities
- Performance optimization
- Animation classes

**Main Categories**:
```css
/* Fade Animations */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

/* Slide Animations */
@keyframes slideInUp {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Scale Animations */
@keyframes scaleIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

/* Animation Classes */
.fade-in { animation: fadeIn 0.3s ease-out; }
.fade-out { animation: fadeOut 0.3s ease-in; }
.slide-up { animation: slideInUp 0.4s ease-out; }
.scale-in { animation: scaleIn 0.3s ease-out; }
```

### responsive.css (6.9KB, 330 lines)
**Purpose**: Responsive design
**Dependencies**: All base styles

**Key Features**:
- Media queries
- Breakpoint management
- Responsive layouts
- Mobile adaptations
- Tablet support

**Main Breakpoints**:
```css
/* Small screens */
@media (max-width: 640px) {
    .container { padding: var(--spacing-4); }
    .window { min-width: 280px; }
    .terminal { font-size: var(--text-xs); }
}

/* Medium screens */
@media (min-width: 641px) and (max-width: 1024px) {
    .container { padding: var(--spacing-6); }
    .window { min-width: 400px; }
}

/* Large screens */
@media (min-width: 1025px) {
    .container { padding: var(--spacing-8); }
    .window { min-width: 500px; }
}
```

### mobile.css (23KB, 698 lines)
**Purpose**: Mobile-specific styles
**Dependencies**: responsive.css

**Key Features**:
- Touch interactions
- Mobile navigation
- Mobile gestures
- Mobile performance
- Mobile accessibility

**Main Features**:
```css
/* Touch Targets */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    padding: var(--spacing-3);
}

/* Mobile Navigation */
.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: var(--spacing-4);
    z-index: 1000;
}

/* Mobile Gestures */
.swipe-area {
    touch-action: pan-y;
    user-select: none;
}
```

### apps.css (11KB, 536 lines)
**Purpose**: Application-specific styles
**Dependencies**: window-base.css, design-tokens.css

**Key Features**:
- Application window styles
- App-specific layouts
- Application themes
- App interactions
- App customization

**Main Classes**:
```css
/* Application Windows */
.app-window {
    background: var(--background-dark);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* App Content */
.app-content {
    padding: var(--spacing-4);
    height: calc(100% - 60px);
    overflow-y: auto;
}

/* App Toolbar */
.app-toolbar {
    background: rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid var(--border-color);
    padding: var(--spacing-3) var(--spacing-4);
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
}
```

### theme.css (12KB, 494 lines)
**Purpose**: Theme management
**Dependencies**: All other CSS files

**Key Features**:
- Theme switching
- Color schemes
- Theme persistence
- Dynamic theming
- Theme customization

**Main Features**:
```css
/* Theme Variables */
[data-theme="dark"] {
    --background-primary: #000000;
    --background-secondary: #1C1C1E;
    --text-primary: #FFFFFF;
    --text-secondary: #8E8E93;
    --border-color: #38383A;
}

[data-theme="light"] {
    --background-primary: #FFFFFF;
    --background-secondary: #F2F2F7;
    --text-primary: #000000;
    --text-secondary: #6D6D70;
    --border-color: #C6C6C8;
}

/* Theme Transitions */
* {
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
```

### terminal-icon.css (1.4KB, 60 lines)
**Purpose**: Terminal icon styles
**Dependencies**: design-tokens.css

**Key Features**:
- Terminal icon design
- Icon animations
- Icon states
- Icon interactions

**Main Classes**:
```css
/* Terminal Icon */
.terminal-icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #007AFF, #5856D6);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.terminal-icon:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 122, 255, 0.3);
}
```

### login.css (23KB, 910 lines)
**Purpose**: Login screen styles
**Dependencies**: glass.css, design-tokens.css

**Key Features**:
- Login interface
- Authentication forms
- Login animations
- Security features
- User experience

**Main Classes**:
```css
/* Login Container */
.login-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--background-dark);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

/* Login Form */
.login-form {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: var(--spacing-8);
    width: 100%;
    max-width: 400px;
    box-shadow: 0 16px 64px rgba(0, 0, 0, 0.3);
}

/* Login Input */
.login-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: var(--spacing-4);
    color: var(--text-color);
    font-size: var(--text-base);
    width: 100%;
    margin-bottom: var(--spacing-4);
}
```

## Performance Considerations

### Critical Performance Areas
1. **Glass Effects**: Backdrop filter performance
2. **Animations**: Smooth animation rendering
3. **Responsive Design**: Mobile performance
4. **Theme Switching**: Dynamic style updates

### Optimization Strategies
1. **CSS Custom Properties**: Efficient theme switching
2. **Hardware Acceleration**: Transform and opacity animations
3. **Lazy Loading**: On-demand style loading
4. **Minification**: Reduced file sizes

## Browser Compatibility

### Supported Features
- **CSS Custom Properties**: Modern browser support
- **Backdrop Filters**: WebKit and Firefox support
- **CSS Grid**: Modern layout support
- **Flexbox**: Cross-browser layout support

### Fallbacks
- **Backdrop Filters**: Fallback backgrounds
- **CSS Grid**: Flexbox fallbacks
- **Custom Properties**: Static value fallbacks

## Accessibility Features

### Visual Accessibility
- **High Contrast**: Minimum 4.5:1 contrast ratio
- **Color Independence**: Non-color dependent indicators
- **Focus Indicators**: Visible focus states
- **Reduced Motion**: Respects user preferences

### Screen Reader Support
- **Semantic HTML**: Proper element structure
- **ARIA Labels**: Screen reader descriptions
- **Live Regions**: Dynamic content announcements
- **Alternative Text**: Image and icon descriptions

## Future Enhancements

### Planned Features
1. **Advanced Theming**: Dynamic theme generation
2. **CSS-in-JS**: Component-based styling
3. **Design System**: Comprehensive component library
4. **Performance Monitoring**: CSS performance tracking

### Technical Improvements
1. **CSS Modules**: Scoped styling
2. **PostCSS**: Advanced CSS processing
3. **CSS Custom Properties**: Advanced theming
4. **CSS Grid**: Advanced layouts

## Related Documentation

- See [architecture.md](architecture.md) for overall system architecture
- See [theme.md](THEMING_STANDARDIZATION.md) for theming system
- See [main.md](main.md) for CSS loading
- See [DOTHISNEXT.md](DOTHISNEXT.md) for CSS-specific issues 