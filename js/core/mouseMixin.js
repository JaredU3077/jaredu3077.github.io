/**
 * Mouse Mixin for Particle System
 * Provides mouse tracking and interaction functionality
 */

export const mouseMixin = {
    /**
     * Sets up mouse tracking
     */
    setupMouseTracking() {
        // Track mouse position for particle interaction
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.handleMouseMove(e);
        }, { passive: true });

        // Track mouse enter/leave for particle attraction
        document.addEventListener('mouseenter', () => {
            this.mouseInViewport = true;
        });

        document.addEventListener('mouseleave', () => {
            this.mouseInViewport = false;
        });
    },

    /**
     * Handles mouse movement for particle interaction
     */
    handleMouseMove(event) {
        if (!this.particleAnimationRunning) return;

        // Update mouse position
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        // Apply mouse attraction to nearby particles
        this.particles.forEach(particle => {
            const distance = Math.sqrt(
                Math.pow(particle.x - this.mouseX, 2) + 
                Math.pow(particle.y - this.mouseY, 2)
            );

            if (distance < 150) {
                const attraction = (150 - distance) / 150;
                const dx = (this.mouseX - particle.x) * attraction * 0.02;
                const dy = (this.mouseY - particle.y) * attraction * 0.02;
                
                particle.vx += dx;
                particle.vy += dy;
            }
        });
    },

    /**
     * Gets mouse position
     */
    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    },

    /**
     * Checks if mouse is in viewport
     */
    isMouseInViewport() {
        return this.mouseInViewport || false;
    }
};