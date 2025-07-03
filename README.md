# DarkWave Demoscene Platform

A web-based demoscene platform that embodies the dark wave 8-bit hacker aesthetic, inspired by classic demoscene culture and modern web technologies.

## 🌟 Features

### Aesthetic Implementation
- **Dark Wave 8-bit Hacker Style**: Neon purples, deep blues, and glowing whites on dark backgrounds
- **Glitch Effects**: Dynamic text distortion and visual artifacts
- **Scanline Overlay**: CRT-style scanlines for authentic retro feel
- **Pixelated Rendering**: True 8-bit aesthetic with crisp pixel edges
- **Neon Glows**: CSS-powered neon effects and animations

### Core Functionality
- **Demo Showcase**: Gallery of interactive demos with real-time previews
- **Creation Tools**: Web-based demo editor with canvas, audio, and code tabs
- **Community Hub**: Comments system and leaderboard for demo ratings
- **Educational Resources**: Tutorials for demoscene creation

### Audio System
- **Chiptune Generation**: Web Audio API-powered 8-bit music creation
- **Dark Wave Sequences**: Atmospheric chord progressions and ambient tracks
- **Real-time Effects**: Reverb, delay, distortion, and low-pass filtering
- **Audio Visualizer**: Real-time frequency analysis display

### Visual Effects
- **Particle Systems**: Dynamic neon particle animations
- **Matrix Rain**: Classic falling character effects
- **Wireframe Networks**: Connected node animations
- **Glitch Text**: Distorted typography with color separation

## 🚀 Getting Started

### Prerequisites
- Modern web browser with Web Audio API support
- No server required - runs entirely in the browser

### Installation
1. Clone or download the repository
2. Open `demoscene.html` in your web browser
3. Click anywhere to initialize audio (required for browser autoplay policies)

### File Structure
```
demoscene-platform/
├── demoscene.html          # Main HTML file
├── css/
│   └── DarkWave.css        # Dark wave aesthetic framework
├── js/
│   ├── DarkWaveAudio.js    # Chiptune and audio system
│   ├── DarkWaveCore.js     # Core demoscene functionality
│   └── demoscene.js        # Main platform controller
└── README.md              # This file
```

## 🎨 Usage

### Demo Showcase
- Browse the demo gallery to see sample demos
- Click "Play" to run demos with synchronized audio
- Click "Stop" to halt demo playback

### Creation Tools
1. **Canvas Editor**: Add particles and create visual effects
2. **Audio Editor**: Generate chiptune melodies and dark wave sequences
3. **Code Editor**: Write custom demo code in JavaScript

### Community Features
- Add comments to share thoughts on demos
- View the leaderboard of top-rated demos
- Tutorials for learning demoscene techniques

## 🎵 Audio System

### Chiptune Generation
```javascript
// Create a chiptune melody
const melody = darkWaveAudio.createChiptuneMelody('minor', 16);
darkWaveAudio.playChiptuneMelody(melody, 120);

// Play dark wave sequence
darkWaveAudio.playDarkWaveSequence('cyber', 4);
```

### Available Scales
- `minor`: A minor scale for dark atmospheres
- `major`: C major scale for brighter melodies
- `pentatonic`: Five-note scale for minimalist compositions

### Dark Wave Styles
- `dark`: Am-F-C-G progression
- `cyber`: Em-C-G-D progression
- `hacker`: Dm-Am-Bm-G progression
- `wave`: Cm-Ab-Eb-Bb progression

## 🎨 Visual Effects

### Particle Systems
```javascript
// Create particle system
darkWaveCore.createParticleSystem('canvas-id', {
    maxParticles: 100,
    particleSize: 2,
    speed: 2,
    colors: ['#b388ff', '#00ffff', '#ff00ff'],
    life: 100,
    gravity: 0.1
});
```

### Glitch Effects
```javascript
// Create glitch text
darkWaveCore.createGlitchEffect('canvas-id', 'DEMOSCENE', {
    fontSize: 48,
    glitchIntensity: 0.1,
    glitchFrequency: 0.05
});
```

### Matrix Rain
```javascript
// Create matrix rain effect
darkWaveCore.createMatrixRain('canvas-id', {
    fontSize: 14,
    columns: 50,
    speed: 1,
    color: '#00ff41'
});
```

## 🛠️ Customization

### CSS Variables
The platform uses CSS custom properties for easy theming:

```css
:root {
    --bg-primary: #0d0b1e;      /* Main background */
    --bg-secondary: #1a1a2e;    /* Secondary background */
    --neon-purple: #b388ff;     /* Primary neon color */
    --neon-blue: #00ffff;       /* Secondary neon color */
    --neon-pink: #ff00ff;       /* Accent neon color */
    --text-primary: #ffffff;    /* Primary text color */
}
```

### Adding New Effects
1. Extend the `DarkWaveCore` class with new effect methods
2. Add corresponding UI controls in the editor
3. Update the demo gallery to showcase new effects

### Audio Customization
1. Add new chord progressions to `chordProgressions` object
2. Create custom scales in `createChiptuneMelody`
3. Implement new audio effects in the `createEffects` method

## 🎯 Demo Creation Guide

### Basic Demo Structure
```javascript
// Get canvas context
const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');

// Animation loop
function animate() {
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Your demo code here
    ctx.fillStyle = '#b388ff';
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Start animation
animate();
```

### Best Practices
- Use `requestAnimationFrame` for smooth animations
- Implement fade effects with `rgba` colors
- Keep particle counts reasonable for performance
- Use the dark wave color palette for consistency
- Add audio synchronization for immersive experiences

## 🔧 Technical Details

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (may require user interaction for audio)
- **Mobile**: Responsive design with touch support

### Performance Optimization
- Canvas rendering with `imageSmoothingEnabled = false`
- Efficient particle system with object pooling
- Audio context management for browser autoplay policies
- Visibility API integration for background tab optimization

### Security Considerations
- Code execution in sandboxed environment
- Input sanitization for user-generated content
- Local storage for persistence (no server required)

## 🎪 Future Enhancements

### Planned Features
- **WebGL Support**: 3D demos with Three.js integration
- **Demo Upload System**: Server-side demo storage and sharing
- **Real-time Collaboration**: Multi-user demo creation
- **Advanced Audio**: FM synthesis and tracker-style sequencing
- **Mobile App**: Progressive Web App with offline support

### Community Features
- **Virtual Demoparties**: Live streaming of demo competitions
- **Demo Voting System**: Community rating and feedback
- **Tutorial Videos**: Interactive learning content
- **Code Sharing**: GitHub integration for demo source code

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly in multiple browsers
5. Submit a pull request

### Code Style
- Use ES6+ features
- Follow the existing naming conventions
- Add comments for complex algorithms
- Maintain the dark wave aesthetic

### Testing
- Test in Chrome, Firefox, Safari, and Edge
- Verify audio functionality
- Check mobile responsiveness
- Ensure accessibility compliance

## 📄 License

This project is open source and available under the MIT License. See the LICENSE file for details.

## 🙏 Acknowledgments

- **Future Crew**: Inspiration from Second Reality (1993)
- **Farbrausch**: Influence from Debris (2007)
- **Demoscene Community**: Decades of creative coding inspiration
- **Web Audio API**: Enabling real-time audio synthesis
- **Canvas API**: Providing powerful 2D graphics capabilities

## 📞 Support

For questions, bug reports, or feature requests:
- Create an issue on GitHub
- Join the demoscene community discussions
- Check the tutorial section for learning resources

---

**Welcome to the DarkWave Demoscene Platform** - Where 8-bit meets dark wave, and creativity knows no bounds! 🎮🎵✨ 