/**
 * @file Background Music Module - Handles background music management
 * @author Jared U.
 * @tags neu-os
 */

export class BackgroundMusic {
    constructor() {
        // Background music management
        this.backgroundMusic = null;
        this.musicEnabled = localStorage.getItem('neuos-music') !== 'false';
        if (localStorage.getItem('neuos-music') === null) {
            this.musicEnabled = true;
            localStorage.setItem('neuos-music', 'true');
        }
        this.userManuallyDisabled = false; // Track if user manually disabled music
        this.toggleInProgress = false; // Prevent rapid clicking
        this.autoRestartSetup = false;
        
        // Volume control
        this.volume = parseFloat(localStorage.getItem('neuos-volume')) || 0.2;
        this.isDragging = false;
        this.volumeSlider = null;
        this.volumeProgress = null;
        this.volumeIndicator = null;
    }

    init() {
        this.setupBackgroundMusic();
        this.setupVolumeSlider();
    }

    setupBackgroundMusic() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        if (!this.backgroundMusic) {
            console.error('Background music element not found - check if audio element exists in HTML');
            return;
        }

        // Background music initialized

        // Set volume from stored value or default
        this.backgroundMusic.volume = this.volume;
        
        // Add error handling for missing audio file
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Background music file not found or cannot be loaded:', e);
            console.error('Audio error details:', {
                error: this.backgroundMusic.error,
                networkState: this.backgroundMusic.networkState,
                readyState: this.backgroundMusic.readyState
            });
            // Hide audio controls if music file is not available
            const audioControls = document.getElementById('audioControls');
            if (audioControls) {
                audioControls.style.display = 'none';
            }
        });
        
        // Add load event listener to confirm audio file loaded
        this.backgroundMusic.addEventListener('loadeddata', () => {
            // Background music file loaded successfully
        });
        
        // Add play event listener
        this.backgroundMusic.addEventListener('play', () => {
            // Ensure audio context is resumed when music plays
            if (window.audioSystemInstance && window.audioSystemInstance.audioContext && 
                window.audioSystemInstance.audioContext.state === 'suspended') {
                window.audioSystemInstance.audioContext.resume().then(() => {
                    // Audio context resumed
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                });
            }
        });
        
        // Add pause event listener
        this.backgroundMusic.addEventListener('pause', () => {
            // Background music paused
        });
        
        // Add canplay event to check if audio can be played
        this.backgroundMusic.addEventListener('canplay', () => {
            // Background music can be played
        });
        

        
        // Update audio controls to reflect music state
        this.updateAudioControls();
        
        // Start music if enabled
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        if (!this.backgroundMusic || !this.musicEnabled) {
            return;
        }
        
        // Modern browsers require user interaction before playing audio
        const playMusic = () => {
            this.backgroundMusic.play().then(() => {
                // Add visual indicator that music is playing
                this.showMusicIndicator();
            }).catch(error => {
                // Silently handle autoplay policy errors - this is expected
                if (error.name === 'NotAllowedError') {
                    // This is normal - music will start on first user interaction
                } else {
                    console.warn('Could not start background music:', error);
                }
            });
        };
        
        // Try to play immediately, if it fails, wait for user interaction
        playMusic();
        
        // Set up auto-restart for music on user interaction
        if (this.musicEnabled && !this.autoRestartSetup) {
            const startOnInteraction = () => {
                // Only restart if music is enabled, paused, and user hasn't manually disabled it
                if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled && !this.userManuallyDisabled) {
                    playMusic();
                }
            };
            
            // Listen for any user interaction to start music
            document.addEventListener('click', startOnInteraction, { once: false });
            document.addEventListener('keydown', startOnInteraction, { once: false });
            document.addEventListener('touchstart', startOnInteraction, { once: false });
            this.autoRestartSetup = true;
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
            // Background music stopped
            
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
            return;
        }
        
        this.toggleInProgress = true;
        
        // Simple toggle logic
        if (this.musicEnabled) {
            // Disable music
            this.musicEnabled = false;
            this.userManuallyDisabled = true;
            localStorage.setItem('neuos-music', 'false');
            
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                
                // Remove music indicator
                const indicator = document.querySelector('div[style*="musicPulse"]');
                if (indicator) {
                    indicator.remove();
                }
            }
        } else {
            // Enable music
            this.musicEnabled = true;
            this.userManuallyDisabled = false;
            localStorage.setItem('neuos-music', 'true');
            
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play().then(() => {
                    this.showMusicIndicator();
                }).catch(error => {
                    console.warn('Could not resume background music:', error);
                });
            }
        }
        
        this.updateAudioControls();
        
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

    // Add play and pause methods for terminal access
    play() {
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                this.showMusicIndicator();
            }).catch(error => {
                console.warn('Could not start background music via terminal:', error);
            });
        } else {
            console.warn('Background music not available or disabled');
        }
    }

    pause() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            
            // Remove music indicator
            const indicator = document.querySelector('div[style*="musicPulse"]');
            if (indicator) {
                indicator.remove();
            }
        } else {
            console.warn('Background music not available');
        }
    }

    // Volume slider functionality
    setupVolumeSlider() {
        this.volumeSlider = document.querySelector('.volume-slider');
        this.volumeProgress = document.querySelector('.volume-progress');
        this.volumeIndicator = document.querySelector('.volume-indicator');
        
        if (!this.volumeSlider || !this.volumeProgress || !this.volumeIndicator) {
            console.warn('Volume slider elements not found');
            return;
        }
        
        // Initialize volume display
        this.updateVolumeDisplay();
        
        // Add event listeners for drag functionality
        this.volumeSlider.addEventListener('mousedown', (e) => this.startVolumeDrag(e));
        this.volumeSlider.addEventListener('touchstart', (e) => this.startVolumeDrag(e));
        
        // Prevent context menu on right click
        this.volumeSlider.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    startVolumeDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        
        // Add visual feedback for dragging
        if (this.volumeSlider) {
            this.volumeSlider.style.cursor = 'grabbing';
        }
        
        // Add global event listeners
        document.addEventListener('mousemove', this.handleVolumeDrag.bind(this));
        document.addEventListener('mouseup', this.stopVolumeDrag.bind(this));
        document.addEventListener('touchmove', this.handleVolumeDrag.bind(this));
        document.addEventListener('touchend', this.stopVolumeDrag.bind(this));
        
        // Handle initial click/touch
        this.handleVolumeDrag(e);
    }
    
    handleVolumeDrag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        const rect = this.volumeSlider.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Get mouse/touch position
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
        
        // Calculate distance from center to determine if we're within the dial area
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Only respond if we're within a reasonable distance from the center (dial area)
        const minRadius = 20; // Minimum distance from center
        const maxRadius = 50; // Maximum distance from center
        
        if (distance < minRadius || distance > maxRadius) {
            return;
        }
        
        // Calculate angle from center
        let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Convert to 0-360 range starting from top (12 o'clock position)
        angle = (angle + 90 + 360) % 360;
        
        // Convert angle to volume (0-1) with improved precision
        let volume = angle / 360;
        
        // Add some resistance at the edges for better control
        if (volume < 0.05) volume = 0;
        if (volume > 0.95) volume = 1;
        
        // Apply smooth interpolation for better feel
        volume = Math.max(0, Math.min(1, volume));
        
        this.setVolume(volume);
    }
    
    stopVolumeDrag() {
        this.isDragging = false;
        
        // Reset cursor
        if (this.volumeSlider) {
            this.volumeSlider.style.cursor = 'pointer';
        }
        
        // Remove global event listeners
        document.removeEventListener('mousemove', this.handleVolumeDrag.bind(this));
        document.removeEventListener('mouseup', this.stopVolumeDrag.bind(this));
        document.removeEventListener('touchmove', this.handleVolumeDrag.bind(this));
        document.removeEventListener('touchend', this.stopVolumeDrag.bind(this));
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update audio element
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
        
        // Save to localStorage
        localStorage.setItem('neuos-volume', this.volume.toString());
        
        // Update visual display
        this.updateVolumeDisplay();
    }
    
    updateVolumeDisplay() {
        if (!this.volumeProgress || !this.volumeIndicator) return;
        
        // Calculate circumference (2 * π * radius)
        const circumference = 2 * Math.PI * 35;
        
        // Calculate stroke-dasharray values with smooth interpolation
        const progressLength = this.volume * circumference;
        const remainingLength = circumference - progressLength;
        
        // Update progress circle with smooth transition
        this.volumeProgress.style.strokeDasharray = `${progressLength.toFixed(2)} ${remainingLength.toFixed(2)}`;
        
        // Update indicator position with improved precision
        const angle = this.volume * 360 - 90; // Start from top (-90 degrees)
        const radius = 35;
        const x = 50 + radius * Math.cos(angle * Math.PI / 180);
        const y = 50 + radius * Math.sin(angle * Math.PI / 180);
        
        this.volumeIndicator.setAttribute('cx', x.toFixed(2));
        this.volumeIndicator.setAttribute('cy', y.toFixed(2));
        
        // Add subtle visual feedback during dragging
        if (this.isDragging) {
            this.volumeProgress.style.filter = 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.8))';
            this.volumeIndicator.style.filter = 'drop-shadow(0 0 8px rgba(99, 102, 241, 1))';
        } else {
            this.volumeProgress.style.filter = 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))';
            this.volumeIndicator.style.filter = 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.8))';
        }
    }
    
    // Expose methods globally for other components
    static getInstance() {
        if (!window.backgroundMusicInstance) {
            window.backgroundMusicInstance = new BackgroundMusic();
        }
        return window.backgroundMusicInstance;
    }
    

} 