/**
 * @file Boot Sequence Module - Handles system boot sequence and login
 * @author Jared U.
 * @tags neu-os
 */

export class BootSequence {
    constructor() {
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
        this.hasPaused = false; // Track if we've already paused once
    }

    async startBootSequence() {
        console.log('BootSequence: Starting boot sequence...');
        
        try {
            document.body.classList.add('boot-active');
            
            if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
                window.audioSystemInstance.playBootSound();
            }

            // Start message cycling
            this.cycleBootMessages();

            // Wait for progress animation to complete
            await this.startProgressAnimation();
            
            console.log('BootSequence: Boot sequence complete, showing login screen...');
            this.showLoginScreen();
        } catch (error) {
            console.error('BootSequence: Boot sequence failed:', error);
            // Fallback: show login screen directly
            this.showLoginScreen();
        }
    }

    startProgressAnimation() {
        return new Promise((resolve) => {
            console.log('Starting progress animation...');
            
            const progressFill = document.querySelector('.progress-fill');
            const progressPercentage = document.querySelector('.progress-percentage');
            
            if (!progressFill) {
                console.error('Progress fill element not found');
                resolve();
                return;
            }
            
            if (!progressPercentage) {
                console.warn('Progress percentage element not found, continuing without percentage display');
            }

            // Reset progress bar to 0
            progressFill.style.width = '0%';
            if (progressPercentage) {
                progressPercentage.textContent = '0%';
            }

            let progress = 0;
            const targetProgress = 100;
            const duration = 2000; // 2 seconds total (much faster)
            const interval = 25; // Update every 25ms for smoother animation
            const pauseAt = 85; // Pause at 85%
            const pauseDuration = 300; // Pause for 300ms
            let isPaused = false;
            let pauseStartTime = 0;
            
            // Calculate smooth increment
            const totalSteps = duration / interval;
            const increment = targetProgress / totalSteps;

            console.log('Progress animation parameters:', {
                duration,
                interval,
                totalSteps,
                increment,
                pauseAt,
                pauseDuration
            });

            const updateProgress = () => {
                // Handle pause at 85% - only pause once
                if (progress >= pauseAt && !isPaused && !this.hasPaused) {
                    console.log('Pausing at 85%');
                    isPaused = true;
                    this.hasPaused = true; // Mark that we've paused once
                    pauseStartTime = Date.now();
                    setTimeout(updateProgress, pauseDuration);
                    return;
                }
                
                // Resume after pause
                if (isPaused && (Date.now() - pauseStartTime) >= pauseDuration) {
                    console.log('Resuming after pause');
                    isPaused = false;
                }
                
                if (!isPaused) {
                    progress += increment;
                    if (progress > targetProgress) progress = targetProgress;
                }
                
                // Update the progress bar
                progressFill.style.width = `${progress}%`;
                if (progressPercentage) {
                    progressPercentage.textContent = `${Math.round(progress)}%`;
                }
                
                console.log('Progress:', Math.round(progress) + '%');
                
                if (progress < targetProgress) {
                    setTimeout(updateProgress, interval);
                } else {
                    console.log('Progress animation complete');
                    resolve(); // Resolve the promise when animation is complete
                }
            };

            // Start the animation
            updateProgress();
        });
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
            bootSequence.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                bootSequence.style.display = 'none';
                document.body.classList.remove('boot-active');
                document.body.classList.add('login-active');
                
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    
                    if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
                        window.audioSystemInstance.playLoginSound();
                    }
                }
            }, 300);
        }
    }

    async handleLogin() {
        const loginScreen = document.getElementById('loginScreen');
        const guestLoginBtn = document.getElementById('guestLoginBtn');
        
        if (guestLoginBtn) {
            guestLoginBtn.textContent = 'Logging in...';
            guestLoginBtn.disabled = true;
        }

        if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
            window.audioSystemInstance.playClickSound();
        }

        // Simulate login process
        await this.delay(1500);

        if (loginScreen) {
            loginScreen.style.animation = 'fadeOut 0.6s ease-out forwards';
            setTimeout(() => {
                loginScreen.style.display = 'none';
                document.body.classList.remove('login-active');
                
                // Small delay to ensure CSS transitions apply properly
                setTimeout(() => {
                    // Initialize main application
                    this.initializeDesktop();
                }, 100);
            }, 600);
        }
    }

    initializeDesktop() {
        // Let CSS handle the desktop visibility
        const desktop = document.getElementById('desktop');
        
        if (desktop) {
            // Remove any inline styles that might interfere with CSS
            desktop.style.removeProperty('opacity');
            desktop.style.removeProperty('visibility');
            desktop.style.removeProperty('transform');
            desktop.style.removeProperty('transition');
        }

        // Add network animation elements
        this.createNetworkAnimations();

        // Ensure particle system is active
        if (window.particleSystemInstance && window.particleSystemInstance.particleContainer && 
            window.particleSystemInstance.particleAnimationRunning) {
            console.log('neuOS: Activating particle system for desktop...');
            window.particleSystemInstance.startContinuousGeneration();
        }

        // Play desktop ready sound
        if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
            setTimeout(() => window.audioSystemInstance.playDesktopReadySound(), 500);
        }

        // Start background music when desktop is ready and user has interacted
        setTimeout(() => {
            if (window.backgroundMusicInstance) {
                // Try to start music, but don't worry if it fails due to autoplay policy
                window.backgroundMusicInstance.startBackgroundMusic();
            }
        }, 1000);

        console.log('neuOS: Desktop initialization complete');
        console.log('neuOS: Desktop element found:', !!desktop);
        console.log('neuOS: Desktop icons container found:', !!document.getElementById('desktop-icons'));
        console.log('neuOS: Desktop icons count:', document.getElementById('desktop-icons')?.children?.length || 0);
    }

    createNetworkAnimations() {
        // Network animations disabled - no longer creating drifting blue dots
        // This function is kept for potential future use but doesn't create any elements
        console.log('Network animations disabled - no drifting blue dots');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Expose methods globally for other components
    static getInstance() {
        if (!window.bootSequenceInstance) {
            window.bootSequenceInstance = new BootSequence();
        }
        return window.bootSequenceInstance;
    }
} 