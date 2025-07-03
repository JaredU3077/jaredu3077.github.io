// demoscene.js - Main Demoscene Platform Controller

class DemoscenePlatform {
    constructor() {
        this.currentDemo = null;
        this.demoGallery = [];
        this.editorState = {
            particles: [],
            audio: null,
            code: ''
        };
        this.comments = JSON.parse(localStorage.getItem('demoscene-comments')) || [];
        this.leaderboard = JSON.parse(localStorage.getItem('demoscene-leaderboard')) || [];
        
        this.init();
    }
    
    init() {
        // Check if required dependencies are available
        if (!window.darkWaveCore) {
            console.error('DarkWaveCore not found! Make sure DarkWaveCore.js is loaded before demoscene.js');
            return;
        }
        
        if (!window.darkWaveAudio) {
            console.warn('DarkWaveAudio not found. Audio features will be disabled.');
        }
        
        // Initialize audio on first user interaction
        document.addEventListener('click', () => {
            if (window.darkWaveAudio && !window.darkWaveAudio.isInitialized) {
                window.darkWaveAudio.resume();
            }
        }, { once: true });
        
        this.setupEventListeners();
        this.initializeHeroCanvas();
        this.loadDemoGallery();
        this.setupEditor();
        this.setupCommunity();
        this.setupTutorials();
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.neon-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = e.target.getAttribute('href').substring(1);
                this.scrollToSection(target);
            });
        });
        
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
        
        // Comment form
        const commentForm = document.getElementById('comment-form');
        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addComment();
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentDemo) {
                this.closeFullScreenDemo();
            }
        });
    }
    
    // Hero canvas animation
    initializeHeroCanvas() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;
        
        // Create a dynamic particle system for the hero
        const heroParticles = window.darkWaveCore.createParticleSystem('hero-canvas', {
            maxParticles: 150,
            particleSize: 3,
            speed: 1.5,
            colors: ['#b388ff', '#00ffff', '#ff00ff', '#00ff41'],
            life: 120,
            gravity: 0.05,
            wind: 0.02
        });
        
        // Add glitch text overlay
        setTimeout(() => {
            window.darkWaveCore.createGlitchEffect('hero-canvas', 'DARKWAVE', {
                fontSize: 72,
                glitchIntensity: 0.15,
                glitchFrequency: 0.03
            });
        }, 1000);
        
        // Start ambient audio
        setTimeout(() => {
            if (window.darkWaveAudio) {
                window.darkWaveAudio.startAmbientTrack();
            }
        }, 2000);
    }
    
    // Demo gallery management
    loadDemoGallery() {
        const gallery = document.getElementById('demo-gallery');
        if (!gallery) {
            console.error('Demo gallery element not found');
            return;
        }
        
        // Sample demos
        const sampleDemos = [
            {
                id: 'demo-1',
                title: 'Neon Particles',
                description: 'Dynamic particle system with neon colors',
                type: 'particles',
                thumbnail: null
            },
            {
                id: 'demo-2',
                title: 'Matrix Rain',
                description: 'Classic matrix-style falling characters',
                type: 'matrix',
                thumbnail: null
            },
            {
                id: 'demo-3',
                title: 'Wireframe Network',
                description: 'Connected nodes with dynamic movement',
                type: 'wireframe',
                thumbnail: null
            },
            {
                id: 'demo-4',
                title: 'Glitch Text',
                description: 'Distorted text with glitch effects',
                type: 'glitch',
                thumbnail: null
            }
        ];
        
        this.demoGallery = sampleDemos;
        this.renderDemoGallery();
    }
    
    renderDemoGallery() {
        const gallery = document.getElementById('demo-gallery');
        if (!gallery) {
            console.error('Demo gallery element not found');
            return;
        }
        
        gallery.innerHTML = '';
        
        this.demoGallery.forEach(demo => {
            const demoCard = document.createElement('article');
            demoCard.className = 'demo-card';
            demoCard.innerHTML = `
                <canvas id="${demo.id}-canvas" width="320" height="200"></canvas>
                <h3>${demo.title}</h3>
                <p>${demo.description}</p>
                <button class="neon-button small play-btn" data-demo-id="${demo.id}">Play</button>
                <button class="neon-button small secondary stop-btn" data-demo-id="${demo.id}">Stop</button>
            `;
            gallery.appendChild(demoCard);
            
            // Initialize demo preview
            this.initializeDemoPreview(demo);
        });

        // Attach event listeners for play/stop buttons
        const playButtons = gallery.querySelectorAll('.play-btn');
        const stopButtons = gallery.querySelectorAll('.stop-btn');
        
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const demoId = e.target.getAttribute('data-demo-id');
                this.playDemo(demoId);
            });
        });
        stopButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const demoId = e.target.getAttribute('data-demo-id');
                this.stopDemo(demoId);
            });
        });
    }
    
    initializeDemoPreview(demo) {
        const canvasId = `${demo.id}-canvas`;
        
        switch (demo.type) {
            case 'particles':
                window.darkWaveCore.createParticleSystem(canvasId, {
                    maxParticles: 50,
                    particleSize: 2,
                    speed: 1,
                    colors: ['#b388ff', '#00ffff'],
                    life: 80
                });
                break;
            case 'matrix':
                window.darkWaveCore.createMatrixRain(canvasId, {
                    fontSize: 10,
                    columns: 20,
                    speed: 0.5
                });
                break;
            case 'wireframe':
                window.darkWaveCore.createWireframe(canvasId, {
                    points: 20,
                    connections: 2,
                    color: '#b388ff'
                });
                break;
            case 'glitch':
                window.darkWaveCore.createGlitchEffect(canvasId, 'DEMO', {
                    fontSize: 24,
                    glitchIntensity: 0.1,
                    glitchFrequency: 0.02
                });
                break;
        }
    }
    
    playDemo(demoId) {
        const demo = this.demoGallery.find(d => d.id === demoId);
        if (!demo) {
            console.error(`Demo not found: ${demoId}`);
            return;
        }
        
        // Stop any current demo
        if (this.currentDemo) {
            this.stopDemo(this.currentDemo);
        }
        
        this.currentDemo = demoId;
        
        // Handle each demo type uniquely
        switch (demo.type) {
            case 'matrix':
                this.createMatrixFullscreen();
                break;
            case 'particles':
                this.createParticlesFullscreen();
                break;
            case 'wireframe':
                this.createWireframeFullscreen();
                break;
            case 'glitch':
                this.createGlitchFullscreen();
                break;
            default:
                console.error(`Unknown demo type: ${demo.type}`);
        }
    }
    
    // Matrix Rain Fullscreen
    createMatrixFullscreen() {
        this.closeFullScreenDemo();
        
        const container = document.createElement('div');
        container.id = 'matrix-fullscreen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0d0b1e;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'matrix-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: transparent;
            border: 1px solid #00ff41;
            color: #00ff41;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            font-family: monospace;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(container);
            this.currentDemo = null;
        };
        
        container.appendChild(canvas);
        container.appendChild(closeBtn);
        document.body.appendChild(container);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.startMatrixRain(canvas);
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(container);
                document.removeEventListener('keydown', escapeHandler);
                this.currentDemo = null;
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Particles Fullscreen
    createParticlesFullscreen() {
        this.closeFullScreenDemo();
        
        const container = document.createElement('div');
        container.id = 'particles-fullscreen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0d0b1e;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'particles-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: transparent;
            border: 1px solid #b388ff;
            color: #b388ff;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            font-family: monospace;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(container);
            this.currentDemo = null;
        };
        
        container.appendChild(canvas);
        container.appendChild(closeBtn);
        document.body.appendChild(container);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.startParticlesEffect(canvas);
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(container);
                document.removeEventListener('keydown', escapeHandler);
                this.currentDemo = null;
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Wireframe Fullscreen
    createWireframeFullscreen() {
        this.closeFullScreenDemo();
        
        const container = document.createElement('div');
        container.id = 'wireframe-fullscreen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0d0b1e;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'wireframe-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: transparent;
            border: 1px solid #00ffff;
            color: #00ffff;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            font-family: monospace;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(container);
            this.currentDemo = null;
        };
        
        container.appendChild(canvas);
        container.appendChild(closeBtn);
        document.body.appendChild(container);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.startWireframeEffect(canvas);
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(container);
                document.removeEventListener('keydown', escapeHandler);
                this.currentDemo = null;
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Glitch Fullscreen
    createGlitchFullscreen() {
        this.closeFullScreenDemo();
        
        const container = document.createElement('div');
        container.id = 'glitch-fullscreen';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #0d0b1e;
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;
        
        const canvas = document.createElement('canvas');
        canvas.id = 'glitch-canvas';
        canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 10001;
            background: transparent;
            border: 1px solid #ff00ff;
            color: #ff00ff;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            font-weight: bold;
            font-family: monospace;
        `;
        closeBtn.onclick = () => {
            document.body.removeChild(container);
            this.currentDemo = null;
        };
        
        container.appendChild(canvas);
        container.appendChild(closeBtn);
        document.body.appendChild(container);
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        this.startGlitchEffect(canvas);
        
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(container);
                document.removeEventListener('keydown', escapeHandler);
                this.currentDemo = null;
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    startMatrixRain(canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let columns = [];
        let isRunning = true;
        
        function generateMatrixChars(length) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
            const result = [];
            for (let i = 0; i < length; i++) {
                result.push(chars[Math.floor(Math.random() * chars.length)]);
            }
            return result;
        }
        
        function initMatrixRain() {
            const fontSize = 18;
            const columnCount = Math.floor(canvas.width / 20);
            
            columns = [];
            const columnWidth = canvas.width / columnCount;
            
            for (let i = 0; i < columnCount; i++) {
                columns.push({
                    x: i * columnWidth + (columnWidth / 2),
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 1.5 + 0.5,
                    chars: generateMatrixChars(25),
                    brightness: Math.random()
                });
            }
        }
        
        function animate() {
            if (!isRunning) return;
            
            // Clear with fade effect
            ctx.fillStyle = 'rgba(13, 11, 30, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '18px monospace';
            ctx.textAlign = 'center';
            
            columns.forEach(column => {
                column.y += column.speed;
                column.brightness = Math.sin(Date.now() * 0.001 + column.x) * 0.3 + 0.7;
                
                if (column.y > canvas.height + (18 * 25)) {
                    column.y = -18 * 5;
                    column.chars = generateMatrixChars(25);
                }
                
                column.chars.forEach((char, index) => {
                    const y = column.y - (index * 18);
                    if (y > -18 && y < canvas.height + 18) {
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
            
            animationId = requestAnimationFrame(animate);
        }
        
        // Initialize and start
        initMatrixRain();
        animate();
        
        // Store for cleanup
        this.currentMatrixAnimation = {
            stop: () => {
                isRunning = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        };
    }
    
    stopDemo(demoId) {
        if (this.currentDemo === demoId) {
            this.currentDemo = null;
        }
        
        // Stop any running animations for this demo
        const canvasId = `${demoId}-canvas`;
        if (window.darkWaveCore.animations.has(canvasId)) {
            window.darkWaveCore.animations.get(canvasId).stop();
        }
        
        // Close full-screen demo if open
        this.closeFullScreenDemo();
    }

    createFullScreenDemo(demo) {
        console.log('createFullScreenDemo called for:', demo.title);
        
        // Remove existing full-screen demo if present
        this.closeFullScreenDemo();
        
        // Create full-screen container
        const container = document.createElement('div');
        container.id = 'fullscreen-demo';
        container.className = 'fullscreen-demo-container';
        
        container.innerHTML = `
            <div class="demo-header">
                <div class="demo-title">${demo.title}</div>
                <div class="demo-description">${demo.description}</div>
                <button class="demo-close" onclick="window.demoscenePlatform?.closeFullScreenDemo()">×</button>
            </div>
            <div class="demo-loading" id="demo-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Loading ${demo.title}...</div>
            </div>
            <canvas id="fullscreen-demo-canvas" class="fullscreen-demo-canvas"></canvas>
            <div class="demo-controls">
                <div class="demo-info">
                    <span class="demo-type">${demo.type.toUpperCase()}</span>
                    <span class="demo-duration">∞</span>
                </div>
                <div class="demo-actions">
                    <button class="demo-btn" onclick="window.demoscenePlatform?.toggleDemoAudio()">♪</button>
                    <button class="demo-btn" onclick="window.demoscenePlatform?.cycleDemoEffect()">⚡</button>
                </div>
            </div>
        `;
        
        console.log('Appending container to body...');
        document.body.appendChild(container);
        
        // Add styles
        this.addFullScreenDemoStyles();
        
        // Initialize the full-screen demo
        console.log('Initializing fullscreen demo...');
        this.initializeFullScreenDemo(demo);
        
        // Start audio
        this.startDemoAudio(demo);
        
        // Add fade-in effect
        setTimeout(() => {
            container.style.opacity = '1';
        }, 100);
        
        console.log('Fullscreen demo creation completed');
    }

    addFullScreenDemoStyles() {
        const style = document.createElement('style');
        style.id = 'fullscreenDemoStyles';
        style.textContent = `
            .fullscreen-demo-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: #0d0b1e;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                font-family: 'Orbitron', 'Share Tech Mono', monospace;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .demo-header {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 80px;
                background: rgba(13, 11, 30, 0.9);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid #b388ff;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10001;
                box-shadow: 0 0 20px rgba(179, 136, 255, 0.3);
            }

            .demo-title {
                font-size: 24px;
                font-weight: 700;
                color: #b388ff;
                text-shadow: 0 0 10px #b388ff;
                letter-spacing: 2px;
                text-transform: uppercase;
            }

            .demo-description {
                position: absolute;
                top: 45px;
                font-size: 12px;
                color: #ffffff;
                opacity: 0.8;
                letter-spacing: 1px;
            }

            .demo-close {
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: 1px solid #b388ff;
                color: #b388ff;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                font-weight: bold;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .demo-close:hover {
                background: #b388ff;
                color: #0d0b1e;
                box-shadow: 0 0 15px #b388ff;
            }

            .fullscreen-demo-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100vw !important;
                height: 100vh !important;
                background: #0d0b1e;
                display: block;
                z-index: 10000;
            }

            .demo-controls {
                position: absolute;
                bottom: 20px;
                left: 0;
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 20px;
                z-index: 10001;
            }

            .demo-info {
                display: flex;
                gap: 20px;
                color: #ffffff;
                font-size: 14px;
            }

            .demo-type {
                color: #00ffff;
                text-shadow: 0 0 5px #00ffff;
            }

            .demo-duration {
                color: #ff00ff;
                text-shadow: 0 0 5px #ff00ff;
            }

            .demo-actions {
                display: flex;
                gap: 10px;
            }

            .demo-btn {
                background: transparent;
                border: 1px solid #b388ff;
                color: #b388ff;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .demo-btn:hover {
                background: #b388ff;
                color: #0d0b1e;
                box-shadow: 0 0 15px #b388ff;
            }

            /* Loading indicator */
            .demo-loading {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10002;
                text-align: center;
                color: #00ff41;
                opacity: 1;
                transition: opacity 0.3s ease;
            }

            .loading-spinner {
                width: 40px;
                height: 40px;
                border: 3px solid rgba(0, 255, 65, 0.3);
                border-top: 3px solid #00ff41;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 16px;
                text-shadow: 0 0 10px #00ff41;
                letter-spacing: 1px;
            }

            /* Ensure fullscreen demo is always visible */
            .fullscreen-demo-container {
                display: flex !important;
                visibility: visible !important;
            }
        `;
        
        document.head.appendChild(style);
    }

    initializeFullScreenDemo(demo) {
        console.log('initializeFullScreenDemo called for:', demo.type);
        
        const canvas = document.getElementById('fullscreen-demo-canvas');
        if (!canvas) {
            console.error('Fullscreen demo canvas not found');
            return;
        }
        
        console.log('Canvas found, setting size...');
        // Set canvas size to full viewport
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log('Canvas size set to:', canvas.width, 'x', canvas.height);
        
        // Create the demo effect based on type
        switch (demo.type) {
            case 'particles':
                console.log('Creating particles demo...');
                window.darkWaveCore.createParticleSystem('fullscreen-demo-canvas', {
                    maxParticles: 200,
                    particleSize: 4,
                    speed: 3,
                    colors: ['#b388ff', '#00ffff', '#ff00ff', '#00ff41'],
                    life: 150,
                    gravity: 0.02,
                    wind: 0.01
                });
                break;
            case 'matrix':
                console.log('Creating matrix rain demo...');
                this.createMatrixRainDirect(canvas);
                break;
            case 'wireframe':
                console.log('Creating wireframe demo...');
                window.darkWaveCore.createWireframe('fullscreen-demo-canvas', {
                    points: 100,
                    connections: 4,
                    color: '#b388ff'
                });
                break;
            case 'glitch':
                console.log('Creating glitch demo...');
                window.darkWaveCore.createGlitchEffect('fullscreen-demo-canvas', 'DARKWAVE', {
                    fontSize: 72,
                    glitchIntensity: 0.2,
                    glitchFrequency: 0.08
                });
                break;
            default:
                console.error(`Unknown demo type: ${demo.type}`);
        }
        
        // Handle window resize
        const resizeHandler = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Recreate the effect with new dimensions
            if (window.darkWaveCore.animations.has('fullscreen-demo-canvas')) {
                window.darkWaveCore.animations.get('fullscreen-demo-canvas').stop();
            }
            
            // Reinitialize the demo
            setTimeout(() => {
                this.initializeFullScreenDemo(demo);
            }, 100);
        };
        
        window.addEventListener('resize', resizeHandler);
        
        // Store resize handler for cleanup
        this.currentResizeHandler = resizeHandler;
        
        // Hide loading indicator after a short delay
        setTimeout(() => {
            const loadingElement = document.getElementById('demo-loading');
            if (loadingElement) {
                loadingElement.style.opacity = '0';
                setTimeout(() => {
                    loadingElement.style.display = 'none';
                }, 300);
            }
        }, 1000);
    }
    
    // Direct matrix rain implementation (from working standalone)
    createMatrixRainDirect(canvas) {
        console.log('createMatrixRainDirect called');
        const ctx = canvas.getContext('2d');
        let animationId;
        let columns = [];
        let isRunning = true;
        
        function generateMatrixChars(length) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
            const result = [];
            for (let i = 0; i < length; i++) {
                result.push(chars[Math.floor(Math.random() * chars.length)]);
            }
            return result;
        }
        
        function initMatrixRain() {
            const fontSize = 18;
            const columnCount = Math.floor(canvas.width / 20);
            
            columns = [];
            const columnWidth = canvas.width / columnCount;
            
            for (let i = 0; i < columnCount; i++) {
                columns.push({
                    x: i * columnWidth + (columnWidth / 2),
                    y: Math.random() * canvas.height,
                    speed: Math.random() * 1.5 + 0.5,
                    chars: generateMatrixChars(25),
                    brightness: Math.random()
                });
            }
            console.log('Matrix rain initialized with', columnCount, 'columns');
        }
        
        function animate() {
            if (!isRunning) return;
            
            // Clear with fade effect
            ctx.fillStyle = 'rgba(13, 11, 30, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '18px monospace';
            ctx.textAlign = 'center';
            
            columns.forEach(column => {
                column.y += column.speed;
                column.brightness = Math.sin(Date.now() * 0.001 + column.x) * 0.3 + 0.7;
                
                if (column.y > canvas.height + (18 * 25)) {
                    column.y = -18 * 5;
                    column.chars = generateMatrixChars(25);
                }
                
                column.chars.forEach((char, index) => {
                    const y = column.y - (index * 18);
                    if (y > -18 && y < canvas.height + 18) {
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
            
            animationId = requestAnimationFrame(animate);
        }
        
        // Initialize and start
        console.log('Starting matrix rain animation...');
        initMatrixRain();
        animate();
        console.log('Matrix rain animation started');
        
        // Store the animation for cleanup
        window.darkWaveCore.animations.set('fullscreen-demo-canvas', {
            stop: () => {
                console.log('Stopping matrix rain animation');
                isRunning = false;
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
                window.darkWaveCore.animations.delete('fullscreen-demo-canvas');
            }
        });
    }

    startDemoAudio(demo) {
        if (window.darkWaveAudio) {
            const styles = ['dark', 'cyber', 'hacker', 'wave'];
            const randomStyle = styles[Math.floor(Math.random() * styles.length)];
            window.darkWaveAudio.playDarkWaveSequence(randomStyle, 4);
            
            // Start ambient track for continuous audio
            setTimeout(() => {
                window.darkWaveAudio.startAmbientTrack();
            }, 4000);
        }
    }

    closeFullScreenDemo() {
        // Close simple matrix fullscreen
        const simpleContainer = document.getElementById('simple-matrix-fullscreen');
        if (simpleContainer) {
            simpleContainer.remove();
        }
        
        // Stop matrix animation
        if (this.currentMatrixAnimation) {
            this.currentMatrixAnimation.stop();
            this.currentMatrixAnimation = null;
        }
        
        // Close complex fullscreen demo
        const container = document.getElementById('fullscreen-demo');
        if (container) {
            container.remove();
        }
        
        const styles = document.getElementById('fullscreenDemoStyles');
        if (styles) {
            styles.remove();
        }
        
        // Remove resize handler
        if (this.currentResizeHandler) {
            window.removeEventListener('resize', this.currentResizeHandler);
            this.currentResizeHandler = null;
        }
        
        // Stop audio
        if (window.darkWaveAudio) {
            window.darkWaveAudio.stopAmbientTrack();
        }
        
        // Stop animations
        if (window.darkWaveCore) {
            const canvasId = 'fullscreen-demo-canvas';
            if (window.darkWaveCore.animations.has(canvasId)) {
                window.darkWaveCore.animations.get(canvasId).stop();
            }
        }
        
        this.currentDemo = null;
    }

    toggleDemoAudio() {
        if (window.darkWaveAudio) {
            if (window.darkWaveAudio.currentSequence) {
                window.darkWaveAudio.stopAmbientTrack();
            } else {
                window.darkWaveAudio.startAmbientTrack();
            }
        }
    }

    cycleDemoEffect() {
        // This could cycle through different variations of the current demo
        console.log('Cycling demo effect...');
    }
    
    // Editor functionality
    setupEditor() {
        // Initialize editor canvas
        const editorCanvas = document.getElementById('editor-canvas');
        if (editorCanvas) {
            // Clear any existing context
            const ctx = editorCanvas.getContext('2d');
            ctx.fillStyle = '#0d0b1e';
            ctx.fillRect(0, 0, editorCanvas.width, editorCanvas.height);
        }
        
        // Setup code editor
        const codeTextarea = document.getElementById('code-textarea');
        if (codeTextarea) {
            codeTextarea.value = `// DarkWave Demo Code
