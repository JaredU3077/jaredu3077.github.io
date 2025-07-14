# Contributing to neuOS

Thank you for your interest in contributing to neuOS! This guide will help you understand how to contribute effectively to this project.

## 🤝 How to Contribute

### Types of Contributions
We welcome various types of contributions:

- **🐛 Bug Reports**: Help us identify and fix issues
- **✨ Feature Requests**: Suggest new features or improvements
- **📝 Documentation**: Improve or expand documentation
- **🎨 UI/UX Improvements**: Enhance the user experience
- **🔧 Code Improvements**: Optimize performance or fix issues
- **🧪 Testing**: Help test features and report issues
- **🎵 Audio Enhancements**: Improve Mechvibes and audio systems
- **🎨 Demoscene**: Contribute to the secret demoscene platform
- **🌌 Solar System**: Enhance background animations and effects
- **⭕ Circular UI**: Improve circular design elements
- **🌟 Glass UI**: Enhance glass morphism effects and create new glass elements

## 🚀 Getting Started

### Prerequisites
- **Git**: For version control
- **Node.js**: 14+ (for development tools)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- **Code Editor**: VS Code recommended

### Development Setup

#### Step 1: Fork and Clone
```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/jaredu3077.github.io.git
cd jaredu3077.github.io
```

#### Step 2: Set Up Development Environment
```bash
# Install dependencies (if any)
npm install

# Start development server
python -m http.server 8000
# or
npx live-server --port=8000
```

#### Step 3: Create a Branch
```bash
# Create a new branch for your changes
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

## 📋 Development Guidelines

### Code Style

#### JavaScript
- **ES6+**: Use modern JavaScript features
- **Modules**: Use ES6 module syntax
- **JSDoc**: Document all functions and classes
- **Error Handling**: Use try-catch blocks appropriately
- **Performance**: Optimize for 60fps animations

```javascript
/**
 * Example function with proper JSDoc
 * @param {string} param1 - Description of parameter
 * @param {number} param2 - Description of parameter
 * @returns {boolean} Description of return value
 */
export function exampleFunction(param1, param2) {
    try {
        // Implementation
        return true;
    } catch (error) {
        console.error('Error in exampleFunction:', error);
        return false;
    }
}
```

#### CSS
- **Consolidated File**: All styles in `neuos-complete.css`
- **CSS Custom Properties**: Use variables for theming
- **Circular Design**: Maintain 50% border-radius for UI elements
- **Performance**: Optimize for smooth animations
- **Hardware Acceleration**: Use transform: translateZ(0)

```css
/* Example CSS with custom properties and circular design */
.window {
    --window-bg: rgba(255, 255, 255, 0.1);
    --window-border: rgba(255, 255, 255, 0.2);
    background: var(--window-bg);
    border: 1px solid var(--window-border);
    transform: translateZ(0);
    will-change: transform;
}

.desktop-icon {
    border-radius: 50%;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
}
```

#### HTML
- **Semantic HTML**: Use proper semantic elements
- **Accessibility**: Include ARIA labels and roles
- **SEO**: Use proper meta tags and structure
- **Performance**: Optimize for fast loading

```html
<!-- Example semantic HTML with accessibility -->
<div class="window" role="dialog" aria-label="Application Window">
    <header class="window__header" role="banner">
        <h2 class="window__title">Window Title</h2>
    </header>
    <main class="window__content" role="main">
        <!-- Content -->
    </main>
