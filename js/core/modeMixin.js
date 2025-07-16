/**
 * Mode Mixin for Particle System
 * Provides particle mode management functionality
 */

export const modeMixin = {
    /**
     * Available particle modes
     */
    particleModes: {
        calm: {
            name: 'Calm',
            description: 'Gentle, relaxing particle movement',
            particleCount: 25,
            generationRate: 1500,
            physics: {
                gravity: 0.01,
                wind: 0.005,
                turbulence: 0.002
            }
        },
        normal: {
            name: 'Normal',
            description: 'Balanced particle behavior',
            particleCount: 50,
            generationRate: 1200,
            physics: {
                gravity: 0.02,
                wind: 0.01,
                turbulence: 0.005
            }
        },
        intense: {
            name: 'Intense',
            description: 'Dynamic, energetic particle movement',
            particleCount: 100,
            generationRate: 800,
            physics: {
                gravity: 0.03,
                wind: 0.015,
                turbulence: 0.008
            }
        }
    },

    /**
     * Sets particle mode with full configuration
     */
    setParticleMode(mode) {
        if (this.particleModes[mode]) {
            const modeConfig = this.particleModes[mode];
            this.particleMode = mode;
            this.particleCount = modeConfig.particleCount;
            this.particleGenerationRate = modeConfig.generationRate;
            this.particlePhysics = { ...this.particlePhysics, ...modeConfig.physics };
            
            // Regenerate particles with new settings
            this.regenerateParticles();
        }
    },

    /**
     * Gets current mode configuration
     */
    getCurrentMode() {
        return this.particleModes[this.particleMode] || this.particleModes.normal;
    },

    /**
     * Gets all available modes
     */
    getAvailableModes() {
        return Object.keys(this.particleModes);
    },

    /**
     * Cycles to next mode
     */
    cycleMode() {
        const modes = this.getAvailableModes();
        const currentIndex = modes.indexOf(this.particleMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setParticleMode(modes[nextIndex]);
    },

    /**
     * Gets mode statistics
     */
    getModeStats() {
        const currentMode = this.getCurrentMode();
        return {
            currentMode: this.particleMode,
            modeName: currentMode.name,
            description: currentMode.description,
            particleCount: this.particleCount,
            generationRate: this.particleGenerationRate,
            physics: this.particlePhysics
        };
    }
};