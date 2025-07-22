# manifest.json Documentation

## File Overview

**File Type**: JSON Web App Manifest  
**Purpose**: Progressive Web App (PWA) manifest for neuOS  
**Role**: Defines the web application's metadata, icons, shortcuts, and PWA behavior for installation and native app-like experience.

## Dependencies and Imports

### HTML Link Reference
```html
<!-- Referenced in index.html -->
<link rel="manifest" href="config/manifest.json">
```

### Service Worker Integration
```javascript
// Service Worker uses manifest for PWA functionality
const manifest = await fetch('/config/manifest.json');
```

## Internal Structure

### Basic PWA Properties
```json
{
    "name": "neuOS - Jared U. Portfolio",
    "short_name": "neuOS",
    "description": "senior network engineer portfolio featuring 15+ years experience in network infrastructure, security, and automation. interactive os-style interface showcasing technical skills.",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#181f2a",
    "theme_color": "#6366f1",
    "orientation": "any",
    "scope": "/",
    "lang": "en",
    "categories": ["productivity", "utilities"]
}
```

### Icon Definitions
```json
"icons": [
    {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'><rect width='192' height='192' fill='%23181f2a'/><circle cx='96' cy='96' r='48' fill='none' stroke='%236366f1' stroke-width='8'/><path d='M96 48v48M96 144v48M48 96h48M144 96h48' stroke='%236366f1' stroke-width='8'/><text x='96' y='160' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='16'>neuOS</text></svg>",
        "sizes": "192x192",
        "type": "image/svg+xml",
        "purpose": "any maskable"
    },
    {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'><rect width='512' height='512' fill='%23181f2a'/><circle cx='256' cy='256' r='128' fill='none' stroke='%236366f1' stroke-width='16'/><path d='M256 128v128M256 384v128M128 256h128M384 256h128' stroke='%236366f1' stroke-width='16'/><text x='256' y='440' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='48'>neuOS</text></svg>",
        "sizes": "512x512",
        "type": "image/svg+xml",
        "purpose": "any maskable"
    }
]
```

### Application Shortcuts
```json
"shortcuts": [
    {
        "name": "Terminal",
        "short_name": "Terminal",
        "description": "Open terminal application",
        "url": "/?app=terminal",
        "icons": [
            {
                "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><rect width='96' height='96' fill='%23181f2a'/><text x='48' y='60' text-anchor='middle' fill='%236366f1' font-family='monospace' font-size='24'>$</text></svg>",
                "sizes": "96x96"
            }
        ]
    },
    {
        "name": "Codex",
        "short_name": "Codex",
        "description": "Open codex application",
        "url": "/?app=codex",
        "icons": [
            {
                "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'><rect width='96' height='96' fill='%23181f2a'/><text x='48' y='60' text-anchor='middle' fill='%236366f1' font-family='Arial' font-size='24'>📚</text></svg>",
                "sizes": "96x96"
            }
        ]
    }
]
```

### Screenshots for App Stores
```json
"screenshots": [
    {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720' viewBox='0 0 1280 720'><rect width='1280' height='720' fill='%23181f2a'/><circle cx='640' cy='360' r='120' fill='none' stroke='%236366f1' stroke-width='8'/><path d='M640 240v120M640 480v120M520 360h120M760 360h120' stroke='%236366f1' stroke-width='8'/><text x='640' y='600' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='48'>neuOS</text><text x='640' y='650' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='24'>Interactive Portfolio</text></svg>",
        "sizes": "1280x720",
        "type": "image/svg+xml",
        "form_factor": "wide"
    },
    {
        "src": "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='390' height='844' viewBox='0 0 390 844'><rect width='390' height='844' fill='%23181f2a'/><circle cx='195' cy='422' r='80' fill='none' stroke='%236366f1' stroke-width='6'/><path d='M195 342v80M195 502v80M115 422h80M275 422h80' stroke='%236366f1' stroke-width='6'/><text x='195' y='700' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='32'>neuOS</text><text x='195' y='730' text-anchor='middle' fill='%23eaf1fb' font-family='Arial' font-size='16'>Mobile Portfolio</text></svg>",
        "sizes": "390x844",
        "type": "image/svg+xml",
        "form_factor": "narrow"
    }
]
```