</div>
```

### File Organization

#### JavaScript Files
```
js/
├── main.js              # Application entry point
├── config.js            # Configuration management
├── core/                # Core system modules
│   ├── boot.js         # Main boot orchestrator
│   ├── bootSequence.js # Boot animation system
│   ├── window.js       # Window management
│   ├── particleSystem.js # Particle system
│   ├── audioSystem.js  # Audio management
│   ├── backgroundMusic.js # Background music
│   ├── screensaver.js  # Screensaver system
│   ├── glassEffect.js  # Glass morphism system
│   └── Mixins/         # Particle system mixins
├── apps/                # Application modules
│   ├── terminal.js     # Terminal application
│   └── codex.js        # Knowledge base
└── utils/               # Utility modules
    ├── utils.js        # General utilities
    ├── help.js         # Help system
    ├── search.js       # Search functionality
    ├── mechvibes.js    # Typing sound system
    ├── draggable.js    # Window dragging system
    └── glassEffects.js # Glass effect utilities
```

#### CSS Files
```
├── neuos-complete.css   # Complete consolidated styling system
├── _glass.css           # Glass morphism effects (legacy)
├── _variables.css       # CSS custom properties (legacy)
├── _window.css          # Window styles (legacy)
├── _desktop.css         # Desktop styles (legacy)
├── _login.css           # Login styles (legacy)
├── _apps.css            # Application styles (legacy)
├── _animations.css      # Animation definitions (legacy)
└── _responsive.css      # Responsive styles (legacy)
```

#### Demoscene Platform
```
demoscene/
├── index.html          # Main demoscene interface
├── demoscene.html      # Alternative interface
├── manifest.json       # PWA manifest
├── sw.js              # Service worker
├── css/
│   └── DarkWave.css   # Demoscene styling
└── js/
    ├── main.js        # Main controller
    ├── demoscene.js   # Demo platform controller
    ├── DarkWaveAudio.js # Audio system with synthesis
    ├── DarkWaveCore.js # Core functionality
    ├── QuantumVortex.js # Quantum Vortex demo
    └── WebGLUtils.js  # WebGL utilities and shaders
```

### Naming Conventions

#### Files and Directories
- **JavaScript**: camelCase (`windowManager.js`)
- **CSS**: kebab-case (`window-styles.css`)
- **HTML**: kebab-case (`index.html`)
- **Directories**: kebab-case (`core-modules/`)

#### Variables and Functions
- **Variables**: camelCase (`windowManager`)
- **Functions**: camelCase (`createWindow()`)
- **Classes**: PascalCase (`WindowManager`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_WINDOW_COUNT`)

### File Tagging System

All files should include appropriate tags in comments:

```javascript
// [neu-os] - neuOS core files
// [game] - Game applications and features
// [secret] - Demoscene applications and website
```

#### Tag Usage
- **neu-os**: All neuOS files include this identifier
- **game**: Game applications and features
- **secret**: Demoscene applications/website

## 🎨 Design Guidelines

### Circular Design Language
- **Consistent Radius**: Use 50% border-radius for circular elements
- **Glass Effects**: Apply backdrop-filter and glass backgrounds
- **Smooth Transitions**: Use cubic-bezier transitions
- **Hardware Acceleration**: Enable GPU acceleration

```css
/* Circular design elements */
.circular-element {
    border-radius: 50%;
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateZ(0);
}
```

### Solar System Background
- **8 Rotating Rings**: Maintain concentric circle structure
- **Orbiting Elements**: Keep dynamic rotation animations
- **Layered Depth**: Use proper z-index layering
- **Performance**: Optimize for 60fps animations

