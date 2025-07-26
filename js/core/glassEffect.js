/**
 * neuOS Glass Morphism System - Performance Optimized Implementation
 * Uses new design tokens for consistent glass effects across all components
 */

export class GlassMorphismSystem {
    constructor() {
        this.isInitialized = false;
        this.interactiveElements = new Map();
        this.animationFrames = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.glassElements = new Set();
        this.focusedElement = null; // Track currently focused element
        
        // Performance optimizations
        this.lastMouseUpdate = 0;
        this.mouseUpdateThrottle = 16; // ~60fps
        this.lastDistortionUpdate = 0;
        this.distortionUpdateThrottle = 100; // 10fps for distortion
        this.lastReflectionUpdate = 0;
        this.reflectionUpdateThrottle = 200; // 5fps for reflections
        
        // Light glass effects for performance
        this.enableBreathingAnimations = false; // Disabled for performance
        this.enableDistortion = false; // Disabled for performance
        this.enableReflections = false; // Disabled for performance
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
        
        this.isInitialized = true;
    }

    setup() {
        this.setupInteractiveElements();
        // Disabled for performance: this.setupFocusedMouseTracking();
        // Disabled for performance: this.setupBreathingAnimations();
        // Disabled for performance: this.setupGlassDistortion();
        // Disabled for performance: this.setupEnhancedReflections();
        this.setupMutationObserver();
        this.enhanceExistingElements();
    }

    /**
     * Setup interactive 3D tilt effects for glass containers (optimized)
     */
    setupInteractiveElements() {
        // Apply tilting to glass containers, but NOT to application windows or desktop icons
        const glassContainers = document.querySelectorAll('.glass-container, .boot-container, .login-container, .neuos-glass-box, .neuos-widget');
        
        glassContainers.forEach(container => {
            this.makeInteractive(container);
        });

        // Also setup glass text containers
        const glassTextContainers = document.querySelectorAll('.glass-text-container, .boot-header, .login-header');
        glassTextContainers.forEach(container => {
            this.makeInteractive(container);
        });
    }

    /**
     * Make an element interactive with 3D tilt effects (optimized)
     */
    makeInteractive(element) {
        if (!element || this.interactiveElements.has(element)) return;
        
        element.classList.add('glass-interactive');
        
        // Throttled mouse move handler for better performance
        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - this.lastMouseUpdate < this.mouseUpdateThrottle) {
                return;
            }
            this.lastMouseUpdate = now;
            
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const x = (e.clientX - centerX) / (rect.width / 2);
            const y = (e.clientY - centerY) / (rect.height / 2);
            
            // Reduced rotation for better performance
            const maxRotation = 8; // Reduced from 15
            const rotateX = -y * maxRotation;
            const rotateY = x * maxRotation;
            
