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
     * Creates enhanced solar system with realistic physics and interactions
     */
    createBackgroundSpinnerRings() {
        // Remove any existing solar system elements
        document.querySelectorAll('.background-spinner, .solar-orb, .solar-sun, .solar-planet, .solar-planet-ring, .solar-moon, .solar-atmosphere, .solar-asteroid, .solar-comet').forEach(element => element.remove());
        
        // Create the central sun with enhanced realistic effects
        const sun = document.createElement('div');
        sun.className = 'solar-sun';
        sun.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: 140px !important;
            height: 140px !important;
            transform: translate(-50%, -50%) !important;
            background: radial-gradient(circle, 
                #fff8dc 0%, 
                #fff5e6 3%, 
                #ffd700 12%, 
                #ff8c00 25%, 
                #ff4500 45%, 
                #8b0000 70%, 
                #4a0000 85%,
                #1a0000 100%) !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 99 !important;
            box-shadow: 
                0 0 60px #ffd700,
                0 0 120px #ff8c00,
                0 0 180px #ff4500,
                0 0 240px rgba(255, 69, 0, 0.5),
                0 0 300px rgba(255, 69, 0, 0.3),
                0 0 360px rgba(255, 69, 0, 0.2),
                inset 0 0 50px rgba(255, 215, 0, 0.6),
                inset 0 0 25px rgba(255, 255, 255, 0.4) !important;
            animation: sunPulse 12s ease-in-out infinite !important;
        `;
        document.body.appendChild(sun);

        // Add solar corona effect
        const corona = document.createElement('div');
        corona.className = 'solar-corona';
        corona.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: 200px !important;
            height: 200px !important;
            transform: translate(-50%, -50%) !important;
            background: radial-gradient(circle, 
                rgba(255, 215, 0, 0.3) 0%, 
                rgba(255, 140, 0, 0.2) 30%, 
                rgba(255, 69, 0, 0.1) 60%, 
                transparent 100%) !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 98 !important;
            animation: coronaPulse 8s ease-in-out infinite !important;
        `;
        document.body.appendChild(corona);

        // Enhanced solar system planets with realistic characteristics and physics
        const planets = [
            { 
                name: 'Mercury', 
                size: 16, 
                distance: 180, 
                speed: 18, 
                color: '#8c7853', 
                ring: false,
                atmosphere: false,
                surface: 'mercury',
                moons: 0,
                features: ['cratered', 'rocky'],
                surfaceDetails: ['impact_craters', 'volcanic_plains', 'scarps'],
                gravity: 0.38,
                temperature: 427,
                composition: ['iron', 'nickel', 'sulfur']
            },
            { 
                name: 'Venus', 
                size: 20, 
                distance: 240, 
                speed: 28, 
                color: '#e6be8a', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(255, 193, 7, 0.5)',
                surface: 'venus',
                moons: 0,
                features: ['cloudy', 'volcanic'],
                surfaceDetails: ['sulfuric_clouds', 'volcanic_highlands', 'impact_craters'],
                gravity: 0.91,
                temperature: 462,
                composition: ['carbon_dioxide', 'nitrogen', 'sulfuric_acid']
            },
            { 
                name: 'Earth', 
                size: 22, 
                distance: 300, 
                speed: 38, 
                color: '#4a90e2', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(74, 144, 226, 0.3)',
                surface: 'earth',
                moons: 1,
                features: ['oceans', 'continents'],
                surfaceDetails: ['ocean_blue', 'continental_green', 'polar_ice'],
                gravity: 1.0,
                temperature: 15,
                composition: ['nitrogen', 'oxygen', 'water']
            },
            { 
                name: 'Mars', 
                size: 18, 
                distance: 360, 
                speed: 48, 
                color: '#c1440e', 
                ring: false,
                atmosphere: true,
                atmosphereColor: 'rgba(193, 68, 14, 0.3)',
                surface: 'mars',
                moons: 2,
                features: ['red', 'dusty'],
                surfaceDetails: ['red_plains', 'dust_storms', 'polar_caps'],
                gravity: 0.38,
                temperature: -63,
                composition: ['carbon_dioxide', 'nitrogen', 'argon']
            },
            { 
                name: 'Jupiter', 
                size: 36, 
                distance: 460, 
                speed: 58, 
                color: '#d4af37', 
                ring: true,
                ringColor: 'rgba(212, 175, 55, 0.6)',
                atmosphere: true,
                atmosphereColor: 'rgba(212, 175, 55, 0.4)',
                surface: 'jupiter',
                moons: 6,
                features: ['striped', 'stormy'],
                surfaceDetails: ['cloud_bands', 'great_red_spot', 'storm_systems'],
                gravity: 2.34,
                temperature: -110,
                composition: ['hydrogen', 'helium', 'methane']
            },
            { 
                name: 'Saturn', 
                size: 32, 
                distance: 540, 
                speed: 68, 
                color: '#f4d03f', 
                ring: true,
                ringColor: 'rgba(244, 208, 63, 0.8)',
                ringSize: 4.5,
                atmosphere: true,
                atmosphereColor: 'rgba(244, 208, 63, 0.4)',
                surface: 'saturn',
                moons: 4,
                features: ['ringed', 'golden'],
                surfaceDetails: ['cloud_bands', 'hexagonal_storm', 'ring_shadows'],
                gravity: 0.93,
                temperature: -140,
                composition: ['hydrogen', 'helium', 'ammonia']
            },
            { 
                name: 'Uranus', 
                size: 24, 
                distance: 620, 
                speed: 78, 
                color: '#85c1e9', 
                ring: true,
                ringColor: 'rgba(133, 193, 233, 0.6)',
                atmosphere: true,
                atmosphereColor: 'rgba(133, 193, 233, 0.4)',
                surface: 'uranus',
                moons: 3,
                features: ['icy', 'tilted'],
                surfaceDetails: ['icy_surface', 'cloud_layers', 'tilted_axis'],
                gravity: 0.89,
                temperature: -195,
                composition: ['hydrogen', 'helium', 'methane']
            },
            { 
                name: 'Neptune', 
                size: 22, 
                distance: 700, 
                speed: 88, 
                color: '#5dade2', 
                ring: true,
                ringColor: 'rgba(93, 173, 226, 0.7)',
                atmosphere: true,
                atmosphereColor: 'rgba(93, 173, 226, 0.4)',
                surface: 'neptune',
                moons: 3,
                features: ['windy', 'blue'],
                surfaceDetails: ['wind_storms', 'dark_spots', 'icy_clouds'],
                gravity: 1.12,
                temperature: -200,
                composition: ['hydrogen', 'helium', 'methane']
            }
        ];
        
        planets.forEach((planet, index) => {
            // Create planet with enhanced realistic styling
            const planetElement = document.createElement('div');
            planetElement.className = 'solar-planet';
            planetElement.setAttribute('data-planet', planet.name);
            
            // Enhanced planet styling with realistic surface details
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
                --planet-gravity: ${planet.gravity} !important;
                --planet-temperature: ${planet.temperature} !important;
                animation: solarOrbit ${planet.speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 101 !important;
                box-shadow: 
                    0 0 20px ${planet.color},
                    0 0 35px ${planet.color}60,
                    0 0 50px ${planet.color}40,
                    inset 0 0 10px rgba(255, 255, 255, 0.5),
                    inset 0 0 5px rgba(255, 255, 255, 0.3) !important;
                margin: 0 !important;
                padding: 0 !important;
                position: relative !important;
                transform-style: preserve-3d !important;
            `;
            document.body.appendChild(planetElement);

            // Add enhanced atmospheric glow with realistic composition
            if (planet.atmosphere) {
                const atmosphere = document.createElement('div');
                atmosphere.className = 'solar-atmosphere';
                atmosphere.style.cssText = `
                    position: absolute !important;
                    top: -8px !important;
                    left: -8px !important;
                    width: ${planet.size + 16}px !important;
                    height: ${planet.size + 16}px !important;
                    background: ${planet.atmosphereColor} !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    z-index: 100 !important;
                    filter: blur(4px) !important;
                    animation: atmosphereGlow 6s ease-in-out infinite !important;
                `;
                planetElement.appendChild(atmosphere);
            }

            // Create enhanced orbital ring with gravitational field visualization
            const ring = document.createElement('div');
            ring.className = 'solar-orbit-ring';
            ring.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${planet.distance * 2}px !important;
                height: ${planet.distance * 2}px !important;
                transform: translate(-50%, -50%) !important;
                border: 1px solid rgba(255, 255, 255, 0.15) !important;
                border-radius: 50% !important;
                pointer-events: none !important;
                z-index: 100 !important;
                opacity: 0.6 !important;
                margin: 0 !important;
                padding: 0 !important;
                background: none !important;
                box-shadow: 
                    0 0 15px rgba(255, 255, 255, 0.08),
                    inset 0 0 15px rgba(255, 255, 255, 0.02) !important;
                animation: orbitGlow ${planet.speed * 0.1}s linear infinite !important;
            `;
            document.body.appendChild(ring);

            // Create enhanced planet rings for gas giants with realistic composition
            if (planet.ring) {
                const ringSize = planet.ringSize || 3.5;
                const planetRing = document.createElement('div');
                planetRing.className = 'solar-planet-ring';
                planetRing.style.cssText = `
                    position: fixed !important;
                    top: 50% !important;
                    left: 50% !important;
                    width: ${planet.size * ringSize}px !important;
                    height: ${planet.size * 0.8}px !important;
                    transform: translate(-50%, -50%) !important;
                    background: ${this.getEnhancedRingGradient(planet)} !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                    z-index: 102 !important;
                    animation: planetRingRotate ${planet.speed * 0.4}s linear infinite !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    box-shadow: 
                        0 0 15px ${planet.ringColor},
                        0 0 25px ${planet.ringColor}50,
                        inset 0 0 10px rgba(255, 255, 255, 0.1) !important;
                `;
                document.body.appendChild(planetRing);
            }

            // Add enhanced moons with realistic orbital mechanics
            if (planet.moons > 0) {
                for (let i = 0; i < planet.moons; i++) {
                    const moon = document.createElement('div');
                    moon.className = 'solar-moon';
                    const moonSize = Math.max(5, planet.size * 0.25);
                    const moonDistance = planet.size * 1.6;
                    const moonOffset = (i * (360 / planet.moons)) + (Math.random() * 60);
                    const moonSpeed = planet.speed * (0.3 + Math.random() * 0.2);
                    
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
                        animation: moonOrbit ${moonSpeed}s linear infinite !important;
                        pointer-events: none !important;
                        z-index: 103 !important;
                        box-shadow: 
                            0 0 10px rgba(192, 192, 192, 0.9),
                            0 0 15px rgba(192, 192, 192, 0.7),
                            0 0 20px rgba(192, 192, 192, 0.5),
                            inset 0 0 4px rgba(255, 255, 255, 0.5) !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    `;
                    document.body.appendChild(moon);
                }
            }
        });

        // Create asteroid belt between Mars and Jupiter
        this.createAsteroidBelt(420, 480);

        // Create Kuiper belt beyond Neptune
        this.createKuiperBelt(800, 900);

        // Create comet with realistic trajectory
        this.createComet();

        // Hide ambient glow overlay if it exists
        const glow = document.querySelector('.ambient-glow');
        if (glow) glow.style.display = 'none';
    },

    /**
     * Creates asteroid belt with realistic distribution
     */
    createAsteroidBelt(innerRadius, outerRadius) {
        const numAsteroids = 25;
        for (let i = 0; i < numAsteroids; i++) {
            const asteroid = document.createElement('div');
            asteroid.className = 'solar-asteroid';
            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            const size = Math.random() * 3 + 1;
            const speed = 45 + Math.random() * 15;
            const offset = Math.random() * 360;
            
            asteroid.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${size}px !important;
                height: ${size}px !important;
                background: ${this.getAsteroidColor()} !important;
                border-radius: 50% !important;
                --orbit-radius: ${distance}px !important;
                --asteroid-offset: ${offset}deg !important;
                animation: asteroidOrbit ${speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 104 !important;
                box-shadow: 0 0 5px rgba(139, 69, 19, 0.8) !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            document.body.appendChild(asteroid);
        }
    },

    /**
     * Creates Kuiper belt with icy objects
     */
    createKuiperBelt(innerRadius, outerRadius) {
        const numObjects = 15;
        for (let i = 0; i < numObjects; i++) {
            const kbo = document.createElement('div');
            kbo.className = 'solar-kbo';
            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            const size = Math.random() * 4 + 2;
            const speed = 95 + Math.random() * 20;
            const offset = Math.random() * 360;
            
            kbo.style.cssText = `
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                width: ${size}px !important;
                height: ${size}px !important;
                background: ${this.getKBOColor()} !important;
                border-radius: 50% !important;
                --orbit-radius: ${distance}px !important;
                --kbo-offset: ${offset}deg !important;
                animation: kboOrbit ${speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 105 !important;
                box-shadow: 0 0 8px rgba(173, 216, 230, 0.6) !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            document.body.appendChild(kbo);
        }
    },

    /**
     * Creates a comet with realistic trajectory
     */
    createComet() {
        const comet = document.createElement('div');
        comet.className = 'solar-comet';
        const size = 8;
        
        comet.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: ${size}px !important;
            height: ${size}px !important;
            background: radial-gradient(circle, 
                rgba(255, 255, 255, 0.9) 0%, 
                rgba(173, 216, 230, 0.7) 30%, 
                rgba(135, 206, 235, 0.5) 60%, 
                transparent 100%) !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 106 !important;
            box-shadow: 
                0 0 15px rgba(255, 255, 255, 0.8),
                0 0 25px rgba(173, 216, 230, 0.6),
                0 0 35px rgba(135, 206, 235, 0.4) !important;
            animation: cometTrajectory 120s linear infinite !important;
            margin: 0 !important;
            padding: 0 !important;
        `;
        document.body.appendChild(comet);

        // Add comet tail
        const tail = document.createElement('div');
        tail.className = 'comet-tail';
        tail.style.cssText = `
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            width: 60px !important;
            height: 4px !important;
            background: linear-gradient(90deg, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(173, 216, 230, 0.6) 30%, 
                rgba(135, 206, 235, 0.4) 60%, 
                transparent 100%) !important;
            border-radius: 2px !important;
            pointer-events: none !important;
            z-index: 105 !important;
            animation: cometTrajectory 120s linear infinite !important;
            margin: 0 !important;
            padding: 0 !important;
        `;
        document.body.appendChild(tail);
    },

    /**
     * Gets enhanced surface gradient for planets
     */
    getEnhancedSurfaceGradient(planet) {
        const gradients = {
            mercury: 'radial-gradient(circle, #8c7853 0%, #6b5b47 50%, #4a3d3b 100%)',
            venus: 'radial-gradient(circle, #e6be8a 0%, #d4a574 40%, #b8860b 80%, #8b6914 100%)',
            earth: 'radial-gradient(circle, #4a90e2 0%, #357abd 40%, #2e5a8a 70%, #1e3a5f 100%)',
            mars: 'radial-gradient(circle, #c1440e 0%, #a0522d 40%, #8b4513 70%, #654321 100%)',
            jupiter: 'radial-gradient(circle, #d4af37 0%, #b8860b 30%, #daa520 60%, #cd853f 100%)',
            saturn: 'radial-gradient(circle, #f4d03f 0%, #f39c12 30%, #e67e22 60%, #d35400 100%)',
            uranus: 'radial-gradient(circle, #85c1e9 0%, #5dade2 40%, #3498db 70%, #2980b9 100%)',
            neptune: 'radial-gradient(circle, #5dade2 0%, #3498db 40%, #2980b9 70%, #1f618d 100%)'
        };
        return gradients[planet.surface] || planet.color;
    },

    /**
     * Gets enhanced ring gradient for gas giants
     */
    getEnhancedRingGradient(planet) {
        return `conic-gradient(from 0deg, 
            ${planet.ringColor} 0deg, 
            rgba(255, 255, 255, 0.3) 45deg, 
            ${planet.ringColor} 90deg, 
            rgba(255, 255, 255, 0.1) 135deg, 
            ${planet.ringColor} 180deg, 
            rgba(255, 255, 255, 0.2) 225deg, 
            ${planet.ringColor} 270deg, 
            rgba(255, 255, 255, 0.05) 315deg, 
            ${planet.ringColor} 360deg)`;
    },

    /**
     * Gets enhanced moon color based on planet
     */
    getEnhancedMoonColor(planetName, moonIndex) {
        const moonColors = {
            earth: ['#f5f5dc', '#d3d3d3'],
            mars: ['#deb887', '#cd853f'],
            jupiter: ['#f0e68c', '#daa520', '#b8860b', '#cd853f', '#d2691e', '#8b4513'],
            saturn: ['#f5deb3', '#deb887', '#d2b48c', '#bc8f8f'],
            uranus: ['#e0ffff', '#b0e0e6', '#87ceeb'],
            neptune: ['#add8e6', '#87ceeb', '#4682b4']
        };
        const colors = moonColors[planetName.toLowerCase()] || ['#c0c0c0'];
        return colors[moonIndex % colors.length];
    },

    /**
     * Gets asteroid color
     */
    getAsteroidColor() {
        const colors = ['#8b4513', '#a0522d', '#cd853f', '#d2691e', '#b8860b'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    /**
     * Gets Kuiper belt object color
     */
    getKBOColor() {
        const colors = ['#e0ffff', '#b0e0e6', '#87ceeb', '#add8e6', '#f0f8ff'];
        return colors[Math.floor(Math.random() * colors.length)];
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