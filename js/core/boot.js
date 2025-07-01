/**
 * @file Boot System Module - Handles system boot sequence, login, and audio
 * @author Jared U.
 */

export class BootSystem {
    constructor() {
        this.audioEnabled = localStorage.getItem('neuos-audio') !== 'false';
        this.bootMessages = [
            'Initializing network stack...',
            'Loading kernel modules...',
            'Starting network services...',
            'Mounting file systems...',
            'Configuring network interfaces...',
            'Loading user profile...',
            'Starting graphical interface...',
            'Neu-OS ready.'
        ];
        this.messageIndex = 0;
        this.audioContext = null;
        this.init();
    }

    async init() {
        this.setupAudioSystem();
        this.setupEventListeners();
        await this.startBootSequence();
    }

    setupAudioSystem() {
        // Create audio context for sound effects with better error handling
        if (this.audioEnabled) {
            try {
                // Check for AudioContext support
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.audioContext = new AudioContextClass();
                    
                    // Handle suspended audio context (required by modern browsers)
                    if (this.audioContext.state === 'suspended') {
                        // Audio context will be resumed on first user interaction
                        document.addEventListener('click', () => {
                            if (this.audioContext && this.audioContext.state === 'suspended') {
                                this.audioContext.resume().catch(err => {
                                    console.warn('Failed to resume audio context:', err);
                                });
                            }
                        }, { once: true });
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
    }

    setupEventListeners() {
        // Audio toggle button
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleAudio());
        }

        // Guest login button
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', () => this.handleLogin());
        }

        // Skip boot sequence on any key press or click
        document.addEventListener('keydown', (e) => {
            if (document.body.classList.contains('boot-active')) {
                this.skipBoot();
            }
        }, { once: true });

        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('boot-active') && 
                !e.target.closest('.audio-toggle')) {
                this.skipBoot();
            }
        }, { once: true });
    }

    async startBootSequence() {
        document.body.classList.add('boot-active');
        
        if (this.audioEnabled) {
            this.playBootSound();
        }

        // Start message cycling
        this.cycleBootMessages();

        // Auto-progress to login after boot completes
        setTimeout(() => {
            this.showLoginScreen();
        }, 4000);
    }

    cycleBootMessages() {
        const messageElement = document.querySelector('.boot-message');
        if (!messageElement) return;

        const showMessage = () => {
            if (this.messageIndex < this.bootMessages.length) {
                messageElement.textContent = this.bootMessages[this.messageIndex];
                messageElement.style.animation = 'none';
                
                // Trigger reflow
                messageElement.offsetHeight;
                
                messageElement.style.animation = 'bootMessageFade 0.5s ease-in-out forwards';
                
                this.messageIndex++;
                
                // Schedule next message
                setTimeout(showMessage, 500);
            }
        };

        showMessage();
    }

    skipBoot() {
        this.messageIndex = this.bootMessages.length;
        this.showLoginScreen();
    }

    showLoginScreen() {
        const bootSequence = document.getElementById('bootSequence');
        const loginScreen = document.getElementById('loginScreen');
        
        if (bootSequence) {
            bootSequence.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                bootSequence.style.display = 'none';
                document.body.classList.remove('boot-active');
                document.body.classList.add('login-active');
                
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    
                    if (this.audioEnabled) {
                        this.playLoginSound();
                    }
                }
            }, 500);
        }
    }

    async handleLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        
        if (guestLoginBtn) {
            guestLoginBtn.textContent = 'Logging in...';
            guestLoginBtn.disabled = true;
        }

        if (this.audioEnabled) {
            this.playClickSound();
        }

        // Simulate login process
        await this.delay(1500);

        if (loginScreen) {
            loginScreen.style.animation = 'fadeOut 0.8s ease-out forwards';
            setTimeout(() => {
                loginScreen.style.display = 'none';
                document.body.classList.remove('login-active');
                
                // Initialize main application
                this.initializeDesktop();
            }, 800);
        }
    }

    initializeDesktop() {
        // Show desktop with fade-in animation
        const desktop = document.getElementById('desktop');
        const taskbar = document.querySelector('.taskbar');
        
        if (desktop) {
            desktop.style.opacity = '0';
            desktop.style.transform = 'scale(0.95)';
            desktop.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        }
        
        if (taskbar) {
            taskbar.style.opacity = '0';
            taskbar.style.transform = 'translateY(100%)';
            taskbar.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        }

        // Add network animation elements
        this.createNetworkAnimations();

        // Trigger entrance animation
        setTimeout(() => {
            if (desktop) {
                desktop.style.opacity = '1';
                desktop.style.transform = 'scale(1)';
            }
            if (taskbar) {
                taskbar.style.opacity = '1';
                taskbar.style.transform = 'translateY(0)';
            }
        }, 100);

        // Play desktop ready sound
        if (this.audioEnabled) {
            setTimeout(() => this.playDesktopReadySound(), 500);
        }

        // Auto-open welcome window
        setTimeout(() => {
            if (window.handleAppClick) {
                window.handleAppClick('welcome');
            }
        }, 1500);
    }

    createNetworkAnimations() {
        // Create data packet particles
        const particleContainer = document.createElement('div');
        particleContainer.className = 'network-particles';
        
        for (let i = 0; i < 6; i++) {
            const packet = document.createElement('div');
            packet.className = 'data-packet';
            particleContainer.appendChild(packet);
        }
        
        document.body.appendChild(particleContainer);

        // Create network nodes
        const nodeContainer = document.createElement('div');
        nodeContainer.className = 'network-nodes';
        
        for (let i = 0; i < 4; i++) {
            const node = document.createElement('div');
            node.className = 'network-node';
            nodeContainer.appendChild(node);
        }
        
        document.body.appendChild(nodeContainer);
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

    createTone(frequency, duration, waveType = 'sine', volume = 0.1) {
        if (!this.audioContext) return;

        try {
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
            console.warn('Audio synthesis failed:', e);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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