            // Use transform3d for hardware acceleration
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
        };

        // Add focus/blur handlers for mouse tracking
        const handleMouseEnter = () => {
            this.focusedElement = element;
            // Throttled reflection update
            const now = Date.now();
            if (now - this.lastReflectionUpdate > this.reflectionUpdateThrottle) {
                this.updateGlassReflection();
                this.lastReflectionUpdate = now;
            }
        };

        const handleMouseLeave = () => {
            if (this.focusedElement === element) {
                this.focusedElement = null;
            }
            // Remove inline transform so CSS can take over
            element.style.removeProperty('transform');
        };

        // Use passive listeners for better performance
        element.addEventListener('mousemove', handleMouseMove, { passive: true });
        element.addEventListener('mouseenter', handleMouseEnter, { passive: true });
        element.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        
        // Store references for cleanup
        this.interactiveElements.set(element, {
            handleMouseMove,
            handleMouseEnter,
            handleMouseLeave
        });
    }

    /**
     * Setup focused mouse tracking (optimized)
     */
    setupFocusedMouseTracking() {
        // Throttled mouse tracking for better performance
        const handleMouseMove = (e) => {
            const now = Date.now();
            if (now - this.lastMouseUpdate < this.mouseUpdateThrottle) {
                return;
            }
            this.lastMouseUpdate = now;
            
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // Only update reflection if there's a focused element
            if (this.focusedElement && this.enableReflections) {
                const now = Date.now();
                if (now - this.lastReflectionUpdate > this.reflectionUpdateThrottle) {
                    this.updateGlassReflection();
                    this.lastReflectionUpdate = now;
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    /**
     * Update glass reflection (optimized)
     */
    updateGlassReflection() {
        if (!this.focusedElement || !this.enableReflections) return;
        
        const reflection = this.focusedElement.querySelector('.glass-reflection');
        if (!reflection) return;
        
        const rect = this.focusedElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const x = (this.mousePosition.x - centerX) / (rect.width / 2);
        const y = (this.mousePosition.y - centerY) / (rect.height / 2);
        
        // Simplified reflection calculation
        const translateX = x * 10; // Reduced from 20
        const translateY = y * 10; // Reduced from 20
        
        reflection.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    /**
     * Setup breathing animations for glass elements
     */
    setupBreathingAnimations() {
        if (!this.enableBreathingAnimations) return;
        
        // Add breathing animation to glass containers
        const glassContainers = document.querySelectorAll('.glass-container, .neuos-glass-box, .neuos-widget');
        glassContainers.forEach(container => {
            container.classList.add('glass-breathe');
            
                    // Inner glow removed for performance
        });
        
        // Add pulse animation to glass buttons
        const glassButtons = document.querySelectorAll('.glass-login-btn');
        glassButtons.forEach(button => {
            button.classList.add('glass-pulse');
            
                    // Inner glow removed for performance
        });
    }

    /**
     * Setup glass distortion effects
     */
    setupGlassDistortion() {
        if (!this.enableDistortion) return;
        
        // Apply distortion filter to glass elements
        const glassElements = document.querySelectorAll('.glass-container, .neuos-glass-box, .neuos-widget');
        glassElements.forEach(element => {
            element.style.filter = 'url(#glass-distortion)';
        });
        
        // Update distortion parameters periodically for dynamic effect
        setInterval(() => {
            const turbulence = document.querySelector('feTurbulence');
            if (turbulence) {
                const frequency = 0.01 + Math.random() * 0.01;
                turbulence.setAttribute('baseFrequency', `${frequency} ${frequency}`);
            }
        }, 3000); // Update every 3 seconds
    }

    /**
     * Setup enhanced reflections (optimized)
     */
    setupEnhancedReflections() {
        if (!this.enableReflections) return;
        
        // Add reflection layers to existing glass elements
        this.glassElements.forEach(element => {
            this.addReflectionLayer(element);
        });
    }

    /**
     * Add reflection layer to element (optimized)
     */
    addReflectionLayer(element) {
        if (element.querySelector('.glass-reflection')) return;
        
        const reflection = document.createElement('div');
        reflection.className = 'glass-reflection';
        reflection.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 25%, 
                transparent 50%, 
                rgba(255, 255, 255, 0.02) 75%, 
                transparent 100%);
            pointer-events: none;
            z-index: 1;
            will-change: transform;
            transition: transform 0.1s ease-out;
        `;
        
        element.style.position = 'relative';
        element.appendChild(reflection);
    }

    /**
     * Setup mutation observer (optimized)
     */
    setupMutationObserver() {
        // Throttled mutation observer for better performance
        let observerTimeout;
        
        this.mutationObserver = new MutationObserver((mutations) => {
            if (observerTimeout) {
                clearTimeout(observerTimeout);
            }
            
            observerTimeout = setTimeout(() => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                this.enhanceElement(node);
                            }
                        });
                    }
                });
            }, 100); // Debounce mutations
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Enhance existing elements (optimized)
     */
    enhanceExistingElements() {
        // Batch process elements for better performance
        const elements = document.querySelectorAll('.glass-container, .neuos-glass-box, .glass-interactive');
        
        // Process in chunks to avoid blocking the main thread
        const chunkSize = 10;
        for (let i = 0; i < elements.length; i += chunkSize) {
            const chunk = Array.from(elements).slice(i, i + chunkSize);
            setTimeout(() => {
                chunk.forEach(element => this.enhanceElement(element));
            }, i * 5); // Stagger processing
        }
    }

    /**
     * Enhance element with glass effects (optimized)
     */
    enhanceElement(element) {
        if (!element || this.glassElements.has(element)) return;
        
        this.glassElements.add(element);
        
        // Add glass effect class
        element.classList.add('glass-effect');
        
        // Add reflection layer if enabled
        if (this.enableReflections) {
            this.addReflectionLayer(element);
        }
        
        // Add will-change for better performance
        element.style.willChange = 'transform';
        
        // Add hardware acceleration
        element.style.transform = 'translateZ(0)';
    }

    /**
     * Add glass effect to element (optimized)
     */
    addGlassEffect(element, options = {}) {
        if (!element) return;
        
        const defaultOptions = {
            blur: '10px',
            transparency: '0.1',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            shadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backdrop: 'blur(10px)',
            interactive: true
        };
        
        const config = { ...defaultOptions, ...options };
        
        // Apply glass effect styles
        element.style.cssText += `
            background: rgba(255, 255, 255, ${config.transparency});
            backdrop-filter: ${config.backdrop};
            -webkit-backdrop-filter: ${config.backdrop};
            border: ${config.border};
            box-shadow: ${config.shadow};
            will-change: transform;
        `;
        
        // Add glass class
        element.classList.add('glass-effect');
        
        // Make interactive if requested
        if (config.interactive) {
            this.makeInteractive(element);
        }
        
        // Add to tracking
        this.glassElements.add(element);
    }

    /**
     * Create glass text element (optimized)
     */
    createGlassText(text, options = {}) {
        const element = document.createElement('div');
        element.textContent = text;
        element.className = 'glass-text';
        
        this.addGlassEffect(element, {
            transparency: '0.05',
            blur: '5px',
            ...options
        });
        
        return element;
    }

    /**
     * Create glass button element (optimized)
     */
    createGlassButton(text, options = {}) {
        const element = document.createElement('button');
        element.textContent = text;
        element.className = 'glass-button';
        
        this.addGlassEffect(element, {
            transparency: '0.15',
            blur: '15px',
            interactive: true,
            ...options
        });
        
        return element;
    }

    /**
     * Enhance all glass elements (optimized)
     */
    enhanceAllGlassElements() {
        // Batch process for better performance
        const elements = document.querySelectorAll('.glass-container, .neuos-glass-box, .glass-interactive, .neuos-widget');
        
        // Process in smaller chunks to avoid blocking
        const chunkSize = 5;
        for (let i = 0; i < elements.length; i += chunkSize) {
            const chunk = Array.from(elements).slice(i, i + chunkSize);
            setTimeout(() => {
                chunk.forEach(element => {
                    if (!this.glassElements.has(element)) {
                        this.enhanceElement(element);
                    }
                });
            }, i * 10); // Stagger processing more
        }
    }

    /**
     * Cleanup and destroy (optimized)
     */
    destroy() {
        // Remove event listeners
        this.interactiveElements.forEach((handlers, element) => {
            element.removeEventListener('mousemove', handlers.handleMouseMove);
            element.removeEventListener('mouseenter', handlers.handleMouseEnter);
            element.removeEventListener('mouseleave', handlers.handleMouseLeave);
        });
        
        // Clear collections
        this.interactiveElements.clear();
        this.glassElements.clear();
        this.animationFrames.clear();
        
        // Disconnect observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // Cancel any pending animation frames
        this.animationFrames.forEach(frameId => {
            cancelAnimationFrame(frameId);
        });
        
        this.isInitialized = false;
    }
}

// Initialize the glass morphism system
const glassSystem = new GlassMorphismSystem();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlassMorphismSystem;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.GlassMorphismSystem = GlassMorphismSystem;
    window.glassSystem = glassSystem;
}