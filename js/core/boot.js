/**
 * @file Boot System Module - Handles system boot sequence, login, audio, and particle effects
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
        this.audioNodes = {};
        this.particles = [];
        this.particleCount = 150; // Increased particle count
        this.mouseX = 0;
        this.mouseY = 0;
        this.init();
    }

    async init() {
        this.setupAudioSystem();
        this.setupEventListeners();
        this.setupParticleSystem();
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

                    // Pre-create audio nodes for better performance
                    this.setupAudioNodes();
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

    setupAudioNodes() {
        if (!this.audioContext) return;

        try {
            // Create master gain node
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

        // Mouse tracking for particle interaction
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParticleInteraction();
        });

        // Keyboard controls for background effects
        document.addEventListener('keydown', (e) => {
            // Only handle keyboard controls if no input is focused
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA' &&
                !e.ctrlKey && !e.altKey && !e.metaKey) {
                
                switch(e.key.toLowerCase()) {
                    case 'space':
                        e.preventDefault();
                        this.toggleParticleAnimation();
                        break;
                    case 'r':
                        this.rotateBackground();
                        break;
                    case '+':
                    case '=':
                        this.increaseParticles();
                        break;
                    case '-':
                        this.decreaseParticles();
                        break;
                    case 'c':
                        this.changeParticleColors();
                        break;
                }
            }
        });

        // Typing sound effects
        this.setupTypingSounds();
    }

    setupTypingSounds() {
        // Add typing sounds to all text inputs
        document.addEventListener('keydown', (e) => {
            // Only play typing sounds for actual character input
            if (e.target.tagName === 'INPUT' && e.target.type === 'text' && 
                !e.ctrlKey && !e.altKey && !e.metaKey && 
                e.key.length === 1) {
                this.playTypingSound();
            }
        });

        // Special sounds for special keys
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
                switch(e.key) {
                    case 'Enter':
                        this.playEnterSound();
                        break;
                    case 'Backspace':
                        this.playBackspaceSound();
                        break;
                    case ' ':
                        this.playSpaceSound();
                        break;
                }
            }
        });
    }

    setupParticleSystem() {
        // Create particle container
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.id = 'particleContainer';
        document.body.appendChild(particleContainer);

        // Create spinning background elements
        const spinner1 = document.createElement('div');
        spinner1.className = 'background-spinner';
        spinner1.style.width = '300px';
        spinner1.style.height = '300px';
        spinner1.style.margin = '-150px 0 0 -150px';
        document.body.appendChild(spinner1);

        const spinner2 = document.createElement('div');
        spinner2.className = 'background-spinner';
        spinner2.style.width = '500px';
        spinner2.style.height = '500px';
        spinner2.style.margin = '-250px 0 0 -250px';
        spinner2.style.animationDuration = '50s';
        spinner2.style.animationDirection = 'reverse';
        spinner2.style.opacity = '0.3';
        document.body.appendChild(spinner2);

        // Create matrix background
        const matrixBg = document.createElement('div');
        matrixBg.className = 'matrix-background';
        document.body.appendChild(matrixBg);

        // Generate initial particles
        this.generateParticles();
        
        // Start particle animation loop
        this.animateParticles();
    }

    generateParticles() {
        const container = document.getElementById('particleContainer');
        if (!container) return;

        for (let i = 0; i < this.particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'blue-particle particle-interactive';
            
            // Random size variation
            const size = Math.random();
            if (size < 0.3) {
                particle.classList.add('small');
            } else if (size > 0.7) {
                particle.classList.add('large');
            }

            // Random positioning
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (10 + Math.random() * 20) + 's';
            
            // Add some horizontal movement variation
            const drift = (Math.random() - 0.5) * 200;
            particle.style.setProperty('--drift', drift + 'px');

            container.appendChild(particle);
            this.particles.push({
                element: particle,
                originalX: parseFloat(particle.style.left),
                originalY: 100,
                velocityX: (Math.random() - 0.5) * 2,
                velocityY: -Math.random() * 2 - 1
            });
        }
    }

    updateParticleInteraction() {
        // Create attraction/repulsion effect based on mouse position
        const mouseForce = 50;
        const mouseRadius = 150;

        this.particles.forEach(particle => {
            const rect = particle.element.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const dx = this.mouseX - particleX;
            const dy = this.mouseY - particleY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < mouseRadius) {
                const force = (mouseRadius - distance) / mouseRadius;
                const angle = Math.atan2(dy, dx);
                
                // Gentle repulsion effect
                const repelX = -Math.cos(angle) * force * mouseForce;
                const repelY = -Math.sin(angle) * force * mouseForce;
                
                particle.element.style.transform = `translate(${repelX}px, ${repelY}px) scale(${1 + force * 0.5})`;
                particle.element.style.opacity = Math.min(1, 0.6 + force * 0.4);
            } else {
                particle.element.style.transform = '';
                particle.element.style.opacity = '';
            }
        });
    }

    animateParticles() {
        // Continuous particle regeneration
        setInterval(() => {
            if (this.particles.length < this.particleCount) {
                this.generateParticles();
            }
        }, 2000);
    }

    // Enhanced sound effects
    playTypingSound() {
        if (!this.audioEnabled || !this.audioContext) return;

        const frequency = 400 + Math.random() * 200; // Vary the typing sound
        const duration = 0.08;
        this.createTone(frequency, duration, 'square', 0.03);
    }

    playEnterSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Play a satisfying "enter" sound
        this.createTone(600, 0.15, 'sine', 0.05);
        setTimeout(() => this.createTone(800, 0.1, 'sine', 0.03), 50);
    }

    playBackspaceSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Play a "deletion" sound
        this.createTone(300, 0.1, 'sawtooth', 0.04);
    }

    playSpaceSound() {
        if (!this.audioEnabled || !this.audioContext) return;
        
        // Subtle space bar sound
        this.createTone(350, 0.06, 'triangle', 0.02);
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

    // Expose sound methods globally for other components
    static getInstance() {
        if (!window.bootSystemInstance) {
            window.bootSystemInstance = new BootSystem();
        }
        return window.bootSystemInstance;
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

    // Background control methods
    toggleParticleAnimation() {
        const particles = document.querySelectorAll('.blue-particle');
        const spinners = document.querySelectorAll('.background-spinner');
        
        particles.forEach(particle => {
            if (particle.style.animationPlayState === 'paused') {
                particle.style.animationPlayState = 'running';
            } else {
                particle.style.animationPlayState = 'paused';
            }
        });
        
        spinners.forEach(spinner => {
            if (spinner.style.animationPlayState === 'paused') {
                spinner.style.animationPlayState = 'running';
            } else {
                spinner.style.animationPlayState = 'paused';
            }
        });
        
        // Play UI feedback sound
        if (this.audioEnabled) {
            this.playUIClickSound();
        }
    }

    rotateBackground() {
        const spinners = document.querySelectorAll('.background-spinner');
        spinners.forEach((spinner, index) => {
            const currentRotation = parseInt(spinner.dataset.rotation || '0');
            const newRotation = currentRotation + 90;
            spinner.dataset.rotation = newRotation.toString();
            spinner.style.transform = `rotate(${newRotation}deg)`;
        });
        
        // Add a temporary visual effect
        document.body.style.transform = 'rotate(2deg)';
        setTimeout(() => {
            document.body.style.transform = '';
        }, 200);
        
        if (this.audioEnabled) {
            this.createTone(600, 0.2, 'sine', 0.05);
        }
    }

    increaseParticles() {
        if (this.particleCount < 300) {
            this.particleCount += 25;
            this.generateParticles();
            
            if (this.audioEnabled) {
                this.createTone(800, 0.1, 'sine', 0.04);
            }
        }
    }

    decreaseParticles() {
        if (this.particleCount > 50) {
            this.particleCount -= 25;
            
            // Remove some particles
            const particlesToRemove = this.particles.slice(-25);
            particlesToRemove.forEach(particle => {
                if (particle.element && particle.element.parentNode) {
                    particle.element.remove();
                }
            });
            this.particles = this.particles.slice(0, -25);
            
            if (this.audioEnabled) {
                this.createTone(400, 0.1, 'sine', 0.04);
            }
        }
    }

    changeParticleColors() {
        const colors = [
            '#4a90e2', // Original blue
            '#00d084', // Green
            '#7c53ff', // Purple
            '#ff6900', // Orange
            '#ff4757', // Red
            '#2ed573', // Light green
            '#5352ed'  // Indigo
        ];
        
        const currentColor = this.currentParticleColor || 0;
        const newColor = (currentColor + 1) % colors.length;
        this.currentParticleColor = newColor;
        
        const particles = document.querySelectorAll('.blue-particle');
        particles.forEach(particle => {
            particle.style.background = `radial-gradient(circle, ${colors[newColor]} 0%, ${colors[newColor]}aa 50%, transparent 100%)`;
            particle.style.boxShadow = `0 0 8px ${colors[newColor]}, 0 0 16px ${colors[newColor]}44`;
        });
        
        if (this.audioEnabled) {
            this.createTone(1000, 0.15, 'triangle', 0.06);
        }
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