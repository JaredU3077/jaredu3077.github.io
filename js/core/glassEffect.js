/**
 * neuOS True test1 Glass Morphism System
 * Exact implementation of the test1 theme with proper glass effects
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
    }

    /**
     * Setup interactive 3D tilt effects for glass containers from test1
     */
    setupInteractiveElements() {
        const glassContainers = document.querySelectorAll('.glass-container, .boot-container, .login-container');
        
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
            const maxRotation = 25;
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
            const x = (this.mousePosition.x / windowWidth - 0.5) * 20;
            const y = (this.mousePosition.y / windowHeight - 0.5) * 20;
            
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
                // Set fixed values from JSON
                const frequency = 0.01;
                const scale = 33;
                
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
        // Set glass parameters to match JSON exactly
        const updateGlassParameters = () => {
            document.documentElement.style.setProperty('--shadow-blur', '9px');
            document.documentElement.style.setProperty('--shadow-spread', '-5px');
            document.documentElement.style.setProperty('--shadow-color', '#ffffff');
            document.documentElement.style.setProperty('--tint-opacity', '0.03');
            document.documentElement.style.setProperty('--frost-blur', '2px');
        };

        updateGlassParameters();
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
     * Create a glass text element with advanced effects from test1
     */
    createGlassText(text, options = {}) {
        const {
            containerClass = 'glass-text-container',
            textClass = 'breathing-title',
            interactive = true
        } = options;

        const container = document.createElement('div');
        container.className = containerClass;
        
        const textElement = document.createElement('h1');
        textElement.className = textClass;
        textElement.textContent = text;
        
        container.appendChild(textElement);
        
        if (interactive) {
            this.makeInteractive(container);
        }
        
        return container;
    }

    /**
     * Create a glass button with enhanced effects from test1
     */
    createGlassButton(text, options = {}) {
        const {
            buttonClass = 'glass-login-btn',
            interactive = true
        } = options;

        const button = document.createElement('button');
        button.className = buttonClass;
        button.textContent = text;
        
        if (interactive) {
            this.makeInteractive(button);
        }
        
        return button;
    }

    /**
     * Update glass parameters dynamically from test1
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
        this.interactiveElements.forEach((listeners, element) => {
            element.removeEventListener('mousemove', listeners.mousemove);
            element.removeEventListener('mouseleave', listeners.mouseleave);
        });
        
        // Cancel animation frames
        this.animationFrames.forEach(frameId => {
            cancelAnimationFrame(frameId);
        });
        
        this.interactiveElements.clear();
        this.animationFrames.clear();
        this.isInitialized = false;
    }
}

// Initialize the glass morphism system
const glassSystem = new GlassMorphismSystem();

// Export for module usage and global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlassMorphismSystem;
} else {
    // Make available globally for non-module usage
    window.GlassMorphismSystem = GlassMorphismSystem;
    window.glassSystem = glassSystem;
} 