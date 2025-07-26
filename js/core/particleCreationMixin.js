/**
 * Particle Creation Mixin for Particle System
 * Provides particle generation and creation functionality
 */

export const particleCreationMixin = {
    /**
     * Generates initial particles
     */
    generateParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    },

    /**
     * Creates a single particle
     */
    createParticle() {
        const particle = {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            opacity: Math.random() * 0.5 + 0.3,
            color: this.getNextParticleColor(),
            element: null
        };

        this.createParticleElement(particle);
        this.particles.push(particle);
    },

    /**
     * Creates the DOM element for a particle
     */
    createParticleElement(particle) {
        const element = document.createElement('div');
        element.className = 'enhanced-particle';
        element.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: ${particle.color};
            border-radius: 50%;
            opacity: ${particle.opacity};
            pointer-events: none;
            z-index: 16 !important; /* Much lower than terminal window (2000) */
            box-shadow: 0 0 ${particle.size * 2}px ${particle.color};
            transition: all 0.3s ease;
        `;

        this.particleContainer.appendChild(element);
        particle.element = element;
    },

    /**
     * Gets the next particle color from the current scheme
     */
    getNextParticleColor() {
        const colors = this.colorSchemes[this.currentColorScheme];
        const color = colors[this.currentParticleColor % colors.length];
        this.currentParticleColor++;
        return color;
    },

    /**
     * Starts continuous particle generation
     */
    startContinuousGeneration() {
        setInterval(() => {
            if (this.particleAnimationRunning && this.particles.length < this.particleCount) {
                this.createParticle();
            }
        }, this.particleGenerationRate);
    },

    /**
     * Removes a particle from the system
     */
    removeParticle(particle) {
        if (particle.element) {
            particle.element.remove();
        }
        const index = this.particles.indexOf(particle);
        if (index > -1) {
            this.particles.splice(index, 1);
        }
    },

    /**
     * Cleans up particles that are off-screen
     */
    cleanupOffscreenParticles() {
        const margin = 100;
        this.particles = this.particles.filter(particle => {
            if (particle.x < -margin || particle.x > window.innerWidth + margin ||
                particle.y < -margin || particle.y > window.innerHeight + margin) {
                this.removeParticle(particle);
                return false;
            }
            return true;
        });
    }
};