# neuOS Project Documentation

## Overview

This directory contains comprehensive documentation for the neuOS web application project. neuOS is an interactive web-based operating system interface that serves as a portfolio for Jared U., a senior network engineer. The project implements a modern, glassmorphic UI design with advanced audio-visual effects, particle systems, and a terminal-based interface.

## Documentation Structure

```
docs/
├── README.md                    # This file - Documentation overview
├── project-overview.md          # Comprehensive project overview
├── architecture.md              # Overall project architecture
├── index.md                     # Main HTML entry point documentation
├── main.md                      # JavaScript entry point documentation
├── sw.md                        # Service Worker documentation
├── config.md                    # Configuration system documentation
├── terminal.md                  # Terminal application documentation
├── core-systems.md              # Core system modules documentation
├── utils.md                     # Utility modules documentation
├── css-system.md                # CSS system documentation
├── DOTHISNEXT.md               # Issues requiring attention
├── THEMING_STANDARDIZATION.md  # Theming system documentation
└── config/
    └── manifest.md              # PWA manifest documentation
```

## Quick Navigation

### Project Overview
- **[project-overview.md](project-overview.md)** - Comprehensive project overview and architecture

### Core Files
- **[architecture.md](architecture.md)** - Complete project overview, dependency graph, and system architecture
- **[index.md](index.md)** - HTML5 entry point with PWA support and accessibility features
- **[main.md](main.md)** - JavaScript module system and application initialization
- **[sw.md](sw.md)** - Service Worker for offline functionality and caching

### Applications
- **[terminal.md](terminal.md)** - Terminal application documentation and command system

### Core Systems
- **[core-systems.md](core-systems.md)** - Core system modules and functionality

### Utilities
- **[utils.md](utils.md)** - Utility modules and helper functions

### Styling
- **[css-system.md](css-system.md)** - CSS system and design framework

### Configuration
- **[config.md](config.md)** - Configuration management system and application settings
- **[config/manifest.md](config/manifest.md)** - PWA manifest and installation features

### Development
- **[DOTHISNEXT.md](DOTHISNEXT.md)** - Issues requiring attention and refactoring needs
- **[THEMING_STANDARDIZATION.md](THEMING_STANDARDIZATION.md)** - Theming system implementation

## Project Architecture

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Audio**: Howler.js library for audio management
- **PWA**: Service Worker for offline functionality
- **Graphics**: Canvas API for starfield background
- **Effects**: CSS filters, SVG filters, custom animations

### Core Systems
1. **Boot System** - Application startup sequence with glassmorphic effects
2. **Window Manager** - Application window management with drag and drop
3. **Glass Effect System** - Glassmorphic UI effects and animations
4. **Particle System** - Background particle animations and effects
5. **Audio System** - Sound effects and background music with mechvibes
6. **Theme Manager** - UI theme management with design tokens
7. **Terminal System** - Command-line interface with network engineering commands
8. **Draggable System** - Drag and drop functionality for windows and elements

### Module Organization
```
js/
├── main.js              # Application entry point
├── config.js            # Configuration management
├── core/                # Core system modules
│   ├── boot.js          # Boot sequence management
│   ├── window.js        # Window management system
│   ├── glassEffect.js   # Glassmorphic effects
│   ├── particleSystem.js # Particle system
│   ├── audioSystem.js   # Audio management
│   ├── themeManager.js  # Theme management
│   ├── screensaver.js   # Screensaver functionality
│   └── ...              # Additional core modules
├── apps/                # Application modules
│   └── terminal/        # Terminal application
│       ├── terminal.js  # Main terminal logic
│       ├── commands/    # Command implementations
│       └── ...          # Terminal utilities
└── utils/               # Utility modules
    ├── draggable.js     # Drag and drop functionality
    ├── mobile.js        # Mobile utilities
    ├── mechvibes.js     # Mechanical keyboard sounds
    ├── utils.js         # General utilities
    ├── glassEffects.js  # Glass effect utilities
    └── help.js          # Help system
```

## Standards Compliance

### HTML5 Standards
- ✅ Semantic HTML elements (`<main>`, `<section>`, `<nav>`)
- ✅ ARIA attributes for accessibility
- ✅ Meta tags for SEO and PWA
- ✅ Content Security Policy headers
- ✅ Structured data (JSON-LD)

### CSS3 Standards
- ✅ CSS Custom Properties (variables)
- ✅ Flexbox and Grid layouts
- ✅ Media queries for responsive design
- ✅ CSS animations and transitions
- ✅ CSS filters and transforms
- ✅ Design tokens system

