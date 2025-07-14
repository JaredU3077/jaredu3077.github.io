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
        this.setupMouseTracking();
        this.setupBreathingAnimations();
        this.setupGlassDistortion();
        this.setupDynamicGlassParameters();
        this.setupEnhancedReflections();
    }

    /**
     * Setup interactive 3D tilt effects for glass containers from test1
     */
    setupInteractiveElements() {
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

        const handleMouseLeave = () => {
            element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
        };

        element.addEventListener('mousemove', handleMouseMove);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        // Store references for cleanup
        this.interactiveElements.set(element, {
            mousemove: handleMouseMove,
            mouseleave: handleMouseLeave
        });
    }

    /**
     * Setup global mouse tracking for advanced effects from test1
     */
    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            this.mousePosition.x = e.clientX;
            this.mousePosition.y = e.clientY;
            
            // Update glass reflection based on mouse position
            this.updateGlassReflection();
        });
    }

    /**
     * Update glass reflection based on mouse position from test1
     */
    updateGlassReflection() {
        const reflections = document.querySelectorAll('.glass-reflection');
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
        const titles = document.querySelectorAll('.glass-title, .boot-title, .login-title, .breathing-title');
        
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
        // Set enhanced glass parameters for better transparency and shine
        const updateGlassParameters = () => {
            document.documentElement.style.setProperty('--shadow-blur', '12px');
            document.documentElement.style.setProperty('--shadow-spread', '-3px');
            document.documentElement.style.setProperty('--shadow-color', 'rgba(255, 255, 255, 0.8)');
            document.documentElement.style.setProperty('--tint-opacity', '0.015');
            document.documentElement.style.setProperty('--frost-blur', '4px');
            document.documentElement.style.setProperty('--glass-background', 'rgba(255, 255, 255, 0.008)');
            document.documentElement.style.setProperty('--glass-backdrop-blur', '12px');
            document.documentElement.style.setProperty('--glass-saturation', '180%');
            document.documentElement.style.setProperty('--glass-brightness', '140%');
            document.documentElement.style.setProperty('--glass-reflection-opacity', '0.3');
            document.documentElement.style.setProperty('--glass-edge-glow', '0 0 25px rgba(255, 255, 255, 0.4)');
        };

        updateGlassParameters();
    }

    /**
     * Setup enhanced reflection effects
     */
    setupEnhancedReflections() {
        // Add reflection layers to glass elements
        const glassElements = document.querySelectorAll('.glass-container, .neuos-glass-box, .neuos-widget, .glass-login-btn');
        
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
     * Cleanup and destroy the system
     */
    destroy() {
        // Remove event listeners
        this.interactiveElements.forEach((handlers, element) => {
            element.removeEventListener('mousemove', handlers.mousemove);
            element.removeEventListener('mouseleave', handlers.mouseleave);
        });
        
        this.interactiveElements.clear();
        this.animationFrames.clear();
        
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