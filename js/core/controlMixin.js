/**
 * Control Mixin for Particle System
 * Provides control and management functionality
 */

export const controlMixin = {
    /**
     * Sets up keyboard controls
     */
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyControl(e);
        });
    },

    /**
     * Handles keyboard controls
     */
    handleKeyControl(event) {
        switch (event.key) {
            case ' ':
                event.preventDefault();
                this.toggleAnimation();
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                this.regenerateParticles();
                break;
            case 'c':
            case 'C':
                event.preventDefault();
                this.clearParticles();
                break;
            case '1':
                this.setParticleMode('calm');
                break;
            case '2':
                this.setParticleMode('normal');
                break;
            case '3':
                this.setParticleMode('intense');
                break;
            case '+':
            case '=':
                event.preventDefault();
                this.setParticleCount(Math.min(this.particleCount + 10, 200));
                break;
            case '-':
                event.preventDefault();
                this.setParticleCount(Math.max(this.particleCount - 10, 10));
                break;
        }
    },

    /**
     * Gets system status
     */
    getSystemStatus() {
        return {
            animationRunning: this.particleAnimationRunning,
            particleCount: this.particles.length,
            maxParticles: this.particleCount,
            mode: this.particleMode,
            colorScheme: this.currentColorScheme,
            generationRate: this.particleGenerationRate
        };
    },

    /**
     * Resets the particle system
     */
    reset() {
        this.clearParticles();
        this.particleCount = 50;
        this.particleGenerationRate = 1200;
        this.particleMode = 'normal';
        this.currentColorScheme = 'chillhouse';
        this.particleAnimationRunning = true;
        this.generateParticles();
    },

    /**
     * Destroys the particle system
     */
    destroy() {
        this.stopAnimation();
        this.clearParticles();
        if (this.particleContainer && this.particleContainer.parentNode) {
            this.particleContainer.remove();
        }
    }
};