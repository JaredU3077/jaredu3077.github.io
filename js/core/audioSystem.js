/**
 * @file Audio System Module - Handles audio context, sound effects, and synthesis
 * @author Jared U.
 * @tags neu-os
 */

export class AudioSystem {
    constructor() {
        // Audio enabled by default, only disabled if explicitly set to false
        this.audioEnabled = localStorage.getItem('neuos-audio') !== 'false';
        // If no setting exists, default to enabled
        if (localStorage.getItem('neuos-audio') === null) {
            this.audioEnabled = true;
            localStorage.setItem('neuos-audio', 'true');
        }
        
        this.audioContext = null;
        this.audioNodes = {};
        this.mechvibesPlayer = null;
    }

    init() {
        this.setupAudioSystem();
    }

    setupAudioSystem() {
        // Always try to initialize audio system, even if disabled (for seamless enabling later)
        try {
            // Check for AudioContext support
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                
                // Handle suspended audio context (required by modern browsers)
                if (this.audioContext.state === 'suspended') {
                    // Audio context will be resumed on first user interaction
                    const resumeAudio = () => {
                        if (this.audioContext && this.audioContext.state === 'suspended') {
                            this.audioContext.resume().then(() => {
                    
                                this.setupAudioNodes();
                            }).catch(err => {
                                console.warn('Failed to resume audio context:', err);
                            });
                        }
                        // Remove listeners after first interaction
                        document.removeEventListener('click', resumeAudio);
                        document.removeEventListener('keydown', resumeAudio);
                    };
                    
                    document.addEventListener('click', resumeAudio, { once: true });
                    document.addEventListener('keydown', resumeAudio, { once: true });
                } else {
                    // Audio context is already active
                    this.setupAudioNodes();
                }
            } else {
                console.warn('AudioContext not supported in this browser');
                this.audioEnabled = false;
            }
        } catch (error) {
            console.warn('Failed to initialize audio context:', error);
            this.audioEnabled = false;
            this.audioContext = null;
        }
    }

    setupAudioNodes() {
        if (!this.audioContext) return;

        try {
            // Create master gain node for all synthesized sounds
            this.audioNodes.masterGain = this.audioContext.createGain();
            this.audioNodes.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.audioNodes.masterGain.connect(this.audioContext.destination);

            // Create filter for different sound types
            this.audioNodes.filter = this.audioContext.createBiquadFilter();
            this.audioNodes.filter.type = 'lowpass';
            this.audioNodes.filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            this.audioNodes.filter.connect(this.audioNodes.masterGain);
            
    
        } catch (error) {
            console.warn('Failed to setup audio nodes:', error);
        }
    }

    async initMechvibes() {
        if (this.audioContext) {
            try {
        
                const { mechvibesPlayer } = await import('../utils/mechvibes.js');
                await mechvibesPlayer.init(this.audioContext);
                this.mechvibesPlayer = mechvibesPlayer;

            } catch (error) {
                console.warn('Mechvibes initialization failed:', error);
            }
        } else {
            console.warn('🎹 AudioSystem: Audio context not available for Mechvibes');
        }
    }

    // Enhanced realistic typing sound effects
    async playTypingSound(key) {

        if (!this.audioEnabled || !this.audioContext) {
            console.warn('🎹 AudioSystem: Audio not enabled or context not available');
            return;
        }

        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio context for typing sound:', err);
            });
        }

        // Try Mechvibes first (enabled by default), fallback to synthesized sounds
        if (this.mechvibesPlayer && this.mechvibesPlayer.isLoaded && this.mechvibesPlayer.isEnabled) {
            
            try {
                await this.mechvibesPlayer.playKeySound(key);
                return;
            } catch (error) {
                console.warn('🎹 AudioSystem: Mechvibes failed, falling back to synthesized sound:', error);
            }
        }

        
        // Fallback to synthesized sounds - much louder and longer
        const baseFreq = 800 + Math.random() * 200; // Higher frequency for better audibility
        const duration = 0.1 + Math.random() * 0.05; // Longer duration (100-150ms)
        const volume = 0.1 + Math.random() * 0.05; // Much louder volume

        // Single filtered tone - no layering, no delays, no noise
        this.createFilteredTone(baseFreq, duration, 'triangle', volume, 'lowpass', 800);
    }

    playEnterSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio context for enter sound:', err);
            });
        }
        
        // Try Mechvibes first (enabled by default), fallback to synthesized sounds
        if (this.mechvibesPlayer && this.mechvibesPlayer.isLoaded && this.mechvibesPlayer.isEnabled) {
            this.mechvibesPlayer.playKeySound('enter');
            return;
        }
        
        // Fallback to synthesized sounds
        const baseFreq = 350 + Math.random() * 50;
        const duration = 0.08 + Math.random() * 0.02;
        this.createFilteredTone(baseFreq, duration, 'sine', 0.03, 'lowpass', 500);
    }

    playBackspaceSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio context for backspace sound:', err);
            });
        }
        
        // Try Mechvibes first (enabled by default), fallback to synthesized sounds
        if (this.mechvibesPlayer && this.mechvibesPlayer.isLoaded && this.mechvibesPlayer.isEnabled) {
            this.mechvibesPlayer.playKeySound('backspace');
            return;
        }
        
        // Fallback to synthesized sounds
        const baseFreq = 300 + Math.random() * 50;
        const duration = 0.06 + Math.random() * 0.02;
        this.createFilteredTone(baseFreq, duration, 'triangle', 0.025, 'lowpass', 400);
    }

    playSpaceSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Ensure audio context is running
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(err => {
                console.warn('Failed to resume audio context for space sound:', err);
            });
        }
        
        // Try Mechvibes first (enabled by default), fallback to synthesized sounds
        if (this.mechvibesPlayer && this.mechvibesPlayer.isLoaded && this.mechvibesPlayer.isEnabled) {
            this.mechvibesPlayer.playKeySound(' ');
            return;
        }
        
        // Fallback to synthesized sounds
        const baseFreq = 250 + Math.random() * 50;
        const duration = 0.07 + Math.random() * 0.02;
        this.createFilteredTone(baseFreq, duration, 'triangle', 0.02, 'lowpass', 400);
    }

    playUIClickSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // UI interaction sound
        this.createTone(800, 0.1, 'sine', 0.04);
        setTimeout(() => this.createTone(1000, 0.05, 'sine', 0.02), 30);
    }

    playWindowOpenSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Window opening sound
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createTone(400 + i * 200, 0.15, 'sine', 0.03);
            }, i * 50);
        }
    }

    playWindowCloseSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Window closing sound
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createTone(800 - i * 200, 0.1, 'sine', 0.03);
            }, i * 40);
        }
    }

    // Audio synthesis methods
    playBootSound() {
        if (!this.audioContext) return;
        
        this.createTone(220, 0.1, 'sine', 0.3);
        setTimeout(() => this.createTone(330, 0.1, 'sine', 0.2), 200);
        setTimeout(() => this.createTone(440, 0.2, 'sine', 0.1), 400);
    }

    playLoginSound() {
        if (!this.audioContext) return;
        
        this.createTone(440, 0.1, 'sine', 0.2);
        setTimeout(() => this.createTone(554, 0.1, 'sine', 0.15), 100);
    }

    playClickSound() {
        if (!this.audioContext) return;
        
        this.createTone(800, 0.05, 'square', 0.1);
    }

    playDesktopReadySound() {
        if (!this.audioContext) return;
        
        // Ascending chord
        this.createTone(262, 0.15, 'sine', 0.1); // C
        setTimeout(() => this.createTone(330, 0.15, 'sine', 0.1), 50); // E
        setTimeout(() => this.createTone(392, 0.15, 'sine', 0.1), 100); // G
        setTimeout(() => this.createTone(523, 0.2, 'sine', 0.1), 150); // C octave
    }

    createFilteredTone(frequency, duration, waveType = 'sine', volume = 0.1, filterType = 'lowpass', filterFreq = 1000) {
        if (!this.audioContext) return;

        try {
            // Resume audio context if it's suspended (required for autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {
                    // Silently handle if resume fails - this is expected before user interaction
                    return;
                });
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            filter.type = filterType;
            filter.frequency.value = filterFreq;
            
            // Apply very subtle ADSR envelope for smooth, soothing sound
            this.applyADSREnvelope(gainNode, 0.001, 0.005, 0.4, 0.03, duration, volume);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration + 0.1); // Buffer for release
            
            // Cleanup to prevent memory buildup
            setTimeout(() => {
                oscillator.disconnect();
                filter.disconnect();
                gainNode.disconnect();
            }, (duration + 0.1) * 1000);
        } catch (e) {
            // Silently handle autoplay policy errors - this is expected
            if (e.name !== 'NotAllowedError') {
                console.warn('Audio synthesis failed:', e);
            }
        }
    }

    applyADSREnvelope(gainNode, attack, decay, sustain, release, duration, peakVolume) {
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(peakVolume, now + attack);
        gainNode.gain.linearRampToValueAtTime(peakVolume * sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(peakVolume * sustain, now + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
    }

    createTone(frequency, duration, waveType = 'sine', volume = 0.1) {
        if (!this.audioContext) return;

        try {
            // Resume audio context if it's suspended (required for autoplay policy)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {
                    // Silently handle if resume fails - this is expected before user interaction
                    return;
                });
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = waveType;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            // Silently handle autoplay policy errors - this is expected
            if (e.name !== 'NotAllowedError') {
                console.warn('Audio synthesis failed:', e);
            }
        }
    }

    createNoiseTone(duration, volume) {
        if (!this.audioContext) return;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); // Fade out noise
        }
        
        const noise = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        noise.buffer = buffer;
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        filter.type = 'bandpass';
        filter.frequency.value = 2000 + Math.random() * 1000; // Mid-high for friction
        
        // Quick envelope for noise
        this.applyADSREnvelope(gainNode, 0.001, 0.02, 0.2, 0.03, duration, volume);
        
        noise.start(this.audioContext.currentTime);
        noise.stop(this.audioContext.currentTime + duration + 0.1);
        
        // Cleanup
        setTimeout(() => {
            noise.disconnect();
            filter.disconnect();
            gainNode.disconnect();
        }, (duration + 0.1) * 1000);
    }

    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        localStorage.setItem('neuos-audio', this.audioEnabled.toString());
        
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            const audioOnIcon = audioToggle.querySelector('.audio-on');
            const audioOffIcon = audioToggle.querySelector('.audio-off');
            
            if (this.audioEnabled) {
                audioOnIcon.style.display = 'block';
                audioOffIcon.style.display = 'none';
                this.playClickSound();
            } else {
                audioOnIcon.style.display = 'none';
                audioOffIcon.style.display = 'block';
            }
        }
    }

    // Expose sound methods globally for other components
    static getInstance() {
        if (!window.audioSystemInstance) {
            window.audioSystemInstance = new AudioSystem();
        }
        return window.audioSystemInstance;
    }
} 