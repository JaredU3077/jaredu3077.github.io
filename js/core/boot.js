/**
 * @file Boot System Module - Handles system boot sequence, login, audio, and particle effects
 * @author Jared U.
 */

export class BootSystem {
    constructor() {
        // Audio enabled by default, only disabled if explicitly set to false
        this.audioEnabled = localStorage.getItem('neuos-audio') !== 'false';
        // If no setting exists, default to enabled
        if (localStorage.getItem('neuos-audio') === null) {
            this.audioEnabled = true;
            localStorage.setItem('neuos-audio', 'true');
        }
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
        
        // Particle system initialization
        this.particles = [];
        this.particleCount = 80; // Calm particle count for lofi vibes
        this.particleContainer = null;
        this.particleAnimationRunning = true;
        this.particleGenerationRate = 1200; // Default generation rate
        this.particleMode = 'normal';
        this.startTime = Date.now();
        
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
                                console.log('Audio context resumed successfully');
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
        console.log('Setting up particle system...');
        
        // Create particle container
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.id = 'particleContainer';
        this.particleContainer.style.zIndex = '1000'; // Ensure high z-index
        document.body.appendChild(this.particleContainer);
        console.log('Particle container created:', this.particleContainer);

        // Create single subtle spinning background element
        const spinner = document.createElement('div');
        spinner.className = 'background-spinner';
        document.body.appendChild(spinner);

        // Create simplified matrix background
        const matrixBg = document.createElement('div');
        matrixBg.className = 'matrix-background';
        document.body.appendChild(matrixBg);

        // Create calm ambient glows for chillhouse vibes
        this.createAmbientGlows();

        // Initialize mouse tracking
        this.mouseX = 0;
        this.mouseY = 0;
        this.setupMouseTracking();

        // Initialize particle arrays and state
        this.particles = [];
        this.particleCount = 25;
        this.particleGenerationRate = 1200;
        this.particleAnimationRunning = true;
        this.particleMode = 'normal';
        this.startTime = Date.now();

        // Generate initial particles
        this.generateParticles();
        
        // Start particle animation loop
        this.animateParticles();
        
        // Start continuous particle generation from bottom
        this.startContinuousGeneration();
        
        console.log('Particle system setup complete. Container:', this.particleContainer);
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParticleInteraction();
        });

        document.addEventListener('click', (e) => {
            this.createMouseClickEffect(e.clientX, e.clientY);
        });
    }

    generateParticles() {
        if (!this.particleContainer) {
            console.warn('Particle container not available');
            return;
        }

        for (let i = 0; i < this.particleCount; i++) {
            this.createSingleParticle(this.particleContainer);
        }
    }

    createSingleParticle(container) {
        if (!container) {
            console.warn('Container not provided for particle creation');
            return;
        }

        console.log('Creating particle in container:', container);
        const particle = document.createElement('div');
        particle.className = 'blue-particle particle-interactive';
        
        // Random size variation
        const size = Math.random();
        if (size < 0.3) {
            particle.classList.add('small');
        } else if (size > 0.7) {
            particle.classList.add('large');
        }

        // Ensure particles start from very bottom with random horizontal position
        const startX = Math.random() * 100;
        particle.style.left = startX + '%';
        // Add staggered entry to prevent horizontal line formation
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (12 + Math.random() * 8) + 's';
        
        // Add horizontal drift variation with smoother movement
        const drift = (Math.random() - 0.5) * 300;
        particle.style.setProperty('--drift', drift + 'px');

        // Set initial position to guarantee bottom start and visibility
        particle.style.position = 'fixed';
        particle.style.bottom = '-30px';
        particle.style.zIndex = '1001'; // Higher than container
        particle.style.opacity = '1'; // Ensure visibility
        particle.style.display = 'block'; // Ensure display

        // Add click interaction
        particle.addEventListener('click', (e) => {
            this.onParticleClick(e, particle);
        });

        container.appendChild(particle);
        
        // Create particle data object
        const particleData = {
            element: particle,
            originalX: startX,
            originalY: 100,
            velocityX: (Math.random() - 0.5) * 1.5,
            velocityY: -Math.random() * 1.5 - 0.5,
            attracted: false,
            createdAt: Date.now()
        };
        
        // Add to particles array
        this.particles.push(particleData);
        
        // Remove particle after animation completes with buffer
        const animationTime = parseFloat(particle.style.animationDuration) * 1000;
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
            // Remove from particles array
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, animationTime + 2000);
        
        console.log('Particle created and added to DOM:', particle);
        return particleData;
    }

    updateParticleInteraction() {
        if (!this.mouseX || !this.mouseY) return;

        const attractRadius = 120;
        const repelRadius = 60;
        const maxForce = 80;

        this.particles.forEach(particle => {
            if (!particle.element.parentNode) return;
            
            const rect = particle.element.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const dx = this.mouseX - particleX;
            const dy = this.mouseY - particleY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Remove existing mouse interaction classes
            particle.element.classList.remove('mouse-attracted', 'mouse-repelled');
            
            if (distance < repelRadius) {
                // Repulsion effect (very close to mouse)
                const force = (repelRadius - distance) / repelRadius;
                const angle = Math.atan2(dy, dx);
                
                const repelX = -Math.cos(angle) * force * maxForce;
                const repelY = -Math.sin(angle) * force * maxForce;
                
                particle.element.style.transform = `translate(${repelX}px, ${repelY}px)`;
                particle.element.classList.add('mouse-repelled');
                particle.attracted = false;
                
            } else if (distance < attractRadius) {
                // Attraction effect (medium distance)
                const force = (attractRadius - distance) / attractRadius;
                const angle = Math.atan2(dy, dx);
                
                const attractX = Math.cos(angle) * force * (maxForce * 0.3);
                const attractY = Math.cos(angle) * force * (maxForce * 0.3);
                
                particle.element.style.transform = `translate(${attractX}px, ${attractY}px)`;
                particle.element.classList.add('mouse-attracted');
                particle.attracted = true;
                
            } else {
                // Reset to normal state
                particle.element.style.transform = '';
                particle.attracted = false;
            }
        });
    }

    onParticleClick(event, particle) {
        event.stopPropagation();
        
        // Create explosion effect
        const rect = particle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Remove the clicked particle
        particle.remove();
        
        // Create mini particles explosion
        for (let i = 0; i < 8; i++) {
            const miniParticle = document.createElement('div');
            miniParticle.className = 'blue-particle small';
            miniParticle.style.position = 'fixed';
            miniParticle.style.left = centerX + 'px';
            miniParticle.style.top = centerY + 'px';
            miniParticle.style.pointerEvents = 'none';
            miniParticle.style.zIndex = '1000';
            
            const angle = (i / 8) * Math.PI * 2;
            const velocity = 100 + Math.random() * 50;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            document.body.appendChild(miniParticle);
            
            // Animate explosion
            miniParticle.animate([
                { transform: `translate(0px, 0px) scale(1)`, opacity: 1 },
                { transform: `translate(${vx}px, ${vy}px) scale(0)`, opacity: 0 }
            ], {
                duration: 600,
                easing: 'ease-out'
            }).addEventListener('finish', () => {
                miniParticle.remove();
            });
        }
        
        // Play sound effect if audio enabled
        if (this.audioEnabled) {
            this.createTone(800, 0.1, 'sine', 0.05);
        }
    }

    createMouseClickEffect(x, y) {
        // Create ripple effect at mouse click
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '4px';
        ripple.style.height = '4px';
        ripple.style.background = 'radial-gradient(circle, #4a90e2 0%, transparent 70%)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '1000';
        ripple.style.transform = 'translate(-50%, -50%)';
        
        document.body.appendChild(ripple);
        
        // Animate ripple
        ripple.animate([
            { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.8 },
            { transform: 'translate(-50%, -50%) scale(20)', opacity: 0 }
        ], {
            duration: 400,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            ripple.remove();
        });
    }

    createAmbientGlows() {
        // Create calm ambient glow container for chillhouse vibes
        const ambientContainer = document.createElement('div');
        ambientContainer.id = 'ambientContainer';
        ambientContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -2;
        `;
        document.body.appendChild(ambientContainer);

        // Create 3 slow-moving ambient glows
        const glowPositions = [
            { left: '15%', top: '20%', delay: 0 },
            { left: '70%', top: '60%', delay: 8 },
            { left: '40%', top: '80%', delay: 16 }
        ];

        glowPositions.forEach((pos, index) => {
            const ambientGlow = document.createElement('div');
            ambientGlow.className = 'ambient-glow';
            ambientGlow.style.left = pos.left;
            ambientGlow.style.top = pos.top;
            ambientGlow.style.animationDelay = pos.delay + 's';
            ambientContainer.appendChild(ambientGlow);
        });
    }

    toggleParticleAnimation() {
        this.particleAnimationRunning = !this.particleAnimationRunning;
        console.log('Particle animation toggled:', this.particleAnimationRunning ? 'ON' : 'OFF');
        
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

    startContinuousGeneration() {
        if (!this.particleAnimationRunning) return;
        
        console.log('Starting continuous particle generation...');
        
        // Calm particle generation for chillhouse vibes
        let lastGenerationTime = 0;
        const generationDelay = this.particleGenerationRate || 1200; // Use configured rate
        const maxParticles = this.particleCount || 25; // Ensure we have a default
        
        const generateParticle = () => {
            if (!this.particleAnimationRunning) return;
            
            const now = Date.now();
            if (now - lastGenerationTime > generationDelay) {
                // More lenient particle limit - allow more particles for better visibility
                if (this.particleContainer && this.particles.length < maxParticles * 1.2) {
                    console.log('Creating continuous particle, total:', this.particles.length);
                    
                    // Create appropriate particle type based on current mode
                    switch (this.particleMode) {
                        case 'rain':
                            this.createRainParticle();
                            break;
                        case 'storm':
                            this.createStormParticle();
                            break;
                        case 'calm':
                            this.createCalmParticle();
                            break;
                        case 'dance':
                            this.createDanceParticle();
                            break;
                        default:
                            this.createSingleParticle(this.particleContainer);
                    }
                    
                    lastGenerationTime = now;
                }
            }
            
            // Clean up particles more efficiently
            this.cleanupParticles();
            
            // Use requestAnimationFrame for better performance
            requestAnimationFrame(generateParticle);
        };
        
        requestAnimationFrame(generateParticle);
    }

    cleanupParticles() {
        // Throttled cleanup to avoid performance issues
        if (!this.lastCleanupTime || Date.now() - this.lastCleanupTime > 5000) {
            this.particles = this.particles.filter(particle => {
                const element = particle.element;
                
                // Remove if element is no longer in DOM
                if (!element.parentNode) {
                    return false;
                }
                
                // Remove if element is far outside viewport (performance optimization)
                // Increased threshold to allow particles to be visible longer
                const rect = element.getBoundingClientRect();
                if (rect.top < -500 || rect.top > window.innerHeight + 500) {
                    element.remove();
                    return false;
                }
                
                return true;
            });
            
            this.lastCleanupTime = Date.now();
        }
    }

    animateParticles() {
        // Start the mouse interaction loop
        const updateLoop = () => {
            this.updateParticleInteraction();
            requestAnimationFrame(updateLoop);
        };
        requestAnimationFrame(updateLoop);
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

        // Start progress animation and message cycling
        this.startProgressAnimation();
        this.cycleBootMessages();

        // Auto-progress to login after boot completes
        setTimeout(() => {
            this.showLoginScreen();
        }, 5000);
    }

    startProgressAnimation() {
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (!progressFill || !progressPercentage) return;

        let progress = 0;
        const targetProgress = 100;
        const duration = 5000; // 5 seconds
        const interval = 50; // Update every 50ms
        const increment = (targetProgress / (duration / interval));

        const updateProgress = () => {
            progress += increment;
            if (progress > targetProgress) progress = targetProgress;
            
            progressFill.style.width = `${progress}%`;
            progressPercentage.textContent = `${Math.round(progress)}%`;
            
            if (progress < targetProgress) {
                setTimeout(updateProgress, interval);
            }
        };

        updateProgress();
    }

    cycleBootMessages() {
        const messageElement = document.querySelector('.boot-message');
        if (!messageElement) return;

        const showMessage = () => {
            if (this.messageIndex < this.bootMessages.length) {
                const messageText = messageElement.querySelector('.message-text');
                const messageIcon = messageElement.querySelector('.message-icon');
                
                if (messageText) {
                    messageText.textContent = this.bootMessages[this.messageIndex];
                }
                
                // Update icon based on message type
                if (messageIcon) {
                    const icons = ['⚡', '🔒', '🌐', '💾', '🔧', '🖥️', '✅', '🚀'];
                    messageIcon.textContent = icons[this.messageIndex] || '⚡';
                }
                
                messageElement.style.animation = 'none';
                messageElement.offsetHeight; // Trigger reflow
                messageElement.style.animation = 'bootMessageFade 0.8s ease-in-out forwards';
                
                this.messageIndex++;
                
                // Schedule next message
                setTimeout(showMessage, 600);
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
        
        if (desktop) {
            desktop.style.opacity = '0';
            desktop.style.transform = 'scale(0.95)';
            desktop.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        }

        // Add network animation elements
        this.createNetworkAnimations();

        // Ensure particle system is active
        if (this.particleContainer && this.particleAnimationRunning) {
            console.log('Activating particle system for desktop...');
            this.startContinuousGeneration();
        }

        // Trigger entrance animation
        setTimeout(() => {
            if (desktop) {
                desktop.style.opacity = '1';
                desktop.style.transform = 'scale(1)';
            }
        }, 100);

        // Play desktop ready sound
        if (this.audioEnabled) {
            setTimeout(() => this.playDesktopReadySound(), 500);
        }

        // Clean desktop start - welcome app removed for clean startup
        // User can launch welcome app manually if needed
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
    rotateBackground() {
        const spinners = document.querySelectorAll('.background-spinner');
        spinners.forEach((spinner, index) => {
            const currentRotation = parseInt(spinner.dataset.rotation || '0');
            const newRotation = currentRotation + 90;
            spinner.dataset.rotation = newRotation.toString();
            spinner.style.transform = `rotate(${newRotation}deg)`;
        });
        
        // Add enhanced visual effects
        this.createRotationRipple();
        
        // Add a temporary visual effect
        document.body.style.transform = 'rotate(2deg)';
        setTimeout(() => {
            document.body.style.transform = '';
        }, 200);
        
        if (this.audioEnabled) {
            this.createTone(600, 0.2, 'sine', 0.05);
            setTimeout(() => this.createTone(800, 0.1, 'triangle', 0.03), 150);
        }
    }

    createRotationRipple() {
        // Create a rotating ripple effect from the center
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            border: 2px solid rgba(74, 144, 226, 0.8);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 100;
        `;
        
        document.body.appendChild(ripple);
        
        // Animate the ripple
        ripple.animate([
            { 
                transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', 
                opacity: 0.8,
                borderWidth: '2px'
            },
            { 
                transform: 'translate(-50%, -50%) scale(15) rotate(360deg)', 
                opacity: 0,
                borderWidth: '0px'
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).addEventListener('finish', () => {
            ripple.remove();
        });
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
            { name: 'Blue', color: '#4a90e2', gradient: 'radial-gradient(circle, #4a90e2 0%, #4a90e2aa 50%, transparent 100%)' },
            { name: 'Green', color: '#00d084', gradient: 'radial-gradient(circle, #00d084 0%, #00d084aa 50%, transparent 100%)' },
            { name: 'Purple', color: '#7c53ff', gradient: 'radial-gradient(circle, #7c53ff 0%, #7c53ffaa 50%, transparent 100%)' },
            { name: 'Orange', color: '#ff6900', gradient: 'radial-gradient(circle, #ff6900 0%, #ff6900aa 50%, transparent 100%)' },
            { name: 'Red', color: '#ff4757', gradient: 'radial-gradient(circle, #ff4757 0%, #ff4757aa 50%, transparent 100%)' },
            { name: 'Cyan', color: '#2ed573', gradient: 'radial-gradient(circle, #2ed573 0%, #2ed573aa 50%, transparent 100%)' },
            { name: 'Indigo', color: '#5352ed', gradient: 'radial-gradient(circle, #5352ed 0%, #5352edaa 50%, transparent 100%)' }
        ];
        
        const currentColor = this.currentParticleColor || 0;
        const newColor = (currentColor + 1) % colors.length;
        this.currentParticleColor = newColor;
        const currentColorData = colors[newColor];
        
        // Update existing particles with smoother transition
        const particles = document.querySelectorAll('.blue-particle');
        particles.forEach((particle, index) => {
            // Stagger the color change for a wave effect
            setTimeout(() => {
                particle.style.background = currentColorData.gradient;
                particle.style.boxShadow = `0 0 12px ${currentColorData.color}, 0 0 24px ${currentColorData.color}44, 0 0 36px ${currentColorData.color}22`;
                
                // Add a temporary pulse effect
                particle.style.transform = 'scale(1.3)';
                setTimeout(() => {
                    particle.style.transform = '';
                }, 200);
            }, index * 20);
        });
        
        // Create a burst of new particles with the new color at the bottom
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const burstParticle = document.createElement('div');
                burstParticle.className = 'blue-particle particle-interactive';
                burstParticle.style.background = currentColorData.gradient;
                burstParticle.style.boxShadow = `0 0 15px ${currentColorData.color}, 0 0 30px ${currentColorData.color}66`;
                
                // Start from bottom center and spread outward
                const startX = 45 + (Math.random() - 0.5) * 10;
                burstParticle.style.left = startX + '%';
                burstParticle.style.animationDelay = '0s';
                burstParticle.style.animationDuration = (8 + Math.random() * 6) + 's';
                
                const container = document.getElementById('particleContainer');
                if (container) {
                    container.appendChild(burstParticle);
                    
                    // Track particle in array
                    const particleData = {
                        element: burstParticle,
                        type: this.particleMode,
                        createdAt: Date.now()
                    };
                    this.particles.push(particleData);
                    
                    // Remove after animation
                    setTimeout(() => {
                        if (burstParticle.parentNode) {
                            burstParticle.remove();
                        }
                        // Remove from particles array
                        const index = this.particles.indexOf(particleData);
                        if (index > -1) {
                            this.particles.splice(index, 1);
                        }
                    }, parseFloat(burstParticle.style.animationDuration) * 1000);
                }
            }, i * 100);
        }
        
        // Show color change notification
        this.showColorChangeNotification(currentColorData.name, currentColorData.color);
        
        // Play enhanced audio feedback
        if (this.audioEnabled) {
            this.createTone(1000, 0.15, 'triangle', 0.06);
            setTimeout(() => this.createTone(1200, 0.1, 'sine', 0.04), 100);
            setTimeout(() => this.createTone(800, 0.1, 'triangle', 0.03), 200);
        }
    }

    showColorChangeNotification(colorName, colorHex) {
        // Remove existing notification if present
        const existingNotification = document.querySelector('.color-change-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'color-change-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="color-preview" style="background: ${colorHex}; box-shadow: 0 0 15px ${colorHex}44;"></div>
                <span>Particle Color: ${colorName}</span>
            </div>
        `;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #232c3d 60%, #2e3a54 100%);
            color: #eaf1fb;
            padding: 12px 18px;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(16, 22, 36, 0.8), 0 2px 8px rgba(35, 44, 61, 0.6);
            border: 1px solid #26334d;
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
        `;
        
        // Style the content
        const style = document.createElement('style');
        style.textContent = `
            .color-change-notification .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .color-change-notification .color-preview {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
                if (style.parentNode) {
                    style.remove();
                }
            }, 300);
        }, 2500);
    }

    // Particle mode methods for terminal commands
    createParticleBurst(count = 15) {
        console.log(`Creating particle burst of ${count} particles`);
        
        if (!this.particleContainer) {
            console.error('Particle container not available for burst');
            return;
        }
        
        // Create particles with staggered timing for better visual effect
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                if (this.particleContainer) {
                    const particleData = this.createSingleParticle(this.particleContainer);
                    
                    // Make burst particles more visible by adjusting their animation
                    if (particleData && particleData.element) {
                        particleData.element.style.animationDuration = (8 + Math.random() * 4) + 's';
                        particleData.element.style.animationDelay = '0s';
                        particleData.element.style.opacity = '1';
                    }
                }
            }, i * 50); // Faster burst timing
        }
    }

    setParticleMode(mode) {
        console.log(`Setting particle mode to: ${mode}`);
        this.particleMode = mode;
        
        // Clear existing particles when changing modes
        this.clearAllParticles();
        
        switch (mode) {
            case 'rain':
                this.particleGenerationRate = 300;
                this.createRainParticles();
                break;
            case 'calm':
                this.particleGenerationRate = 2000;
                this.createCalmParticles();
                break;
            case 'storm':
                this.particleGenerationRate = 150;
                this.createStormParticles();
                break;
            case 'dance':
                this.particleGenerationRate = 400;
                this.createDanceParticles();
                break;
            default:
                this.particleGenerationRate = 1200;
                this.createNormalParticles();
        }
        
        // Restart generation with new rate
        this.particleAnimationRunning = true;
        this.startContinuousGeneration();
        
        console.log(`Particle mode set to ${mode} with rate ${this.particleGenerationRate}ms`);
    }

    createRainParticles() {
        console.log('Creating rain particles...');
        if (!this.particleContainer) return;
        
        // Create initial rain particles
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createRainParticle();
            }, i * 100);
        }
    }

    createRainParticle() {
        const particle = document.createElement('div');
        particle.className = 'rain-particle';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '-20px';
        particle.style.width = '2px';
        particle.style.height = '20px';
        particle.style.background = 'linear-gradient(to bottom, #4a90e2, #2c5aa0)';
        particle.style.borderRadius = '1px';
        particle.style.zIndex = '1001';
        particle.style.opacity = '0.8';
        particle.style.boxShadow = '0 0 8px #4a90e2';
        particle.style.animation = 'rainFall 2s linear infinite';
        particle.style.animationDelay = Math.random() * 2 + 's';
        
        this.particleContainer.appendChild(particle);
        
        // Track particle in array
        const particleData = {
            element: particle,
            type: 'rain',
            createdAt: Date.now()
        };
        this.particles.push(particleData);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            // Remove from particles array
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 3000);
    }

    createStormParticles() {
        console.log('Creating storm particles...');
        if (!this.particleContainer) return;
        
        // Create initial storm particles
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                this.createStormParticle();
            }, i * 50);
        }
    }

    createStormParticle() {
        const particle = document.createElement('div');
        particle.className = 'storm-particle';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '-30px';
        particle.style.width = '3px';
        particle.style.height = '25px';
        particle.style.background = 'linear-gradient(to bottom, #ff6b35, #cc3300)';
        particle.style.borderRadius = '2px';
        particle.style.zIndex = '1001';
        particle.style.opacity = '1';
        particle.style.boxShadow = '0 0 15px #ff6b35, 0 0 30px rgba(255, 107, 53, 0.5)';
        particle.style.animation = 'stormFall 1.5s linear infinite';
        particle.style.animationDelay = Math.random() * 1.5 + 's';
        
        this.particleContainer.appendChild(particle);
        
        // Track particle in array
        const particleData = {
            element: particle,
            type: 'storm',
            createdAt: Date.now()
        };
        this.particles.push(particleData);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            // Remove from particles array
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 2500);
    }

    createCalmParticles() {
        console.log('Creating calm particles...');
        if (!this.particleContainer) return;
        
        // Create initial calm particles
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createCalmParticle();
            }, i * 400);
        }
    }

    createCalmParticle() {
        const particle = document.createElement('div');
        particle.className = 'calm-particle';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-20px';
        particle.style.width = '8px';
        particle.style.height = '8px';
        particle.style.background = 'radial-gradient(circle, #87ceeb, #4682b4)';
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '1001';
        particle.style.opacity = '0.6';
        particle.style.boxShadow = '0 0 20px #87ceeb, 0 0 40px rgba(135, 206, 235, 0.3)';
        particle.style.animation = 'calmFloat 8s ease-in-out infinite';
        particle.style.animationDelay = Math.random() * 8 + 's';
        
        this.particleContainer.appendChild(particle);
        
        // Track particle in array
        const particleData = {
            element: particle,
            type: 'calm',
            createdAt: Date.now()
        };
        this.particles.push(particleData);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            // Remove from particles array
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 10000);
    }

    createDanceParticles() {
        console.log('Creating dance particles...');
        if (!this.particleContainer) return;
        
        // Create initial dance particles
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                this.createDanceParticle();
            }, i * 200);
        }
    }

    createDanceParticle() {
        const colors = ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const particle = document.createElement('div');
        particle.className = 'dance-particle';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.bottom = '-30px';
        particle.style.width = '12px';
        particle.style.height = '12px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.zIndex = '1001';
        particle.style.opacity = '1';
        particle.style.boxShadow = `0 0 25px ${color}, 0 0 50px ${color}80`;
        particle.style.animation = 'danceFloat 6s ease-in-out infinite';
        particle.style.animationDelay = Math.random() * 6 + 's';
        
        this.particleContainer.appendChild(particle);
        
        // Track particle in array
        const particleData = {
            element: particle,
            type: 'dance',
            createdAt: Date.now()
        };
        this.particles.push(particleData);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
            }
            // Remove from particles array
            const index = this.particles.indexOf(particleData);
            if (index > -1) {
                this.particles.splice(index, 1);
            }
        }, 8000);
    }

    createNormalParticles() {
        console.log('Creating normal particles...');
        if (!this.particleContainer) return;
        
        // Create initial normal particles
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                this.createSingleParticle(this.particleContainer);
            }, i * 300);
        }
    }

    clearAllParticles() {
        if (this.particleContainer) {
            this.particleContainer.innerHTML = '';
        }
        this.particles = [];
    }

    // Force reinitialize particle system
    reinitializeParticleSystem() {
        console.log('Reinitializing particle system...');
        
        // Remove existing container if it exists
        if (this.particleContainer && this.particleContainer.parentNode) {
            this.particleContainer.parentNode.removeChild(this.particleContainer);
        }
        
        // Clear particles array
        this.particles = [];
        
        // Recreate the particle system
        this.setupParticleSystem();
        
        console.log('Particle system reinitialized');
    }

    createVisibleTestParticles() {
        console.log('Creating visible test particles...');
        
        if (!this.particleContainer) {
            console.error('Particle container not available');
            return;
        }
        
        // Create 5 immediately visible particles
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'blue-particle';
            particle.style.position = 'fixed';
            particle.style.left = (20 + i * 15) + '%';
            particle.style.top = (30 + i * 10) + '%';
            particle.style.animation = 'none';
            particle.style.zIndex = '1002';
            particle.style.background = '#00ff00';
            particle.style.boxShadow = '0 0 20px #00ff00';
            particle.style.opacity = '1';
            particle.style.display = 'block';
            
            this.particleContainer.appendChild(particle);
            
            // Remove after 5 seconds
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 5000);
        }
        
        console.log('Visible test particles created');
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