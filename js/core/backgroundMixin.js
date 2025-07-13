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
     * Creates eight persistent, different-sized, centered rings with solar system orbs
     */
    createBackgroundSpinnerRings() {
        // Remove any existing rings and orbs to avoid duplicates
        document.querySelectorAll('.background-spinner, .solar-orb').forEach(element => element.remove());
        
        // Create eight rings with different sizes and speeds - all with same visibility and style
        const rings = [
            { size: 200, animation: 40, borderWidth: 1, orbSize: 8, orbColor: '#ff6b6b' },
            { size: 280, animation: 50, borderWidth: 1, orbSize: 6, orbColor: '#4ecdc4' },
            { size: 360, animation: 60, borderWidth: 1, orbSize: 10, orbColor: '#45b7d1' },
            { size: 440, animation: 70, borderWidth: 1, orbSize: 7, orbColor: '#96ceb4' },
            { size: 520, animation: 80, borderWidth: 1, orbSize: 12, orbColor: '#feca57' },
            { size: 600, animation: 90, borderWidth: 1, orbSize: 9, orbColor: '#ff9ff3' },
            { size: 680, animation: 100, borderWidth: 1, orbSize: 11, orbColor: '#54a0ff' },
            { size: 760, animation: 110, borderWidth: 1, orbSize: 8, orbColor: '#5f27cd' }
        ];
        
        rings.forEach((ringConfig, index) => {
            // Create the ring
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
                border: ${ringConfig.borderWidth}px solid rgba(74, 144, 226, 0.25) !important;
                border-radius: 50% !important;
                animation: backgroundSpin ${ringConfig.animation}s linear infinite !important;
                pointer-events: none !important;
                z-index: 100 !important;
                opacity: 1 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: none !important;
                box-shadow: 0 0 18px 4px rgba(74,144,226,0.13);
                filter: blur(1px);
            `;
            document.body.appendChild(ring);

            // Create the orb for this ring
            const orb = document.createElement('div');
            orb.className = 'solar-orb';
            const orbRadius = ringConfig.size / 2;
            orb.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${ringConfig.orbSize}px !important;
                height: ${ringConfig.orbSize}px !important;
                background: ${ringConfig.orbColor} !important;
                border-radius: 50% !important;
                --orbit-radius: ${orbRadius}px !important;
                animation: solarOrbit ${ringConfig.animation}s linear infinite !important;
                pointer-events: none !important;
                z-index: 101 !important;
                box-shadow: 0 0 10px ${ringConfig.orbColor} !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            document.body.appendChild(orb);
        });

        // Hide ambient glow overlay if it exists
        const glow = document.querySelector('.ambient-glow');
        if (glow) glow.style.display = 'none';
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
        // No fading logic! This function is intentionally left blank.
    }
};