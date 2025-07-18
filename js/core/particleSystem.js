import { backgroundMixin } from './backgroundMixin.js';
import { mouseMixin } from './mouseMixin.js';
import { particleCreationMixin } from './particleCreationMixin.js';
import { interactionMixin } from './interactionMixin.js';
import { generationMixin } from './generationMixin.js';
import { animationMixin } from './animationMixin.js';
import { controlMixin } from './controlMixin.js';
import { modeMixin } from './modeMixin.js';

export class ParticleSystem {
    constructor() {
        // Enhanced particle system initialization
        this.particles = [];
        this.particleCount = 60; // Optimized particle count for performance
        this.particleContainer = null;
        this.particleAnimationRunning = true;
        this.particleGenerationRate = 1000; // Optimized generation rate
        this.particleMode = 'normal';
        this.startTime = Date.now();
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Advanced particle physics with realistic parameters
        this.particlePhysics = {
            gravity: 0.015,
            wind: 0.008,
            turbulence: 0.003,
            attraction: 0.025,
            repulsion: 0.015,
            friction: 0.98,
            bounce: 0.7,
            mass: 1.0,
            temperature: 20,
            pressure: 1.0
        };
        
        // Enhanced color schemes with more variety and realism
        this.colorSchemes = {
            chillhouse: ['var(--color-accent-blue)', 'var(--color-accent-cyan)', '#4682b4', '#5f9ea0', '#20b2aa', '#87ceeb'],
            sunset: ['var(--color-accent-orange)', '#ff8c42', '#ffa07a', '#ffb347', 'var(--color-accent-yellow)', '#ffd700'],
            neon: ['#ff6b9d', 'var(--color-accent-cyan)', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'],
            cosmic: ['var(--color-accent-purple)', '#9370db', '#ba55d3', '#da70d6', '#ee82ee', '#dda0dd'],
            ocean: ['#00ced1', 'var(--color-accent-cyan)', '#48d1cc', '#20b2aa', '#008b8b', '#40e0d0'],
            forest: ['#228b22', 'var(--color-accent-green)', '#90ee90', '#98fb98', '#00ff7f', '#32cd32'],
            aurora: ['#00ff88', '#00ffff', '#0088ff', '#8800ff', '#ff0088', '#ff8800'],
            fire: ['#ff4500', '#ff6347', '#ff7f50', '#ff8c00', '#ffa500', '#ffd700']
        };
        
        this.currentColorScheme = 'chillhouse';
        this.currentParticleColor = 0;

        this.lastCleanupTime = null;
        
        // Advanced particle properties
        this.particleProperties = {
            maxSize: 8,
            minSize: 2,
            maxSpeed: 2.5,
            minSpeed: 0.5,
            maxLife: 15000,
            minLife: 8000,
            maxOpacity: 0.9,
            minOpacity: 0.3
        };
        
        // Enhanced interaction zones
        this.interactionZones = {
            mouse: { radius: 120, strength: 0.8 },
            gravity: { radius: 200, strength: 0.3 },
            repulsion: { radius: 80, strength: 0.6 }
        };
        
        // Performance optimization
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Advanced effects
        this.effects = {
            trails: true,
            glow: true,
            sparkles: true,
            connections: true,
            waveEffect: true
        };
        
        // Particle clustering for realistic behavior
        this.clusters = [];
        this.maxClusters = 5;
        this.clusterRadius = 50;
    }

    init() {
        this.setupParticleSystem();
        this.setupMouseTracking();
    }

    setupParticleSystem() {
        
        // Create enhanced particle container with improved styling
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-container';
        this.particleContainer.id = 'particleContainer';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1000;
            overflow: hidden;
            background: transparent !important;
            filter: contrast(1.1) brightness(1.05);
        `;
        document.body.appendChild(this.particleContainer);

        // Create enhanced background elements
        this.createEnhancedBackgroundElements();

        // Initialize enhanced particle system
        this.particles = [];
        this.particleCount = 40;
        this.particleGenerationRate = 1000;
        this.particleAnimationRunning = true;
        this.particleMode = 'normal';
        this.startTime = Date.now();

        // Generate initial particles
        this.generateParticles();
        
        // Start enhanced particle animation loop
        this.animateParticles();
        
        // Start continuous particle generation
        this.startContinuousGeneration();
        
        // Initialize advanced effects
        this.initializeAdvancedEffects();
    }

    /**
     * Initialize advanced particle effects
     */
    initializeAdvancedEffects() {
        // Create particle trails container
        if (this.effects.trails) {
            this.trailsContainer = document.createElement('div');
            this.trailsContainer.className = 'particle-trails';
            this.trailsContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 999;
                background: transparent;
            `;
            document.body.appendChild(this.trailsContainer);
        }
        
        // Create connection lines container
        if (this.effects.connections) {
            this.connectionsContainer = document.createElement('canvas');
            this.connectionsContainer.className = 'particle-connections';
            this.connectionsContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 998;
                background: transparent;
            `;
            this.connectionsCtx = this.connectionsContainer.getContext('2d');
            document.body.appendChild(this.connectionsContainer);
            this.resizeConnectionsCanvas();
        }
        
        // Create sparkles container
        if (this.effects.sparkles) {
            this.sparklesContainer = document.createElement('div');
            this.sparklesContainer.className = 'particle-sparkles';
            this.sparklesContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 997;
                background: transparent;
            `;
            document.body.appendChild(this.sparklesContainer);
        }
    }

