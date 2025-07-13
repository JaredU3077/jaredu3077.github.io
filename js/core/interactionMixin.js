/**
 * Interaction Mixin for Particle System
 * Provides particle interaction and physics functionality
 */

export const interactionMixin = {
    /**
     * Updates particle physics and interactions
     */
    updateParticlePhysics() {
        this.particles.forEach(particle => {
            // Apply physics forces
            this.applyPhysicsForces(particle);
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply boundary constraints
            this.applyBoundaryConstraints(particle);
            
            // Update visual element
            this.updateParticleElement(particle);
        });
    },

    /**
     * Applies physics forces to a particle
     */
    applyPhysicsForces(particle) {
        // Apply gravity
        particle.vy += this.particlePhysics.gravity;
        
        // Apply wind
        particle.vx += this.particlePhysics.wind;
        
        // Apply turbulence
        particle.vx += (Math.random() - 0.5) * this.particlePhysics.turbulence;
        particle.vy += (Math.random() - 0.5) * this.particlePhysics.turbulence;
        
        // Apply damping
        particle.vx *= 0.99;
        particle.vy *= 0.99;
    },

    /**
     * Applies boundary constraints to keep particles on screen
     */
    applyBoundaryConstraints(particle) {
        const margin = 50;
        
        if (particle.x < -margin) {
            particle.x = window.innerWidth + margin;
        } else if (particle.x > window.innerWidth + margin) {
            particle.x = -margin;
        }
        
        if (particle.y < -margin) {
            particle.y = window.innerHeight + margin;
        } else if (particle.y > window.innerHeight + margin) {
            particle.y = -margin;
        }
    },

    /**
     * Updates the visual element of a particle
     */
    updateParticleElement(particle) {
        if (particle.element) {
            particle.element.style.transform = `translate(${particle.x}px, ${particle.y}px)`;
        }
    },

    /**
     * Handles particle collision detection
     */
    handleParticleCollisions() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < 20) {
                    this.handleCollision(p1, p2);
                }
            }
        }
    },

    /**
     * Handles collision between two particles
     */
    handleCollision(p1, p2) {
        // Simple elastic collision
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const nx = dx / distance;
            const ny = dy / distance;
            
            const relativeVelocityX = p2.vx - p1.vx;
            const relativeVelocityY = p2.vy - p1.vy;
            
            const speed = relativeVelocityX * nx + relativeVelocityY * ny;
            
            if (speed < 0) return; // Particles are moving apart
            
            const impulse = 2 * speed;
            p1.vx += impulse * nx;
            p1.vy += impulse * ny;
            p2.vx -= impulse * nx;
            p2.vy -= impulse * ny;
        }
    }
};