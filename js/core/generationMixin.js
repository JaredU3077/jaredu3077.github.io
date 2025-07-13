/**
 * Generation Mixin for Particle System
 * Provides particle generation and management functionality
 */

export const generationMixin = {
    /**
     * Sets particle generation rate
     */
    setGenerationRate(rate) {
        this.particleGenerationRate = rate;
    },

    /**
     * Sets particle count
     */
    setParticleCount(count) {
        this.particleCount = count;
    },

    /**
     * Sets particle mode
     */
    setParticleMode(mode) {
        this.particleMode = mode;
        this.updateParticleBehavior();
    },

    /**
     * Updates particle behavior based on current mode
     */
    updateParticleBehavior() {
        switch (this.particleMode) {
            case 'calm':
                this.particleCount = 25;
                this.particleGenerationRate = 1500;
                this.particlePhysics.gravity = 0.01;
                this.particlePhysics.wind = 0.005;
                break;
            case 'normal':
                this.particleCount = 50;
                this.particleGenerationRate = 1200;
                this.particlePhysics.gravity = 0.02;
                this.particlePhysics.wind = 0.01;
                break;
            case 'intense':
                this.particleCount = 100;
                this.particleGenerationRate = 800;
                this.particlePhysics.gravity = 0.03;
                this.particlePhysics.wind = 0.015;
                break;
            default:
                this.particleCount = 50;
                this.particleGenerationRate = 1200;
        }
    },

    /**
     * Sets color scheme
     */
    setColorScheme(scheme) {
        if (this.colorSchemes[scheme]) {
            this.currentColorScheme = scheme;
            this.currentParticleColor = 0;
        }
    },

    /**
     * Gets current particle statistics
     */
    getParticleStats() {
        return {
            count: this.particles.length,
            maxCount: this.particleCount,
            mode: this.particleMode,
            generationRate: this.particleGenerationRate,
            colorScheme: this.currentColorScheme
        };
    },

    /**
     * Pauses particle generation
     */
    pauseGeneration() {
        this.particleAnimationRunning = false;
    },

    /**
     * Resumes particle generation
     */
    resumeGeneration() {
        this.particleAnimationRunning = true;
    },

    /**
     * Clears all particles
     */
    clearParticles() {
        this.particles.forEach(particle => {
            this.removeParticle(particle);
        });
        this.particles = [];
    },

    /**
     * Regenerates particles
     */
    regenerateParticles() {
        this.clearParticles();
        this.generateParticles();
    }
};