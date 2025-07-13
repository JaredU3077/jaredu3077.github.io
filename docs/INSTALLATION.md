# neuOS Installation & Setup Guide

## Prerequisites

### System Requirements
- **Browser**: Modern browser with ES6+ support (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **JavaScript**: ES6 modules support enabled
- **Audio**: Web Audio API support for sound effects and Mechvibes
- **Storage**: At least 50MB free space for assets
- **Memory**: 2GB RAM recommended for smooth performance
- **Graphics**: Hardware acceleration recommended for particle effects and solar system animations

### Browser Compatibility
| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 80+ | ✅ Full Support | Recommended browser |
| Firefox | 75+ | ✅ Full Support | Excellent performance |
| Safari | 13+ | ✅ Full Support | Good performance |
| Edge | 80+ | ✅ Full Support | Chromium-based |
| Opera | 67+ | ✅ Full Support | Chromium-based |

## 🚀 Quick Start

### Option 1: Direct Access (Recommended)
1. **Visit the Site**: Navigate to [https://jaredu3077.github.io](https://jaredu3077.github.io)
2. **Experience the Boot**: Watch the system initialize with solar system animations
3. **Login**: Click "enter" to access the system
4. **Explore**: Click on circular desktop icons to launch applications
5. **Discover**: Access the secret demoscene via terminal command "show demoscene"

### Option 2: Local Development

#### Step 1: Clone the Repository
```bash
git clone https://github.com/jaredu3077/jaredu3077.github.io.git
cd jaredu3077.github.io
```

#### Step 2: Set Up Local Server
Choose one of the following methods:

**Method A: Using Python (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Method B: Using Node.js**
```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8000
```

**Method C: Using PHP**
```bash
php -S localhost:8000
```

#### Step 3: Access the Application
1. Open your browser
2. Navigate to `http://localhost:8000`
3. Experience neuOS locally

## 🔧 Development Setup

### Prerequisites for Development
- **Node.js**: 14+ (for development tools)
- **Git**: For version control
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - Live Server
  - JavaScript (ES6) code snippets

### Development Environment Setup

#### Step 1: Install Dependencies
```bash
# Install development dependencies
npm install

# Or if using yarn
yarn install
```

#### Step 2: Development Server
```bash
# Start development server with live reload
npm run dev

# Or using live-server
npx live-server --port=8000
```

#### Step 3: Code Quality Tools
```bash
# Lint JavaScript files
npm run lint

# Format code
npm run format

# Check for security vulnerabilities
npm audit
```

## 📁 Project Structure for Development

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
│   │   ├── boot.js         # Main boot orchestrator
│   │   ├── bootSequence.js # Boot animation system
│   │   ├── window.js       # Window management system
│   │   ├── particleSystem.js # Particle system engine
│   │   ├── audioSystem.js  # Audio management
│   │   ├── backgroundMusic.js # Background music system
│   │   ├── screensaver.js  # Screensaver system
│   │   └── glassEffect.js  # Glass morphism system
│   ├── apps/                # Application modules
│   │   ├── terminal.js     # Terminal application
│   │   └── codex.js        # Knowledge base app
│   └── utils/               # Utility modules
│       ├── utils.js        # General utilities
│       ├── help.js         # Help system
│       ├── search.js       # Search functionality
│       ├── mechvibes.js    # Typing sound system
│       ├── draggable.js    # Window dragging system
│       └── glassEffects.js # Glass effect utilities
├── demoscene/                # Secret demoscene platform
│   ├── index.html          # Main demoscene interface
│   ├── demoscene.html      # Alternative interface
│   ├── manifest.json       # PWA manifest
│   ├── sw.js               # Service worker
│   ├── css/
│   │   └── DarkWave.css    # Demoscene styling
│   └── js/
│       ├── main.js         # Main controller
│       ├── demoscene.js    # Demo platform controller
│       ├── DarkWaveAudio.js # Audio system with synthesis
│       ├── DarkWaveCore.js # Core functionality
│       ├── QuantumVortex.js # Quantum Vortex demo
│       └── WebGLUtils.js   # WebGL utilities and shaders
└── docs/                     # Documentation
```

## 🎮 Configuration

### Environment Configuration
The system automatically detects the environment and adjusts settings:

```javascript
// Development environment
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    // Development settings
    CONFIG.DEBUG = true;
    CONFIG.LOG_LEVEL = 'debug';
}

// Production environment
if (location.hostname === 'jaredu3077.github.io') {
    // Production settings
    CONFIG.DEBUG = false;
    CONFIG.LOG_LEVEL = 'error';
}
```

### Custom Configuration
Edit `js/config.js` to customize:

```javascript
export const CONFIG = {
    // Window defaults
    WINDOW: {
        DEFAULT_WIDTH: '500px',
        DEFAULT_HEIGHT: '400px',
        MAXIMIZED_WIDTH: '90%',
        MAXIMIZED_HEIGHT: '80%',
        MAXIMIZED_MARGIN: '5%'
    },

    // Application configurations
    applications: {
        'terminal': {
            id: 'terminal',
            name: 'Terminal',
            description: 'Command line interface',
            defaultSize: { width: 700, height: 500 },
            // ... more config
        }
    }
};
```

## 🎨 Customization

### Theme Customization
The system uses CSS custom properties for easy theming:

```css
:root {
    /* Primary Colors */
    --primary-color: #6366f1;
    --primary-hover: #4f46e5;
    
    /* Background Colors */
    --background-dark: #030712;
    --background-light: #0a0f1a;
    
    /* Glass Effects */
    --glass-bg: rgba(51, 65, 85, 0.7);
    --glass-border: rgba(255, 255, 255, 0.1);
}
```

### Circular UI Elements
All UI elements follow a circular design language:

```css
/* Circular containers */
.boot-container,
.login-container,
.neuos-widget,
.desktop-icon {
    border-radius: 50%;
}
```

### Solar System Background
The background features 8 rotating rings with orbiting elements:

```css
/* Background spinner rings */
.background-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;
}
```

## 🔧 Performance Optimization

### CSS Consolidation
The system uses a single consolidated CSS file for optimal performance:

- **File**: `neuos-complete.css` (~78KB)
- **Benefits**: Single HTTP request, improved caching
- **Loading**: Faster page load times
- **Maintenance**: Easier to manage and update

### Hardware Acceleration
Enable hardware acceleration for smooth animations:

```css
/* Hardware acceleration */
.window {
    transform: translateZ(0);
    will-change: transform;
    backface-visibility: hidden;
}
```

### Particle System Optimization
Configure particle system for optimal performance:

```javascript
// Reduce particle count for better performance
particles 25

// Disable effects on low-end devices
effects off
```

## 🐛 Troubleshooting

### Common Issues

#### Audio Not Working
```bash
# Check browser permissions
# Enable Web Audio API
# Verify audio files are loaded
```

#### Performance Issues
```bash
# Reduce particle count
particles 25

# Disable effects
effects off

# Close unnecessary windows
```

#### Circular Elements Not Rendering
```bash
# Check CSS border-radius support
# Verify hardware acceleration
# Test in different browsers
```

### Debug Mode
Enable debug mode for development:

```javascript
// In browser console
localStorage.setItem('neuOS_debug', 'true');
location.reload();
```

### Performance Monitoring
Monitor performance in browser dev tools:

1. Open Developer Tools (F12)
2. Go to Performance tab
3. Record performance during interaction
4. Analyze frame rate and memory usage

## 🚀 Deployment

### GitHub Pages Deployment
The site is automatically deployed via GitHub Pages:

1. **Repository**: `jaredu3077/jaredu3077.github.io`
2. **Branch**: `main`
3. **Domain**: `https://jaredu3077.github.io`
4. **HTTPS**: Automatically enabled

### Custom Domain Setup
To use a custom domain:

1. Add CNAME file to repository
2. Configure DNS settings
3. Enable HTTPS in repository settings
4. Update CSP headers for new domain

### CDN Integration
For improved global performance:

1. **Cloudflare**: Free CDN with caching
2. **GitHub Pages**: Built-in CDN
3. **Cache Headers**: Optimized for static assets

## 🔒 Security

### Content Security Policy
The system implements strict CSP headers:

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com; 
               style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;">
```

### HTTPS Enforcement
- All connections use HTTPS
- Mixed content blocked
- Secure cookies only
- HSTS headers enabled

## ♿ Accessibility

### WCAG 2.1 Compliance
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and roles
- **High Contrast**: WCAG AA contrast ratios
- **Reduced Motion**: Respects user preferences

### Testing Accessibility
```bash
# Use browser dev tools
# Test with screen readers
# Verify keyboard navigation
# Check color contrast
```

## 📊 Monitoring

### Performance Metrics
- **Page Load**: < 3 seconds
- **Animation Frame Rate**: 60fps
- **Memory Usage**: < 100MB
- **CPU Usage**: < 20% during normal operation

### Error Tracking
- **Console Logging**: Structured error logging
- **User Feedback**: Error reporting system
- **Performance Monitoring**: Real-time tracking

## 🔮 Future Enhancements

### Planned Features
- **PWA Implementation**: Service worker and manifest
- **Offline Support**: Cached resources
- **Advanced Audio**: More sophisticated audio synthesis
- **Enhanced Demoscene**: More demos and tools

### Technical Improvements
- **Build System**: Automated build process
- **Testing Framework**: Automated testing
- **Performance Monitoring**: Real-time analytics
- **Accessibility Audit**: Automated accessibility testing

---

*This installation guide provides comprehensive setup instructions for both users and developers. The system is designed to work out-of-the-box while providing extensive customization options for advanced users.* 