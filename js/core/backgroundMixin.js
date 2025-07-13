/**
 * Background Mixin for Particle System
 * Provides background-related functionality
 */

export const backgroundMixin = {
    /**
     * Creates enhanced background elements
     */
    createEnhancedBackgroundElements() {
        this.createBackgroundSpinnerRings();
        this.createAmbientGlow();
    },

    /**
     * Creates three persistent, different-sized, centered rings
     */
    createBackgroundSpinnerRings() {
        // Remove any existing rings to avoid duplicates
        document.querySelectorAll('.background-spinner').forEach(ring => ring.remove());
        
        // Create three rings with different sizes
        const rings = [
            { size: 300, opacity: 0.3, animation: 60 },
            { size: 400, opacity: 0.25, animation: 80 },
            { size: 500, opacity: 0.2, animation: 100 }
        ];
        
        rings.forEach((ringConfig, index) => {
            const ring = document.createElement('div');
            ring.className = 'background-spinner';
            
            // Set ALL styles inline to override any CSS
            ring.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${ringConfig.size}px !important;
                height: ${ringConfig.size}px !important;
                transform: translate(-50%, -50%) !important;
                border: 1px solid rgba(74, 144, 226, 0.08) !important;
                border-radius: 50% !important;
                animation: backgroundSpin ${ringConfig.animation}s linear infinite !important;
                pointer-events: none !important;
                z-index: 100 !important;
                opacity: ${ringConfig.opacity} !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            
            document.body.appendChild(ring);
            console.log(`Created ring ${index + 1}: ${ringConfig.size}px, centered at viewport center`);
        });
    },

    /**
     * Creates ambient glow effects
     */
    createAmbientGlow() {
        const glow = document.createElement('div');
        glow.className = 'ambient-glow';
        glow.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            pointer-events: none;
            z-index: 50;
        `;
        document.body.appendChild(glow);
    },

    /**
     * Updates background effects based on particle mode
     */
    updateBackgroundEffects() {
        // Update background based on current particle mode
        const rings = document.querySelectorAll('.background-spinner');
        rings.forEach((ring, index) => {
            const opacity = this.particleMode === 'intense' ? 0.15 - index * 0.03 : 0.1 - index * 0.02;
            ring.style.borderColor = `rgba(74, 144, 226, ${opacity})`;
        });
    }
};