# index.html - Main Entry Point Documentation

## File Overview

**Purpose**: Main HTML5 document serving as the entry point for the neuOS interactive portfolio website.

**Type**: HTML5 document with PWA (Progressive Web App) capabilities.

**Role**: Primary entry point that loads all CSS stylesheets, JavaScript modules, and initializes the operating system interface.

## Dependencies and Imports

### External Resources

| Resource | Type | Purpose | Version |
|----------|------|---------|---------|
| `howler.min.js` | JavaScript Library | Audio management and playback | Latest |
| `config/manifest.json` | PWA Manifest | Progressive Web App configuration | - |

### CSS Dependencies (Load Order)

| File | Purpose | Dependencies |
|------|---------|--------------|
| `css/design-tokens.css` | Design system tokens and variables | None |
| `css/variables.css` | CSS custom properties | design-tokens.css |
| `css/glass.css` | Glassmorphic effects | variables.css |
| `css/window.css` | Window management styles | glass.css |
| `css/desktop.css` | Desktop layout and icons | window.css |
| `css/animations.css` | Animation definitions | desktop.css |
| `css/responsive.css` | Responsive design rules | animations.css |
| `css/mobile.css` | Mobile-specific styles | responsive.css |
| `css/apps.css` | Application-specific styles | mobile.css |
| `css/theme.css` | Theme management | apps.css |
| `css/terminal-icon.css` | Terminal icon styles | theme.css |
| `css/login.css` | Login screen styles | terminal-icon.css |

### JavaScript Dependencies

| Module | Purpose | Entry Point |
|--------|---------|-------------|
| `js/main.js` | Application initialization | DOMContentLoaded |
| `js/howler.min.js` | Audio library | Preloaded |

## Internal Structure

### HTML5 Semantic Elements

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Meta tags and SEO -->
    <!-- PWA support -->
    <!-- Security headers -->
    <!-- CSS stylesheets -->
    <!-- JavaScript modules -->
</head>
<body>
    <!-- SVG filters for glass effects -->
    <!-- Canvas for starfield background -->
    <!-- Boot sequence dialog -->
    <!-- Login screen dialog -->
    <!-- Desktop container -->
    <!-- Live region for accessibility -->
    <!-- Service worker registration -->
