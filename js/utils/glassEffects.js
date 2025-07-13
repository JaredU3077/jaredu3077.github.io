// neuOS Glass Effects - Essential glass morphism from test1
// Implements only the core glass effects without breathing or tilt

class GlassEffects {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlassDistortion();
        this.setupGlassParameters();
    }

    setupGlassDistortion() {
        // Update SVG distortion filter parameters to match test1
        const updateDistortion = () => {
            const turbulence = document.querySelector('feTurbulence');
            const displacementMap = document.querySelector('feDisplacementMap');
            
            if (turbulence && displacementMap) {
                // Set glassier values from JSON
                const frequency = 0.01;
                const scale = 33;
                
                turbulence.setAttribute('baseFrequency', `${frequency} ${frequency}`);
                displacementMap.setAttribute('scale', scale);
            }
        };

        // Update distortion immediately
        updateDistortion();
    }

    setupGlassParameters() {
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

    // Method to refresh glass effects when new elements are added
    refresh() {
        this.setupGlassDistortion();
        this.setupGlassParameters();
    }
}

// Initialize glass effects when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.glassEffects = new GlassEffects();
});

// Export for use in other modules
export default GlassEffects; 