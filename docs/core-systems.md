# Core Systems Documentation

## Overview

The core systems form the foundation of the neuOS application, providing essential functionality for window management, audio, theming, particles, and other fundamental features.

## File Structure

```
js/core/
├── boot.js                    # Boot sequence management
├── window.js                  # Window management system
├── glassEffect.js             # Glassmorphic effects
├── particleSystem.js          # Particle system
├── audioSystem.js             # Audio management
├── themeManager.js            # Theme management
├── screensaver.js             # Screensaver functionality
├── backgroundMusic.js         # Background music system
├── resizeHandler.js           # Window resize handling
├── dragHandler.js             # Drag and drop handling
├── snapHandler.js             # Window snapping
├── autoScrollHandler.js       # Auto-scroll functionality
├── bootSequence.js            # Boot sequence logic
├── animationMixin.js          # Animation mixin
├── backgroundMixin.js         # Background mixin
├── controlMixin.js            # Control mixin
├── generationMixin.js         # Generation mixin
├── interactionMixin.js        # Interaction mixin
├── mouseMixin.js              # Mouse mixin
├── modeMixin.js               # Mode mixin
├── particleCreationMixin.js   # Particle creation mixin
└── data/                      # Data files
    └── solarSystemData.js     # Solar system data
```

## Core Components

### boot.js (3.2KB, 122 lines)
**Purpose**: Boot sequence management
**Dependencies**: audioSystem.js, particleSystem.js

**Key Features**:
- Application startup sequence
- Boot progress tracking
- Login screen management
- System initialization coordination

**Main Classes**:
```javascript
class BootSystem {
    static getInstance()
    startBootSequence()
    showLoginScreen()
    completeBoot()
    playUIClickSound()
}
```

### window.js (20KB, 565 lines)
**Purpose**: Window management system
**Dependencies**: utils/draggable.js, glassEffect.js, config.js

**Key Features**:
- Window creation and destruction
- Window positioning and sizing
- Window focus management
- Window state management (minimize, maximize, restore)
- Window dragging and resizing

**Main Classes**:
```javascript
class WindowManager {
    constructor()
    createWindow(config)
    destroyWindow(windowId)
    focusWindow(window)
    minimizeWindow(window)
    maximizeWindow(window)
    restoreWindow(window)
    setupEventListeners()
}
```

### glassEffect.js (14KB, 423 lines)
**Purpose**: Glassmorphic effects
**Dependencies**: utils/glassEffects.js

**Key Features**:
- Glass morphism application
- Backdrop filter effects
- Glass reflection effects
- Dynamic glass properties
- Performance optimization

**Main Classes**:
```javascript
class GlassMorphismSystem {
    constructor()
    applyGlassEffect(element)
    updateGlassProperties(element, properties)
    removeGlassEffect(element)
    optimizePerformance()
}
```

### particleSystem.js (22KB, 642 lines)
**Purpose**: Particle system
**Dependencies**: backgroundMixin.js, generationMixin.js

**Key Features**:
- Background particle generation
- Particle animation
- Performance optimization
- Particle customization
- Mobile optimization

**Main Classes**:
```javascript
class ParticleSystem {
    constructor()
    initialize()
    start()
    stop()
    updateParticles()
    optimizeForMobile()
}
```

### audioSystem.js (21KB, 565 lines)
**Purpose**: Audio management
**Dependencies**: howler.min.js

**Key Features**:
- Audio playback control
- Volume management
- Audio effects
- Background music
- Sound effect management

**Main Classes**:
```javascript
class AudioSystem {
    constructor()
    playSound(soundId)
    stopSound(soundId)
    setVolume(volume)
    playBackgroundMusic()
    stopBackgroundMusic()
}
```

### themeManager.js (22KB, 487 lines)
**Purpose**: Theme management
**Dependencies**: design-tokens.css

**Key Features**:
- Theme switching
- Color scheme management
- CSS variable management
- Theme persistence
- Dynamic theme updates

**Main Classes**:
```javascript
class ThemeManager {
    constructor()
    setTheme(themeName)
    getCurrentTheme()
    updateColors(colors)
    saveThemePreference()
    loadThemePreference()
}
```

### screensaver.js (6.6KB, 176 lines)
**Purpose**: Screensaver functionality
**Dependencies**: particleSystem.js

**Key Features**:
- Screensaver activation
- Space-themed screensaver
- User interaction detection
- Automatic activation/deactivation

**Main Classes**:
```javascript
class Screensaver {
    constructor()
    activate()
    deactivate()
    handleUserInteraction()
    startSpaceAnimation()
}
```

### backgroundMusic.js (19KB, 521 lines)
**Purpose**: Background music system
**Dependencies**: audioSystem.js

**Key Features**:
- Background music playback
- Music controls
- Volume management
- Playlist management
- Audio visualization

**Main Classes**:
```javascript
class BackgroundMusic {
    constructor()
    play()
    pause()
    stop()
    setVolume(volume)
    nextTrack()
    previousTrack()
}
```

### resizeHandler.js (22KB, 577 lines)
**Purpose**: Window resize handling
**Dependencies**: window.js

**Key Features**:
- Window resize detection
- Resize constraints
- Aspect ratio maintenance
- Performance optimization
- Mobile responsiveness

**Main Classes**:
```javascript
class ResizeHandler {
    constructor()
    enableResize(element)
    disableResize(element)
    setConstraints(constraints)
    handleResize(event)
}
```

### dragHandler.js (6.4KB, 195 lines)
**Purpose**: Drag and drop handling
**Dependencies**: utils/draggable.js

**Key Features**:
- Element dragging
- Drag constraints
- Drop zones
- Drag feedback
- Performance optimization