    /**
     * Resize connections canvas
     */
    resizeConnectionsCanvas() {
        if (this.connectionsContainer) {
            this.connectionsContainer.width = window.innerWidth;
            this.connectionsContainer.height = window.innerHeight;
        }
    }

    /**
     * Create enhanced particle with advanced properties
     */
    createEnhancedParticle() {
        const particle = {
            id: Date.now() + Math.random(),
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * this.particleProperties.maxSpeed,
            vy: (Math.random() - 0.5) * this.particleProperties.maxSpeed,
            size: Math.random() * (this.particleProperties.maxSize - this.particleProperties.minSize) + this.particleProperties.minSize,
            opacity: Math.random() * (this.particleProperties.maxOpacity - this.particleProperties.minOpacity) + this.particleProperties.minOpacity,
            life: Math.random() * (this.particleProperties.maxLife - this.particleProperties.minLife) + this.particleProperties.minLife,
            maxLife: this.particleProperties.maxLife,
            color: this.getNextParticleColor(),
            element: null,
            trail: [],
            maxTrailLength: 10,
            cluster: null,
            temperature: Math.random() * 40 + 10,
            charge: (Math.random() - 0.5) * 2,
            mass: Math.random() * 0.5 + 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 4,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            glow: Math.random() * 0.5 + 0.5,
            sparkle: Math.random() > 0.8,
            wave: Math.random() * Math.PI * 2,
            waveSpeed: Math.random() * 0.03 + 0.01
        };
        
        return particle;
    }

    /**
     * Get next particle color with enhanced variety
     */
    getNextParticleColor() {
        const colors = this.colorSchemes[this.currentColorScheme];
        const color = colors[this.currentParticleColor % colors.length];
        this.currentParticleColor++;
        return color;
    }

