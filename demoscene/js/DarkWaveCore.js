// DarkWaveCore.js - Core Demoscene Functionality

class DarkWaveCore {
    constructor() {
        this.canvases = new Map();
        this.particles = new Map();
        this.animations = new Map();
        this.effects = new Map();
        
        // Initialize core systems
        this.init();
    }
    
    init() {
        console.log('DarkWave Core initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeAllCanvases();
        });
        
        // Handle visibility change for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAllAnimations();
            } else {
                this.resumeAllAnimations();
            }
        });
    }
    
    // Canvas management
    getCanvas(id) {
        if (!this.canvases.has(id)) {
            const canvas = document.getElementById(id);
            if (canvas) {
                this.canvases.set(id, canvas);
                this.setupCanvas(canvas);
            }
        }
        return this.canvases.get(id);
    }
    
    setupCanvas(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false; // Pixelated rendering
        
        // Set canvas size
        this.resizeCanvas(canvas);
        
        return ctx;
    }
    
    resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        
        const ctx = canvas.getContext('2d');
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    
    resizeAllCanvases() {
        this.canvases.forEach(canvas => {
            this.resizeCanvas(canvas);
        });
    }
    
    // Particle system
    createParticleSystem(canvasId, options = {}) {
        const canvas = this.getCanvas(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const particles = [];
        
        const defaultOptions = {
            maxParticles: 100,
            particleSize: 2,
            speed: 2,
            colors: ['#b388ff', '#00ffff', '#ff00ff'],
            life: 100,
            gravity: 0.1,
            wind: 0
        };
        
        const config = { ...defaultOptions, ...options };
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * config.speed;
                this.vy = (Math.random() - 0.5) * config.speed;
                this.size = Math.random() * config.particleSize + 1;
                this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
                this.life = config.life;
                this.maxLife = config.life;
                this.alpha = 1;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.vy += config.gravity;
                this.vx += config.wind;
                this.life--;
                this.alpha = this.life / this.maxLife;
                
                // Wrap around edges
                if (this.x < 0) this.x = canvas.width;
                if (this.x > canvas.width) this.x = 0;
                if (this.y < 0) this.y = canvas.height;
                if (this.y > canvas.height) this.y = 0;
                
                // Reset if dead
                if (this.life <= 0) {
                    this.reset();
                }
            }
            
            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.restore();
            }
        }
        
        // Create particles
        for (let i = 0; i < config.maxParticles; i++) {
            particles.push(new Particle());
        }
        
        // Animation loop
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.update();
                particle.draw(ctx);
            });
            
            requestAnimationFrame(animate);
        };
        
        const animationId = requestAnimationFrame(animate);
        this.animations.set(canvasId, animationId);
        this.particles.set(canvasId, particles);
        
        return {
            particles,
            stop: () => {
                cancelAnimationFrame(animationId);
                this.animations.delete(canvasId);
                this.particles.delete(canvasId);
            }
        };
    }
    
    // Glitch effect
    createGlitchEffect(canvasId, text, options = {}) {
        const canvas = this.getCanvas(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const defaultOptions = {
            fontSize: 48,
            fontFamily: 'Orbitron',
            color: '#b388ff',
            glitchIntensity: 0.1,
            glitchFrequency: 0.05
        };
        
        const config = { ...defaultOptions, ...options };
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = `${config.fontSize}px ${config.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Main text
            ctx.fillStyle = config.color;
            ctx.fillText(text, centerX, centerY);
            
            // Glitch effect
            if (Math.random() < config.glitchFrequency) {
                const offsetX = (Math.random() - 0.5) * config.glitchIntensity * 10;
                const offsetY = (Math.random() - 0.5) * config.glitchIntensity * 10;
                
                ctx.fillStyle = '#ff00ff';
                ctx.fillText(text, centerX + offsetX, centerY + offsetY);
                
                ctx.fillStyle = '#00ffff';
                ctx.fillText(text, centerX - offsetX, centerY - offsetY);
            }
            
            requestAnimationFrame(animate);
        };
        
        const animationId = requestAnimationFrame(animate);
        this.animations.set(canvasId, animationId);
        
        return {
            stop: () => {
                cancelAnimationFrame(animationId);
                this.animations.delete(canvasId);
            }
        };
    }
    
    // Matrix rain effect
    createMatrixRain(canvasId, options = {}) {
        const canvas = this.getCanvas(canvasId);
        if (!canvas) {
            console.error(`Canvas not found: ${canvasId}`);
            return null;
        }
        
        const ctx = canvas.getContext('2d');
        const defaultOptions = {
            fontSize: 16,
            columns: 50,
            speed: 1,
            color: '#00ff41'
        };
        
        const config = { ...defaultOptions, ...options };
        
        const columns = [];
        const columnWidth = canvas.width / config.columns;
        
        // Initialize columns
        for (let i = 0; i < config.columns; i++) {
            columns.push({
                x: i * columnWidth + (columnWidth / 2),
                y: Math.random() * canvas.height,
                speed: Math.random() * config.speed + 0.5,
                chars: this.generateMatrixChars(25),
                brightness: Math.random()
            });
        }
        
        const animate = () => {
            // Clear with fade effect
            ctx.fillStyle = 'rgba(13, 11, 30, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = `${config.fontSize}px 'Share Tech Mono', monospace`;
            ctx.textAlign = 'center';
            
            columns.forEach(column => {
                column.y += column.speed;
                column.brightness = Math.sin(Date.now() * 0.001 + column.x) * 0.3 + 0.7;
                
                if (column.y > canvas.height + (config.fontSize * 25)) {
                    column.y = -config.fontSize * 5;
                    column.chars = this.generateMatrixChars(25);
                }
                
                column.chars.forEach((char, index) => {
                    const y = column.y - (index * config.fontSize);
                    if (y > -config.fontSize && y < canvas.height + config.fontSize) {
                        const alpha = Math.max(0, 1 - (index / column.chars.length)) * column.brightness;
                        const intensity = Math.max(0.1, alpha);
                        
                        // Main character
                        ctx.fillStyle = `rgba(0, 255, 65, ${intensity})`;
                        ctx.fillText(char, column.x, y);
                        
                        // Glow effect for first few characters
                        if (index < 3) {
                            ctx.shadowColor = '#00ff41';
                            ctx.shadowBlur = 10;
                            ctx.fillStyle = `rgba(0, 255, 65, ${intensity * 0.5})`;
                            ctx.fillText(char, column.x, y);
                            ctx.shadowBlur = 0;
                        }
                    }
                });
            });
            
            requestAnimationFrame(animate);
        };
        
        const animationId = requestAnimationFrame(animate);
        this.animations.set(canvasId, animationId);
        
        return {
            stop: () => {
                cancelAnimationFrame(animationId);
                this.animations.delete(canvasId);
            }
        };
    }
    
    generateMatrixChars(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
        const result = [];
        for (let i = 0; i < length; i++) {
            result.push(chars[Math.floor(Math.random() * chars.length)]);
        }
        return result;
    }
    
    // Wireframe effect
    createWireframe(canvasId, options = {}) {
        const canvas = this.getCanvas(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const defaultOptions = {
            points: 50,
            connections: 3,
            color: '#b388ff',
            speed: 0.01
        };
        
        const config = { ...defaultOptions, ...options };
        
        const points = [];
        const connections = [];
        
        // Generate points
        for (let i = 0; i < config.points; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2
            });
        }
        
        // Generate connections
        for (let i = 0; i < points.length; i++) {
            for (let j = 0; j < config.connections; j++) {
                const target = Math.floor(Math.random() * points.length);
                if (target !== i) {
                    connections.push([i, target]);
                }
            }
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update points
            points.forEach(point => {
                point.x += point.vx;
                point.y += point.vy;
                
                // Bounce off edges
                if (point.x < 0 || point.x > canvas.width) point.vx *= -1;
                if (point.y < 0 || point.y > canvas.height) point.vy *= -1;
            });
            
            // Draw connections
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.5;
            
            connections.forEach(([i, j]) => {
                const p1 = points[i];
                const p2 = points[j];
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                
                if (distance < 150) {
                    ctx.globalAlpha = 1 - (distance / 150);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
            
            ctx.globalAlpha = 1;
            
            requestAnimationFrame(animate);
        };
        
        const animationId = requestAnimationFrame(animate);
        this.animations.set(canvasId, animationId);
        
        return {
            stop: () => {
                cancelAnimationFrame(animationId);
                this.animations.delete(canvasId);
            }
        };
    }
    
    // Utility functions
    pauseAllAnimations() {
        this.animations.forEach((animationId) => {
            cancelAnimationFrame(animationId);
        });
    }
    
    resumeAllAnimations() {
        // Recreate animations if needed
        console.log('Animations resumed');
    }
    
    // Color utilities
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    // Math utilities
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }
    
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    // Random utilities
    randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    randomChoice(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
}

// Global instance
window.darkWaveCore = new DarkWaveCore();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DarkWaveCore;
} 