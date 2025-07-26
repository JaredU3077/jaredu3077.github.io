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
        try {
            document.body.classList.add('boot-active');
            
            // Refresh draggable system to ensure boot container is draggable
            if (window.neuOS && window.neuOS.draggableSystem) {
                setTimeout(() => {
                    window.neuOS.draggableSystem.refreshBootAndLogin();
                }, 100);
            }
            
            // Don't play boot sounds automatically - wait for user interaction
            // The audio system will handle this properly when the user interacts

            // Wait for progress animation to complete
            await this.startProgressAnimation();
            
            this.showLoginScreen();
        } catch (error) {
            console.error('BootSequence: Boot sequence failed:', error);
            // Fallback: show login screen directly
            this.showLoginScreen();
        }
    }

    startProgressAnimation() {
        return new Promise((resolve) => {
            // Wait for DOM to be ready with timeout
            let retryCount = 0;
            const maxRetries = 50; // 5 seconds max wait
            
            const waitForElement = () => {
                const progressFill = document.querySelector('.progress-fill');
                
                if (!progressFill) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        console.warn('Progress fill element not found after timeout, skipping animation');
                        resolve();
                        return;
                    }
                    console.warn(`Progress fill element not found, retrying... (${retryCount}/${maxRetries})`);
                    setTimeout(waitForElement, 100);
                    return;
                }
                
                // Continue with animation once element is found
                this.animateProgress(progressFill, resolve);
            };
            
            waitForElement();
        });
    }
    
    animateProgress(progressFill, resolve) {
        // Reset progress bar to 0
        progressFill.style.width = '0%';

        let currentProgress = 0;
        const targetProgress = 100;
        const pauseAt = 85;
        const pauseDuration = 300;
        let isPaused = false;
        let hasPaused = false;
        
        // Simple, direct animation
        const totalDuration = 3000; // 3 seconds
        const activeDuration = totalDuration - pauseDuration; // 2.7 seconds
        const updateInterval = 16; // 60fps
        const totalUpdates = activeDuration / updateInterval;
        const progressPerUpdate = targetProgress / totalUpdates;

        const updateProgress = () => {
            // Handle pause at 85%
            if (currentProgress >= pauseAt && !isPaused && !hasPaused) {
                isPaused = true;
                hasPaused = true;
                
                setTimeout(() => {
                    isPaused = false;
                    updateProgress();
                }, pauseDuration);
                return;
            }
            
            if (!isPaused) {
                currentProgress += progressPerUpdate;
                if (currentProgress > targetProgress) {
                    currentProgress = targetProgress;
                }
            }
            
            // Update the progress bar immediately
            progressFill.style.width = `${currentProgress}%`;
            
            if (currentProgress < targetProgress) {
                setTimeout(updateProgress, updateInterval);
            } else {
                setTimeout(() => {
                    resolve();
                }, 200);
            }
        };

        // Start the animation
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
            bootSequence.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                bootSequence.style.display = 'none';
                document.body.classList.remove('boot-active');
                document.body.classList.add('login-active');
                
                if (loginScreen) {
                    loginScreen.style.display = 'flex';
                    
                    // Refresh draggable system to ensure login container is draggable
                    if (window.neuOS && window.neuOS.draggableSystem) {
                        setTimeout(() => {
                            window.neuOS.draggableSystem.refreshBootAndLogin();
                        }, 100);
                    }
                    
                    // Don't play login sounds automatically - wait for user interaction
                    // The audio system will handle this properly when the user interacts
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
        // Ensure proper desktop visibility
        const desktop = document.getElementById('desktop');
        
        if (desktop) {
            // Remove any inline styles that might interfere with CSS
            desktop.style.removeProperty('opacity');
            desktop.style.removeProperty('visibility');
            desktop.style.removeProperty('transform');
            desktop.style.removeProperty('transition');
            
            // Ensure desktop is visible after login
            setTimeout(() => {
                if (!document.body.classList.contains('boot-active') && !document.body.classList.contains('login-active')) {
                    desktop.style.opacity = '1';
                    desktop.style.visibility = 'visible';
                }
            }, 100);
        }

        // Add network animation elements
        this.createNetworkAnimations();

        // Ensure particle system is active
        if (window.particleSystemInstance && window.particleSystemInstance.particleContainer && 
            window.particleSystemInstance.particleAnimationRunning) {
            window.particleSystemInstance.startContinuousGeneration();
        }

        // Play desktop ready sound
        if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
            setTimeout(() => window.audioSystemInstance.playDesktopReadySound(), 500);
        }

        // Start background music when desktop is ready and user has interacted
        setTimeout(() => {
            if (window.backgroundMusicInstance) {
                window.backgroundMusicInstance.musicEnabled = true;
                localStorage.setItem('neuos-music', 'true');
                window.backgroundMusicInstance.startBackgroundMusic();
            }
        }, 1000);
    }

    createNetworkAnimations() {
        // Network animations disabled - no longer creating drifting blue dots
        // This function is kept for potential future use but doesn't create any elements
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