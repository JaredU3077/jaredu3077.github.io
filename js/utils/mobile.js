/**
 * neuOS Mobile Utilities
 * Handles mobile-specific functionality and optimizations
 */

class MobileUtils {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTouch = this.detectTouch();
        this.performanceMode = this.isMobile ? 'mobile' : 'desktop';
        this.setupMobileOptimizations();
        this.applyMobileCSS(); // Add this line
    }

    /**
     * Detect if device is mobile
     */
    detectMobile() {
        // More conservative mobile detection
        const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isSmallScreen = window.innerWidth <= 768;
        
        // Only consider it mobile if both conditions are met
        return isMobileUserAgent && isSmallScreen;
    }

    /**
     * Detect if device supports touch
     */
    detectTouch() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    /**
     * Apply mobile CSS classes to body
     */
    applyMobileCSS() {
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
            document.body.classList.add('touch-device');
        } else {
            // Remove mobile classes if not mobile
            document.body.classList.remove('mobile-device');
            document.body.classList.remove('touch-device');
        }
    }

    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        if (this.isMobile) {
            this.optimizeForMobile();
            this.setupMobileEventHandlers();
            this.setupPerformanceMonitoring();
        }
    }

    /**
     * Optimize performance for mobile devices
     */
    optimizeForMobile() {
        // Disable particle system on mobile for maximum performance
        if (window.particleSystem) {
            window.particleSystem.particleAnimationRunning = false;
            window.particleSystem.maxParticles = 0;
            window.particleSystem.particleLimit = 0;
        }

        // Optimize animations on mobile (but keep glass effects)
        if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--animation-duration', '0.1s');
            document.documentElement.style.setProperty('--transition-duration', '0.1s');
            
            // Note: Glass effects are kept enabled for visual appeal
            // They can be manually disabled via terminal command if needed
        }

        // Optimize memory usage
        this.setupMemoryOptimization();
    }

    /**
     * Setup mobile event handlers
     */
    setupMobileEventHandlers() {
        // Handle mobile orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Handle mobile resize
        window.addEventListener('resize', () => {
            this.handleMobileResize();
        });

        // Handle mobile touch events
        this.setupTouchHandlers();
    }

    /**
     * Setup touch event handlers
     */
    setupTouchHandlers() {
        // Prevent zoom on double tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle touch feedback
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
    }

    /**
     * Handle touch start events
     */
    handleTouchStart(e) {
        const target = e.target;
        if (target.classList.contains('desktop-icon') || 
            target.classList.contains('window-control') ||
            target.classList.contains('login-btn')) {
            target.style.transform = 'scale(0.95)';
        }
    }

    /**
     * Handle touch end events
     */
    handleTouchEnd(e) {
        const target = e.target;
        if (target.classList.contains('desktop-icon') || 
            target.classList.contains('window-control') ||
            target.classList.contains('login-btn')) {
            setTimeout(() => {
                target.style.transform = '';
            }, 100);
        }
    }

    /**
     * Handle orientation changes
     */
    handleOrientationChange() {
        // Recalculate window positions
        if (window.windowManager) {
            window.windowManager.repositionWindows();
        }

        // Recalculate desktop icon positions
        this.repositionDesktopIcons();

        // Update viewport
        this.updateViewport();
    }

    /**
     * Handle mobile resize
     */
    handleMobileResize() {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        
        // Update mobile classes if detection changed
        if (wasMobile !== this.isMobile) {
            this.applyMobileCSS();
        }
        
        if (this.isMobile) {
            this.optimizeForMobile();
        }

        // Reposition windows
        if (window.windowManager) {
            window.windowManager.repositionWindows();
        }

        // Reposition desktop icons
        this.repositionDesktopIcons();
    }

    /**
     * Reposition desktop icons for mobile
     */
    repositionDesktopIcons() {
        const desktopIcons = document.getElementById('desktop-icons');
        if (!desktopIcons) return;

        if (this.isMobile) {
            desktopIcons.style.top = '16px';
            desktopIcons.style.left = '16px';
            desktopIcons.style.gap = '16px';
            desktopIcons.style.padding = '16px';
        }
    }

    /**
     * Update viewport for mobile
     */
    updateViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, user-scalable=no');
        }
    }

    /**
     * Setup memory optimization
     */
    setupMemoryOptimization() {
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.checkMemoryUsage();
            }, 30000); // Check every 30 seconds
        }

        // Cleanup unused resources
        setInterval(() => {
            this.cleanupResources();
        }, 60000); // Cleanup every minute
    }

    /**
     * Check memory usage and optimize if needed
     */
    checkMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            const usedMemory = memory.usedJSHeapSize;
            const totalMemory = memory.totalJSHeapSize;
            const memoryUsage = (usedMemory / totalMemory) * 100;

            if (memoryUsage > 80) {
                this.cleanupResources();
            }
        }
    }

    /**
     * Cleanup unused resources
     */
    cleanupResources() {
        // Clear unused event listeners
        this.cleanupEventListeners();

        // Clear unused DOM elements
        this.cleanupDOM();

        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Cleanup unused event listeners
     */
    cleanupEventListeners() {
        // This would be implemented based on your event listener management
        // For now, we'll just log that cleanup is happening
    }

    /**
     * Cleanup unused DOM elements
     */
    cleanupDOM() {
        // Remove hidden windows that are no longer needed
        const hiddenWindows = document.querySelectorAll('.window[style*="display: none"]');
        hiddenWindows.forEach(window => {
            if (window.dataset.lastUsed) {
                const lastUsed = parseInt(window.dataset.lastUsed);
                const now = Date.now();
                if (now - lastUsed > 300000) { // 5 minutes
                    window.remove();
                }
            }
        });
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (this.isMobile) {
            // Monitor frame rate
            this.monitorFrameRate();

            // Monitor touch performance
            this.monitorTouchPerformance();

            // Monitor battery usage if available
            if ('getBattery' in navigator) {
                this.monitorBatteryUsage();
            }
        }
    }

    /**
     * Monitor frame rate
     */
    monitorFrameRate() {
        let frameCount = 0;
        let lastTime = performance.now();

        const countFrames = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                if (fps < 30) {
                    this.enablePerformanceMode();
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFrames);
        };

        requestAnimationFrame(countFrames);
    }

    /**
     * Monitor touch performance
     */
    monitorTouchPerformance() {
        let touchStartTime = 0;
        let touchEndTime = 0;

        document.addEventListener('touchstart', () => {
            touchStartTime = performance.now();
        }, { passive: true });

        document.addEventListener('touchend', () => {
            touchEndTime = performance.now();
            const touchDuration = touchEndTime - touchStartTime;

            if (touchDuration > 100) {
                this.enablePerformanceMode();
            }
        }, { passive: true });
    }

    /**
     * Monitor battery usage
     */
    async monitorBatteryUsage() {
        try {
            const battery = await navigator.getBattery();
            
            battery.addEventListener('levelchange', () => {
                if (battery.level < 0.2) {
                    this.enableLowBatteryMode();
                }
            });
        } catch (error) {
            // Battery API not available
        }
    }

    /**
     * Enable performance mode
     */
    enablePerformanceMode() {
        // Reduce animations
        document.documentElement.style.setProperty('--animation-duration', '0.05s');
        document.documentElement.style.setProperty('--transition-duration', '0.05s');

        // Reduce particle count further
        if (window.particleSystem) {
            window.particleSystem.maxParticles = 10;
            window.particleSystem.particleLimit = 25;
        }

        // Disable heavy effects (but keep glass effects)
        const heavyEffects = document.querySelectorAll('.enhanced-particle, .network-particles');
        heavyEffects.forEach(effect => {
            effect.style.display = 'none';
        });
        
        // Note: Glass effects are kept enabled for visual appeal
        // They can be manually disabled via terminal command if needed
    }

    /**
     * Enable low battery mode
     */
    enableLowBatteryMode() {
        // Disable all animations
        document.documentElement.style.setProperty('--animation-duration', '0s');
        document.documentElement.style.setProperty('--transition-duration', '0s');

        // Disable particles
        if (window.particleSystem) {
            window.particleSystem.maxParticles = 0;
            window.particleSystem.particleLimit = 0;
        }

        // Disable audio
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.pause();
            audio.muted = true;
        });
    }

    /**
     * Get mobile device info
     */
    getMobileInfo() {
        return {
            isMobile: this.isMobile,
            isTouch: this.isTouch,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            orientation: window.orientation || 0,
            userAgent: navigator.userAgent,
            performanceMode: this.performanceMode
        };
    }

    /**
     * Show mobile-specific help
     */
    showMobileHelp() {
        const helpText = `
            Mobile neuOS Help:
            
            • Tap icons to open applications
            • Swipe to scroll in applications
            • Use pinch gestures to zoom (where supported)
            • Double-tap to close windows
            • Rotate device to change orientation
            
            Performance Tips:
            • Close unused applications
            • Keep device charged for best performance
            • Enable low power mode for longer battery life
        `;
        
        return helpText;
    }
}

// Initialize mobile utilities
window.mobileUtils = new MobileUtils();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileUtils;
} 