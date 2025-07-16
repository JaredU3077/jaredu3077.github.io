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
        document.querySelectorAll('.background-spinner, .solar-orb, .solar-sun, .solar-planet, .solar-planet-ring, .solar-moon, .solar-atmosphere').forEach(element => element.remove());
        
        // Create the central sun with enhanced effects
        const sun = document.createElement('div');
        sun.className = 'solar-sun';
        sun.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: 120px !important;
            height: 120px !important;
            transform: translate(-50%, -50%) !important;
            background: radial-gradient(circle, 
                #fff8dc 0%, 
                #fff5e6 5%, 
                #ffd700 15%, 
                #ff8c00 35%, 
                #ff4500 65%, 
                #8b0000 85%, 
                #4a0000 100%) !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 99 !important;
            box-shadow: 
                0 0 50px #ffd700,
                0 0 100px #ff8c00,
                0 0 150px #ff4500,
                0 0 200px rgba(255, 69, 0, 0.4),
                0 0 250px rgba(255, 69, 0, 0.2),
                inset 0 0 40px rgba(255, 215, 0, 0.5),
                inset 0 0 20px rgba(255, 255, 255, 0.3) !important;
            animation: sunPulse 8s ease-in-out infinite !important;
        `;
        document.body.appendChild(sun);

        // Create solar system planets with enhanced realistic characteristics
        const planets = [
            { 
                name: 'Mercury', 
                size: 14, 
                distance: 160, 
                speed: 22, 
                color: '#8c7853', 
                ring: false,
                atmosphere: false,
                surface: 'mercury',
                moons: 0,
                features: ['cratered', 'rocky'],
                surfaceDetails: ['impact_craters', 'volcanic_plains', 'scarps']
            },
            { 
                name: 'Venus', 
                size: 18, 
                distance: 220, 
                speed: 32, 
                color: '#e6be8a', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(255, 193, 7, 0.4)',
                surface: 'venus',
                moons: 0,
                features: ['cloudy', 'volcanic'],
                surfaceDetails: ['sulfuric_clouds', 'volcanic_highlands', 'impact_craters']
            },
            { 
                name: 'Earth', 
                size: 20, 
                distance: 280, 
                speed: 42, 
                color: '#4a90e2', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(74, 144, 226, 0.25)',
                surface: 'earth',
                moons: 1,
                features: ['oceans', 'continents'],
                surfaceDetails: ['ocean_blue', 'continental_green', 'polar_ice']
            },
            { 
                name: 'Mars', 
                size: 16, 
                distance: 340, 
                speed: 52, 
                color: '#c1440e', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(193, 68, 14, 0.25)',
                surface: 'mars',
                moons: 2,
                features: ['red', 'dusty'],
                surfaceDetails: ['red_plains', 'dust_storms', 'polar_caps']
            },
            { 
                name: 'Jupiter', 
                size: 32, 
                distance: 420, 
                speed: 62, 
                color: '#d4af37', 
                ring: true,
                ringColor: 'rgba(212, 175, 55, 0.5)',
                atmosphere: true,
                atmosphereColor: 'rgba(212, 175, 55, 0.35)',
                surface: 'jupiter',
                moons: 4,
                features: ['striped', 'stormy'],
                surfaceDetails: ['cloud_bands', 'great_red_spot', 'storm_systems']
            },
            { 
                name: 'Saturn', 
                size: 28, 
                distance: 500, 
                speed: 72, 
                color: '#f4d03f', 
                ring: true,
                ringColor: 'rgba(244, 208, 63, 0.7)',
                ringSize: 4.0,
                atmosphere: true,
                atmosphereColor: 'rgba(244, 208, 63, 0.35)',
                surface: 'saturn',
                moons: 3,
                features: ['ringed', 'golden'],
                surfaceDetails: ['cloud_bands', 'hexagonal_storm', 'ring_shadows']
            },
            { 
                name: 'Uranus', 
                size: 22, 
                distance: 580, 
                speed: 82, 
                color: '#85c1e9', 
                ring: true,
                ringColor: 'rgba(133, 193, 233, 0.5)',
                atmosphere: true,
                atmosphereColor: 'rgba(133, 193, 233, 0.35)',
                surface: 'uranus',
                moons: 2,
                features: ['icy', 'tilted'],
                surfaceDetails: ['icy_surface', 'cloud_layers', 'tilted_axis']
            },
            { 
                name: 'Neptune', 
                size: 20, 
                distance: 660, 
                speed: 92, 
                color: '#5dade2', 
                ring: true,
                ringColor: 'rgba(93, 173, 226, 0.6)',
                atmosphere: true,
                atmosphereColor: 'rgba(93, 173, 226, 0.35)',
                surface: 'neptune',
                moons: 2,
                features: ['windy', 'blue'],
                surfaceDetails: ['wind_storms', 'dark_spots', 'icy_clouds']
            }
        ];
        
        planets.forEach((planet, index) => {
            // Create planet with enhanced styling
            const planetElement = document.createElement('div');
            planetElement.className = 'solar-planet';
            planetElement.setAttribute('data-planet', planet.name);
            
            // Enhanced planet styling with surface details
            const surfaceGradient = this.getEnhancedSurfaceGradient(planet);
            
            planetElement.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${planet.size}px !important;
                height: ${planet.size}px !important;
                background: ${surfaceGradient} !important;
                border-radius: 50% !important;
                --orbit-radius: ${planet.distance}px !important;
                animation: solarOrbit ${planet.speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 101 !important;
                box-shadow: 
                    0 0 15px ${planet.color},
                    0 0 25px ${planet.color}50,
                    0 0 35px ${planet.color}30,
                    inset 0 0 8px rgba(255, 255, 255, 0.4),
                    inset 0 0 4px rgba(255, 255, 255, 0.2) !important;
                margin: 0 !important;
                padding: 0 !important;
                position: relative !important;
            `;
            document.body.appendChild(planetElement);

            // Add enhanced atmospheric glow for planets with atmospheres
            if (planet.atmosphere) {
                const atmosphere = document.createElement('div');
                atmosphere.className = 'solar-atmosphere';
                atmosphere.style.cssText = `
                    position: absolute !important;
                    top: -6px !important;
                    left: -6px !important;
                    width: ${planet.size + 12}px !important;
                    height: ${planet.size + 12}px !important;
                    background: ${planet.atmosphereColor} !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    z-index: 100 !important;
                    filter: blur(3px) !important;
                    animation: atmosphereGlow 4s ease-in-out infinite !important;
                `;
                planetElement.appendChild(atmosphere);
            }

            // Create orbital ring with enhanced visibility
            const ring = document.createElement('div');
            ring.className = 'solar-orbit-ring';
            ring.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${planet.distance * 2}px !important;
                height: ${planet.distance * 2}px !important;
                transform: translate(-50%, -50%) !important;
                border: 1px solid rgba(255, 255, 255, 0.12) !important;
                border-radius: 50% !important;
                pointer-events: none !important;
                z-index: 100 !important;
                opacity: 0.5 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: none !important;
                box-shadow: 0 0 10px rgba(255, 255, 255, 0.05) !important;
            `;
            document.body.appendChild(ring);

            // Create enhanced planet rings for gas giants
            if (planet.ring) {
                const ringSize = planet.ringSize || 3.0;
                const planetRing = document.createElement('div');
                planetRing.className = 'solar-planet-ring';
                planetRing.style.cssText = `
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: ${planet.size * ringSize}px !important;
                    height: ${planet.size * 0.7}px !important;
                    transform: translate(-50%, -50%) !important;
                    background: ${this.getEnhancedRingGradient(planet)} !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    z-index: 102 !important;
                    animation: planetRingRotate ${planet.speed * 0.5}s linear infinite !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: 
                        0 0 12px ${planet.ringColor},
                        0 0 20px ${planet.ringColor}40 !important;
                `;
                document.body.appendChild(planetRing);
            }

            // Add enhanced moons for planets
            if (planet.moons > 0) {
                for (let i = 0; i < planet.moons; i++) {
                    const moon = document.createElement('div');
                    moon.className = 'solar-moon';
                    const moonSize = Math.max(4, planet.size * 0.3);
                    const moonDistance = planet.size * 1.4;
                    const moonOffset = (i * (360 / planet.moons)) + (Math.random() * 45);
                    
                    moon.style.cssText = `
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        width: ${moonSize}px !important;
                        height: ${moonSize}px !important;
                        background: ${this.getEnhancedMoonColor(planet.name, i)} !important;
                        border-radius: 50% !important;
                        --orbit-radius: ${moonDistance}px !important;
                        --moon-offset: ${moonOffset}deg !important;
                        animation: moonOrbit ${planet.speed * 0.35}s linear infinite !important;
                        pointer-events: none !important;
                        z-index: 103 !important;
                        box-shadow: 
                            0 0 8px rgba(192, 192, 192, 0.9),
                            0 0 12px rgba(192, 192, 192, 0.6),
                            inset 0 0 3px rgba(255, 255, 255, 0.4) !important;
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
     * Get enhanced surface gradient for planets with more realistic details
     */
    getEnhancedSurfaceGradient(planet) {
        const gradients = {
            mercury: `radial-gradient(circle, 
                ${planet.color} 0%, 
                ${this.darkenColor(planet.color, 0.15)} 30%, 
                ${this.darkenColor(planet.color, 0.3)} 60%, 
                ${this.darkenColor(planet.color, 0.5)} 100%)`,
            venus: `radial-gradient(circle, 
                ${planet.color} 0%, 
                ${this.darkenColor(planet.color, 0.1)} 25%, 
                ${this.darkenColor(planet.color, 0.25)} 50%, 
                ${this.darkenColor(planet.color, 0.4)} 100%)`,
            earth: `radial-gradient(circle, 
                #4a90e2 0%, 
                #357abd 20%, 
                #2d5aa0 40%, 
                #1e3a8a 60%, 
                #1e40af 80%, 
                #1e3a8a 100%)`,
            mars: `radial-gradient(circle, 
                #c1440e 0%, 
                #a0522d 25%, 
                #8b4513 50%, 
                #654321 75%, 
                #4a2c2a 100%)`,
            jupiter: `radial-gradient(circle, 
                #d4af37 0%, 
                #b8860b 15%, 
                #daa520 30%, 
                #cd853f 45%, 
                #8b4513 60%, 
                #654321 75%, 
                #4a2c2a 100%)`,
            saturn: `radial-gradient(circle, 
                #f4d03f 0%, 
                #f39c12 15%, 
                #e67e22 30%, 
                #d68910 45%, 
                #b7950b 60%, 
                #8b6914 75%, 
                #654321 100%)`,
            uranus: `radial-gradient(circle, 
                #85c1e9 0%, 
                #5dade2 25%, 
                #3498db 50%, 
                #2980b9 75%, 
                #1f618d 100%)`,
            neptune: `radial-gradient(circle, 
                #5dade2 0%, 
                #3498db 25%, 
                #2980b9 50%, 
                #1f618d 75%, 
                #154360 100%)`
        };
        return gradients[planet.surface] || `radial-gradient(circle, ${planet.color} 0%, ${this.darkenColor(planet.color, 0.3)} 100%)`;
    },

    /**
     * Get enhanced ring gradient for gas giants with more realistic appearance
     */
    getEnhancedRingGradient(planet) {
        const ringGradients = {
            jupiter: `linear-gradient(90deg, 
                transparent 0%, 
                ${planet.ringColor}25 10%, 
                ${planet.ringColor}70 30%, 
                ${planet.ringColor}90 45%, 
                ${planet.ringColor}70 55%, 
                ${planet.ringColor}25 70%, 
                transparent 100%)`,
            saturn: `linear-gradient(90deg, 
                transparent 0%, 
                ${planet.ringColor}35 5%, 
                ${planet.ringColor}80 25%, 
                ${planet.ringColor}95 40%, 
                ${planet.ringColor}80 55%, 
                ${planet.ringColor}35 75%, 
                transparent 100%)`,
            uranus: `linear-gradient(90deg, 
                transparent 0%, 
                ${planet.ringColor}30 15%, 
                ${planet.ringColor}75 35%, 
                ${planet.ringColor}90 45%, 
                ${planet.ringColor}75 55%, 
                ${planet.ringColor}30 75%, 
                transparent 100%)`,
            neptune: `linear-gradient(90deg, 
                transparent 0%, 
                ${planet.ringColor}40 10%, 
                ${planet.ringColor}85 30%, 
                ${planet.ringColor}95 40%, 
                ${planet.ringColor}85 50%, 
                ${planet.ringColor}40 70%, 
                transparent 100%)`
        };
        return ringGradients[planet.name.toLowerCase()] || `linear-gradient(90deg, transparent 0%, ${planet.ringColor}50 20%, ${planet.ringColor}85 50%, ${planet.ringColor}50 80%, transparent 100%)`;
    },

    /**
     * Get enhanced moon colors based on planet with more variety
     */
    getEnhancedMoonColor(planetName, moonIndex) {
        const moonColors = {
            earth: ['#c0c0c0', '#d3d3d3'],
            mars: ['#a0522d', '#8b7355', '#cd853f'],
            jupiter: ['#c0c0c0', '#d2b48c', '#f5deb3', '#deb887'],
            saturn: ['#c0c0c0', '#d2b48c', '#f5deb3', '#daa520']
        };
        const colors = moonColors[planetName.toLowerCase()] || ['#c0c0c0'];
        return colors[moonIndex % colors.length];
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