**Main Classes**:
```javascript
class DragHandler {
    constructor()
    enableDrag(element)
    disableDrag(element)
    setConstraints(constraints)
    handleDrag(event)
}
```

### snapHandler.js (5.2KB, 153 lines)
**Purpose**: Window snapping
**Dependencies**: window.js

**Key Features**:
- Window snapping to edges
- Snap zones
- Snap indicators
- Snap constraints
- Performance optimization

**Main Classes**:
```javascript
class SnapHandler {
    constructor()
    enableSnapping(window)
    disableSnapping(window)
    setSnapZones(zones)
    handleSnap(event)
}
```

### autoScrollHandler.js (3.7KB, 116 lines)
**Purpose**: Auto-scroll functionality
**Dependencies**: None

**Key Features**:
- Automatic scrolling
- Scroll speed control
- Scroll direction
- Scroll boundaries
- Performance optimization

**Main Classes**:
```javascript
class AutoScrollHandler {
    constructor()
    enableAutoScroll(element)
    disableAutoScroll(element)
    setScrollSpeed(speed)
    setScrollDirection(direction)
}
```

### bootSequence.js (9.7KB, 271 lines)
**Purpose**: Boot sequence logic
**Dependencies**: boot.js

**Key Features**:
- Boot sequence steps
- Progress tracking
- Error handling
- Boot completion
- System checks

**Main Classes**:
```javascript
class BootSequence {
    constructor()
    start()
    nextStep()
    handleError(error)
    complete()
}
```

## Mixin System

### animationMixin.js (2.8KB, 108 lines)
**Purpose**: Animation mixin
**Dependencies**: None

**Key Features**:
- Animation utilities
- Animation timing
- Animation easing
- Animation callbacks

### backgroundMixin.js (15KB, 383 lines)
**Purpose**: Background mixin
**Dependencies**: None

**Key Features**:
- Background management
- Background effects
- Background transitions
- Background customization

### controlMixin.js (2.4KB, 93 lines)
**Purpose**: Control mixin
**Dependencies**: None

**Key Features**:
- Control utilities
- Control states
- Control events
- Control validation

### generationMixin.js (2.7KB, 112 lines)
**Purpose**: Generation mixin
**Dependencies**: None

**Key Features**:
- Content generation
- Random generation
- Pattern generation
- Generation utilities

### interactionMixin.js (3.5KB, 121 lines)
**Purpose**: Interaction mixin
**Dependencies**: None

**Key Features**:
- User interaction
- Event handling
- Interaction states
- Interaction feedback

### mouseMixin.js (1.9KB, 69 lines)
**Purpose**: Mouse mixin
**Dependencies**: None

**Key Features**:
- Mouse events
- Mouse tracking
- Mouse states
- Mouse utilities

### modeMixin.js (2.7KB, 100 lines)
**Purpose**: Mode mixin
**Dependencies**: None

**Key Features**:
- Mode management
- Mode switching
- Mode states
- Mode utilities

### particleCreationMixin.js (3.0KB, 106 lines)
**Purpose**: Particle creation mixin
**Dependencies**: None

**Key Features**:
- Particle creation
- Particle properties
- Particle patterns
- Particle utilities

## Data Files

### solarSystemData.js
**Purpose**: Solar system data for screensaver
**Dependencies**: None

**Key Features**:
- Planet data
- Orbit information
- Celestial body properties
- Astronomical calculations

## System Integration

### Initialization Order
1. **Boot System** - Application startup
2. **Window Manager** - Window management
3. **Glass Effect System** - Visual effects
4. **Particle System** - Background effects
5. **Audio System** - Sound management
6. **Theme Manager** - UI theming
7. **Screensaver** - Idle management

### Dependencies
```
boot.js → audioSystem.js, particleSystem.js
window.js → draggable.js, glassEffect.js, config.js
glassEffect.js → glassEffects.js
particleSystem.js → backgroundMixin.js, generationMixin.js
audioSystem.js → howler.min.js
themeManager.js → design-tokens.css
screensaver.js → particleSystem.js
backgroundMusic.js → audioSystem.js
resizeHandler.js → window.js
dragHandler.js → draggable.js
snapHandler.js → window.js
```

## Performance Considerations

### Critical Performance Areas
1. **Particle System** - Animation performance
2. **Window Management** - DOM manipulation
3. **Audio System** - Audio processing
4. **Glass Effects** - Visual effects

### Optimization Strategies
1. **RequestAnimationFrame** - Smooth animations
2. **Debouncing** - Event handling
3. **Lazy Loading** - Resource management
4. **Memory Management** - Garbage collection

## Error Handling

### Error Boundaries
- Module initialization errors
- Runtime errors
- Performance errors
- User interaction errors

### Recovery Mechanisms
- Automatic retry
- Fallback modes
- Error logging
- User notification

## Testing Strategy

### Unit Tests
- Individual module functionality
- Error handling
- Performance metrics
- Integration points

### Integration Tests
- Module interactions
- System initialization
- Error propagation
- Performance impact

## Future Enhancements

### Planned Features
1. **Advanced Window Management** - Virtual desktops
2. **Enhanced Audio System** - 3D audio
3. **Improved Particle System** - GPU acceleration
4. **Advanced Theming** - Dynamic themes

### Performance Improvements
1. **Web Workers** - Background processing
2. **WebGL** - Hardware acceleration
3. **Service Workers** - Caching
4. **IndexedDB** - Local storage

## Related Documentation

- See [main.md](main.md) for core system initialization
- See [architecture.md](architecture.md) for overall system architecture
- See [terminal.md](terminal.md) for terminal integration
- See [DOTHISNEXT.md](DOTHISNEXT.md) for core system issues 