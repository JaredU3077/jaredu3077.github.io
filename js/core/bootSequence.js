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
    }

    async startBootSequence() {
        console.log('BootSequence: Starting boot sequence...');
        
        try {
            document.body.classList.add('boot-active');
            
            if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
                window.audioSystemInstance.playBootSound();
            }

            // Start progress animation and message cycling
            this.startProgressAnimation();
            this.cycleBootMessages();

            // Auto-progress to login after boot completes
            setTimeout(() => {
                console.log('BootSequence: Boot sequence complete, showing login screen...');
                this.showLoginScreen();
            }, 5000);
        } catch (error) {
            console.error('BootSequence: Boot sequence failed:', error);
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
                    
                    if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
                        window.audioSystemInstance.playLoginSound();
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

        if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
            window.audioSystemInstance.playClickSound();
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
        if (window.particleSystemInstance && window.particleSystemInstance.particleContainer && 
            window.particleSystemInstance.particleAnimationRunning) {
            console.log('Activating particle system for desktop...');
            window.particleSystemInstance.startContinuousGeneration();
        }

        // Trigger entrance animation
        setTimeout(() => {
            if (desktop) {
                desktop.style.opacity = '1';
                desktop.style.transform = 'scale(1)';
            }
        }, 100);

        // Play desktop ready sound
        if (window.audioSystemInstance && window.audioSystemInstance.audioEnabled) {
            setTimeout(() => window.audioSystemInstance.playDesktopReadySound(), 500);
        }

        // Start background music when desktop is ready
        setTimeout(() => {
            if (window.backgroundMusicInstance) {
                window.backgroundMusicInstance.init();
            }
        }, 1000);

        // Clean desktop start - welcome app removed for clean startup
        // User can launch welcome app manually if needed
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