# DarkWave Demoscene Platform

A standalone demoscene platform with high-quality graphics, unique 8-bit audio tracks, and smooth user experience.

## 🎯 Overview

This is a completely self-contained demoscene platform that has been separated from the main NEU-OS system for better organization and maintenance. It features:

- **High-resolution graphics** with proper canvas scaling
- **Unique 8-bit audio tracks** for each demo (45-second loops)
- **Auto-play audio** with mute functionality
- **Enhanced visual effects** with glow and smooth animations
- **Responsive design** that works on any screen size

## 📁 File Structure

```
demoscene/
├── index.html              # Main demoscene platform
├── test.html               # Enhanced test page
├── README.md               # This file
├── css/
│   └── DarkWave.css        # Styling for the platform
└── js/
    ├── demoscene.js        # Main demoscene controller
    ├── DarkWaveAudio.js    # Audio system with unique tracks
    └── DarkWaveCore.js     # Core functionality
```

## 🎵 Audio Tracks

Each demo has its own unique 8-bit hacker themed music:

1. **Neon Particles** - "Neon Pulse" (Dark Wave, 120 BPM)
2. **Matrix Rain** - "Digital Rain" (Chiptune, 140 BPM)  
3. **Wireframe Network** - "Network Pulse" (Hacker, 110 BPM)
4. **Glitch Text** - "Glitch Corruption" (Wave, 90 BPM)

## 🎮 How to Use

### Direct Access
1. Navigate to `demoscene/index.html` for the main platform
2. Navigate to `demoscene/test.html` for the enhanced test page
3. Click "Launch Demo" on any demo card
4. Audio starts automatically (use ♪ button to mute/unmute)
5. Click × to close fullscreen demo

### From Main Site
- Visit `demoscene.html` for automatic redirect
- Or access directly via `demoscene/` folder

## 🎨 Demo Types

### 1. Neon Particles
- Dynamic particle system with physics
- Glow effects and color cycling
- 200+ particles with smooth animations

### 2. Matrix Rain
- Classic matrix-style falling characters
- Trail effects with fading opacity
- Variable speeds and multiple color layers

### 3. Wireframe Network
- Connected nodes with dynamic movement
- Pulsing nodes and proximity-based connections
- Energy flow visualization

### 4. Glitch Text
- Distorted text with advanced glitch effects
- Multiple text variations and layered effects
- Random scanline effects

## 🔧 Technical Features

- **Canvas Resolution**: Full screen resolution (e.g., 1920x1080)
- **Audio Quality**: 44.1kHz, 16-bit audio with Web Audio API
- **Frame Rate**: 60 FPS smooth animations
- **Memory Management**: Optimized particle counts and cleanup
- **Responsive Design**: Adapts to any screen size

## 🚀 Performance

- High-resolution graphics without pixelation
- Smooth 60 FPS animations
- Efficient memory usage
- Proper cleanup on demo close
- Optimized for modern browsers

## 🔮 Future Enhancements

- Additional demo types
- More audio tracks and effects
- User-created demo support
- Social features and sharing
- Advanced visual effects
- Mobile optimization

## 🐛 Bug Fixes

- Fixed canvas pixelation issues
- Resolved audio auto-play problems
- Fixed mute button functionality
- Corrected animation cleanup
- Resolved memory leaks
- Fixed responsive scaling issues

## 📝 Development Notes

This platform is completely self-contained and doesn't interfere with the main NEU-OS system. All dependencies are included within the `demoscene/` folder.

### Key Improvements Made:
- High-resolution canvas with proper scaling
- Unique 8-bit hacker themed music for each demo
- Auto-play audio when launching fullscreen demos
- Mute/unmute button functionality
- Enhanced graphics with glow effects
- Responsive canvas sizing
- Improved particle systems with physics
- Better matrix rain with trail effects
- Enhanced wireframe network with pulsing nodes
- Advanced glitch text with multiple layers

---

**Result**: A professional, high-quality demoscene platform with unique audio tracks, crisp graphics, and smooth user experience, completely isolated from the main system. 