// Write your demo here...

// Canvas and context are provided as parameters
// Use 'canvas' and 'ctx' variables in your code

function animate() {
    // Clear canvas
    ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Your animation code here
    ctx.fillStyle = '#b388ff';
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 4, 4);
    
    requestAnimationFrame(animate);
}

animate();`;
        }
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update panels
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tabName}-editor`).classList.add('active');
    }
    
    // Editor functions
    clearCanvas() {
        const canvas = document.getElementById('editor-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0d0b1e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    addParticle() {
        const canvas = document.getElementById('editor-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const colors = ['#b388ff', '#00ffff', '#ff00ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 4, 4);
        
        // Add to editor state
        this.editorState.particles.push({ x, y, color });
    }
    
    playDemo() {
        const codeTextarea = document.getElementById('code-textarea');
        if (!codeTextarea) return;
        
        try {
            // Create a safe execution environment
            const demoCanvas = document.getElementById('editor-canvas');
            if (!demoCanvas) {
                throw new Error('Editor canvas not found');
            }
            
            const demoCtx = demoCanvas.getContext('2d');
            if (!demoCtx) {
                throw new Error('Could not get canvas context');
            }
            
            // Clear canvas
            demoCtx.fillStyle = '#0d0b1e';
            demoCtx.fillRect(0, 0, demoCanvas.width, demoCanvas.height);
            
            // Execute code with unique variable names to avoid conflicts
            const code = codeTextarea.value;
            if (!code.trim()) {
                throw new Error('No code to execute');
            }
            
            const func = new Function('canvas', 'ctx', code);
            func(demoCanvas, demoCtx);
            
        } catch (error) {
            console.error('Demo execution error:', error);
            alert('Demo execution error: ' + error.message + '\n\nPlease check your code and try again.');
        }
    }
    
    // Audio functions
    playChiptune() {
        if (window.darkWaveAudio) {
            const melody = window.darkWaveAudio.createChiptuneMelody('minor', 8);
            window.darkWaveAudio.playChiptuneMelody(melody, 140);
        }
    }
    
    stopAudio() {
        if (window.darkWaveAudio) {
            window.darkWaveAudio.stopAmbientTrack();
        }
    }
    
    runCode() {
        this.playDemo();
    }
    
    // Community functionality
    setupCommunity() {
        this.renderComments();
        this.renderLeaderboard();
    }
    
    addComment() {
        const input = document.getElementById('comment-input');
        if (!input || !input.value.trim()) return;
        
        const comment = {
            id: Date.now(),
            text: input.value.trim(),
            timestamp: new Date().toISOString(),
            author: 'Anonymous'
        };
        
        this.comments.unshift(comment);
        localStorage.setItem('demoscene-comments', JSON.stringify(this.comments));
        
        this.renderComments();
        input.value = '';
    }
    
    renderComments() {
        const list = document.getElementById('comment-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        this.comments.slice(0, 10).forEach(comment => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${comment.author}</strong>
                <span class="timestamp">${new Date(comment.timestamp).toLocaleString()}</span>
                <p>${comment.text}</p>
            `;
            list.appendChild(li);
        });
    }
    
    renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (this.leaderboard.length === 0) {
            list.innerHTML = '<p>No demos rated yet. Be the first!</p>';
            return;
        }
        
        this.leaderboard.forEach((demo, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-item';
            div.innerHTML = `
                <span class="rank">#${index + 1}</span>
                <span class="title">${demo.title}</span>
                <span class="score">${demo.score}</span>
            `;
            list.appendChild(div);
        });
    }
    
    // Tutorial system
    setupTutorials() {
        // Tutorial content will be loaded dynamically
    }
    
    loadTutorial(tutorialId) {
        const tutorials = {
            '4k-demo': {
                title: 'Writing a 4K Demo',
                content: 'Learn to create demos under 4KB using WebGL...'
            },
            'chiptune': {
                title: 'Chiptune Composition',
                content: 'Create 8-bit music with Web Audio API...'
            },
            'sprites': {
                title: '8-bit Sprite Design',
                content: 'Design pixel art for your demos...'
            }
        };
        
        const tutorial = tutorials[tutorialId];
        if (tutorial) {
            alert(`Loading tutorial: ${tutorial.title}\n\nThis feature is coming soon!`);
        }
    }
    
    // Utility functions
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Particles Effect
    startParticlesEffect(canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const particles = [];
        const particleCount = 200;
        
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
                this.size = Math.random() * 3 + 1;
                this.color = `hsl(${Math.random() * 60 + 240}, 70%, 60%)`;
                this.life = 1;
                this.decay = Math.random() * 0.02 + 0.005;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= this.decay;
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            
            draw() {
                ctx.save();
                ctx.globalAlpha = this.life;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
        
        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        function animate() {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((particle, index) => {
                particle.update();
                particle.draw();
                
                if (particle.life <= 0) {
                    particles[index] = new Particle();
                }
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
        
        // Store animation ID for cleanup
        this.currentAnimationId = animationId;
    }
    
    // Wireframe Effect
    startWireframeEffect(canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        
        const points = [];
        const pointCount = 50;
        
        class Point {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }
            
            draw() {
                ctx.fillStyle = '#00ffff';
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Initialize points
        for (let i = 0; i < pointCount; i++) {
            points.push(new Point());
        }
        
        function animate() {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw points
            points.forEach(point => {
                point.update();
                point.draw();
            });
            
            // Draw connections
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            
            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.globalAlpha = 1 - (distance / 100);
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.stroke();
                    }
                }
            }
            
            ctx.globalAlpha = 1;
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
        
        this.currentAnimationId = animationId;
    }
    
    // Glitch Effect
    startGlitchEffect(canvas) {
        const ctx = canvas.getContext('2d');
        let animationId;
        let glitchTimer = 0;
        
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        const text = 'GLITCH';
        const fontSize = 120;
        
        function animate() {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            glitchTimer++;
            
            // Normal text
            ctx.fillStyle = '#ff00ff';
            ctx.font = `${fontSize}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Glitch effect every 30 frames
            if (glitchTimer % 30 < 5) {
                // Red channel shift
                ctx.fillStyle = '#ff0000';
                ctx.fillText(text, centerX + 2, centerY);
                
                // Blue channel shift
                ctx.fillStyle = '#0000ff';
                ctx.fillText(text, centerX - 2, centerY);
                
                // Random character replacement
                const glitchedText = text.split('').map(char => 
                    Math.random() < 0.3 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
                ).join('');
                
                ctx.fillStyle = '#ff00ff';
                ctx.fillText(glitchedText, centerX, centerY);
            } else {
                ctx.fillStyle = '#ff00ff';
                ctx.fillText(text, centerX, centerY);
            }
            
            // Add some random glitch lines
            if (Math.random() < 0.1) {
                ctx.strokeStyle = '#ff00ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, Math.random() * canvas.height);
                ctx.lineTo(canvas.width, Math.random() * canvas.height);
                ctx.stroke();
            }
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
        
        this.currentAnimationId = animationId;
    }
    
    // Save demo
    saveDemo(title, code) {
        const demo = {
            id: 'demo-' + Date.now(),
            title,
            code,
            timestamp: new Date().toISOString(),
            author: 'Anonymous'
        };
        
        // In a real implementation, this would save to a server
        console.log('Demo saved:', demo);
        alert('Demo saved! (This is a demo - in production, demos would be saved to a server)');
    }
    
    // Cleanup method for when platform is closed
    cleanup() {
        // Close full-screen demo if open
        this.closeFullScreenDemo();
        
        // Stop all running animations
        if (window.darkWaveCore) {
            window.darkWaveCore.pauseAllAnimations();
        }
        
        // Stop audio
        if (window.darkWaveAudio) {
            window.darkWaveAudio.stopAmbientTrack();
        }
        
        // Clear any running demos
        this.currentDemo = null;
        
        console.log('Demoscene platform cleaned up');
    }
}

// Global functions for HTML onclick handlers
function scrollToSection(sectionId) {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.scrollToSection(sectionId);
    }
}

function clearCanvas() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.clearCanvas();
    }
}

function addParticle() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.addParticle();
    }
}

function playDemo() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.playDemo();
    }
}

function playChiptune() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.playChiptune();
    }
}

function stopAudio() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.stopAudio();
    }
}

function runCode() {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.runCode();
    }
}

function loadTutorial(tutorialId) {
    if (window.demoscenePlatform) {
        window.demoscenePlatform.loadTutorial(tutorialId);
    }
}



// Initialize platform when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.demoscenePlatform = new DemoscenePlatform();
    } catch (error) {
        console.error('Failed to initialize DemoscenePlatform:', error);
    }
});

// Also try to initialize immediately if DOM is already ready
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already ready, initialize immediately
    try {
        window.demoscenePlatform = new DemoscenePlatform();
    } catch (error) {
        console.error('Failed to initialize DemoscenePlatform (immediate):', error);
    }
} 