### Color System
- **Primary**: Purple-based theme (#6366f1)
- **Background**: Ultra-dark theme (#030712)
- **Text**: High contrast white (#f8fafc)
- **Glass**: Semi-transparent with blur effects

## 🌟 Glass UI System Guidelines

### Overview
The glass UI system is a core component of neuOS that provides modern, translucent interface elements. All glass effects should maintain consistency and performance.

### Core Glass Classes

#### 1. `.neuos-glass-box` (Main Container)
Use this for large glass containers like boot/login screens:
```css
.my-glass-container {
    /* Inherit from neuos-glass-box */
    composes: neuos-glass-box;
    
    /* Custom properties */
    width: 400px;
    height: 400px;
    border-radius: 50%;
}
```

#### 2. `.neuos-widget` (Small Elements)
Use this for smaller glass elements:
```css
.my-glass-widget {
    /* Inherit from neuos-widget */
    composes: neuos-widget;
    
    /* Custom properties */
    width: 180px;
    height: 90px;
    border-radius: 20px;
}
```

#### 3. `.glass-login-btn` (Interactive Buttons)
Use this for glass buttons:
```css
.my-glass-button {
    /* Inherit from glass-login-btn */
    composes: glass-login-btn;
    
    /* Custom properties */
    padding: 16px 32px;
    border-radius: 12px;
}
```

### Creating New Glass Elements

#### 1. CSS Implementation
```css
/* New glass element */
.my-new-glass-element {
    /* Base glass properties */
    background: rgba(255,255,255,0.0015);
    backdrop-filter: blur(2px) saturate(150%) brightness(120%);
    -webkit-backdrop-filter: blur(2px) saturate(150%) brightness(120%);
    
    /* Shadow and depth */
    box-shadow: 0px 6px 24px rgba(0, 0, 0, 0.2);
    
    /* Performance optimizations */
    isolation: isolate;
    contain: layout style paint;
    backface-visibility: hidden;
    transform-style: flat;
    
    /* Border and shape */
    border-radius: 50%; /* or specific radius */
    border: 1px solid rgba(255, 255, 255, 0.15);
    
    /* Hardware acceleration */
    transform: translateZ(0);
    will-change: transform;
}
```

#### 2. JavaScript Integration
```javascript
// Using GlassMorphismSystem
const glassSystem = new GlassMorphismSystem();

// Add glass effect to existing element
glassSystem.addGlassEffect(element, {
    containerClass: 'my-glass-element',
    reflectionClass: 'glass-reflection',
    edgeClass: 'glass-edge',
    interactive: true
});

// Create glass text
const glassText = glassSystem.createGlassText('Hello World', {
    containerClass: 'glass-text-container',
    textClass: 'glass-title',
    interactive: true
});
```

#### 3. HTML Structure
```html
<!-- Glass element with proper structure -->
<div class="my-glass-element" role="dialog" aria-label="Glass Element">
    <div class="glass-reflection"></div>
    <div class="glass-edge"></div>
    <div class="glass-content">
        <!-- Content here -->
    </div>
</div>
```

### Glass Effect Best Practices

#### 1. Performance Optimization
```css
/* Always use hardware acceleration */
.glass-element {
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
}

/* Use efficient containment */
.glass-element {
    contain: layout style paint;
    isolation: isolate;
}
```

#### 2. Cross-browser Compatibility
```css
/* Always include webkit prefixes */
.glass-element {
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
}

/* Provide fallbacks */
@supports not (backdrop-filter: blur(1px)) {
    .glass-element {
        background: rgba(255, 255, 255, 0.1);
    }
}
```

#### 3. Responsive Design
```css
/* Mobile adjustments */
@media (max-width: 768px) {
    .my-glass-element {
        width: 300px;
        height: 300px;
        padding: 30px;
    }
}

@media (max-width: 480px) {
    .my-glass-element {
        width: 250px;
        height: 250px;
        padding: 20px;
    }
}
```

### Glass System Testing

#### 1. Visual Testing Checklist
- [ ] Glass effect renders correctly
- [ ] Backdrop blur works as expected
- [ ] Shadows and depth are visible
- [ ] Interactive effects respond properly
- [ ] Performance is smooth (60fps)
- [ ] Cross-browser compatibility

#### 2. Performance Testing
```javascript
// Test glass effect performance
const testGlassPerformance = () => {
    const start = performance.now();
    
    // Create multiple glass elements
    for (let i = 0; i < 10; i++) {
        const element = document.createElement('div');
        element.className = 'my-glass-element';
        document.body.appendChild(element);
    }
    
    const end = performance.now();
    console.log(`Glass creation took ${end - start}ms`);
};
```

#### 3. Accessibility Testing
```javascript
// Test glass element accessibility
const testGlassAccessibility = () => {
    const glassElements = document.querySelectorAll('.glass-element');
    
    glassElements.forEach(element => {
        // Check for proper ARIA labels
        const hasAriaLabel = element.hasAttribute('aria-label');
        
        // Check for proper focus indicators
        const hasFocusIndicator = getComputedStyle(element).outline !== 'none';
        
        console.log(`Glass element accessibility:`, {
            hasAriaLabel,
            hasFocusIndicator
        });
    });
};
```

### Troubleshooting Glass Effects

#### 1. Glass Effect Not Visible
```css
/* Check these properties */
.glass-element {
    /* Ensure background is transparent */
    background: rgba(255,255,255,0.0015);
    
    /* Verify backdrop-filter is applied */
    backdrop-filter: blur(2px) saturate(150%) brightness(120%);
    -webkit-backdrop-filter: blur(2px) saturate(150%) brightness(120%);
    
    /* Check z-index stacking */
    z-index: 1000;
}
```

#### 2. Performance Issues
```css
/* Optimize for performance */
.glass-element {
    /* Reduce blur intensity */
    backdrop-filter: blur(1px) saturate(120%) brightness(110%);
    
    /* Use hardware acceleration */
    transform: translateZ(0);
    will-change: transform;
    
    /* Limit number of glass elements */
    /* Consider using CSS containment */
    contain: layout style paint;
}
```

#### 3. Cross-browser Issues
```javascript
// Check backdrop-filter support
const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(1px)');

if (!supportsBackdropFilter) {
    // Apply fallback styles
    document.querySelectorAll('.glass-element').forEach(element => {
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
}
```

### Glass System Contribution Guidelines

#### 1. Before Contributing Glass Changes
- [ ] Test in all target browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify performance impact (60fps target)
- [ ] Check accessibility compliance
- [ ] Ensure responsive design works
- [ ] Test with reduced motion preferences

#### 2. Glass Effect Submission Checklist
- [ ] CSS follows glass system conventions
- [ ] JavaScript integrates with GlassMorphismSystem
- [ ] Performance optimizations included
- [ ] Cross-browser compatibility verified
- [ ] Accessibility features implemented
- [ ] Documentation updated

#### 3. Glass Effect Review Process
1. **Visual Review**: Check glass effect appearance
2. **Performance Review**: Verify 60fps performance
3. **Accessibility Review**: Test with screen readers
4. **Cross-browser Review**: Test in all browsers
5. **Code Review**: Check code quality and conventions

## 🔧 Performance Guidelines

### CSS Optimization
- **Consolidated File**: Use `neuos-complete.css` for all styles
- **Hardware Acceleration**: Enable GPU acceleration
- **Efficient Selectors**: Use specific, efficient CSS selectors
- **Minimize Reflows**: Use transform instead of position changes

### JavaScript Optimization
- **Module Loading**: ES6 modules for better tree-shaking
- **Event Delegation**: Efficient event handling
- **Debouncing**: Optimize for frequent events
- **Memory Management**: Proper cleanup of event listeners

### Animation Performance
- **60fps Target**: Optimize for smooth animations
- **Hardware Acceleration**: Use transform and opacity
- **Reduced Motion**: Respect user preferences
- **Performance Monitoring**: Track frame rates

## 🧪 Testing Guidelines

### Manual Testing Checklist
Before submitting a pull request, ensure:

- [ ] **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- [ ] **Responsive Design**: Mobile, tablet, desktop
- [ ] **Accessibility**: Keyboard navigation, screen readers
- [ ] **Performance**: 60fps animations, < 3s load time
- [ ] **Audio System**: Mechvibes and background music
- [ ] **Particle System**: All particle modes work
- [ ] **Window Management**: Drag, resize, focus
- [ ] **Terminal Commands**: All commands functional
- [ ] **Circular UI**: All circular elements render properly
- [ ] **Solar System**: Background animations smooth
- [ ] **Glass Effects**: All glass elements render correctly
- [ ] **Glass Interactions**: Hover and focus states work

### Automated Testing
```bash
# Run linting
npm run lint

# Check for accessibility issues
npm run a11y

# Performance testing
npm run perf
```

## 📝 Documentation Standards

### Code Documentation
- **JSDoc**: Document all functions and classes
- **Inline Comments**: Explain complex logic
- **README Updates**: Update documentation for new features
- **Architecture Docs**: Update architecture documentation

### Commit Messages
Use conventional commit format:

```bash
feat: add circular desktop icons
fix: resolve window dragging performance issue
docs: update installation guide
style: improve glass morphism effects
refactor: consolidate CSS files
test: add accessibility testing
```

## 🚀 Pull Request Process

### Before Submitting
1. **Test Thoroughly**: Run all manual tests
2. **Check Performance**: Ensure 60fps animations
3. **Update Documentation**: Update relevant docs
4. **Follow Guidelines**: Adhere to coding standards

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Accessibility enhancement
- [ ] Glass UI enhancement

## Testing
- [ ] Cross-browser testing completed
- [ ] Performance testing completed
- [ ] Accessibility testing completed
- [ ] Manual testing completed
- [ ] Glass effect testing completed

## Screenshots
Add screenshots if UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Performance impact assessed
- [ ] Glass effects render correctly
```

## 🐛 Bug Reports

### Bug Report Template
```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [Chrome/Firefox/Safari/Edge]
- Version: [Version number]
- OS: [Operating system]
- Device: [Desktop/Mobile/Tablet]

## Console Errors
Any error messages from browser console

## Screenshots
Visual evidence if applicable
```

## ✨ Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why this feature would be useful

## Proposed Implementation
How you think it should be implemented

## Alternatives Considered
Other approaches you considered

## Additional Context
Any other relevant information
```

## 🎵 Audio Contributions

### Mechvibes Integration
- **Sound Packs**: Create new sound packs
- **Key Mapping**: Improve key-to-sound mappings
- **Performance**: Optimize audio loading
- **Volume Control**: Enhance volume management

### Background Music
- **Music Selection**: Suggest new background tracks
- **Audio Processing**: Improve audio effects
- **Looping**: Enhance seamless looping
- **Controls**: Improve audio controls

## 🎨 Demoscene Contributions

### WebGL Graphics
- **Shaders**: Create new GLSL shaders
- **Particle Systems**: Enhance particle effects
- **3D Scenes**: Build new 3D environments
- **Post-processing**: Add visual effects

### Audio Synthesis
- **Chiptune Generation**: Create new music algorithms
- **FM Synthesis**: Enhance sound synthesis
- **Real-time Effects**: Add audio effects
- **Visualization**: Improve audio visualization

## 🌟 Recognition

### Contributor Recognition
- **GitHub Profile**: Contributors listed on GitHub
- **Documentation**: Contributors mentioned in docs
- **Release Notes**: Contributors credited in releases
- **Special Thanks**: Long-term contributors recognized

### Contribution Levels
- **Bronze**: 1-5 contributions
- **Silver**: 6-15 contributions
- **Gold**: 16+ contributions
- **Platinum**: Major feature contributions

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions
- **Pull Requests**: For code contributions
- **Documentation**: For self-help resources

### Code of Conduct
- **Respect**: Treat all contributors with respect
- **Inclusion**: Welcome contributors from all backgrounds
- **Constructive Feedback**: Provide helpful, constructive feedback
- **Learning**: Help others learn and grow

---

*Thank you for contributing to neuOS! Your contributions help make this project better for everyone. Together, we can create an amazing web-based operating system experience.* 