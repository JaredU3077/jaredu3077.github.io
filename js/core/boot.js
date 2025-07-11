/**
 * @file Boot System Module - Main orchestrator for system boot sequence, login, audio, and particle effects
 * @author Jared U.
 * @tags neu-os
 */

import { AudioSystem } from './audioSystem.js';
import { BackgroundMusic } from './backgroundMusic.js';
import { ParticleSystem } from './particleSystem.js';
import { BootSequence } from './bootSequence.js';

export class BootSystem {
    constructor() {
        // Initialize all subsystems
        this.audioSystem = new AudioSystem();
        this.backgroundMusic = new BackgroundMusic();
        this.particleSystem = new ParticleSystem();
        this.bootSequence = new BootSequence();
        
        // Store instances globally for other components to access
        window.audioSystemInstance = this.audioSystem;
        window.backgroundMusicInstance = this.backgroundMusic;
        window.particleSystemInstance = this.particleSystem;
        window.bootSequenceInstance = this.bootSequence;
        
            // Expose mechvibes player through boot system for terminal access
    this.mechvibesPlayer = null;
    
    // Expose background music player for terminal access
    this.audioPlayer = null;
    
    this.init();
    }

    async init() {
        try {
            console.log('neuOS: Initializing core systems...');
            
            // Initialize all subsystems
            this.audioSystem.init();
            this.backgroundMusic.init();
            this.particleSystem.init();
            
            // Initialize Mechvibes player if audio is available
            await this.audioSystem.initMechvibes();
            
            // Expose mechvibes player for terminal access
            this.mechvibesPlayer = this.audioSystem.mechvibesPlayer;
            
            // Expose background music player for terminal access
            this.audioPlayer = this.backgroundMusic;
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('neuOS: Core systems ready, starting boot sequence...');
            await this.bootSequence.startBootSequence();
        } catch (error) {
            console.error('neuOS: System initialization failed:', error);
            // Fallback: show login screen directly
            this.bootSequence.showLoginScreen();
        }
    }

    setupEventListeners() {
        // Audio toggle button
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.backgroundMusic.toggleBackgroundMusic());
        }

        // Guest login button
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', () => this.bootSequence.handleLogin());
        }

        // Skip boot sequence on any key press or click
        document.addEventListener('keydown', (e) => {
            if (document.body.classList.contains('boot-active')) {
                this.bootSequence.skipBoot();
            }
        }, { once: true });

        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('boot-active') && 
                !e.target.closest('.audio-toggle')) {
                this.bootSequence.skipBoot();
            }
        }, { once: true });

        // Keyboard controls for background effects
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard controls if no input is focused
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA' &&
                !e.ctrlKey && !e.altKey && !e.metaKey) {
                
                switch(e.key.toLowerCase()) {
                    case 'space':
                        e.preventDefault();
                        this.particleSystem.toggleParticleAnimation();
                        break;
                    case 'r':
                        this.particleSystem.rotateBackground();
                        break;
                    case '+':
                    case '=':
                        this.particleSystem.increaseParticles();
                        break;
                    case '-':
                        this.particleSystem.decreaseParticles();
                        break;
                    case 'c':
                        this.particleSystem.changeParticleColors();
                        break;
                }
            }
        });

        // Typing sound effects - removed global listener to prevent conflicts
    }

    // Expose audio methods from AudioSystem
    playUIClickSound() {
        if (this.audioSystem) {
            this.audioSystem.playUIClickSound();
        } else {
            console.warn('Audio system not available for UI click sound');
        }
    }

    playWindowOpenSound() {
        if (this.audioSystem) {
            this.audioSystem.playWindowOpenSound();
        } else {
            console.warn('Audio system not available for window open sound');
        }
    }

    playWindowCloseSound() {
        if (this.audioSystem) {
            this.audioSystem.playWindowCloseSound();
        } else {
            console.warn('Audio system not available for window close sound');
        }
    }

    playBootSound() {
        if (this.audioSystem) {
            this.audioSystem.playBootSound();
        } else {
            console.warn('Audio system not available for boot sound');
        }
    }

    playLoginSound() {
        if (this.audioSystem) {
            this.audioSystem.playLoginSound();
        } else {
            console.warn('Audio system not available for login sound');
        }
    }

    playClickSound() {
        if (this.audioSystem) {
            this.audioSystem.playClickSound();
        } else {
            console.warn('Audio system not available for click sound');
        }
    }

    playDesktopReadySound() {
        if (this.audioSystem) {
            this.audioSystem.playDesktopReadySound();
        } else {
            console.warn('Audio system not available for desktop ready sound');
        }
    }

    // Expose boot sequence methods
    showLoginScreen() {
        if (this.bootSequence) {
            this.bootSequence.showLoginScreen();
        } else {
            console.warn('Boot sequence not available for showLoginScreen');
        }
    }

    skipBoot() {
        if (this.bootSequence) {
            this.bootSequence.skipBoot();
        } else {
            console.warn('Boot sequence not available for skipBoot');
        }
    }

    handleLogin() {
        if (this.bootSequence) {
            return this.bootSequence.handleLogin();
        } else {
            console.warn('Boot sequence not available for handleLogin');
            return Promise.resolve();
        }
    }

    // Expose methods globally for other components
    static getInstance() {
        if (!window.bootSystemInstance) {
            window.bootSystemInstance = new BootSystem();
        }
        return window.bootSystemInstance;
    }
}

// Additional CSS for fade animations
const additionalStyles = `
@keyframes fadeOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.95); }
}

.desktop-entry {
    animation: desktopEntry 1s ease-out forwards;
}

@keyframes desktopEntry {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
}
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 