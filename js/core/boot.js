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
        
        // Background music management
        this.backgroundMusic = null;
        this.musicEnabled = localStorage.getItem('neuos-music') !== 'false';
        if (localStorage.getItem('neuos-music') === null) {
            this.musicEnabled = true;
            localStorage.setItem('neuos-music', 'true');
        }
        this.userManuallyDisabled = false; // Track if user manually disabled music
        this.toggleInProgress = false; // Prevent rapid clicking
        
        this.bootMessages = [
            'initializing network stack...',
            'loading kernel modules...',
            'starting network services...',
            'mounting file systems...',
            'configuring network interfaces...',
            'loading user profile...',
            'starting graphical interface...',
            'neuOS ready.'
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
        try {
            console.log('BootSystem: Starting initialization...');
            this.setupAudioSystem();
            this.setupEventListeners();
            this.setupParticleSystem();
            
            // Initialize Mechvibes player if audio is available
            if (this.audioContext) {
                try {
                    console.log('🎹 BootSystem: Initializing Mechvibes player...');
                    const { mechvibesPlayer } = await import('../utils/mechvibes.js');
                    await mechvibesPlayer.init(this.audioContext);
                    this.mechvibesPlayer = mechvibesPlayer;
                    console.log('🎹 BootSystem: Mechvibes player initialized successfully');
                } catch (error) {
                    console.warn('Mechvibes initialization failed:', error);
                }
            } else {
                console.warn('🎹 BootSystem: Audio context not available for Mechvibes');
            }
            
            console.log('BootSystem: Initialization complete, starting boot sequence...');
            await this.startBootSequence();
        } catch (error) {
            console.error('BootSystem: Initialization failed:', error);
            // Fallback: show login screen directly
            this.showLoginScreen();
        }
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
            // Create master gain node for all synthesized sounds
            this.audioNodes.masterGain = this.audioContext.createGain();
            this.audioNodes.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            this.audioNodes.masterGain.connect(this.audioContext.destination);

            // Create filter for different sound types
            this.audioNodes.filter = this.audioContext.createBiquadFilter();
            this.audioNodes.filter.type = 'lowpass';
            this.audioNodes.filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            this.audioNodes.filter.connect(this.audioNodes.masterGain);
            
            console.log('Audio nodes setup complete - ready for typing sounds');
        } catch (error) {
            console.warn('Failed to setup audio nodes:', error);
        }
    }

    setupEventListeners() {
        // Audio toggle button
        const audioToggle = document.getElementById('audioToggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => this.toggleBackgroundMusic());
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
        // REMOVED: Global typing sounds - let individual components handle their own sounds
        // This was causing conflicts with the terminal's specific implementation
        console.log('🎹 BootSystem: Typing sounds setup - global listener removed to prevent conflicts');
    }

    setupParticleSystem() {
        console.log('Setting up enhanced particle system...');
        
        // Create particle container with improved styling
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.id = 'particleContainer';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
            background: transparent !important;
        `;
        document.body.appendChild(this.particleContainer);
        console.log('Enhanced particle container created:', this.particleContainer);

        // Create enhanced background elements
        this.createEnhancedBackgroundElements();

        // Initialize enhanced particle system
        this.particles = [];
        this.particleCount = 25;
        this.particleGenerationRate = 1200;
        this.particleAnimationRunning = true;
        this.particleMode = 'normal';
        this.startTime = Date.now();
        
        // Enhanced particle physics
        this.particlePhysics = {
            gravity: 0.02,
            wind: 0.01,
            turbulence: 0.005,
            attraction: 0.03,
            repulsion: 0.02
        };
        
        // Enhanced color schemes for chillhouse vibes
        this.colorSchemes = {
            chillhouse: ['#4a90e2', '#87ceeb', '#4682b4', '#5f9ea0', '#20b2aa'],
            sunset: ['#ff6b35', '#ff8c42', '#ffa07a', '#ffb347', '#ffd700'],
            neon: ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
            cosmic: ['#8a2be2', '#9370db', '#ba55d3', '#da70d6', '#ee82ee'],
            ocean: ['#00ced1', '#40e0d0', '#48d1cc', '#20b2aa', '#008b8b'],
            forest: ['#228b22', '#32cd32', '#90ee90', '#98fb98', '#00ff7f']
        };
        
        this.currentColorScheme = 'chillhouse';
        this.currentParticleColor = 0;

        // Generate initial particles
        this.generateParticles();
        
        // Start enhanced particle animation loop
        this.animateParticles();
        
        // Start continuous particle generation
        this.startContinuousGeneration();
        
        console.log('Enhanced particle system setup complete');
    }

    createEnhancedBackgroundElements() {
        // Create multiple subtle spinning background elements
        for (let i = 0; i < 3; i++) {
            const spinner = document.createElement('div');
            spinner.className = 'background-spinner';
            spinner.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: ${400 + i * 100}px;
                height: ${400 + i * 100}px;
                margin: ${-(200 + i * 50)}px 0 0 ${-(200 + i * 50)}px;
                border: 1px solid rgba(74, 144, 226, ${0.08 - i * 0.02});
                border-radius: 50%;
                animation: backgroundSpin ${60 + i * 30}s linear infinite;
                pointer-events: none;
                z-index: -${i + 1};
                opacity: ${0.3 - i * 0.1};
            `;
            document.body.appendChild(spinner);
        }

        // Create enhanced matrix background
        const matrixBg = document.createElement('div');
        matrixBg.className = 'matrix-background';
        matrixBg.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(74, 144, 226, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(135, 206, 235, 0.06) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(70, 130, 180, 0.04) 0%, transparent 50%);
            pointer-events: none;
            z-index: -2;
        `;
        document.body.appendChild(matrixBg);

        // Create enhanced ambient glows
        this.createEnhancedAmbientGlows();
    }

    createEnhancedAmbientGlows() {
        // Create multiple ambient glow elements for better depth
        const glowPositions = [
            { x: '20%', y: '30%', size: '300px', opacity: '0.15' },
            { x: '80%', y: '70%', size: '400px', opacity: '0.12' },
            { x: '50%', y: '50%', size: '500px', opacity: '0.08' },
            { x: '10%', y: '80%', size: '250px', opacity: '0.10' },
            { x: '90%', y: '20%', size: '350px', opacity: '0.13' }
        ];

        glowPositions.forEach((pos, index) => {
            const glow = document.createElement('div');
            glow.className = 'ambient-glow';
            glow.style.cssText = `
                position: fixed;
                top: ${pos.y};
                left: ${pos.x};
                width: ${pos.size};
                height: ${pos.size};
                background: radial-gradient(circle, rgba(74, 144, 226, ${pos.opacity}) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                z-index: -3;
                animation: ambientFloat ${8 + index * 2}s ease-in-out infinite;
                animation-delay: ${index * 0.5}s;
            `;
            document.body.appendChild(glow);
        });
    }

    setupMouseTracking() {
        // Enhanced mouse tracking for particle interaction
        this.mouseX = 0;
        this.mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            
            // Update particle interactions based on mouse position
            this.updateParticleInteraction();
        });
        
        // Add touch support for mobile devices
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouseX = e.touches[0].clientX;
                this.mouseY = e.touches[0].clientY;
                this.updateParticleInteraction();
            }
        });
        
        console.log('Enhanced mouse tracking setup complete');
    }

    updateParticleInteraction() {
        if (!this.particles || this.particles.length === 0) return;
        
        this.particles.forEach(particleData => {
            if (!particleData.element) return;
            
            const rect = particleData.element.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(particleX - this.mouseX, 2) + 
                Math.pow(particleY - this.mouseY, 2)
            );
            
            const interactionRadius = 100;
            
            if (distance < interactionRadius) {
                // Apply attraction force
                const force = (interactionRadius - distance) / interactionRadius;
                const angle = Math.atan2(this.mouseY - particleY, this.mouseX - particleX);
                
                particleData.velocityX += Math.cos(angle) * force * 0.02;
                particleData.velocityY += Math.sin(angle) * force * 0.02;
                
                // Add visual feedback
                particleData.element.classList.add('mouse-attracted');
                particleData.element.classList.remove('mouse-repelled');
            } else if (distance < interactionRadius * 1.5) {
                // Apply repulsion force
                const force = (distance - interactionRadius) / (interactionRadius * 0.5);
                const angle = Math.atan2(particleY - this.mouseY, particleX - this.mouseX);
                
                particleData.velocityX += Math.cos(angle) * force * 0.01;
                particleData.velocityY += Math.sin(angle) * force * 0.01;
                
                // Add visual feedback
                particleData.element.classList.add('mouse-repelled');
                particleData.element.classList.remove('mouse-attracted');
            } else {
                // Remove visual feedback
                particleData.element.classList.remove('mouse-attracted', 'mouse-repelled');
            }
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

        console.log('Creating enhanced particle in container:', container);
        
        // Get current color from scheme
        const colors = this.colorSchemes[this.currentColorScheme];
        const color = colors[this.currentParticleColor % colors.length];
        
        const particle = document.createElement('div');
        particle.className = 'enhanced-particle particle-interactive';
        
        // Enhanced size variation with better distribution
        const sizeVariation = Math.random();
        let size, opacity, animationDuration;
        
        if (sizeVariation < 0.2) {
            size = '6px';
            opacity = '0.6';
            animationDuration = '18s';
            particle.classList.add('small');
        } else if (sizeVariation < 0.6) {
            size = '10px';
            opacity = '0.8';
            animationDuration = '15s';
            particle.classList.add('medium');
        } else if (sizeVariation < 0.9) {
            size = '14px';
            opacity = '1';
            animationDuration = '12s';
            particle.classList.add('large');
        } else {
            size = '18px';
            opacity = '1';
            animationDuration = '10s';
            particle.classList.add('xlarge');
        }

        // Enhanced positioning with better distribution
        const startX = Math.random() * 100;
        const startY = 100 + Math.random() * 20; // Start from bottom with variation
        
        // Enhanced physics properties
        const velocityX = (Math.random() - 0.5) * 2;
        const velocityY = -Math.random() * 2 - 0.5;
        const rotationSpeed = (Math.random() - 0.5) * 4;
        const drift = (Math.random() - 0.5) * 400;
        
        // Enhanced styling with better visual effects
        particle.style.cssText = `
            position: fixed;
            left: ${startX}%;
            bottom: -${Math.random() * 50}px;
            width: ${size};
            height: ${size};
            background: radial-gradient(circle, ${color}, ${color}80);
            border-radius: 50%;
            opacity: ${opacity};
            animation: enhancedParticleFloat ${animationDuration} linear infinite;
            animation-delay: ${Math.random() * 8}s;
            box-shadow: 
                0 0 ${parseInt(size) * 2}px ${color},
                0 0 ${parseInt(size) * 4}px ${color}80,
                0 0 ${parseInt(size) * 6}px ${color}40;
            will-change: transform, opacity;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: auto;
            border: 1px solid ${color}60;
            z-index: 1001;
            display: block;
            --drift: ${drift}px;
            --rotation-speed: ${rotationSpeed}deg;
        `;

        // Add enhanced click interaction
        particle.addEventListener('click', (e) => {
            this.onEnhancedParticleClick(e, particle);
        });

        // Add hover effects
        particle.addEventListener('mouseenter', () => {
            particle.style.transform = 'scale(1.5)';
            particle.style.boxShadow = `
                0 0 ${parseInt(size) * 3}px ${color},
                0 0 ${parseInt(size) * 6}px ${color}80,
                0 0 ${parseInt(size) * 9}px ${color}40
            `;
        });

        particle.addEventListener('mouseleave', () => {
            particle.style.transform = '';
            particle.style.boxShadow = `
                0 0 ${parseInt(size) * 2}px ${color},
                0 0 ${parseInt(size) * 4}px ${color}80,
                0 0 ${parseInt(size) * 6}px ${color}40
            `;
        });

        container.appendChild(particle);
        
        // Create enhanced particle data object
        const particleData = {
            element: particle,
            originalX: startX,
            originalY: startY,
            velocityX: velocityX,
            velocityY: velocityY,
            rotationSpeed: rotationSpeed,
            attracted: false,
            repelled: false,
            createdAt: Date.now(),
            color: color,
            size: size,
            physics: {
                gravity: this.particlePhysics.gravity,
                wind: this.particlePhysics.wind,
                turbulence: this.particlePhysics.turbulence
            }
        };
        
        this.particles.push(particleData);
        
        // Cycle to next color
        this.currentParticleColor = (this.currentParticleColor + 1) % colors.length;
        
        return particleData;
    }

    onEnhancedParticleClick(event, particle) {
        event.preventDefault();
        event.stopPropagation();
        
        // Create enhanced click effect
        const rect = particle.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Create ripple effect
        this.createEnhancedRippleEffect(x, y, particle.style.background);
        
        // Create particle burst from click point
        this.createClickParticleBurst(x, y, 8);
        
        // Play enhanced click sound
        this.playParticleClickSound();
        
        // Show enhanced notification
        this.showParticleInteractionNotification('Particle clicked! ✨', particle.style.background);
        
        // Apply physics to nearby particles
        this.applyPhysicsToNearbyParticles(x, y, 100);
        
        console.log('Enhanced particle clicked at:', x, y);
    }

    createEnhancedRippleEffect(x, y, color) {
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 0;
            height: 0;
            border: 2px solid ${color};
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: enhancedRipple 1s ease-out forwards;
            pointer-events: none;
            z-index: 1003;
        `;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.remove();
            }
        }, 1000);
    }

    createClickParticleBurst(x, y, count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const burstParticle = document.createElement('div');
                const angle = (i / count) * Math.PI * 2;
                const distance = 50 + Math.random() * 50;
                const endX = x + Math.cos(angle) * distance;
                const endY = y + Math.sin(angle) * distance;
                
                burstParticle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    width: 8px;
                    height: 8px;
                    background: radial-gradient(circle, #fff, #4a90e2);
                    border-radius: 50%;
                    box-shadow: 0 0 20px #4a90e2;
                    animation: clickBurst 0.8s ease-out forwards;
                    pointer-events: none;
                    z-index: 1002;
                    --end-x: ${endX}px;
                    --end-y: ${endY}px;
                `;
                
                document.body.appendChild(burstParticle);
                
                setTimeout(() => {
                    if (burstParticle.parentNode) {
                        burstParticle.remove();
                    }
                }, 800);
            }, i * 50);
        }
    }

    applyPhysicsToNearbyParticles(centerX, centerY, radius) {
        this.particles.forEach(particleData => {
            if (!particleData.element) return;
            
            const rect = particleData.element.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(particleX - centerX, 2) + 
                Math.pow(particleY - centerY, 2)
            );
            
            if (distance < radius) {
                // Apply repulsion force
                const force = (radius - distance) / radius;
                const angle = Math.atan2(particleY - centerY, particleX - centerX);
                
                particleData.velocityX += Math.cos(angle) * force * 0.5;
                particleData.velocityY += Math.sin(angle) * force * 0.5;
                
                // Add visual feedback
                particleData.element.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    particleData.element.style.transform = '';
                }, 300);
            }
        });
    }

    playParticleClickSound() {
        if (this.audioEnabled) {
            this.createTone(800, 100, 'sine', 0.1);
            setTimeout(() => {
                this.createTone(1000, 100, 'sine', 0.08);
            }, 50);
        }
    }

    showParticleInteractionNotification(message, color) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            border-left: 4px solid ${color};
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            z-index: 1004;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
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

    // Enhanced realistic typing sound effects
    async playTypingSound(key) {
        console.log('🎹 BootSystem: playTypingSound called for key:', key);
        if (!this.audioEnabled || !this.audioContext) {
            console.warn('🎹 BootSystem: Audio not enabled or context not available');
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
            console.log('🎹 BootSystem: Using Mechvibes for key:', key);
            try {
                await this.mechvibesPlayer.playKeySound(key);
                return;
            } catch (error) {
                console.warn('🎹 BootSystem: Mechvibes failed, falling back to synthesized sound:', error);
            }
        }

        console.log('🎹 BootSystem: Using fallback synthesized sound for key:', key);
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

    // Expose sound methods globally for other components
    static getInstance() {
        if (!window.bootSystemInstance) {
            window.bootSystemInstance = new BootSystem();
        }
        return window.bootSystemInstance;
    }

    async startBootSequence() {
        console.log('BootSystem: Starting boot sequence...');
        
        try {
            document.body.classList.add('boot-active');
            
            if (this.audioEnabled) {
                this.playBootSound();
            }

            // Start progress animation and message cycling
            this.startProgressAnimation();
            this.cycleBootMessages();

            // Auto-progress to login after boot completes
            setTimeout(() => {
                console.log('BootSystem: Boot sequence complete, showing login screen...');
                this.showLoginScreen();
            }, 5000);
        } catch (error) {
            console.error('BootSystem: Boot sequence failed:', error);
            // Fallback: show login screen directly
            this.showLoginScreen();
        }
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

        // Start background music when desktop is ready
        setTimeout(() => this.setupBackgroundMusic(), 1000);

        // Clean desktop start - welcome app removed for clean startup
        // User can launch welcome app manually if needed
    }

    createNetworkAnimations() {
        // Network animations disabled - no longer creating drifting blue dots
        // This function is kept for potential future use but doesn't create any elements
        console.log('Network animations disabled - no drifting blue dots');
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

    setupBackgroundMusic() {
        console.log('Setting up background music...');
        this.backgroundMusic = document.getElementById('backgroundMusic');
        if (!this.backgroundMusic) {
            console.warn('Background music element not found');
            return;
        }

        console.log('Background music element found:', this.backgroundMusic);
        console.log('Music enabled state:', this.musicEnabled);

        // Set volume to a comfortable level that won't interfere with typing sounds
        this.backgroundMusic.volume = 0.2; // Reduced volume to prevent conflicts
        console.log('Background music volume set to:', this.backgroundMusic.volume);
        
        // Add error handling for missing audio file
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn('Background music file not found or cannot be loaded:', e);
            // Hide audio controls if music file is not available
            const audioControls = document.getElementById('audioControls');
            if (audioControls) {
                audioControls.style.display = 'none';
            }
        });
        
        // Add load event listener to confirm audio file loaded
        this.backgroundMusic.addEventListener('loadeddata', () => {
            console.log('Background music file loaded successfully');
            console.log('Audio duration:', this.backgroundMusic.duration);
        });
        
        // Add play event listener
        this.backgroundMusic.addEventListener('play', () => {
            console.log('Background music started playing');
            // Ensure audio context is resumed when music plays
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('Audio context resumed due to music playback');
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                });
            }
        });
        
        // Add pause event listener
        this.backgroundMusic.addEventListener('pause', () => {
            console.log('Background music paused');
        });
        
        // Update audio controls to reflect music state
        this.updateAudioControls();
        
        // Start music if enabled
        if (this.musicEnabled) {
            console.log('Music is enabled, starting background music...');
            this.startBackgroundMusic();
        } else {
            console.log('Music is disabled, not starting background music');
        }
        
        console.log('Background music system initialized');
    }

    startBackgroundMusic() {
        console.log('startBackgroundMusic called - music element:', this.backgroundMusic, 'enabled:', this.musicEnabled);
        if (!this.backgroundMusic || !this.musicEnabled) {
            console.log('Background music not available or disabled');
            return;
        }
        
        // Modern browsers require user interaction before playing audio
        const playMusic = () => {
            console.log('Attempting to play background music...');
            this.backgroundMusic.play().then(() => {
                console.log('Background music started successfully');
                // Add visual indicator that music is playing
                this.showMusicIndicator();
            }).catch(error => {
                console.warn('Could not start background music:', error);
                console.log('Audio element state:', {
                    paused: this.backgroundMusic.paused,
                    currentTime: this.backgroundMusic.currentTime,
                    duration: this.backgroundMusic.duration,
                    readyState: this.backgroundMusic.readyState,
                    networkState: this.backgroundMusic.networkState
                });
            });
        };
        
        // Try to play immediately, if it fails, wait for user interaction
        playMusic();
        
        // Only set up auto-restart if music is enabled and we haven't already set it up
        if (this.musicEnabled && !this.autoRestartSetup) {
            const startOnInteraction = () => {
                console.log('User interaction detected, attempting to start music...');
                // Only restart if music is enabled, paused, and user hasn't manually disabled it
                if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled && !this.userManuallyDisabled) {
                    console.log('Auto-restarting music due to user interaction...');
                    playMusic();
                } else {
                    console.log('Auto-restart prevented - music disabled or manually paused');
                }
            };
            
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('keydown', startOnInteraction);
            this.autoRestartSetup = true;
            console.log('Auto-restart listeners set up');
        }
    }

    showMusicIndicator() {
        // Create a subtle visual indicator that music is playing
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.7;
            animation: musicPulse 2s ease-in-out infinite;
            pointer-events: none;
            z-index: 7999;
        `;
        
        // Add the pulse animation if it doesn't exist
        if (!document.querySelector('style[data-music-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-music-animation', 'true');
            style.textContent = `
                @keyframes musicPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
        
        // Remove indicator when music stops
        this.backgroundMusic.addEventListener('pause', () => {
            indicator.remove();
        });
        
        this.backgroundMusic.addEventListener('ended', () => {
            indicator.remove();
        });
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            console.log('Background music stopped');
            
            // Remove music indicator
            const indicator = document.querySelector('div[style*="musicPulse"]');
            if (indicator) {
                indicator.remove();
            }
        }
    }

    toggleBackgroundMusic() {
        // Prevent rapid clicking
        if (this.toggleInProgress) {
            console.log('Toggle already in progress, ignoring click');
            return;
        }
        
        this.toggleInProgress = true;
        
        console.log('Audio toggle clicked - current state:', this.musicEnabled);
        console.log('Audio element state before toggle:', {
            paused: this.backgroundMusic?.paused,
            currentTime: this.backgroundMusic?.currentTime,
            duration: this.backgroundMusic?.duration,
            readyState: this.backgroundMusic?.readyState,
            networkState: this.backgroundMusic?.networkState,
            volume: this.backgroundMusic?.volume
        });
        
        // Simple toggle logic
        if (this.musicEnabled) {
            // Disable music
            console.log('Disabling background music...');
            this.musicEnabled = false;
            this.userManuallyDisabled = true;
            localStorage.setItem('neuos-music', 'false');
            
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                console.log('Background music paused');
                
                // Remove music indicator
                const indicator = document.querySelector('div[style*="musicPulse"]');
                if (indicator) {
                    indicator.remove();
                }
            }
        } else {
            // Enable music
            console.log('Enabling background music...');
            this.musicEnabled = true;
            this.userManuallyDisabled = false;
            localStorage.setItem('neuos-music', 'true');
            
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play().then(() => {
                    console.log('Background music resumed successfully');
                    this.showMusicIndicator();
                }).catch(error => {
                    console.warn('Could not resume background music:', error);
                });
            } else if (this.backgroundMusic) {
                console.log('Music already playing or not available');
            }
        }
        
        this.updateAudioControls();
        console.log('Audio toggle complete - new state:', this.musicEnabled);
        console.log('Audio element state after toggle:', {
            paused: this.backgroundMusic?.paused,
            currentTime: this.backgroundMusic?.currentTime,
            duration: this.backgroundMusic?.duration,
            readyState: this.backgroundMusic?.readyState,
            networkState: this.backgroundMusic?.networkState,
            volume: this.backgroundMusic?.volume
        });
        
        // Allow toggle again after a short delay
        setTimeout(() => {
            this.toggleInProgress = false;
        }, 300);
    }

    updateAudioControls() {
        const audioToggle = document.getElementById('audioToggle');
        if (!audioToggle) return;
        
        const audioOn = audioToggle.querySelector('.audio-on');
        const audioOff = audioToggle.querySelector('.audio-off');
        
        if (this.musicEnabled) {
            audioOn.style.display = 'block';
            audioOff.style.display = 'none';
        } else {
            audioOn.style.display = 'none';
            audioOff.style.display = 'block';
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
            console.warn('Audio synthesis failed:', e);
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
        console.log('Changing particle colors...');
        
        // Cycle to next color scheme
        const schemes = Object.keys(this.colorSchemes);
        const currentIndex = schemes.indexOf(this.currentColorScheme);
        const nextIndex = (currentIndex + 1) % schemes.length;
        this.currentColorScheme = schemes[nextIndex];
        
        const colors = this.colorSchemes[this.currentColorScheme];
        this.currentParticleColor = 0;
        
        // Update existing particles with new colors
        this.particles.forEach((particleData, index) => {
            if (particleData.element) {
                const color = colors[index % colors.length];
                
                // Smooth transition to new color
                particleData.element.style.transition = 'background 0.5s ease, box-shadow 0.5s ease';
                particleData.element.style.background = `radial-gradient(circle, ${color}, ${color}80)`;
                particleData.element.style.boxShadow = `
                    0 0 ${parseInt(particleData.size) * 2}px ${color},
                    0 0 ${parseInt(particleData.size) * 4}px ${color}80,
                    0 0 ${parseInt(particleData.size) * 6}px ${color}40
                `;
                particleData.element.style.border = `1px solid ${color}60`;
                
                // Update particle data
                particleData.color = color;
            }
        });
        
        // Show color change notification
        this.showColorChangeNotification(
            this.currentColorScheme.charAt(0).toUpperCase() + this.currentColorScheme.slice(1),
            colors[0]
        );
        
        console.log(`Particle colors changed to ${this.currentColorScheme} scheme`);
    }

    showColorChangeNotification(colorName, colorHex) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            border-left: 4px solid ${colorHex};
            font-family: 'JetBrains Mono', monospace;
            font-size: 14px;
            z-index: 1004;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            backdrop-filter: blur(15px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            display: flex;
            align-items: center;
            gap: 12px;
        `;
        
        // Create color preview
        const colorPreview = document.createElement('div');
        colorPreview.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: ${colorHex};
            box-shadow: 0 0 10px ${colorHex};
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        
        const text = document.createElement('span');
        text.textContent = `Color scheme: ${colorName}`;
        
        notification.appendChild(colorPreview);
        notification.appendChild(text);
        
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
            }, 300);
        }, 3000);
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