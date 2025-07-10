// DarkWaveAudio.js - Chiptune and Dark Wave Audio Module

class DarkWaveAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.currentSequence = null;
        this.audioNodes = new Map();
        this.samples = new Map();
        this.currentTrack = null;
        this.isMuted = false;
        
        // Chiptune frequencies (8-bit style)
        this.frequencies = {
            'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
            'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
            'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
        };
        
        // Dark wave chord progressions
        this.chordProgressions = {
            dark: ['Am', 'F', 'C', 'G'],
            cyber: ['Em', 'C', 'G', 'D'],
            hacker: ['Dm', 'Am', 'Bm', 'G'],
            wave: ['Cm', 'Ab', 'Eb', 'Bb']
        };
        
        // Demoscene-specific track definitions
        this.demosceneTracks = {
            'neon-particles': {
                name: 'Neon Pulse',
                type: 'dark-wave',
                progression: ['Am', 'F', 'C', 'G', 'Dm', 'Em'],
                tempo: 120,
                bassline: ['A2', 'F2', 'C3', 'G2', 'D2', 'E2'],
                melody: ['A4', 'C5', 'E5', 'F4', 'A4', 'C5', 'G4', 'B4', 'D5', 'D4', 'F4', 'A4', 'E4', 'G4', 'B4'],
                effects: ['reverb', 'delay', 'distortion']
            },
            'matrix-rain': {
                name: 'Digital Rain',
                type: 'chiptune',
                progression: ['Em', 'C', 'G', 'D', 'Am', 'Bm'],
                tempo: 140,
                bassline: ['E2', 'C2', 'G2', 'D2', 'A2', 'B2'],
                melody: ['E4', 'G4', 'B4', 'C4', 'E4', 'G4', 'G4', 'B4', 'D5', 'D4', 'F#4', 'A4', 'A4', 'C5', 'E5', 'B4', 'D5', 'F#5'],
                effects: ['lowpass', 'delay']
            },
            'wireframe-network': {
                name: 'Network Pulse',
                type: 'hacker',
                progression: ['Dm', 'Am', 'Bm', 'G', 'C', 'F'],
                tempo: 110,
                bassline: ['D2', 'A2', 'B2', 'G2', 'C3', 'F2'],
                melody: ['D4', 'F4', 'A4', 'A4', 'C5', 'E5', 'B4', 'D5', 'F#5', 'G4', 'B4', 'D5', 'C5', 'E5', 'G5', 'F4', 'A4', 'C5'],
                effects: ['reverb', 'distortion', 'lowpass']
            },
            'glitch-text': {
                name: 'Glitch Corruption',
                type: 'wave',
                progression: ['Cm', 'Ab', 'Eb', 'Bb', 'Fm', 'Db'],
                tempo: 90,
                bassline: ['C2', 'Ab2', 'Eb2', 'Bb2', 'F2', 'Db3'],
                melody: ['C4', 'Eb4', 'G4', 'Ab4', 'C5', 'Eb5', 'Eb4', 'G4', 'Bb4', 'Bb4', 'D5', 'F5', 'F4', 'Ab4', 'C5', 'Db4', 'F4', 'Ab4'],
                effects: ['distortion', 'delay', 'reverb']
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            // Prevent multiple initializations
            if (this.isInitialized) {
                console.log('Audio already initialized');
                return;
            }
            
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.masterGain.connect(this.audioContext.destination);
            
            // Create audio effects
            this.createEffects();
            
            this.isInitialized = true;
            console.log('DarkWave Audio initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }
    
    createEffects() {
        // Reverb effect
        this.reverb = this.audioContext.createConvolver();
        this.createReverbImpulse();
        
        // Delay effect
        this.delay = this.audioContext.createDelay(1.0);
        this.delayGain = this.audioContext.createGain();
        this.delayGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        this.delay.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
        
        // Distortion
        this.distortion = this.audioContext.createWaveShaper();
        this.createDistortionCurve();
        
        // Low-pass filter for dark wave feel
        this.lowpass = this.audioContext.createBiquadFilter();
        this.lowpass.type = 'lowpass';
        this.lowpass.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        this.lowpass.Q.setValueAtTime(1, this.audioContext.currentTime);
    }
    
    createReverbImpulse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 second reverb
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverb.buffer = impulse;
    }
    
    createDistortionCurve() {
        const sampleRate = this.audioContext.sampleRate;
        const curve = new Float32Array(sampleRate);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < sampleRate; i++) {
            const x = (i * 2) / sampleRate - 1;
            curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
        }
        
        this.distortion.curve = curve;
        this.distortion.oversample = '4x';
    }
    
    // Play a single chiptune note
    playNote(frequency, duration = 0.2, type = 'square', effects = true) {
        if (!this.isInitialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        // Connect with effects
        if (effects) {
            oscillator
                .connect(this.distortion)
                .connect(this.lowpass)
                .connect(this.delay)
                .connect(this.reverb)
                .connect(gainNode)
                .connect(this.masterGain);
        } else {
            oscillator.connect(gainNode).connect(this.masterGain);
        }
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return { oscillator, gainNode };
    }
    
    // Play a chord
    playChord(notes, duration = 0.5) {
        const nodes = [];
        notes.forEach(note => {
            const freq = this.getFrequency(note);
            if (freq) {
                nodes.push(this.playNote(freq, duration, 'sawtooth'));
            }
        });
        return nodes;
    }
    
    // Get frequency from note name
    getFrequency(note, octave = 4) {
        const baseNote = note.replace(/[0-9]/g, '');
        const noteOctave = parseInt(note.match(/[0-9]/)) || octave;
        
        if (this.frequencies[baseNote]) {
            return this.frequencies[baseNote] * Math.pow(2, noteOctave - 4);
        }
        return null;
    }
    
    // Play a dark wave sequence
    playDarkWaveSequence(style = 'dark', duration = 4) {
        if (!this.isInitialized) return;
        
        const progression = this.chordProgressions[style] || this.chordProgressions.dark;
        const chordDuration = duration / progression.length;
        
        progression.forEach((chord, index) => {
            setTimeout(() => {
                this.playChord(this.getChordNotes(chord), chordDuration);
            }, index * chordDuration * 1000);
        });
    }
    
    // Get notes for a chord
    getChordNotes(chord) {
        const chordMap = {
            'C': ['C4', 'E4', 'G4'],
            'Cm': ['C4', 'Eb4', 'G4'],
            'D': ['D4', 'F#4', 'A4'],
            'Dm': ['D4', 'F4', 'A4'],
            'E': ['E4', 'G#4', 'B4'],
            'Em': ['E4', 'G4', 'B4'],
            'F': ['F4', 'A4', 'C5'],
            'G': ['G4', 'B4', 'D5'],
            'Am': ['A4', 'C5', 'E5'],
            'Bm': ['B4', 'D5', 'F#5'],
            'Ab': ['Ab4', 'C5', 'Eb5'],
            'Bb': ['Bb4', 'D5', 'F5'],
            'Eb': ['Eb4', 'G4', 'Bb4'],
            'Fm': ['F4', 'Ab4', 'C5'],
            'Db': ['Db4', 'F4', 'Ab4']
        };
        
        return chordMap[chord] || chordMap['C'];
    }
    
    // Create and play a demoscene track
    playDemosceneTrack(demoId) {
        if (!this.isInitialized) {
            console.error('Audio system not initialized');
            return;
        }
        
        const track = this.demosceneTracks[demoId];
        if (!track) {
            console.error('Track not found for demo:', demoId);
            return;
        }
        
        // Stop any current track first
        this.stopCurrentTrack();
        
        console.log(`Playing demoscene track: ${track.name}`);
        
        // Create the track
        this.currentTrack = {
            demoId,
            startTime: this.audioContext.currentTime,
            duration: 45, // 45 seconds
            isPlaying: true,
            loopCount: 0
        };
        
        // Schedule the track with looping
        this.scheduleDemosceneTrack(track);
    }
    
    scheduleDemosceneTrack(track) {
        const beatDuration = 60 / track.tempo;
        const progressionLength = track.progression.length;
        const sectionDuration = 45 / progressionLength; // 45 seconds divided by progression length
        
        // Schedule each section of the progression
        track.progression.forEach((chord, sectionIndex) => {
            const sectionStartTime = this.audioContext.currentTime + (sectionIndex * sectionDuration);
            
            // Schedule chords
            this.scheduleChordSection(chord, sectionStartTime, sectionDuration, track);
            
            // Schedule bassline
            this.scheduleBassline(track.bassline[sectionIndex], sectionStartTime, sectionDuration, track);
            
            // Schedule melody
            this.scheduleMelody(track.melody, sectionStartTime, sectionDuration, track);
        });
        
        // Schedule the next loop
        this._loopTimeout = setTimeout(() => {
            if (this.currentTrack && this.currentTrack.isPlaying) {
                this.currentTrack.loopCount++;
                console.log(`Looping track ${track.name} (loop ${this.currentTrack.loopCount})`);
                this.scheduleDemosceneTrack(track);
            }
        }, 45000); // 45 seconds
    }
    
    scheduleChordSection(chord, startTime, duration, track) {
        const chordNotes = this.getChordNotes(chord);
        const chordInterval = duration / 4; // 4 chords per section
        
        for (let i = 0; i < 4; i++) {
            const chordTime = startTime + (i * chordInterval);
            chordNotes.forEach(note => {
                const freq = this.getFrequency(note);
                if (freq) {
                    this.scheduleNote(freq, chordTime, chordInterval * 0.8, 'sawtooth', track.effects);
                }
            });
        }
    }
    
    scheduleBassline(bassNote, startTime, duration, track) {
        const freq = this.getFrequency(bassNote);
        if (!freq) return;
        
        const bassInterval = duration / 8; // 8 bass notes per section
        
        for (let i = 0; i < 8; i++) {
            const bassTime = startTime + (i * bassInterval);
            this.scheduleNote(freq, bassTime, bassInterval * 0.6, 'square', track.effects);
        }
    }
    
    scheduleMelody(melody, startTime, duration, track) {
        const melodyInterval = duration / melody.length;
        
        melody.forEach((note, index) => {
            const freq = this.getFrequency(note);
            if (freq) {
                const noteTime = startTime + (index * melodyInterval);
                this.scheduleNote(freq, noteTime, melodyInterval * 0.7, 'triangle', track.effects);
            }
        });
    }
    
    scheduleNote(frequency, startTime, duration, type, effects) {
        if (!this.isInitialized || this.isMuted) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, startTime);
        
        // Envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        // Connect with effects
        if (effects && effects.includes('reverb')) {
            oscillator.connect(this.reverb);
        }
        if (effects && effects.includes('delay')) {
            oscillator.connect(this.delay);
        }
        if (effects && effects.includes('distortion')) {
            oscillator.connect(this.distortion);
        }
        if (effects && effects.includes('lowpass')) {
            oscillator.connect(this.lowpass);
        }
        
        oscillator.connect(gainNode).connect(this.masterGain);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    }
    
    // Stop current track
    stopCurrentTrack() {
        if (this.currentTrack) {
            this.currentTrack.isPlaying = false;
            this.currentTrack = null;
        }
        
        // Clear any scheduled timeouts for looping
        if (this._loopTimeout) {
            clearTimeout(this._loopTimeout);
            this._loopTimeout = null;
        }
        
        // Stop any scheduled audio by suspending and resuming the context
        if (this.audioContext) {
            // This will stop all scheduled audio
            this.audioContext.suspend().then(() => {
                this.audioContext.resume();
            });
        }
        
        console.log('Audio track stopped and cleaned up');
    }
    
    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.masterGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        } else {
            this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        }
        
        return this.isMuted;
    }
    
    // Create a chiptune melody
    createChiptuneMelody(scale = 'minor', length = 16) {
        const scales = {
            minor: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            major: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
            pentatonic: ['C', 'D', 'E', 'G', 'A']
        };
        
        const selectedScale = scales[scale] || scales.minor;
        const melody = [];
        
        for (let i = 0; i < length; i++) {
            const note = selectedScale[Math.floor(Math.random() * selectedScale.length)];
            const octave = Math.random() > 0.7 ? 5 : 4;
            melody.push(note + octave);
        }
        
        return melody;
    }
    
    // Play a chiptune melody
    playChiptuneMelody(melody, tempo = 120) {
        if (!this.isInitialized) return;
        
        const beatDuration = 60 / tempo;
        
        melody.forEach((note, index) => {
            setTimeout(() => {
                const freq = this.getFrequency(note);
                if (freq) {
                    this.playNote(freq, beatDuration * 0.8, 'square', false);
                }
            }, index * beatDuration * 1000);
        });
    }
    
    // Create drum pattern
    createDrumPattern() {
        if (!this.isInitialized) return;
        
        // Kick drum
        const kick = this.audioContext.createOscillator();
        const kickGain = this.audioContext.createGain();
        
        kick.frequency.setValueAtTime(150, this.audioContext.currentTime);
        kick.frequency.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        kickGain.gain.setValueAtTime(1, this.audioContext.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        kick.connect(kickGain).connect(this.masterGain);
        kick.start();
        kick.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Create noise effect
    createNoise(duration = 0.1) {
        if (!this.isInitialized) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        
        noise.buffer = buffer;
        noiseGain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        noise.connect(noiseGain).connect(this.masterGain);
        noise.start();
    }
    
    // Start a continuous dark wave ambient track
    startAmbientTrack() {
        if (!this.isInitialized || this.currentSequence) return;
        
        this.currentSequence = setInterval(() => {
            const styles = Object.keys(this.chordProgressions);
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            this.playDarkWaveSequence(randomStyle, 2);
            
            // Add occasional effects
            if (Math.random() > 0.7) {
                this.createNoise(0.05);
            }
        }, 2000);
    }
    
    // Stop ambient track
    stopAmbientTrack() {
        if (this.currentSequence) {
            clearInterval(this.currentSequence);
            this.currentSequence = null;
        }
        
        // Also stop demoscene track
        this.stopCurrentTrack();
    }
    
    // Create audio visualizer data
    createVisualizerData() {
        if (!this.isInitialized) return new Array(64).fill(0);
        
        const analyser = this.audioContext.createAnalyser();
        analyser.fftSize = 128;
        analyser.connect(this.masterGain);
        
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        return Array.from(dataArray);
    }
    
    // Set master volume
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
    
    // Resume audio context (for browser autoplay policies)
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
}

// Global instance
window.darkWaveAudio = new DarkWaveAudio();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkWaveAudio;
} 