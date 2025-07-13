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
        // Particle system initialization
        this.particles = [];
        this.particleCount = 80; // Calm particle count for lofi vibes
        this.particleContainer = null;
        this.particleAnimationRunning = true;
        this.particleGenerationRate = 1200; // Default generation rate
        this.particleMode = 'normal';
        this.startTime = Date.now();
        
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Enhanced particle physics
        this.particlePhysics = {
            gravity: 0.02,
            wind: 0.01,
            turbulence: 0.005,
            attraction: 0.03,
            repulsion: 0.02
        };
        
        // Enhanced color schemes for chillhouse vibes
        this.colorSchemes = {
            chillhouse: ['#4a90e2', '#87ceeb', '#4682b4', '#5f9ea0', '#20b2aa'],
            sunset: ['#ff6b35', '#ff8c42', '#ffa07a', '#ffb347', '#ffd700'],
            neon: ['#ff6b9d', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'],
            cosmic: ['#8a2be2', '#9370db', '#ba55d3', '#da70d6', '#ee82ee'],
            ocean: ['#00ced1', '#40e0d0', '#48d1cc', '#20b2aa', '#008b8b'],
            forest: ['#228b22', '#32cd32', '#90ee90', '#98fb98', '#00ff7f']
        };
        
        this.currentColorScheme = 'chillhouse';
        this.currentParticleColor = 0;

        this.lastCleanupTime = null;
    }

    init() {
        this.setupParticleSystem();
        this.setupMouseTracking();
    }

    setupParticleSystem() {
        
        // Create particle container with improved styling
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
        `;
        document.body.appendChild(this.particleContainer);

        // Create enhanced background elements
        this.createEnhancedBackgroundElements();

        // Initialize enhanced particle system
        this.particles = [];
        this.particleCount = 25;
        this.particleGenerationRate = 1200;
        this.particleAnimationRunning = true;
        this.particleMode = 'normal';
        this.startTime = Date.now();

        // Generate initial particles
        this.generateParticles();
        
        // Start enhanced particle animation loop
        this.animateParticles();
        
        // Start continuous particle generation
        this.startContinuousGeneration();
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