</body>
</html>
```

### Key Sections

#### 1. Meta Tags and SEO
- **Character encoding**: UTF-8
- **Viewport**: Mobile-responsive with user-scalable disabled
- **SEO**: Comprehensive meta tags for search engines
- **Open Graph**: Social media sharing optimization
- **Twitter Cards**: Twitter-specific meta tags

#### 2. PWA Support
- **Theme color**: #6366f1 (primary brand color)
- **Apple mobile web app**: Full-screen mode support
- **Manifest**: Links to `config/manifest.json`
- **Service worker**: Registered via JavaScript

#### 3. Security Headers
- **Content Security Policy**: Restricts script and style sources
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables XSS protection

#### 4. Structured Data
- **JSON-LD**: Schema.org Person markup for SEO
- **Professional credentials**: Network engineering expertise
- **Social profiles**: GitHub and LinkedIn links

#### 5. SVG Filters
- **Glass distortion filter**: Creates glassmorphic effects
- **Fractal noise**: Generates organic distortion patterns
- **Gaussian blur**: Smooths filter effects

#### 6. Boot Sequence
- **Dialog role**: Accessibility-compliant modal
- **Progress bar**: Visual boot progress indicator
- **Glass effects**: Modern UI styling

#### 7. Login Screen
- **Guest login**: Single-click access
- **Glass container**: Consistent design language
- **Particle effects**: Dynamic background

#### 8. Desktop Interface
- **Main role**: Primary application area
- **Particle container**: Background effects
- **Desktop icons**: Application launchers
- **Window container**: Dynamic application windows

## Connections and References

### Incoming Connections

| Referencing File | Description | Connection Type |
|------------------|-------------|-----------------|
| `sw.js` | Service worker caches HTML | Caching |
| `js/main.js` | Initializes application | Module import |
| `css/*.css` | Styles applied to elements | Styling |

### Outgoing Connections

| Referenced File | Description | Connection Type |
|-----------------|-------------|-----------------|
| `css/design-tokens.css` | Design system variables | Stylesheet |
| `css/variables.css` | CSS custom properties | Stylesheet |
| `css/glass.css` | Glassmorphic effects | Stylesheet |
| `css/window.css` | Window management | Stylesheet |
| `css/desktop.css` | Desktop layout | Stylesheet |
| `css/animations.css` | Animations | Stylesheet |
| `css/responsive.css` | Responsive design | Stylesheet |
| `css/mobile.css` | Mobile styles | Stylesheet |
| `css/apps.css` | Application styles | Stylesheet |
| `css/theme.css` | Theme management | Stylesheet |
| `css/terminal-icon.css` | Terminal icon | Stylesheet |
| `css/login.css` | Login screen | Stylesheet |
| `js/main.js` | Application logic | Script |
| `js/howler.min.js` | Audio library | Script |
| `config/manifest.json` | PWA manifest | Link |
| `assets/audio/mp3.mp3` | Background music | Audio |
| `assets/audio/sound.ogg` | Sound effects | Audio |

### Bidirectional Connections

| Element | CSS Class | JavaScript Handler | Description |
|---------|-----------|-------------------|-------------|
| `#bootSequence` | `.boot-sequence` | Boot system | Boot screen management |
| `#loginScreen` | `.login-screen` | Login system | Login screen management |
| `#desktop` | Desktop styles | Window manager | Desktop interface |
| `#desktop-icons` | Icon styles | App launcher | Desktop icons |
| `#terminalInput` | Terminal styles | Terminal app | Terminal interface |
| `#terminalOutput` | Terminal styles | Terminal app | Terminal output |

## Data Flow and Architecture

### Load Order

1. **HTML Parsing**: Browser parses HTML structure
2. **CSS Loading**: Stylesheets loaded in dependency order
3. **JavaScript Execution**: Modules loaded via ES6 imports
4. **Boot Sequence**: Application initialization begins
5. **Login Screen**: User authentication interface
6. **Desktop Interface**: Main application area

### Event Handling

```javascript
// DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize core systems
    // Setup event listeners
    // Start boot sequence
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}
```

### State Management

- **Boot State**: Controls visibility of boot sequence
- **Login State**: Manages login screen display
- **Desktop State**: Controls desktop interface visibility
- **Window State**: Manages application windows

## Potential Issues and Recommendations

### Standards Compliance Issues

1. **Semantic HTML**: Missing proper semantic elements
   - **Issue**: Uses generic `<div>` instead of semantic elements
   - **Fix**: Replace with `<main>`, `<section>`, `<article>`, `<nav>`

2. **Inline Styles**: Violates separation of concerns
   - **Issue**: Inline styles in HTML
   - **Fix**: Move all styles to CSS files

3. **Accessibility**: Missing proper ARIA landmarks
   - **Issue**: Incomplete accessibility support
   - **Fix**: Add proper ARIA roles and labels

### Performance Issues

1. **CSS Loading**: Multiple CSS files impact performance
   - **Issue**: 12 separate CSS files
   - **Fix**: Consider CSS bundling for production

2. **JavaScript Loading**: Module loading could be optimized
   - **Issue**: ES6 modules loaded individually
   - **Fix**: Implement module bundling

### Security Issues

1. **Content Security Policy**: Could be more restrictive
   - **Issue**: Allows 'unsafe-inline' and 'unsafe-eval'
   - **Fix**: Implement nonce-based CSP

2. **Input Validation**: Terminal input needs sanitization
   - **Issue**: Command execution without validation
   - **Fix**: Implement input sanitization

## Related Documentation

- See [main.md](main.md) for JavaScript initialization details
- See [architecture.md](architecture.md) for overall system architecture
- See [sw.md](sw.md) for service worker documentation
- See [config.md](config.md) for configuration management 