### JavaScript ES6+ Standards
- ✅ ES6 modules (import/export)
- ✅ Arrow functions
- ✅ Template literals
- ✅ Destructuring assignment
- ✅ Async/await for asynchronous operations
- ✅ Class syntax for object-oriented programming

### PWA Standards
- ✅ Web App Manifest
- ✅ Service Worker for offline functionality
- ✅ Installable application
- ✅ Responsive design
- ✅ Fast loading performance

## Performance Considerations

### Loading Optimization
- CSS files loaded in dependency order with design tokens first
- JavaScript modules use ES6 imports for tree-shaking
- Audio files preloaded for immediate playback
- Service Worker for caching and offline functionality

### Runtime Performance
- Particle system uses requestAnimationFrame for smooth animations
- Debounced event handlers for resize and scroll events
- Lazy loading of application content
- Efficient DOM manipulation with querySelector

## Security Features

### Content Security Policy
- Restricted script sources to 'self' and 'unsafe-inline'
- Restricted style sources to 'self' and 'unsafe-inline'
- Restricted image sources to 'self' and data URIs
- Restricted font sources to 'self'

### XSS Protection
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Input sanitization in terminal commands
- Safe DOM manipulation practices

## Accessibility Features

### ARIA Implementation
- Proper ARIA labels and descriptions
- Live regions for dynamic content
- Focus management for keyboard navigation
- Screen reader announcements

### Keyboard Navigation
- Tab order management
- Keyboard shortcuts for applications
- Focus indicators for interactive elements
- Escape key handling for modals

## Browser Compatibility

### Supported Browsers
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Feature Detection
- Service Worker availability
- ES6 module support
- Canvas API support
- Audio API support
- CSS Grid support

## Development Guidelines

### Code Organization
- Modular architecture with clear separation of concerns
- ES6 modules for dependency management
- Consistent naming conventions
- Comprehensive error handling

### Documentation Standards
- JSDoc comments for all functions
- README files for major components
- Inline comments for complex logic
- Architecture diagrams for system relationships

### Testing Considerations
- Unit tests for utility functions
- Integration tests for core systems
- Cross-browser compatibility testing
- Performance benchmarking

## File Relationships

### Core Dependencies
```
index.html → main.js → core modules → utility modules
```

### CSS Dependencies
```
design-tokens.css → glass.css → window-base.css → terminal.css → desktop.css → animations.css → responsive.css → mobile.css → apps.css → theme.css → terminal-icon.css
```

### JavaScript Dependencies
```
main.js → config.js → core/*.js → apps/terminal/*.js → utils/*.js
```

## Cross-References

### Architecture Documentation
- See [architecture.md](architecture.md) for complete system overview
- See [main.md](main.md) for JavaScript entry point details
- See [index.md](index.md) for HTML structure and PWA features

### Configuration Documentation
- See [config.md](config.md) for configuration management
- See [config/manifest.md](config/manifest.md) for PWA manifest details

### Application Documentation
- See [terminal.md](terminal.md) for terminal application and command system

### Core System Documentation
- See [core-systems.md](core-systems.md) for core system modules and functionality

### Utility Documentation
- See [utils.md](utils.md) for utility modules and helper functions

### Styling Documentation
- See [css-system.md](css-system.md) for CSS system and design framework

### Project Documentation
- See [project-overview.md](project-overview.md) for comprehensive project overview

### Service Documentation
- See [sw.md](sw.md) for Service Worker and offline functionality

### Development Documentation
- See [DOTHISNEXT.md](DOTHISNEXT.md) for issues requiring attention
- See [THEMING_STANDARDIZATION.md](THEMING_STANDARDIZATION.md) for theming system

## Contributing to Documentation

### Documentation Updates
When updating the project, ensure documentation reflects:
1. New file dependencies
2. Updated module relationships
3. Changed configuration options
4. New features or capabilities

### Documentation Standards
- Use consistent formatting and structure
- Include code examples where relevant
- Maintain cross-reference accuracy
- Update connection tables when files change

## Additional Resources

### External Documentation
- [HTML5 Specification](https://html.spec.whatwg.org/)
- [CSS3 Specification](https://www.w3.org/TR/CSS/)
- [JavaScript ES6+ Documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

### Project Resources
- [GitHub Repository](https://github.com/jaredu3077/jaredu3077.github.io)
- [Live Application](https://jaredu3077.github.io/)
- [README.md](../README.md) - Project overview and setup instructions

---

*This documentation is maintained as part of the neuOS project. For questions or contributions, please refer to the project repository.* 