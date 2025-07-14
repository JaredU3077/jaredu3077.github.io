/**
 * neuOS True test1 Glass Morphism System - Enhanced Transparency & Shine
 * Exact implementation of the test1 theme with improved glass effects
 */

export class GlassMorphismSystem {
    constructor() {
        this.isInitialized = false;
        this.interactiveElements = new Map();
        this.animationFrames = new Map();
        this.mousePosition = { x: 0, y: 0 };
        this.glassElements = new Set();
        this.focusedElement = null; // Track currently focused element
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
        this.setupFocusedMouseTracking(); // Changed from setupMouseTracking
        this.setupBreathingAnimations();
        this.setupGlassDistortion();
        this.setupDynamicGlassParameters();
        this.setupEnhancedReflections();
        this.setupMutationObserver();
        this.enhanceExistingElements();
    }

    /**
     * Setup interactive 3D tilt effects for glass containers from test1
     */
    setupInteractiveElements() {
        // Apply tilting to desktop icons and glass containers, but NOT to application windows
        const glassContainers = document.querySelectorAll('.glass-container, .boot-container, .login-container, .neuos-glass-box, .neuos-widget, .desktop-icon');
        
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
     * Make an element interactive with 3D tilt effects from test1
     */
    makeInteractive(element) {
        if (!element || this.interactiveElements.has(element)) return;
        
        element.classList.add('glass-interactive');
        
        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const x = (e.clientX - centerX) / (rect.width / 2);
            const y = (e.clientY - centerY) / (rect.height / 2);
            
            // Enhanced rotation from test1 with better limits
            const maxRotation = 20; // Reduced for more subtle effect
            const rotateX = -y * maxRotation;
            const rotateY = x * maxRotation;
            
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        };

        // Add focus/blur handlers for mouse tracking
        const handleMouseEnter = () => {
            this.focusedElement = element;
            this.updateGlassReflection();
        };

        const handleMouseLeave = () => {
            if (this.focusedElement === element) {
                this.focusedElement = null;
            }
            // Remove inline transform so CSS can take over
            element.style.removeProperty('transform');
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        // Store references for cleanup
        this.interactiveElements.set(element, {
            mousemove: handleMouseMove,
            mouseenter: handleMouseEnter,
            mouseleave: handleMouseLeave
        });
    }

    /**
     * Setup focused mouse tracking - only update effects when element is focused
     */
    setupFocusedMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // Only update glass reflection if an element is focused
            if (this.focusedElement) {
                this.updateGlassReflection();
            }
        });
    }

    /**
     * Update glass reflection based on mouse position from test1
     */
    updateGlassReflection() {
        // Only update reflections for the focused element
        if (!this.focusedElement) return;
        
        const reflections = this.focusedElement.querySelectorAll('.glass-reflection');
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        reflections.forEach(reflection => {
            const x = (this.mousePosition.x / windowWidth - 0.5) * 30; // Increased movement
            const y = (this.mousePosition.y / windowHeight - 0.5) * 30; // Increased movement
            
            reflection.style.transform = `translateZ(25px) translateX(${x}px) translateY(${y}px)`;
        });
    }

    /**
     * Setup breathing animations for titles from test1
     */
    setupBreathingAnimations() {
        const titles = document.querySelectorAll('.glass-title, .boot-title, .login-title');
        
        titles.forEach(title => {
            if (!title.classList.contains('glass-title') && !title.classList.contains('breathing-title')) {
                title.classList.add('glass-title');
            }
        });
    }

    /**
     * Setup dynamic glass distortion effects from test1
     */
    setupGlassDistortion() {
        // Update SVG distortion filter parameters
        const updateDistortion = () => {
            const turbulence = document.querySelector('feTurbulence');
            const displacementMap = document.querySelector('feDisplacementMap');
            
            if (turbulence && displacementMap) {
                // Set enhanced values for better transparency
                const frequency = 0.008; // Reduced for smoother effect
                const scale = 25; // Reduced for subtler effect
                
                turbulence.setAttribute('baseFrequency', `${frequency} ${frequency}`);
                displacementMap.setAttribute('scale', scale);
            }
        };

        // Update distortion immediately
        updateDistortion();
    }

    /**
     * Setup dynamic glass parameters from test1
     */
    setupDynamicGlassParameters() {
        // Set Theme 5 ultra-transparent glass parameters
        const updateGlassParameters = () => {
            document.documentElement.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.001)');
            document.documentElement.style.setProperty('--glass-backdrop-blur', '8px');
            document.documentElement.style.setProperty('--glass-saturation', '140%');
            document.documentElement.style.setProperty('--glass-brightness', '110%');
            document.documentElement.style.setProperty('--glass-reflection-opacity', '0.2');
            document.documentElement.style.setProperty('--glass-edge-glow', '0 0 8px rgba(255, 255, 255, 0.05)');
        };

        updateGlassParameters();
    }

    /**
     * Setup enhanced reflection effects
     */
    setupEnhancedReflections() {
        // Add reflection layers to glass elements - EXCLUDE application windows to prevent interference
        const glassElements = document.querySelectorAll('.glass-container, .neuos-glass-box, .neuos-widget, .glass-login-btn, .desktop-icon');
        
        glassElements.forEach(element => {
            this.addReflectionLayer(element);
        });
    }

    /**
     * Add reflection layer to glass element
     */
    addReflectionLayer(element) {
        if (element.querySelector('.glass-reflection')) return; // Already has reflection
        
        const reflection = document.createElement('div');
        reflection.className = 'glass-reflection';
        element.appendChild(reflection);
        
        const edge = document.createElement('div');
        edge.className = 'glass-edge';
        element.appendChild(edge);
        
        this.glassElements.add(element);
    }

    /**
     * Setup mutation observer to automatically enhance new glass elements
     */
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.enhanceElement(node);
                        
                        // Also check child elements
                        const childElements = node.querySelectorAll ? node.querySelectorAll('*') : [];
                        childElements.forEach(child => this.enhanceElement(child));
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Enhance existing elements with glass effects
     */
    enhanceExistingElements() {
        const elementsToEnhance = document.querySelectorAll('.glass-container, .neuos-glass-box, .neuos-widget, .glass-login-btn, .desktop-icon, .glass-title, .boot-title, .login-title');
        
        elementsToEnhance.forEach(element => {
            this.enhanceElement(element);
        });
    }

    /**
     * Enhance a single element with glass effects
     */
    enhanceElement(element) {
        if (!element || this.glassElements.has(element)) return;

        // Check if element should have glass effects - EXCLUDE application windows
        const glassClasses = ['glass-container', 'neuos-glass-box', 'neuos-widget', 'glass-login-btn', 'desktop-icon'];
        const hasGlassClass = glassClasses.some(className => element.classList.contains(className));
        
        if (hasGlassClass) {
            this.addReflectionLayer(element);
            
            // Only apply interactive effects to desktop icons and glass containers, NOT application windows
            const shouldBeInteractive = element.classList.contains('desktop-icon') || 
                                      element.classList.contains('glass-container') || 
                                      element.classList.contains('neuos-glass-box') || 
                                      element.classList.contains('neuos-widget') ||
                                      element.classList.contains('glass-login-btn');
            
            if (shouldBeInteractive) {
                this.makeInteractive(element);
            }
            
            this.glassElements.add(element);
        }
    }

    /**
     * Add glass effect to any element
     */
    addGlassEffect(element, options = {}) {
        if (!element) return;
        
        const {
            containerClass = 'glass-container',
            reflectionClass = 'glass-reflection',
            edgeClass = 'glass-edge',
            interactive = true
        } = options;

        // Add container class
        element.classList.add(containerClass);
        
        // Create reflection layer
        const reflection = document.createElement('div');
        reflection.className = reflectionClass;
        element.appendChild(reflection);
        
        // Create edge glow
        const edge = document.createElement('div');
        edge.className = edgeClass;
        element.appendChild(edge);
        
        // Make interactive if requested
        if (interactive) {
            this.makeInteractive(element);
        }
        
        this.glassElements.add(element);
        return element;
    }

    /**
     * Create glass text element
     */
    createGlassText(text, options = {}) {
        const {
            className = 'glass-text',
            containerClass = 'glass-text-container'
        } = options;

        const container = document.createElement('div');
        container.className = containerClass;
        
        const textElement = document.createElement('div');
        textElement.className = className;
        textElement.textContent = text;
        
        container.appendChild(textElement);
        
        return container;
    }

    /**
     * Create glass button element
     */
    createGlassButton(text, options = {}) {
        const {
            className = 'glass-login-btn'
        } = options;

        const button = document.createElement('button');
        button.className = className;
        button.textContent = text;
        
        this.addGlassEffect(button, { interactive: true });
        
        return button;
    }

    /**
     * Update glass parameters dynamically
     */
    updateGlassParameters(parameters = {}) {
        Object.entries(parameters).forEach(([property, value]) => {
            document.documentElement.style.setProperty(`--${property}`, value);
        });
    }

    /**
     * Apply enhanced glass effects to all matching elements
     */
    enhanceAllGlassElements() {
        const selectors = [
            '.glass-container',
            '.neuos-glass-box', 
            '.neuos-widget',
            '.glass-login-btn',
            '.desktop-icon',
            '.glass-title',
            '.boot-title',
            '.login-title'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                this.enhanceElement(element);
            });
        });
    }

    /**
     * Cleanup and destroy the system
     */
    destroy() {
        // Remove event listeners
        this.interactiveElements.forEach((handlers, element) => {
            element.removeEventListener('mousemove', handlers.mousemove);
            element.removeEventListener('mouseenter', handlers.mouseenter);
            element.removeEventListener('mouseleave', handlers.mouseleave);
        });
        
        this.interactiveElements.clear();
        this.animationFrames.clear();
        this.glassElements.clear();
        
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