# neuOS Documentation

Welcome to the neuOS documentation! This directory contains comprehensive documentation for the neuOS web-based operating system simulator.

## 📚 Documentation Overview

### Core Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete system architecture and technical details
- **[INSTALLATION.md](./INSTALLATION.md)** - Installation, setup, and deployment guide
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project

## 🚀 Quick Start

### For Users
1. Visit [https://jaredu3077.github.io](https://jaredu3077.github.io)
2. Experience the boot sequence with solar system animation
3. Click "enter" to access the system
4. Explore applications and features
5. Access the secret demoscene via terminal: `show demoscene`

### For Developers
1. Clone the repository
2. Set up local development server
3. Read the [Architecture Documentation](./ARCHITECTURE.md)
4. Follow the [Contributing Guidelines](./CONTRIBUTING.md)

## 🏗️ System Overview

neuOS is a sophisticated web-based operating system simulator featuring:

### Core Features
- **Solar System Interface**: Dynamic background with 8 rotating rings and orbs
- **Circular Glass Morphism**: All UI elements use circular design language
- **Interactive Particle System**: Dynamic visual effects with mouse interaction
- **Modular Architecture**: Clean, maintainable codebase
- **Audio Integration**: Mechvibes typing sounds and background music
- **Responsive Design**: Works on all devices
- **Accessibility**: WCAG 2.1 compliant

### Applications
- **Terminal**: Command-line interface with network simulation
- **Codex**: Knowledge base with search functionality
- **Demoscene**: Secret platform with WebGL graphics and audio synthesis

### Technical Highlights
- **ES6 Modules**: Modern JavaScript architecture
- **Hardware Acceleration**: Optimized for 60fps performance
- **PWA Ready**: Progressive web app capabilities
- **Cross-browser**: Works on all modern browsers
- **Consolidated CSS**: Single `neuos-complete.css` file for optimal performance

## 📁 Project Structure

```
jaredu3077.github.io/
├── index.html                 # Main entry point
├── neuos-complete.css         # Complete consolidated styling system
├── _glass.css                 # Glass morphism effects (legacy)
├── _variables.css             # CSS custom properties (legacy)
├── _window.css               # Window management styles (legacy)
├── _desktop.css              # Desktop interface styles (legacy)
├── _login.css                # Login screen styles (legacy)
├── _apps.css                 # Application styles (legacy)
├── _animations.css           # Animation definitions (legacy)
├── _responsive.css           # Responsive design styles (legacy)
├── config.json               # Mechvibes sound configuration
├── codex.txt                 # Knowledge base content
├── resume.txt                # Resume content
├── mp3.mp3                   # Background music
├── sound.ogg                 # Sound effects
├── js/                       # JavaScript modules
│   ├── main.js              # Application controller
│   ├── config.js            # Configuration management
│   ├── core/                # Core system modules
│   ├── apps/                # Application modules
│   └── utils/               # Utility modules
├── demoscene/                # Secret demoscene platform
└── docs/                     # Documentation
```

## 🎮 Key Features

### Solar System Background
- **8 Rotating Rings**: Concentric circles with varying opacity
- **Orbiting Elements**: Dynamic orbs that rotate around the center
- **Layered Depth**: Multiple z-index layers for 3D effect
- **Performance Optimized**: Hardware-accelerated animations

### Circular UI Design
- **Circular Boot/Login**: 400px diameter circular containers
- **Circular neuOS Widget**: Perfect circle with glass effects
- **Circular Desktop Icons**: All icons are circular with glass styling
- **Consistent Radius**: 50% border-radius throughout interface

### Interactive Terminal
- Network simulation commands
- System control functions
- Particle system control
- Audio system management
- Demoscene access

### Enhanced Particle System
- Multiple modes (rain, storm, calm, dance, normal)
- Mouse interaction with attraction/repulsion
- Physics-based movement
- Performance optimized with reduced motion support

### Audio System
- Mechvibes typing sounds
- Background music with controls
- Real-time audio synthesis
- Volume controls with visual indicators

### Glass Morphism
- Backdrop blur effects
- Dynamic glass properties
- Cross-browser compatibility
- Performance optimized with hardware acceleration

## 🎨 Demoscene Platform

The secret demoscene platform features:

### Quantum Vortex Demo
- Advanced 3D WebGL particle system
- Custom GLSL shaders
- Audio-reactive visual effects
- Bloom and post-processing effects

### Creation Tools
- Canvas editor for 2D graphics
- WebGL editor for 3D scenes
- Audio editor for synthesis
- Code editor for live JavaScript

### Audio Synthesis
- 8-bit chiptune generation
- FM synthesis capabilities
- Real-time visualization
- Multiple audio tracks

## 🔧 Development

### Prerequisites
- Modern browser with ES6+ support
- Node.js 14+ (for development)
- Git for version control

### Setup
```bash
# Clone the repository
git clone https://github.com/jaredu3077/jaredu3077.github.io.git
cd jaredu3077.github.io

# Start development server
python -m http.server 8000
# or
npx live-server --port=8000
```

### Code Conventions
- **File Tags**: Use appropriate tags ([neu-os], [game], [secret])
- **Naming**: camelCase for variables, PascalCase for classes
- **Documentation**: JSDoc for all functions
- **Testing**: Manual testing checklist before PRs
- **CSS**: All styles consolidated in `neuos-complete.css`

## 🐛 Troubleshooting

### Common Issues
- **Audio not working**: Check browser permissions and Web Audio API support
- **Particles not visible**: Enable hardware acceleration
- **Windows not draggable**: Check interact.js library loading
- **Terminal not responding**: Ensure JavaScript modules loaded properly
- **Circular elements not rendering**: Check CSS border-radius support

### Performance Issues
- Reduce particle count: `particles 25`
- Disable effects: `effects off`
- Close unnecessary windows
- Check browser performance settings
- Enable hardware acceleration

## 📊 Performance Metrics

- **Page Load**: < 3 seconds
- **Animation Frame Rate**: 60fps
- **Memory Usage**: < 100MB
- **CPU Usage**: < 20% during normal operation
- **CSS File Size**: ~78KB consolidated

## 🔒 Security

### Content Security Policy
- Restricted script sources
- Validated style sources
- Secure image and font sources
- Input validation and sanitization

### Best Practices
- HTTPS only in production
- No inline scripts
- Proper XSS protection
- CSRF protection

## ♿ Accessibility

### WCAG 2.1 Compliance
- Full keyboard navigation
- Screen reader support
- High contrast ratios
- Reduced motion support
- Clear focus indicators

### Features
- Live regions for dynamic content
- Skip links for navigation
- Alt text for all images
- Semantic HTML structure

## 🌐 Browser Support

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 80+ | ✅ Full Support | Recommended |
| Firefox | 75+ | ✅ Full Support | Excellent performance |
| Safari | 13+ | ✅ Full Support | Good performance |
| Edge | 80+ | ✅ Full Support | Chromium-based |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Types of Contributions
- 🐛 Bug reports and fixes
- ✨ Feature requests and implementations
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🎵 Audio system improvements
- 🎨 Demoscene platform contributions

## 📞 Support

### Getting Help
1. Check this documentation
2. Review browser console for errors
3. Search existing GitHub issues
4. Create a new issue with detailed information

### Reporting Issues
Include:
- Browser and version
- Operating system
- Steps to reproduce
- Console errors
- Screenshots if applicable

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **Mechvibes**: For the typing sound system
- **Interact.js**: For drag and drop functionality
- **Font Awesome**: For icons
- **WebGL Community**: For graphics inspiration
- **Apple Design**: For glass morphism inspiration 