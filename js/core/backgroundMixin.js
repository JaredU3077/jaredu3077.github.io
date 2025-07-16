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
     * Creates enhanced solar system with sun and planets
     */
    createBackgroundSpinnerRings() {
        // Remove any existing solar system elements
        document.querySelectorAll('.background-spinner, .solar-orb, .solar-sun, .solar-planet').forEach(element => element.remove());
        
        // Create the central sun
        const sun = document.createElement('div');
        sun.className = 'solar-sun';
        sun.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: 80px !important;
            height: 80px !important;
            transform: translate(-50%, -50%) !important;
            background: radial-gradient(circle, #ffd700 0%, #ff8c00 30%, #ff4500 70%, #8b0000 100%) !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 99 !important;
            box-shadow: 
                0 0 30px #ffd700,
                0 0 60px #ff8c00,
                0 0 90px #ff4500,
                inset 0 0 20px rgba(255, 215, 0, 0.3) !important;
            animation: sunPulse 4s ease-in-out infinite !important;
        `;
        document.body.appendChild(sun);

        // Create solar system planets with realistic characteristics
        const planets = [
            { name: 'Mercury', size: 6, distance: 120, speed: 25, color: '#8c7853', ring: false },
            { name: 'Venus', size: 8, distance: 180, speed: 35, color: '#e6be8a', ring: false },
            { name: 'Earth', size: 9, distance: 240, speed: 45, color: '#4a90e2', ring: false },
            { name: 'Mars', size: 7, distance: 300, speed: 55, color: '#c1440e', ring: false },
            { name: 'Jupiter', size: 16, distance: 380, speed: 65, color: '#d4af37', ring: true },
            { name: 'Saturn', size: 14, distance: 460, speed: 75, color: '#f4d03f', ring: true },
            { name: 'Uranus', size: 11, distance: 540, speed: 85, color: '#85c1e9', ring: true },
            { name: 'Neptune', size: 10, distance: 620, speed: 95, color: '#5dade2', ring: false }
        ];
        
        planets.forEach((planet, index) => {
            // Create planet
            const planetElement = document.createElement('div');
            planetElement.className = 'solar-planet';
            planetElement.setAttribute('data-planet', planet.name);
            
            planetElement.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${planet.size}px !important;
                height: ${planet.size}px !important;
                background: radial-gradient(circle, ${planet.color} 0%, ${this.darkenColor(planet.color, 0.3)} 100%) !important;
                border-radius: 50% !important;
                --orbit-radius: ${planet.distance}px !important;
                animation: solarOrbit ${planet.speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 101 !important;
                box-shadow: 
                    0 0 8px ${planet.color},
                    inset 0 0 4px rgba(255, 255, 255, 0.2) !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            document.body.appendChild(planetElement);

            // Create orbital ring
            const ring = document.createElement('div');
            ring.className = 'solar-orbit-ring';
            ring.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${planet.distance * 2}px !important;
                height: ${planet.distance * 2}px !important;
                transform: translate(-50%, -50%) !important;
                border: 1px solid rgba(255, 255, 255, 0.05) !important;
                border-radius: 50% !important;
                pointer-events: none !important;
                z-index: 100 !important;
                opacity: 0.3 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: none !important;
            `;
            document.body.appendChild(ring);

            // Create planet rings for gas giants
            if (planet.ring) {
                const planetRing = document.createElement('div');
                planetRing.className = 'solar-planet-ring';
                planetRing.style.cssText = `
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: ${planet.size * 2.5}px !important;
                    height: ${planet.size * 0.8}px !important;
                    transform: translate(-50%, -50%) !important;
                    background: linear-gradient(90deg, transparent 0%, ${planet.color}40 20%, ${planet.color}80 50%, ${planet.color}40 80%, transparent 100%) !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    z-index: 102 !important;
                    animation: planetRingRotate ${planet.speed * 0.8}s linear infinite !important;
                    margin: 0 !important;
                    padding: 0 !important;
                `;
                document.body.appendChild(planetRing);
            }

            // Add moons for some planets
            if (['Earth', 'Mars', 'Jupiter', 'Saturn'].includes(planet.name)) {
                const moonCount = planet.name === 'Jupiter' ? 3 : planet.name === 'Saturn' ? 2 : 1;
                for (let i = 0; i < moonCount; i++) {
                    const moon = document.createElement('div');
                    moon.className = 'solar-moon';
                    moon.style.cssText = `
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        width: ${Math.max(2, planet.size * 0.3)}px !important;
                        height: ${Math.max(2, planet.size * 0.3)}px !important;
                        background: #c0c0c0 !important;
                        border-radius: 50% !important;
                        --orbit-radius: ${planet.size * 0.8}px !important;
                        --moon-offset: ${i * 120}deg !important;
                        animation: moonOrbit ${planet.speed * 0.5}s linear infinite !important;
                        pointer-events: none !important;
                        z-index: 103 !important;
                        box-shadow: 0 0 4px #c0c0c0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                    document.body.appendChild(moon);
                }
            }
        });

        // Hide ambient glow overlay if it exists
        const glow = document.querySelector('.ambient-glow');
        if (glow) glow.style.display = 'none';
    },

    /**
     * Helper function to darken colors
     */
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
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