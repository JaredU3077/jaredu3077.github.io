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
        // Ultra-performance-optimized particle system initialization
        this.particles = [];
        this.particleCount = 10; // Drastically reduced for maximum performance
        this.particleContainer = null;
        this.particleAnimationRunning = false; // Disabled by default for performance
        this.particleGenerationRate = 3000; // Much slower generation
        this.particleMode = 'minimal'; // Use minimal mode by default
        this.startTime = Date.now();
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Simplified particle physics for better performance
        this.particlePhysics = {
            gravity: 0.01, // Reduced from 0.015
            wind: 0.005, // Reduced from 0.008
            turbulence: 0.002, // Reduced from 0.003
            attraction: 0.02, // Reduced from 0.025
            repulsion: 0.01, // Reduced from 0.015
            friction: 0.985, // Increased from 0.98 for better performance
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
        
        // Optimized particle properties
        this.particleProperties = {
            maxSize: 6, // Reduced from 8
            minSize: 2,
            maxSpeed: 2.0, // Reduced from 2.5
            minSpeed: 0.5,
            maxLife: 12000, // Reduced from 15000
            minLife: 6000, // Reduced from 8000
            maxOpacity: 0.8, // Reduced from 0.9
            minOpacity: 0.3
        };
        
        // Simplified interaction zones
        this.interactionZones = {
            mouse: { radius: 100, strength: 0.6 }, // Reduced from 120, 0.8
            gravity: { radius: 150, strength: 0.2 }, // Reduced from 200, 0.3
            repulsion: { radius: 60, strength: 0.4 } // Reduced from 80, 0.6
        };
        
        // Performance optimization
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        this.animationFrameId = null;
        
        // Minimal effects for maximum performance
        this.effects = {
            trails: false, // Disabled for performance
            glow: false, // Disabled for performance
            sparkles: false, // Disabled for performance
            connections: false, // Disabled for performance
            waveEffect: false // Disabled for performance
        };
        
        // Disabled clustering for performance
        this.clusters = [];
        this.maxClusters = 0; // Disabled for performance
        this.clusterRadius = 0; // Disabled for performance
        
        // Minimal object pooling for performance
        this.particlePool = [];
        this.maxPoolSize = 10; // Reduced for performance
        
        // Performance monitoring
        this.lastPerformanceCheck = Date.now();
        this.frameTimeHistory = [];
        this.maxFrameTimeHistory = 10;
    }

    init() {
        this.setupParticleSystem();
        this.setupMouseTracking();
    }

    setupParticleSystem() {
        // Create optimized particle container
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
            z-index: 15 !important; /* Much lower than terminal window (2000) */
            overflow: hidden;
            background: transparent !important;
            will-change: transform; /* Performance optimization */
        `;
        document.body.appendChild(this.particleContainer);

        // Create enhanced background elements
        this.createEnhancedBackgroundElements();

        // Initialize ultra-optimized particle system
        this.particles = [];
        this.particleCount = 5; // Minimal for maximum performance
        this.particleGenerationRate = 5000; // Very slow generation
        this.particleAnimationRunning = false; // Disabled by default
        this.particleMode = 'minimal';
        this.startTime = Date.now();

        // Generate initial particles
        this.generateParticles();
        
        // Start optimized particle animation loop
        this.animateParticles();
        
        // Start continuous particle generation
        this.startContinuousGeneration();
        
        // Initialize simplified effects
        this.initializeSimplifiedEffects();
    }

    /**
     * Initialize simplified particle effects for better performance
     */
    initializeSimplifiedEffects() {
        // Only initialize glow effects for better performance
        if (this.effects.glow) {
            // Glow effects are handled inline for better performance
        }
    }

    /**
     * Get particle from pool or create new one
     */
    getParticleFromPool() {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        return this.createEnhancedParticle();
    }

    /**
     * Return particle to pool
     */
    returnParticleToPool(particle) {
        if (this.particlePool.length < this.maxPoolSize) {
            // Reset particle properties
            particle.life = 0;
            particle.element = null;
            this.particlePool.push(particle);
        }
    }

    /**
     * Create enhanced particle with optimized properties
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
            mass: Math.random() * 0.5 + 0.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2, // Reduced from 4
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.01 + 0.005, // Reduced from 0.02 + 0.01
            glow: Math.random() * 0.5 + 0.5
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
     * Update particle physics with optimized calculations
     */
    updateParticlePhysics() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        // Performance check - skip frame if too slow
        if (deltaTime < this.frameInterval) {
            return;
        }
        
        // Performance monitoring
        this.frameTimeHistory.push(deltaTime);
        if (this.frameTimeHistory.length > this.maxFrameTimeHistory) {
            this.frameTimeHistory.shift();
        }
        
        // Adaptive performance adjustment
        const avgFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
        if (avgFrameTime > 20) { // If average frame time > 20ms, reduce effects
            this.effects.glow = false;
        }
        
        this.lastFrameTime = currentTime;
        this.frameCount++;
        
        // Batch DOM updates for better performance
        const updates = [];
        
        this.particles.forEach(particle => {
            // Apply simplified physics forces
            this.applySimplifiedPhysicsForces(particle, deltaTime);
            
            // Update position with velocity
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply boundary constraints with bounce
            this.applyBoundaryConstraints(particle);
            
            // Update particle properties
            this.updateParticleProperties(particle, deltaTime);
            
            // Collect updates for batch processing
            updates.push(particle);
        });
        
        // Batch update visual elements
        this.batchUpdateParticleElements(updates);
        
        // Update clusters
        this.updateClusters();
        
        // Cleanup old particles
        this.cleanupOffscreenParticles();
    }

    /**
     * Apply simplified physics forces to particle
     */
    applySimplifiedPhysicsForces(particle, deltaTime) {
        const dt = deltaTime / 16; // Normalize to 60fps
        
        // Apply gravity with mass consideration
        particle.vy += this.particlePhysics.gravity * particle.mass * dt;
        
        // Apply wind with reduced turbulence
        particle.vx += this.particlePhysics.wind * dt;
        particle.vx += (Math.random() - 0.5) * this.particlePhysics.turbulence * dt;
        particle.vy += (Math.random() - 0.5) * this.particlePhysics.turbulence * dt;
        
        // Apply friction
        particle.vx *= this.particlePhysics.friction;
        particle.vy *= this.particlePhysics.friction;
        
        // Apply mouse interaction (simplified)
        this.applySimplifiedMouseInteraction(particle);
        
        // Apply cluster forces (simplified)
        this.applySimplifiedClusterForces(particle);
    }

    /**
     * Apply simplified mouse interaction to particle
     */
    applySimplifiedMouseInteraction(particle) {
        const distance = Math.sqrt(
            Math.pow(particle.x - this.mouseX, 2) + 
            Math.pow(particle.y - this.mouseY, 2)
        );
        
        if (distance < this.interactionZones.mouse.radius) {
            const strength = (this.interactionZones.mouse.radius - distance) / this.interactionZones.mouse.radius;
            const dx = (this.mouseX - particle.x) / distance;
            const dy = (this.mouseY - particle.y) / distance;
            
            particle.vx += dx * strength * this.interactionZones.mouse.strength * 0.015; // Reduced from 0.02
            particle.vy += dy * strength * this.interactionZones.mouse.strength * 0.015;
        }
    }

    /**
     * Apply simplified cluster forces to particle
     */
    applySimplifiedClusterForces(particle) {
        this.clusters.forEach(cluster => {
            const distance = Math.sqrt(
                Math.pow(particle.x - cluster.x, 2) + 
                Math.pow(particle.y - cluster.y, 2)
            );
            
            if (distance < this.clusterRadius) {
                const strength = (this.clusterRadius - distance) / this.clusterRadius;
                const dx = (cluster.x - particle.x) / distance;
                const dy = (cluster.y - particle.y) / distance;
                
                particle.vx += dx * strength * 0.008; // Reduced from 0.01
                particle.vy += dy * strength * 0.008;
            }
        });
    }

    /**
     * Update particle properties over time (optimized)
     */
    updateParticleProperties(particle, deltaTime) {
        const dt = deltaTime / 16;
        
        // Update life
        particle.life -= deltaTime;
        
        // Update rotation (simplified)
        particle.rotation += particle.rotationSpeed * dt;
        
        // Update pulse (simplified)
        particle.pulse += particle.pulseSpeed * dt;
        
        // Update opacity based on life
        const lifeRatio = particle.life / particle.maxLife;
        particle.opacity = lifeRatio * this.particleProperties.maxOpacity;
        
        // Update size based on pulse (simplified)
        const pulseFactor = Math.sin(particle.pulse) * 0.1 + 0.9; // Reduced variation
        particle.currentSize = particle.size * pulseFactor;
    }

    /**
     * Batch update particle visual elements for better performance
     */
    batchUpdateParticleElements(particles) {
        // Use requestAnimationFrame for smooth updates
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        this.animationFrameId = requestAnimationFrame(() => {
            particles.forEach(particle => {
                if (particle.element) {
                    // Simplified transform for better performance
                    particle.element.style.transform = `
                        translate(${particle.x}px, ${particle.y}px) 
                        rotate(${particle.rotation}deg) 
                        scale(${particle.currentSize / particle.size})
                    `;
                    
                    particle.element.style.opacity = particle.opacity;
                    
                    // Simplified glow effect
                    if (this.effects.glow) {
                        const glowIntensity = particle.glow * particle.opacity * 0.5; // Reduced intensity
                        particle.element.style.boxShadow = `
                            0 0 ${particle.currentSize * 2}px ${particle.color}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}
                        `;
                    }
                }
            });
        });
    }

    /**
     * Apply boundary constraints with bounce (optimized)
     */
    applyBoundaryConstraints(particle) {
        const margin = 30; // Reduced from 50
        
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
        
        // Simplified bounce off edges
        if (particle.x < 0 || particle.x > window.innerWidth) {
            particle.vx *= -this.particlePhysics.bounce;
        }
        
        if (particle.y < 0 || particle.y > window.innerHeight) {
            particle.vy *= -this.particlePhysics.bounce;
        }
    }

    /**
     * Update clusters (simplified)
     */
    updateClusters() {
        // Remove old clusters
        this.clusters = this.clusters.filter(cluster => 
            Date.now() - cluster.created < 8000 // Reduced from 10000
        );
        
        // Create new clusters less frequently
        if (this.clusters.length < this.maxClusters && Math.random() < 0.0005) { // Reduced from 0.001
            this.clusters.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                created: Date.now(),
                strength: Math.random() * 0.3 + 0.3 // Reduced from 0.5 + 0.5
            });
        }
    }

    /**
     * Cleanup offscreen particles with object pooling
     */
    cleanupOffscreenParticles() {
        const currentTime = Date.now();
        
        // Only cleanup every 2 seconds for better performance
        if (currentTime - this.lastCleanupTime < 2000) {
            return;
        }
        
        this.lastCleanupTime = currentTime;
        
        this.particles = this.particles.filter(particle => {
            if (particle.life <= 0 || 
                particle.x < -100 || particle.x > window.innerWidth + 100 ||
                particle.y < -100 || particle.y > window.innerHeight + 100) {
                
                // Return to pool instead of destroying
                if (particle.element) {
                    particle.element.remove();
                }
                this.returnParticleToPool(particle);
                return false;
            }
            return true;
        });
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