    /**
     * Update particle physics with advanced calculations
     */
    updateParticlePhysics() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime < this.frameInterval) {
            return; // Skip frame for performance
        }
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        this.particles.forEach(particle => {
            // Apply advanced physics forces
            this.applyAdvancedPhysicsForces(particle, deltaTime);
            
            // Update position with velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply boundary constraints with bounce
            this.applyBoundaryConstraints(particle);
            
            // Update particle properties
            this.updateParticleProperties(particle, deltaTime);
            
            // Update visual element
            this.updateParticleElement(particle);
            
            // Update trail
            this.updateParticleTrail(particle);
        });
        
        // Update clusters
        this.updateClusters();
        
        // Update advanced effects
        this.updateAdvancedEffects();
        
        // Cleanup old particles
        this.cleanupOffscreenParticles();
    }

    /**
     * Apply advanced physics forces to particle
     */
    applyAdvancedPhysicsForces(particle, deltaTime) {
        const dt = deltaTime / 16; // Normalize to 60fps
        
        // Apply gravity with mass consideration
        particle.vy += this.particlePhysics.gravity * particle.mass * dt;
        
        // Apply wind with turbulence
        particle.vx += this.particlePhysics.wind * dt;
        particle.vx += (Math.random() - 0.5) * this.particlePhysics.turbulence * dt;
        particle.vy += (Math.random() - 0.5) * this.particlePhysics.turbulence * dt;
        
        // Apply friction
        particle.vx *= this.particlePhysics.friction;
        particle.vy *= this.particlePhysics.friction;
        
        // Apply temperature effects
        const tempEffect = (particle.temperature - 20) / 100;
        particle.vx += tempEffect * 0.01 * dt;
        particle.vy += tempEffect * 0.01 * dt;
        
        // Apply charge interactions
        if (Math.abs(particle.charge) > 0.1) {
            this.particles.forEach(otherParticle => {
                if (particle.id !== otherParticle.id) {
                    const distance = Math.sqrt(
                        Math.pow(particle.x - otherParticle.x, 2) + 
                        Math.pow(particle.y - otherParticle.y, 2)
                    );
                    
                    if (distance < 100 && distance > 0) {
                        const force = (particle.charge * otherParticle.charge) / (distance * distance) * 0.001;
                        const dx = (otherParticle.x - particle.x) / distance;
                        const dy = (otherParticle.y - particle.y) / distance;
                        
                        particle.vx += dx * force * dt;
                        particle.vy += dy * force * dt;
                    }
                }
            });
        }
        
        // Apply mouse interaction
        this.applyMouseInteraction(particle);
        
        // Apply cluster forces
        this.applyClusterForces(particle);
    }

    /**
     * Apply mouse interaction to particle
     */
    applyMouseInteraction(particle) {
        const distance = Math.sqrt(
            Math.pow(particle.x - this.mouseX, 2) + 
            Math.pow(particle.y - this.mouseY, 2)
        );
        
        if (distance < this.interactionZones.mouse.radius) {
            const strength = (this.interactionZones.mouse.radius - distance) / this.interactionZones.mouse.radius;
            const dx = (this.mouseX - particle.x) / distance;
            const dy = (this.mouseY - particle.y) / distance;
            
            particle.vx += dx * strength * this.interactionZones.mouse.strength * 0.02;
            particle.vy += dy * strength * this.interactionZones.mouse.strength * 0.02;
        }
    }

    /**
     * Apply cluster forces to particle
     */
    applyClusterForces(particle) {
        this.clusters.forEach(cluster => {
            const distance = Math.sqrt(
                Math.pow(particle.x - cluster.x, 2) + 
                Math.pow(particle.y - cluster.y, 2)
            );
            
            if (distance < this.clusterRadius) {
                const strength = (this.clusterRadius - distance) / this.clusterRadius;
                const dx = (cluster.x - particle.x) / distance;
                const dy = (cluster.y - particle.y) / distance;
                
                particle.vx += dx * strength * 0.01;
                particle.vy += dy * strength * 0.01;
            }
        });
    }

    /**
     * Update particle properties over time
     */
    updateParticleProperties(particle, deltaTime) {
        const dt = deltaTime / 16;
        
        // Update life
        particle.life -= deltaTime;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed * dt;
        
        // Update pulse
        particle.pulse += particle.pulseSpeed * dt;
        
        // Update wave
        particle.wave += particle.waveSpeed * dt;
        
        // Update temperature
        particle.temperature += (Math.random() - 0.5) * 0.1 * dt;
        particle.temperature = Math.max(0, Math.min(100, particle.temperature));
        
        // Update charge
        particle.charge += (Math.random() - 0.5) * 0.01 * dt;
        particle.charge = Math.max(-1, Math.min(1, particle.charge));
        
        // Update opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = lifeRatio * this.particleProperties.maxOpacity;
        
        // Update size based on pulse
        const pulseFactor = Math.sin(particle.pulse) * 0.2 + 0.8;
        particle.currentSize = particle.size * pulseFactor;
    }

    /**
     * Update particle trail
     */
    updateParticleTrail(particle) {
        if (this.effects.trails) {
            particle.trail.push({
                x: particle.x,
                y: particle.y,
                opacity: particle.opacity * 0.5,
                size: particle.currentSize * 0.7
            });
            
            if (particle.trail.length > particle.maxTrailLength) {
                particle.trail.shift();
            }
        }
    }

    /**
     * Update clusters
     */
    updateClusters() {
        // Remove old clusters
        this.clusters = this.clusters.filter(cluster => 
            Date.now() - cluster.created < 10000
        );
        
        // Create new clusters randomly
        if (this.clusters.length < this.maxClusters && Math.random() < 0.001) {
            this.clusters.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                created: Date.now(),
                strength: Math.random() * 0.5 + 0.5
            });
        }
    }

    /**
     * Update advanced effects
     */
    updateAdvancedEffects() {
        if (this.effects.connections) {
            this.updateConnections();
        }
        
        if (this.effects.sparkles) {
            this.updateSparkles();
        }
        
        if (this.effects.trails) {
            this.updateTrails();
        }
    }

    /**
     * Update connection lines between particles
     */
    updateConnections() {
        if (!this.connectionsCtx) return;
        
        this.connectionsCtx.clearRect(0, 0, this.connectionsContainer.width, this.connectionsContainer.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];
                
                const distance = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
                );
                
                if (distance < 100) {
                    const opacity = (100 - distance) / 100 * 0.3;
                    this.connectionsCtx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.connectionsCtx.lineWidth = 1;
                    this.connectionsCtx.beginPath();
                    this.connectionsCtx.moveTo(p1.x, p1.y);
                    this.connectionsCtx.lineTo(p2.x, p2.y);
                    this.connectionsCtx.stroke();
                }
            }
        }
    }

    /**
     * Update sparkles
     */
    updateSparkles() {
        if (Math.random() < 0.1) {
            const sparkle = document.createElement('div');
            sparkle.className = 'particle-sparkle';
            sparkle.style.cssText = `
                position: absolute;
                left: ${Math.random() * window.innerWidth}px;
                top: ${Math.random() * window.innerHeight}px;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                animation: sparkleFade 1s ease-out forwards;
            `;
            
            this.sparklesContainer.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }
    }

    /**
     * Update trails
     */
    updateTrails() {
        this.particles.forEach(particle => {
            particle.trail.forEach((trailPoint, index) => {
                const trailElement = document.createElement('div');
                trailElement.className = 'particle-trail';
                trailElement.style.cssText = `
                    position: absolute;
                    left: ${trailPoint.x}px;
                    top: ${trailPoint.y}px;
                    width: ${trailPoint.size}px;
                    height: ${trailPoint.size}px;
                    background: ${particle.color};
                    border-radius: 50%;
                    opacity: ${trailPoint.opacity * (index / particle.trail.length)};
                    pointer-events: none;
                    animation: trailFade 0.5s ease-out forwards;
                `;
                
                this.trailsContainer.appendChild(trailElement);
                
                setTimeout(() => {
                    if (trailElement.parentNode) {
                        trailElement.parentNode.removeChild(trailElement);
                    }
                }, 500);
            });
        });
    }

    /**
     * Apply boundary constraints with bounce
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
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > window.innerWidth) {
            particle.vx *= -this.particlePhysics.bounce;
        }
        
        if (particle.y < 0 || particle.y > window.innerHeight) {
            particle.vy *= -this.particlePhysics.bounce;
        }
    }

    /**
     * Update particle visual element with enhanced effects
     */
    updateParticleElement(particle) {
        if (particle.element) {
            const waveEffect = this.effects.waveEffect ? Math.sin(particle.wave) * 2 : 0;
            
            particle.element.style.transform = `
                translate(${particle.x}px, ${particle.y}px) 
                rotate(${particle.rotation}deg) 
                scale(${particle.currentSize / particle.size})
                translateY(${waveEffect}px)
            `;
            
            particle.element.style.opacity = particle.opacity;
            
            // Enhanced glow effect
            if (this.effects.glow) {
                const glowIntensity = particle.glow * particle.opacity;
                particle.element.style.boxShadow = `
                    0 0 ${particle.currentSize * 3}px ${particle.color}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')},
                    0 0 ${particle.currentSize * 6}px ${particle.color}${Math.floor(glowIntensity * 0.5 * 255).toString(16).padStart(2, '0')}
                `;
            }
            
            // Sparkle effect
            if (particle.sparkle && this.effects.sparkles) {
                particle.element.style.filter = `brightness(1.5) contrast(1.2)`;
            }
        }
    }
}

Object.assign(ParticleSystem.prototype, backgroundMixin);
Object.assign(ParticleSystem.prototype, mouseMixin);
Object.assign(ParticleSystem.prototype, particleCreationMixin);
Object.assign(ParticleSystem.prototype, interactionMixin);
Object.assign(ParticleSystem.prototype, generationMixin);
Object.assign(ParticleSystem.prototype, animationMixin);
Object.assign(ParticleSystem.prototype, controlMixin);
Object.assign(ParticleSystem.prototype, modeMixin);