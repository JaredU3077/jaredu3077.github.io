/**
 * @file Background Music Module - Performance Optimized
 * Handles background music management with improved performance
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
        
        // Performance optimization properties
        this.boundHandleVolumeDrag = null;
        this.boundStopVolumeDrag = null;
        this.boundToggleBackgroundMusic = null;
        this.sliderCenterX = null;
        this.sliderCenterY = null;
        this.sliderRadius = null;
        this.lastDraggingState = false;
        this.animationFrameId = null;
        
        // Performance optimizations
        this.lastVolumeUpdate = 0;
        this.volumeUpdateThrottle = 16; // ~60fps
        this.lastDisplayUpdate = 0;
        this.displayUpdateThrottle = 50; // 20fps for display updates
        this.cachedCircumference = 314.159; // Pre-calculated 2 * Math.PI * 50
        this.lastVolume = null; // Cache for comparison
    }

    init() {
        this.setupBackgroundMusic();
        // Don't setup volume slider here - it will be done after login when audio controls are added
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
                // Music started successfully
                console.log('Background music started successfully');
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



    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            // Background music stopped
        }
    }

    toggleBackgroundMusic() {
        console.log('toggleBackgroundMusic called', { 
            musicEnabled: this.musicEnabled, 
            toggleInProgress: this.toggleInProgress 
        });
        
        // Prevent rapid clicking
        if (this.toggleInProgress) {
            console.log('Toggle in progress, ignoring click');
            return;
        }
        
        this.toggleInProgress = true;
        
        // Add animation class for visual feedback
        if (this.audioToggle) {
            this.audioToggle.classList.add('audio-state-changing');
            // Remove animation class after animation completes
            setTimeout(() => {
                this.audioToggle.classList.remove('audio-state-changing');
            }, 300);
        }
        
        // Simple toggle logic
        if (this.musicEnabled) {
            // Disable music
            console.log('Disabling music');
            this.musicEnabled = false;
            this.userManuallyDisabled = true;
            localStorage.setItem('neuos-music', 'false');
            
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
            }
        } else {
            // Enable music
            console.log('Enabling music');
            this.musicEnabled = true;
            this.userManuallyDisabled = false;
            localStorage.setItem('neuos-music', 'true');
            
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play().then(() => {
                    console.log('Music resumed successfully');
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
        if (!audioToggle) {
            console.warn('Audio toggle element not found in updateAudioControls');
            return;
        }
        
        const audioOn = audioToggle.querySelector('.audio-on');
        const audioOff = audioToggle.querySelector('.audio-off');
        
        console.log('updateAudioControls', { 
            musicEnabled: this.musicEnabled,
            audioOn: !!audioOn,
            audioOff: !!audioOff
        });
        
        if (this.musicEnabled) {
            audioOn.style.display = 'block';
            audioOff.style.display = 'none';
        } else {
            audioOn.style.display = 'none';
            audioOff.style.display = 'block';
        }
        
        // Ensure audio controls are visible
        const audioControls = document.getElementById('audioControls');
        if (audioControls) {
            audioControls.classList.add('show');
            audioControls.style.setProperty('opacity', '1', 'important');
            audioControls.style.setProperty('visibility', 'visible', 'important');
        }
    }

    // Add play and pause methods for terminal access
    play() {
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                // Music started successfully
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
        } else {
            console.warn('Background music not available');
        }
    }

    // Volume slider functionality (optimized)
    setupVolumeSlider() {
        this.volumeSlider = document.querySelector('.volume-slider');
        this.volumeProgress = document.querySelector('.volume-progress');
        this.volumeIndicator = document.querySelector('.volume-indicator');
        this.audioToggle = document.getElementById('audioToggle');
        
        console.log('setupVolumeSlider - Elements found:', {
            volumeSlider: !!this.volumeSlider,
            volumeProgress: !!this.volumeProgress,
            volumeIndicator: !!this.volumeIndicator,
            audioToggle: !!this.audioToggle
        });
        
        if (!this.volumeSlider || !this.volumeProgress || !this.volumeIndicator) {
            console.warn('Volume slider elements not found - audio controls may not be loaded yet');
            return;
        }
        
        // Initialize volume display
        this.updateVolumeDisplay();
        
        // Cache bound event handlers to prevent memory leaks
        this.boundHandleVolumeDrag = this.handleVolumeDrag.bind(this);
        this.boundStopVolumeDrag = this.stopVolumeDrag.bind(this);
        this.boundToggleBackgroundMusic = this.toggleBackgroundMusic.bind(this);
        
        // Add event listeners for drag functionality using pointerdown for consistency
        this.volumeSlider.addEventListener('pointerdown', (e) => {
            console.log('Volume slider pointerdown event triggered');
            this.startVolumeDrag(e);
        });
        
        // Set up audio toggle button functionality
        if (this.audioToggle) {
            // Remove any existing listeners to prevent duplicates
            this.audioToggle.removeEventListener('click', this.boundToggleBackgroundMusic);
            // Add the click listener for toggling music
            this.audioToggle.addEventListener('click', () => {
                console.log('Audio toggle clicked');
                this.toggleBackgroundMusic();
            });
            // Prevent dragging on the audio toggle button
            this.audioToggle.addEventListener('pointerdown', (e) => e.stopPropagation());
        }
        
        // Prevent context menu on right click
        this.volumeSlider.addEventListener('contextmenu', (e) => e.preventDefault());
        
        console.log('Volume slider setup complete - event listeners added');
    }
    
    startVolumeDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        
        // Add dragging class for CSS optimizations
        if (this.volumeSlider) {
            this.volumeSlider.classList.add('dragging');
        }
        
        // Cache slider rect to avoid repeated getBoundingClientRect calls
        const rect = this.volumeSlider.getBoundingClientRect();
        this.sliderCenterX = rect.left + rect.width / 2;
        this.sliderCenterY = rect.top + rect.height / 2;
        this.sliderRadius = 50; // Cache radius
        
        // Add visual feedback for dragging
        if (this.volumeSlider) {
            this.volumeSlider.style.cursor = 'grabbing';
        }
        
        // Add global event listeners with cached bound functions using pointer events
        document.addEventListener('pointermove', this.boundHandleVolumeDrag, { passive: false });
        document.addEventListener('pointerup', this.boundStopVolumeDrag, { passive: false });
        
        // Handle initial click/touch
        this.handleVolumeDrag(e);
    }
    
    handleVolumeDrag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        
        // Throttle volume updates for better performance
        const now = Date.now();
        if (now - this.lastVolumeUpdate < this.volumeUpdateThrottle) {
            return;
        }
        this.lastVolumeUpdate = now;
        
        // Use requestAnimationFrame for smoother updates
        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(() => {
                this.processVolumeDrag(e);
                this.animationFrameId = null;
            });
        }
    }
    
    processVolumeDrag(e) {
        // Get pointer position (works for both mouse and touch)
        const clientX = e.clientX;
        const clientY = e.clientY;
        
        // Use cached center coordinates
        const deltaX = clientX - this.sliderCenterX;
        const deltaY = clientY - this.sliderCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Exclude the center area where the mute button is (39px radius for 78px button)
        const muteButtonRadius = 39; // Half of 78px button size
        const minRadius = 40; // Start volume control closer to center for better reach
        const maxRadius = 90; // Allow further from center for better reach
        
        // Don't process volume changes if clicking in the mute button area
        if (distance < muteButtonRadius) {
            return;
        }
        
        // Only respond if we're within the volume control area
        if (distance < minRadius || distance > maxRadius) {
            return;
        }
        
        // Calculate angle from center with improved precision
        let angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
        
        // Convert to 0-360 range starting from top (12 o'clock position)
        angle = (angle + 90 + 360) % 360;
        
        // Direct volume calculation for immediate response (no interpolation)
        const volume = angle / 360;
        
        // Clamp to valid range and update immediately for responsive feel
        const clampedVolume = Math.max(0, Math.min(1, volume));
        
        // Update volume immediately for responsive feel
        this.setVolume(clampedVolume);
    }
    
    stopVolumeDrag() {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Cancel any pending animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        // Remove dragging class for CSS optimizations
        if (this.volumeSlider) {
            this.volumeSlider.classList.remove('dragging');
        }
        
        // Reset cursor
        if (this.volumeSlider) {
            this.volumeSlider.style.cursor = 'pointer';
        }
        
        // Remove global event listeners with cached bound functions
        document.removeEventListener('pointermove', this.boundHandleVolumeDrag);
        document.removeEventListener('pointerup', this.boundStopVolumeDrag);
        
        // Clear cached values
        this.sliderCenterX = null;
        this.sliderCenterY = null;
        this.sliderRadius = null;
    }
    
    setVolume(volume) {
        // Only update if volume actually changed
        if (this.lastVolume === volume) {
            return;
        }
        this.lastVolume = volume;
        
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update audio element
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.volume;
        }
        
        // Save to localStorage (throttled)
        const now = Date.now();
        if (now - this.lastVolumeUpdate > 100) { // Save every 100ms max
            localStorage.setItem('neuos-volume', this.volume.toString());
        }
        
        // Update visual display (throttled)
        if (now - this.lastDisplayUpdate > this.displayUpdateThrottle) {
            this.updateVolumeDisplay();
            this.lastDisplayUpdate = now;
        }
    }
    
    updateVolumeDisplay() {
        if (!this.volumeProgress || !this.volumeIndicator) return;
        
        // Use cached circumference for better performance
        const progressLength = this.volume * this.cachedCircumference;
        const remainingLength = this.cachedCircumference - progressLength;
        
        // Update progress circle with faster transition for better responsiveness
        const strokeDasharray = `${progressLength.toFixed(1)} ${remainingLength.toFixed(1)}`;
        if (this.volumeProgress.style.strokeDasharray !== strokeDasharray) {
            this.volumeProgress.style.strokeDasharray = strokeDasharray;
        }
        
        // Update indicator position with improved precision
        const angle = this.volume * 360 - 90; // Start from top (-90 degrees)
        const radius = 50;
        const x = 60 + radius * Math.cos(angle * Math.PI / 180);
        const y = 60 + radius * Math.sin(angle * Math.PI / 180);
        
        const cx = x.toFixed(1);
        const cy = y.toFixed(1);
        
        // Only update if position actually changed
        if (this.volumeIndicator.getAttribute('cx') !== cx) {
            this.volumeIndicator.setAttribute('cx', cx);
        }
        if (this.volumeIndicator.getAttribute('cy') !== cy) {
            this.volumeIndicator.setAttribute('cy', cy);
        }
        
        // Only update filters if dragging state changed
        const isDragging = this.isDragging;
        if (this.lastDraggingState !== isDragging) {
            this.lastDraggingState = isDragging;
            
            if (isDragging) {
                // Enhanced visual feedback during dragging
                this.volumeProgress.style.filter = 'drop-shadow(0 0 8px var(--primary-color)) brightness(1.2)';
                this.volumeIndicator.style.filter = 'drop-shadow(0 0 6px var(--primary-color)) brightness(1.3)';
            } else {
                // Normal state with subtle glow
                this.volumeProgress.style.filter = 'drop-shadow(0 0 12px var(--primary-color))';
                this.volumeIndicator.style.filter = 'drop-shadow(0 0 8px var(--primary-color))';
            }
        }
    }
    
    // Method to setup volume slider after audio controls are added to DOM
    setupVolumeSliderAfterLogin() {
        console.log('setupVolumeSliderAfterLogin called');
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            console.log('Attempting to setup volume slider...');
            this.setupVolumeSlider();
            
            // If elements still not found, retry once more
            if (!this.volumeSlider || !this.volumeProgress || !this.volumeIndicator) {
                console.log('Elements not found, retrying...');
                setTimeout(() => {
                    this.setupVolumeSlider();
                }, 200);
            } else {
                console.log('Volume slider setup successful');
            }
        }, 100);
    }

    // Expose methods globally for other components
    static getInstance() {
        if (!window.backgroundMusicInstance) {
            window.backgroundMusicInstance = new BackgroundMusic();
        }
        return window.backgroundMusicInstance;
    }
    

} 