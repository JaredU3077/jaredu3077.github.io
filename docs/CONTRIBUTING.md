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
- **BEM Methodology**: Use Block__Element--Modifier naming
- **CSS Custom Properties**: Use variables for theming
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimize for smooth animations

```css
/* Example CSS with BEM and custom properties */
.window {
    --window-bg: rgba(255, 255, 255, 0.1);
    --window-border: rgba(255, 255, 255, 0.2);
    background: var(--window-bg);
    border: 1px solid var(--window-border);
}

.window__header {
    /* Header styles */
}

.window--maximized {
    /* Maximized state styles */
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
│   └── glassEffect.js  # Glass morphism system
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
├── theme.css           # Main stylesheet
├── _variables.css      # CSS custom properties
├── _window.css         # Window styles
├── _desktop.css        # Desktop styles
├── _login.css          # Login styles
├── _apps.css           # Application styles
├── _animations.css     # Animation definitions
├── _responsive.css     # Responsive styles
└── _glass.css          # Glass morphism effects
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
// [neu-os] - For neuOS core files
// [game] - For game applications and features
// [secret] - For demoscene applications and website
```

## 🧪 Testing

### Manual Testing Checklist
Before submitting a pull request, test the following:

#### Core Functionality
- [ ] Boot sequence works correctly
- [ ] Login screen appears and functions
- [ ] Desktop icons are clickable
- [ ] Windows can be created and managed
- [ ] Particle system is visible and interactive
- [ ] Audio system works (Mechvibes and background music)
- [ ] Glass morphism effects render properly

#### Applications
- [ ] Terminal opens and responds to commands
- [ ] Codex opens and search works
- [ ] All applications close properly
- [ ] Window focus management works
- [ ] "show demoscene" command works

#### Demoscene Platform
- [ ] Demoscene loads correctly
- [ ] Quantum Vortex demo works
- [ ] WebGL graphics render properly
- [ ] Audio synthesis works
- [ ] Creation tools function
- [ ] PWA features work offline

#### Responsive Design
- [ ] Mobile layout works correctly
- [ ] Tablet layout is appropriate
- [ ] Desktop layout is optimal
- [ ] Touch interactions work on mobile

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] High contrast is readable
- [ ] Reduced motion is respected

#### Performance
- [ ] Page loads in under 3 seconds
- [ ] Animations are smooth (60fps)
- [ ] No memory leaks
- [ ] CPU usage is reasonable

### Browser Testing
Test in the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## 📝 Documentation

### Code Documentation
- **JSDoc**: Document all functions and classes
- **Inline Comments**: Explain complex logic
- **README Updates**: Update relevant documentation
- **API Documentation**: Document public APIs

### User Documentation
- **Installation Guide**: Keep installation instructions current
- **User Guide**: Document new features
- **Troubleshooting**: Add solutions for common issues
- **Architecture Documentation**: Keep architecture docs updated

## 🔄 Pull Request Process

### Before Submitting
1. **Test Thoroughly**: Ensure all functionality works
2. **Check Code Style**: Follow the established conventions
3. **Update Documentation**: Update relevant docs
4. **Squash Commits**: Clean up commit history
5. **Add Tags**: Include appropriate file tags

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Accessibility improvement
- [ ] Audio enhancement
- [ ] Demoscene contribution

## Testing
- [ ] Manual testing completed
- [ ] Cross-browser testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed
- [ ] Demoscene testing completed (if applicable)

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] No performance regressions
- [ ] File tags added appropriately
```

### Review Process
1. **Automated Checks**: CI/CD pipeline runs tests
2. **Code Review**: Maintainers review the code
3. **Testing**: Manual testing by maintainers
4. **Approval**: Changes approved and merged

## 🐛 Bug Reports

### Bug Report Template
```markdown
## Bug Description
Clear description of the bug

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
- OS: [Windows/macOS/Linux]
- Device: [Desktop/Mobile/Tablet]

## Console Errors
Any error messages from browser console

## Screenshots
Screenshots if applicable
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why this feature is needed

## Proposed Implementation
How you think it should be implemented

## Alternatives Considered
Other approaches you considered

## Additional Context
Any other relevant information
```

## 🎨 Design Guidelines

### Visual Design
- **Space Theme**: Maintain the space aesthetic
- **Glass Morphism**: Use backdrop blur effects
- **Smooth Animations**: 60fps transitions
- **Consistent Spacing**: 8px grid system

### Color Palette
```css
/* Primary Colors */
--primary-color: #4a90e2;
--primary-hover: #357abd;
--accent-color: #8b5cf6;

