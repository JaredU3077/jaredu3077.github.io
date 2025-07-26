/**
 * Background Mixin for Particle System
 * Provides background-related functionality
 */

import { planets, surfaceGradients, moonColors, asteroidColors, kboColors } from './data/solarSystemData.js';

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
        document.querySelectorAll('.background-spinner, .solar-orb, .solar-sun, .solar-planet, .solar-planet-ring, .solar-moon, .solar-atmosphere, .solar-asteroid, .solar-comet, .solar-corona, .solar-kbo, .comet-tail, .solar-orbit-ring, .planet-label').forEach(element => element.remove());

        const fragment = document.createDocumentFragment();

        const sun = this.createStyledElement('div', 'solar-sun', `
            position: absolute !important;
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
            z-index: 10 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
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
        `, fragment);

        const corona = this.createStyledElement('div', 'solar-corona', `
            position: absolute !important;
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
            z-index: 9 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            animation: coronaPulse 8s ease-in-out infinite !important;
        `, fragment);

        planets.forEach(planet => {
            const planetElement = this.createPlanet(planet, fragment);
        });

        this.createAsteroidBelt(420, 480, fragment);
        this.createKuiperBelt(800, 900, fragment);
        this.createComet(fragment);

        // Append to desktop container instead of body to ensure proper layering
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.appendChild(fragment);
        } else {
            document.body.appendChild(fragment);
        }

        // Hide ambient glow overlay if it exists
        const glow = document.querySelector('.ambient-glow');
        if (glow) glow.style.display = 'none';
    },

    createStyledElement(tag, className, styleText, parent) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (styleText) element.style.cssText = styleText;
        if (parent) parent.appendChild(element);
        return element;
    },

    createPlanet(planet, parent) {
        const planetElement = this.createStyledElement('div', 'solar-planet', `
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: ${planet.size}px !important;
            height: ${planet.size}px !important;
            background: ${surfaceGradients[planet.surface] || planet.color} !important;
            border-radius: 50% !important;
            --orbit-radius: ${planet.distance}px !important;
            --planet-gravity: ${planet.gravity} !important;
            --planet-temperature: ${planet.temperature} !important;
            animation: solarOrbit ${planet.speed}s linear infinite !important;
            pointer-events: auto !important;
            z-index: 11 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            box-shadow: 
                0 0 20px ${planet.color},
                0 0 35px ${planet.color}60,
                0 0 50px ${planet.color}40,
                inset 0 0 10px rgba(255, 255, 255, 0.5),
                inset 0 0 5px rgba(255, 255, 255, 0.3) !important;
            margin: 0 !important;
            padding: 0 !important;
            transform-style: preserve-3d !important;
            cursor: pointer !important;
        `, parent);
        planetElement.setAttribute('data-planet', planet.name);

        if (planet.atmosphere) {
            this.createAtmosphere(planetElement, planet);
        }

        if (planet.ring) {
            this.createPlanetRing(planet, planetElement);
        }

        if (planet.moons > 0) {
            this.createMoons(planet, planetElement);
        }

        const label = this.createStyledElement('div', 'planet-label', `
            position: absolute !important;
            bottom: -20px !important;
            left: 50% !important;
            transform: translate(-50%, 0) !important;
            color: rgba(255,255,255,0.8) !important;
            font-size: 12px !important;
            text-shadow: 0 0 3px black !important;
            white-space: nowrap !important;
            pointer-events: none !important;
        `, planetElement);
        label.textContent = planet.name;

        planetElement.addEventListener('click', () => {
            alert(`Planet: ${planet.name}\nGravity: ${planet.gravity} Earth g\nTemperature: ${planet.temperature} °C\nMoons: ${planet.moons}\nComposition: ${planet.composition.join(', ')}`);
        });

        return planetElement;
    },

    createAtmosphere(parent, planet) {
        this.createStyledElement('div', 'solar-atmosphere', `
            position: absolute !important;
            top: -8px !important;
            left: -8px !important;
            width: ${planet.size + 16}px !important;
            height: ${planet.size + 16}px !important;
            background: ${planet.atmosphereColor} !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 10 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            filter: blur(4px) !important;
            animation: atmosphereGlow 6s ease-in-out infinite !important;
        `, parent);
    },



    createPlanetRing(planet, parent) {
        const ringSize = planet.ringSize || 3.5;
        const ringGradient = `conic-gradient(from 0deg, 
            ${planet.ringColor} 0deg, 
            rgba(255, 255, 255, 0.3) 45deg, 
            ${planet.ringColor} 90deg, 
            rgba(255, 255, 255, 0.1) 135deg, 
            ${planet.ringColor} 180deg, 
            rgba(255, 255, 255, 0.2) 225deg, 
            ${planet.ringColor} 270deg, 
            rgba(255, 255, 255, 0.05) 315deg, 
            ${planet.ringColor} 360deg)`;
        this.createStyledElement('div', 'solar-planet-ring', `
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            width: ${planet.size * ringSize}px !important;
            height: ${planet.size * 0.8}px !important;
            transform: translate(-50%, -50%) !important;
            background: ${ringGradient} !important;
            border-radius: 50% !important;
            pointer-events: none !important;
            z-index: 12 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            animation: planetRingRotate ${planet.speed * 0.4}s linear infinite !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: 
                0 0 15px ${planet.ringColor},
                0 0 25px ${planet.ringColor}50,
                inset 0 0 10px rgba(255, 255, 255, 0.1) !important;
        `, parent);
    },

    createMoons(planet, parent) {
        const maxMoons = 10; // Limit for performance
        const numMoons = Math.min(planet.moons, maxMoons);
        for (let i = 0; i < numMoons; i++) {
            const moonSize = Math.max(5, planet.size * 0.25 * Math.random() * 0.5 + 0.5); // Vary size
            const moonDistance = planet.size * (1.2 + Math.random() * 1.2);
            const moonOffset = (i * (360 / numMoons)) + (Math.random() * 60);
            const moonSpeed = planet.speed * (0.3 + Math.random() * 0.2);
            const colors = moonColors[planet.name.toLowerCase()] || ['#c0c0c0'];
            const moonColor = colors[i % colors.length];

            this.createStyledElement('div', 'solar-moon', `
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: ${moonSize}px !important;
                height: ${moonSize}px !important;
                background: ${moonColor} !important;
                border-radius: 50% !important;
                --orbit-radius: ${moonDistance}px !important;
                --moon-offset: ${moonOffset}deg !important;
                animation: moonOrbit ${moonSpeed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 13 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
                box-shadow: 
                    0 0 10px rgba(192, 192, 192, 0.9),
                    0 0 15px rgba(192, 192, 192, 0.7),
                    0 0 20px rgba(192, 192, 192, 0.5),
                    inset 0 0 4px rgba(255, 255, 255, 0.5) !important;
                margin: 0 !important;
                padding: 0 !important;
            `, parent);
        }
    },

    /**
     * Creates asteroid belt with realistic distribution
     */
    createAsteroidBelt(innerRadius, outerRadius, parent) {
        const numAsteroids = 25;
        for (let i = 0; i < numAsteroids; i++) {
            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            const size = Math.random() * 3 + 1;
            const speed = 45 + Math.random() * 15;
            const offset = Math.random() * 360;
            const color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];

            this.createStyledElement('div', 'solar-asteroid', `
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                width: ${size}px !important;
                height: ${size}px !important;
                background: ${color} !important;
                border-radius: 50% !important;
                --orbit-radius: ${distance}px !important;
                --asteroid-offset: ${offset}deg !important;
                animation: asteroidOrbit ${speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 14 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
                box-shadow: 0 0 5px rgba(139, 69, 19, 0.8) !important;
                margin: 0 !important;
                padding: 0 !important;
            `, parent);
        }
    },

    /**
     * Creates Kuiper belt with icy objects
     */
    createKuiperBelt(innerRadius, outerRadius, parent) {
        const numObjects = 15;
        for (let i = 0; i < numObjects; i++) {
            const distance = innerRadius + Math.random() * (outerRadius - innerRadius);
            const size = Math.random() * 4 + 2;
            const speed = 95 + Math.random() * 20;
            const offset = Math.random() * 360;
            const color = kboColors[Math.floor(Math.random() * kboColors.length)];

            this.createStyledElement('div', 'solar-kbo', `
                position: absolute !important;
                top: 50% !important;
                left: 50% !important;
                width: ${size}px !important;
                height: ${size}px !important;
                background: ${color} !important;
                border-radius: 50% !important;
                --orbit-radius: ${distance}px !important;
                --kbo-offset: ${offset}deg !important;
                animation: kboOrbit ${speed}s linear infinite !important;
                pointer-events: none !important;
                z-index: 15 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
                box-shadow: 0 0 8px rgba(173, 216, 230, 0.6) !important;
                margin: 0 !important;
                padding: 0 !important;
            `, parent);
        }
    },

    /**
     * Creates a comet with realistic trajectory
     */
    createComet(parent) {
        const size = 8;

        this.createStyledElement('div', 'solar-comet', `
            position: absolute !important;
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
            z-index: 16 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            box-shadow: 
                0 0 15px rgba(255, 255, 255, 0.8),
                0 0 25px rgba(173, 216, 230, 0.6),
                0 0 35px rgba(135, 206, 235, 0.4) !important;
            animation: cometTrajectory 120s linear infinite !important;
            margin: 0 !important;
            padding: 0 !important;
        `, parent);

        this.createStyledElement('div', 'comet-tail', `
            position: absolute !important;
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
            z-index: 15 !important; /* Lower than terminal window (2000) and neuOS widget (100) */
            animation: cometTrajectory 120s linear infinite !important;
            margin: 0 !important;
            padding: 0 !important;
        `, parent);
    },

    /**
     * Creates ambient glow effects
     */
    createAmbientGlow() {
        const glow = document.createElement('div');
        glow.className = 'ambient-glow';
        glow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            pointer-events: none;
            z-index: 5;
        `;
        // Append to desktop container instead of body to ensure proper layering
        const desktop = document.getElementById('desktop');
        if (desktop) {
            desktop.appendChild(glow);
        } else {
            document.body.appendChild(glow);
        }
    },

    /**
     * Updates background effects based on particle mode
     */
    updateBackgroundEffects() {
        // No fading logic! This function is intentionally left blank.
    }
};