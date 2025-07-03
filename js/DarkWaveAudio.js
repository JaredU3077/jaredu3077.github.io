// DarkWaveAudio.js - Chiptune and Dark Wave Audio Module

class DarkWaveAudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.isInitialized = false;
        this.currentSequence = null;
        this.audioNodes = new Map();
        this.samples = new Map();
        
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
        
        this.init();
    }
    
    async init() {
        try {
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
        if (!this.isInitialized) return;
        
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
            'Eb': ['Eb4', 'G4', 'Bb4']
        };
        
        return chordMap[chord] || chordMap['C'];
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