/**
 * Animation Mixin for Particle System
 * Provides particle animation and rendering functionality
 */

export const animationMixin = {
    /**
     * Starts the particle animation loop
     */
    animateParticles() {
        const animate = () => {
            if (this.particleAnimationRunning) {
                this.updateParticlePhysics();
                this.handleParticleCollisions();
                this.cleanupOffscreenParticles();
                this.updateBackgroundEffects();
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    },

    /**
     * Stops particle animation
     */
    stopAnimation() {
        this.particleAnimationRunning = false;
    },

    /**
     * Starts particle animation
     */
    startAnimation() {
        this.particleAnimationRunning = true;
    },

    /**
     * Toggles particle animation
     */
    toggleAnimation() {
        this.particleAnimationRunning = !this.particleAnimationRunning;
        return this.particleAnimationRunning;
    },

    /**
     * Gets animation status
     */
    isAnimationRunning() {
        return this.particleAnimationRunning;
    },

    /**
     * Sets animation frame rate
     */
    setFrameRate(fps) {
        this.frameRate = fps;
        this.frameInterval = 1000 / fps;
    },

    /**
     * Updates particle colors based on time
     */
    updateParticleColors() {
        const time = Date.now() * 0.001;
        this.particles.forEach((particle, index) => {
            if (particle.element) {
                const hue = (time * 0.1 + index * 0.1) % 360;
                const color = `hsl(${hue}, 70%, 60%)`;
                particle.element.style.background = color;
                particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${color}`;
            }
        });
    },

    /**
     * Creates particle trail effect
     */
    createParticleTrail(particle) {
        if (!particle.element) return;
        
        const trail = document.createElement('div');
        trail.className = 'particle-trail';
        trail.style.cssText = `
            position: absolute;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background: ${particle.color};
            border-radius: 50%;
            opacity: 0.3;
            pointer-events: none;
            z-index: 1000;
            transform: translate(${particle.x}px, ${particle.y}px);
        `;
        
        this.particleContainer.appendChild(trail);
        
        // Fade out and remove trail
        setTimeout(() => {
            trail.style.opacity = '0';
            trail.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.remove();
                }
            }, 500);
        }, 100);
    }
};