/* Background Colors */
--background-dark: #181f2a;
--background-light: #2a2f3e;

/* Text Colors */
--text-color: #eaf1fb;
--text-muted: #a8a8a8;
```

### Typography
- **Code**: JetBrains Mono
- **UI**: System fonts (Segoe UI, -apple-system, etc.)
- **Sizes**: Responsive typography scale

## 🎵 Audio Guidelines

### Mechvibes Integration
- **Sound Quality**: High-quality typing sounds
- **Key Mapping**: Comprehensive key-to-sound mapping
- **Performance**: Low-latency audio playback
- **Volume Control**: Adjustable volume levels

### Background Music
- **Looping**: Seamless background music
- **Controls**: Play/pause functionality
- **Volume**: Independent volume control
- **Auto-restart**: Automatic restart on completion

## 🎨 Demoscene Guidelines

### WebGL Development
- **Performance**: 60fps target for all demos
- **Shaders**: Custom GLSL shaders
- **Audio Reactivity**: Visual effects synchronized to audio
- **Mobile Support**: Touch-friendly controls

### Audio Synthesis
- **Chiptune Style**: 8-bit aesthetic
- **Real-time Generation**: Web Audio API synthesis
- **Effects Chain**: Reverb, delay, distortion
- **Multiple Tracks**: Unique audio for each demo

## 🔧 Development Tools

### Recommended VS Code Extensions
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Live Server**: Local development server
- **Auto Rename Tag**: HTML tag management
- **CSS Peek**: CSS navigation
- **JavaScript (ES6) code snippets**: Code snippets

### Useful Commands
```bash
# Format code
npm run format

# Lint code
npm run lint

# Start development server
npm run dev

# Build for production
npm run build
```

## 📊 Performance Guidelines

### Optimization Targets
- **Page Load**: < 3 seconds
- **Animation Frame Rate**: 60fps
- **Memory Usage**: < 100MB
- **CPU Usage**: < 20% during normal operation

### Performance Best Practices
- **Lazy Loading**: Load resources on demand
- **Debouncing**: Optimize event handlers
- **Hardware Acceleration**: Use `transform3d` for animations
- **Memory Management**: Clean up event listeners and timers

## 🔒 Security Guidelines

### Security Best Practices
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Escape user content
- **CSP Headers**: Maintain content security policy
- **HTTPS Only**: Use secure connections

### Security Checklist
- [ ] No inline scripts
- [ ] Input sanitization implemented
- [ ] CSP headers maintained
- [ ] No sensitive data in client-side code

## 🆘 Getting Help

### Resources
- **Documentation**: Check the docs folder
- **Issues**: Search existing issues
- **Discussions**: Use GitHub Discussions
- **Code Review**: Ask for help in pull requests

### Communication
- **Be Respectful**: Treat others with respect
- **Be Clear**: Provide clear, detailed information
- **Be Patient**: Allow time for responses
- **Be Helpful**: Help others when you can

## 📜 Code of Conduct

### Our Standards
- **Inclusive**: Welcome contributors from all backgrounds
- **Respectful**: Treat everyone with respect
- **Professional**: Maintain professional behavior
- **Constructive**: Provide constructive feedback

### Enforcement
- **Reporting**: Report violations to maintainers
- **Investigation**: Issues will be investigated
- **Action**: Appropriate action will be taken
- **Appeal**: Decisions can be appealed

## 🏆 Recognition

### Contributors
- **Contributors List**: All contributors are listed in the repository
- **Special Thanks**: Significant contributors receive special recognition
- **Badges**: Contributors can display badges on their profiles

### Contribution Levels
- **Bronze**: 1-5 contributions
- **Silver**: 6-15 contributions
- **Gold**: 16+ contributions
- **Platinum**: Major feature contributions

## 🎮 Terminal Commands

### Available Commands
- `help` - Show all available commands
- `particles <mode>` - Control particle system
- `effects <on|off>` - Toggle visual effects
- `audio <on|off>` - Toggle audio system
- `show demoscene` - Access demoscene platform
- `system <cmd>` - System operations
- `theme <cmd>` - Theme control
- `performance <cmd>` - Performance monitoring

### Adding New Commands
When adding new terminal commands:
1. Update the help text in `js/config.js`
2. Implement the command in `js/apps/terminal.js`
3. Add appropriate error handling
4. Test thoroughly
5. Update documentation

---

*Thank you for contributing to neuOS! Your contributions help make this project better for everyone. If you have any questions, don't hesitate to ask.* 