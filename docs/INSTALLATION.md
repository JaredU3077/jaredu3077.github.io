# neuOS Installation & Setup Guide

## Prerequisites

### System Requirements
- **Browser**: Modern browser with ES6+ support (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- **JavaScript**: ES6 modules support enabled
- **Audio**: Web Audio API support for sound effects
- **Storage**: At least 50MB free space for assets
- **Memory**: 2GB RAM recommended for smooth performance

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
2. **Experience the Boot**: Watch the system initialize with space-themed animations
3. **Login**: Click "enter" to access the system
4. **Explore**: Click on desktop icons to launch applications

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
├── theme.css                  # Complete styling system
├── _variables.css             # CSS custom properties
├── _window.css               # Window management styles
├── _desktop.css              # Desktop interface styles
├── _login.css                # Login screen styles
├── _apps.css                 # Application styles
├── _animations.css           # Animation definitions
├── _responsive.css           # Responsive design styles
├── config.json               # System configuration
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
        MAXIMIZED_HEIGHT: '80%'
    },
    
    // Particle system
    PARTICLES: {
        COUNT: 50,
        GENERATION_RATE: 1200,
        MODE: 'normal'
    },
    
    // Audio settings
    AUDIO: {
        ENABLED: true,
        VOLUME: 0.5,
        MECHVIBES: true
    }
};
```

## 🔧 Troubleshooting

### Common Issues

#### Issue: Audio Not Working
**Symptoms**: No sound effects or background music
**Solutions**:
1. Check browser audio permissions
2. Ensure Web Audio API is supported
3. Try refreshing the page
4. Check browser console for errors

#### Issue: Particles Not Visible
**Symptoms**: No particle effects on screen
**Solutions**:
1. Check browser console for JavaScript errors
2. Ensure hardware acceleration is enabled
3. Try different particle modes via terminal
4. Check if animations are disabled in browser

#### Issue: Windows Not Draggable
**Symptoms**: Cannot drag windows around
**Solutions**:
1. Check if interact.js library loaded properly
2. Ensure no JavaScript errors in console
3. Try refreshing the page
4. Check browser compatibility

#### Issue: Terminal Commands Not Working
**Symptoms**: Terminal not responding to commands
**Solutions**:
1. Check if terminal is focused
2. Ensure JavaScript modules loaded properly
3. Try typing `help` for available commands
4. Check browser console for errors

### Performance Issues

#### Slow Performance
**Solutions**:
1. Reduce particle count: Type `particles 25` in terminal
2. Disable animations: Type `effects off` in terminal
3. Close unnecessary windows
4. Check browser performance settings

#### High Memory Usage
**Solutions**:
1. Refresh the page periodically
2. Close unused applications
3. Clear browser cache
4. Use a more powerful device

### Browser-Specific Issues

#### Chrome
- **Issue**: Audio context suspended
- **Solution**: Click anywhere on the page to resume audio

#### Firefox
- **Issue**: Particle animations choppy
- **Solution**: Enable hardware acceleration in about:config

#### Safari
- **Issue**: CSS animations not smooth
- **Solution**: Enable "Reduce motion" in accessibility settings

## 🚀 Deployment

### GitHub Pages Deployment
The project is already configured for GitHub Pages deployment:

1. **Repository**: `jaredu3077/jaredu3077.github.io`
2. **Branch**: `main`
3. **Domain**: `jaredu3077.github.io`
4. **Status**: ✅ Live and accessible

### Custom Domain Deployment
To deploy to a custom domain:

1. **Configure DNS**:
   ```
   Type: CNAME
   Name: @
   Value: jaredu3077.github.io
   ```

2. **Update Repository Settings**:
   - Go to Settings > Pages
   - Add custom domain
   - Enable HTTPS

3. **Update Configuration**:
   ```javascript
   // Update in js/config.js
   CONFIG.BASE_URL = 'https://yourdomain.com';
   ```

### Production Optimization

#### Asset Optimization
```bash
# Compress images
npm run optimize-images

# Minify CSS
npm run minify-css

# Minify JavaScript
npm run minify-js
```

#### Performance Monitoring
```javascript
// Enable performance monitoring
CONFIG.PERFORMANCE_MONITORING = true;

// Check performance metrics
console.log('Performance:', performance.getEntriesByType('navigation'));
```

## 🔒 Security Considerations

### Content Security Policy
The application includes a comprehensive CSP:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://unpkg.com https://cdnjs.cloudflare.com;
    style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
    img-src 'self' data:;
    font-src 'self' https://cdnjs.cloudflare.com;
    connect-src 'self';
">
```

### Security Best Practices
1. **HTTPS Only**: Always use HTTPS in production
2. **Input Validation**: All user inputs are validated
3. **XSS Protection**: No inline scripts, proper escaping
4. **CSP Headers**: Comprehensive content security policy

## 📊 Monitoring and Analytics

### Performance Monitoring
```javascript
// Monitor page load performance
window.addEventListener('load', () => {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart);
});
```

### Error Tracking
```javascript
// Global error handler
window.addEventListener('error', (event) => {
    console.error('Application Error:', event.error);
    // Send to error tracking service
});
```

## 🆘 Support

### Getting Help
1. **Check Documentation**: Review this guide and other docs
2. **Browser Console**: Check for error messages
3. **GitHub Issues**: Report bugs on GitHub
4. **Community**: Join discussions in GitHub Discussions

### Reporting Issues
When reporting issues, include:
- **Browser**: Version and type
- **Operating System**: Version and type
- **Steps to Reproduce**: Detailed steps
- **Console Errors**: Any error messages
- **Screenshots**: Visual evidence if applicable

---

*This installation guide provides everything needed to get neuOS running locally or in production. For additional help, refer to the [Architecture Documentation](./ARCHITECTURE.md) or [Contributing Guide](./CONTRIBUTING.md).* 