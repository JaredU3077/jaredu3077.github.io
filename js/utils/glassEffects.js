// neuOS Glass Effects - Standardized Implementation
// Uses new design tokens for consistent glass effects

class GlassEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlassDistortion();
    }

    setupGlassDistortion() {
        // Update SVG distortion filter parameters to match standardized system
        const updateDistortion = () => {
            const turbulence = document.querySelector('feTurbulence');
            const displacementMap = document.querySelector('feDisplacementMap');
            
            if (turbulence && displacementMap) {
                // Set optimized values for better performance
                const frequency = 0.006;
                const scale = 20;
                
                turbulence.setAttribute('baseFrequency', `${frequency} ${frequency}`);
                displacementMap.setAttribute('scale', scale);
            }
        };

        // Update distortion immediately
        updateDistortion();
    }

    // Method to refresh glass effects when new elements are added
    refresh() {
        this.setupGlassDistortion();
    }
}

// Initialize glass effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.glassEffects = new GlassEffects();
});

// Export for use in other modules
export default GlassEffects; 