### Advanced PWA Features
```json
{
    "related_applications": [],
    "prefer_related_applications": false,
    "edge_side_panel": {
        "preferred_width": 400
    }
}
```

## Icon Design Specifications

### neuOS Logo Design
- **Background**: Dark theme (#181f2a)
- **Primary Color**: Indigo (#6366f1)
- **Text Color**: Light (#eaf1fb)
- **Design Elements**: 
  - Central circle with cross pattern
  - "neuOS" branding text
  - Scalable SVG format

### Icon Sizes
- **192x192**: Standard Android icon
- **512x512**: High-resolution icon for app stores
- **Maskable**: Supports adaptive icons on Android

### Shortcut Icons
- **Terminal**: Dollar sign ($) in monospace font
- **Codex**: Book emoji (📚) for documentation

## Connections and References

### Incoming Connections
| Connection Type | Referenced File | Description | Example Code Snippet |
|----------------|-----------------|-------------|---------------------|
| HTML Link | `index.html` | Manifest reference in HTML | `<link rel="manifest" href="config/manifest.json">` |
| Service Worker | `sw.js` | PWA functionality integration | `caches.match('/config/manifest.json')` |

### Outgoing Connections
| Connection Type | Referenced File | Description | Example Code Snippet |
|----------------|-----------------|-------------|---------------------|
| App Shortcuts | `index.html` | Deep linking to applications | `url: "/?app=terminal"` |
| Icon Assets | Inline SVG | Embedded icon data | `data:image/svg+xml,<svg...` |

### Bidirectional Connections
| Connection Type | Referenced File | Description | Example Code Snippet |
|----------------|-----------------|-------------|---------------------|
| PWA Installation | Browser API | Native app installation | `beforeinstallprompt` event |
| App Shortcuts | URL Parameters | Deep linking to specific apps | `window.location.search` |

## Data Flow and Architecture

### PWA Installation Flow
```
User Interaction → Before Install Prompt → Install Handler → Native App Installation → Launch from Home Screen
```

### App Shortcut Flow
```
Shortcut Click → Deep Link URL → Application Launch → Specific App Opening
```

### Screenshot Display Flow
```
App Store Visit → Screenshot Display → User Download → PWA Installation
```

## Standards Compliance

### PWA Standards
- ✅ **Web App Manifest**: Valid JSON structure
- ✅ **Installable**: Meets installability criteria
- ✅ **Offline Capable**: Service worker integration
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Fast Loading**: Optimized performance

### Icon Standards
- ✅ **SVG Format**: Scalable vector graphics
- ✅ **Maskable Icons**: Android adaptive icon support
- ✅ **Multiple Sizes**: Various resolution support
- ✅ **Purpose Declaration**: Clear icon purposes

### App Store Standards
- ✅ **Screenshots**: App store screenshots
- ✅ **Categories**: Proper app categorization
- ✅ **Descriptions**: Clear app descriptions
- ✅ **Icons**: High-quality app icons

## PWA Features

### Installation Capabilities
- **Standalone Display**: Full-screen app experience
- **Home Screen Icon**: Custom app icon
- **Splash Screen**: Branded loading screen
- **Theme Color**: Consistent branding

### App Shortcuts
- **Terminal Access**: Quick terminal launch
- **Codex Access**: Quick documentation access
- **Deep Linking**: Direct app navigation
- **Custom Icons**: Shortcut-specific icons

### Offline Support
- **Service Worker**: Offline functionality
- **Cached Resources**: Static asset caching
- **Background Sync**: Data synchronization
- **Push Notifications**: User engagement

## Potential Issues and Recommendations

### Current Implementation
- ✅ **Complete PWA**: Full PWA compliance
- ✅ **Custom Icons**: Branded icon design
- ✅ **App Shortcuts**: Quick access features
- ✅ **Screenshots**: App store ready
- ✅ **Offline Support**: Service worker integration

### Recommendations
1. **Push Notifications**: Add notification support
2. **Background Sync**: Implement data synchronization
3. **App Updates**: Add update notification system
4. **Analytics**: Add PWA usage analytics
5. **Testing**: Add PWA testing tools

## Cross-References

- See [index.md](index.md) for manifest HTML reference
- See [sw.md](sw.md) for Service Worker integration
- See [architecture.md](architecture.md) for overall PWA architecture 