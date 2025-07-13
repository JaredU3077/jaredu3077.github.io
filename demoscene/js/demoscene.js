// [secret]
// Demoscene Platform - Enhanced Version with High-Quality Graphics and Audio

console.log('Enhanced Demoscene script loading...');

class DemoscenePlatform {
    constructor() {
        console.log('DemoscenePlatform constructor called');
        this.demoGallery = [];
        this.currentDemo = null;
        this.audioEnabled = true;
        this.currentAudioTrack = null;
        this.fullscreenCanvas = null;
        this.fullscreenCtx = null;
        this.animationId = null;
        this.audioInitialized = false;
        this.userDemos = [];
        this.filters = {
            type: 'all',
            sort: 'popularity'
        };
        this.init();
    }
    
    init() {
        console.log('DemoscenePlatform init started');
        
        // Check dependencies
        if (!window.darkWaveCore) {
            console.error('DarkWaveCore not found!');
            return;
        }
        
        console.log('Dependencies check passed');
        this.loadDemoGallery();
        this.setupFullscreenCanvas();
        this.setupAudioControls();
        this.initializeAudio();
        console.log('DemoscenePlatform init complete');
    }
    
    initializeAudio() {
        // Initialize audio only once
        if (this.audioInitialized) return;
        
        if (window.darkWaveAudio && !window.darkWaveAudio.isInitialized) {
            window.darkWaveAudio.init().then(() => {
                this.audioInitialized = true;
                console.log('Audio system initialized for demoscene');
            }).catch(error => {
                console.error('Failed to initialize audio:', error);
            });
        } else if (window.darkWaveAudio && window.darkWaveAudio.isInitialized) {
            this.audioInitialized = true;
            console.log('Audio system already initialized');
        }
    }
    
    setupFullscreenCanvas() {
        const canvas = document.getElementById('fullscreen-canvas');
        if (!canvas) {
            console.error('Fullscreen canvas not found');
            return;
        }
        
        this.fullscreenCanvas = canvas;
        this.fullscreenCtx = canvas.getContext('2d');
        
        // Set high-resolution canvas
        this.resizeFullscreenCanvas();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeFullscreenCanvas();
        });
    }
    
    resizeFullscreenCanvas() {
        if (!this.fullscreenCanvas) return;
        
        // Get display size
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;
        
        // Set canvas size to match display size
        this.fullscreenCanvas.width = displayWidth;
        this.fullscreenCanvas.height = displayHeight;
        
        // Set CSS size
        this.fullscreenCanvas.style.width = displayWidth + 'px';
        this.fullscreenCanvas.style.height = displayHeight + 'px';
        
        console.log(`Canvas resized to ${displayWidth}x${displayHeight}`);
    }
    
    setupAudioControls() {
        const audioToggle = document.getElementById('demo-audio-toggle');
        if (audioToggle) {
            audioToggle.addEventListener('click', () => {
                this.toggleAudio();
            });
        }
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        
        if (!window.darkWaveAudio) {
            console.error('Audio system not available');
            return;
        }
        
        if (this.audioEnabled) {
            // Unmute: restore volume and restart current track if needed
            window.darkWaveAudio.toggleMute(); // This will unmute
            if (this.currentDemo && !window.darkWaveAudio.currentTrack) {
                // Restart the track if it was stopped
                window.darkWaveAudio.playDemosceneTrack(this.currentDemo.id);
            }
        } else {
            // Mute: stop current track and mute
            window.darkWaveAudio.stopCurrentTrack();
            window.darkWaveAudio.toggleMute(); // This will mute
        }
        
        // Update button appearance
        const audioToggle = document.getElementById('demo-audio-toggle');
        if (audioToggle) {
            audioToggle.textContent = this.audioEnabled ? '♪' : '🔇';
            audioToggle.title = this.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        }
        
        console.log(`Audio ${this.audioEnabled ? 'enabled' : 'disabled'}`);
    }
    
    loadDemoGallery() {
        console.log('Loading demo gallery...');
        const gallery = document.getElementById('demo-gallery');
        if (!gallery) {
            console.error('Demo gallery element not found');
            return;
        }
        console.log('Demo gallery element found:', gallery);
        
        // Define enhanced demos with unique audio tracks
        const demos = [
            {
                id: 'quantum-vortex',
                title: 'Quantum Vortex',
                description: '3D WebGL vortex with black hole physics and audio reactivity',
                type: 'webgl',
                audioTrack: 'quantum-synth',
                duration: 60,
                effects: ['particle-physics', 'black-hole-gravity', 'audio-reactive'],
                colors: ['#b388ff', '#00ffff', '#ff00ff', '#00ff41'],
                popularity: 98,
                author: 'DarkWave',
                date: '2024-01-15'
            },
            {
                id: 'neon-particles',
                title: 'Neon Particles',
                description: 'Dynamic particle system with neon colors and physics',
                type: 'particles',
                audioTrack: 'neon-pulse',
                duration: 45,
                effects: ['particle-trails', 'color-cycling', 'gravity-waves'],
                colors: ['#b388ff', '#00ffff', '#ff00ff', '#00ff41'],
                popularity: 95,
                author: 'CyberPunk',
                date: '2024-01-10'
            },
            {
                id: 'matrix-rain',
                title: 'Matrix Rain',
                description: 'Classic matrix-style falling characters with glitch effects',
                type: 'matrix',
                audioTrack: 'digital-rain',
                duration: 45,
                effects: ['character-variation', 'speed-cycling', 'glitch-distortion'],
                colors: ['#00ff41', '#00ff00', '#00cc00'],
                popularity: 92,
                author: 'NeonRider',
                date: '2024-01-08'
            },
            {
                id: 'wireframe-network',
                title: 'Wireframe Network',
                description: 'Connected nodes with dynamic movement and energy flow',
                type: 'wireframe',
                audioTrack: 'network-pulse',
                duration: 45,
                effects: ['node-pulsing', 'connection-flow', 'energy-particles'],
                colors: ['#b388ff', '#00ffff', '#ff00ff'],
                popularity: 89,
                author: 'GlitchMaster',
                date: '2024-01-05'
            },
            {
                id: 'glitch-text',
                title: 'Glitch Text',
                description: 'Distorted text with advanced glitch and corruption effects',
                type: 'glitch',
                audioTrack: 'glitch-corruption',
                duration: 45,
                effects: ['text-corruption', 'color-shifting', 'scanline-effects'],
                colors: ['#ff00ff', '#00ffff', '#b388ff'],
                popularity: 87,
                author: 'VortexFan',
                date: '2024-01-03'
            },
            {
                id: 'holographic-grid',
                title: 'Holographic Grid',
                description: 'Futuristic grid with holographic projections and depth',
                type: 'webgl',
                audioTrack: 'holographic-wave',
                duration: 50,
                effects: ['depth-mapping', 'holographic-layers', 'grid-animation'],
                colors: ['#00ffff', '#ff00ff', '#ffff00'],
                popularity: 85,
                author: 'HoloCreator',
                date: '2024-01-01'
            },
            {
                id: 'energy-pulse',
                title: 'Energy Pulse',
                description: 'Pulsing energy waves with frequency modulation',
                type: 'particles',
                audioTrack: 'energy-pulse',
                duration: 40,
                effects: ['wave-propagation', 'frequency-mod', 'energy-dissipation'],
                colors: ['#ff00ff', '#00ff41', '#ffff00'],
                popularity: 83,
                author: 'EnergyMaster',
                date: '2023-12-28'
            },
            {
                id: 'digital-corruption',
                title: 'Digital Corruption',
                description: 'Digital artifacts and corruption effects with noise',
                type: 'glitch',
                audioTrack: 'corruption-noise',
                duration: 55,
                effects: ['digital-artifacts', 'noise-generation', 'corruption-spread'],
                colors: ['#ff0000', '#00ff00', '#0000ff'],
                popularity: 81,
                author: 'CorruptionDev',
                date: '2023-12-25'
            }
        ];
        
        this.demoGallery = demos;
        this.loadUserDemos();
        this.setupFilters();
        this.renderDemoGallery();
    }
    
    renderDemoGallery() {
        console.log('Rendering demo gallery...');
        const gallery = document.getElementById('demo-gallery');
        if (!gallery) {
            console.error('Demo gallery element not found');
            return;
        }
        
        const filteredDemos = this.getFilteredDemos();
        console.log('Rendering', filteredDemos.length, 'filtered demos');
        gallery.innerHTML = '';
        
        filteredDemos.forEach(demo => {
            // Get audio track name safely
            let audioTrackName = 'Audio Track';
            if (window.darkWaveAudio && window.darkWaveAudio.demosceneTracks && window.darkWaveAudio.demosceneTracks[demo.id]) {
                audioTrackName = window.darkWaveAudio.demosceneTracks[demo.id].name;
            }
            
            const demoCard = document.createElement('article');
            demoCard.className = 'demo-card';
            demoCard.innerHTML = `
                <canvas id="${demo.id}-canvas" width="320" height="200"></canvas>
                <h3>${demo.title}</h3>
                <p>${demo.description}</p>
                <div class="demo-meta">
                    <span class="demo-duration">${demo.duration}s</span>
                    <span class="demo-effects">${demo.effects.length} effects</span>
                    <span class="demo-audio">♪ ${audioTrackName}</span>
                    <span class="demo-popularity">★ ${demo.popularity}</span>
                </div>
                <div class="demo-info">
                    <span class="demo-author">by ${demo.author}</span>
                    <span class="demo-date">${demo.date}</span>
                </div>
                <button class="neon-button small play-btn" data-demo-id="${demo.id}">Launch Demo</button>
            `;
            gallery.appendChild(demoCard);
            
            // Initialize demo preview
            this.initializeDemoPreview(demo);
        });

        // Attach event listeners for demo launch buttons
        const playButtons = gallery.querySelectorAll('.play-btn');
        playButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const demoId = e.target.getAttribute('data-demo-id');
                this.launchFullScreenDemo(demoId);
            });
        });
    }

    loadUserDemos() {
        const userDemos = JSON.parse(localStorage.getItem('darkwave-user-demos') || '[]');
        this.userDemos = userDemos;
        this.renderUserDemos();
    }

    renderUserDemos() {
        const userGallery = document.getElementById('user-demo-gallery');
        if (!userGallery) return;

        userGallery.innerHTML = '';

        if (this.userDemos.length === 0) {
            userGallery.innerHTML = '<p class="no-demos">No user demos yet. Create your first demo!</p>';
            return;
        }

        this.userDemos.forEach(demo => {
            const demoCard = document.createElement('article');
            demoCard.className = 'demo-card user-demo';
            demoCard.innerHTML = `
                <canvas id="user-${demo.id}-canvas" width="320" height="200"></canvas>
                <h3>${demo.title}</h3>
                <p>${demo.description}</p>
                <div class="demo-meta">
                    <span class="demo-duration">${demo.duration}s</span>
                    <span class="demo-author">by ${demo.author}</span>
                    <span class="demo-date">${demo.date}</span>
                </div>
                <div class="demo-actions">
                    <button class="neon-button small play-btn" data-demo-id="${demo.id}">Play</button>
                    <button class="neon-button small edit-btn" data-demo-id="${demo.id}">Edit</button>
                    <button class="neon-button small delete-btn" data-demo-id="${demo.id}">Delete</button>
                </div>
            `;
            userGallery.appendChild(demoCard);
        });
    }

    setupFilters() {
        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.setFilter(filter);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.setSort(e.target.value);
            });
        }
    }

    setFilter(filter) {
        this.filters.type = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.renderDemoGallery();
    }

    setSort(sort) {
        this.filters.sort = sort;
        this.renderDemoGallery();
    }

    getFilteredDemos() {
        let demos = [...this.demoGallery];

        // Apply type filter
        if (this.filters.type !== 'all') {
            demos = demos.filter(demo => demo.type === this.filters.type);
        }

        // Apply sort
        switch (this.filters.sort) {
            case 'popularity':
                demos.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'newest':
                demos.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'oldest':
                demos.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'duration':
                demos.sort((a, b) => b.duration - a.duration);
                break;
        }

        return demos;
    }
    
    initializeDemoPreview(demo) {
        const canvasId = `${demo.id}-canvas`;
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Create different preview animations based on demo type
        switch (demo.type) {
            case 'particles':
                this.createParticlePreview(ctx, canvas, demo);
                break;
            case 'matrix':
                this.createMatrixPreview(ctx, canvas, demo);
                break;
            case 'wireframe':
                this.createWireframePreview(ctx, canvas, demo);
                break;
            case 'glitch':
                this.createGlitchPreview(ctx, canvas, demo);
                break;
        }
    }
    
    createParticlePreview(ctx, canvas, demo) {
        const particles = [];
        for (let i = 0; i < 15; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                color: demo.colors[Math.floor(Math.random() * demo.colors.length)],
                life: Math.random() * 100
            });
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life += 0.5;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                const alpha = Math.sin(particle.life * 0.1) * 0.5 + 0.5;
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = alpha;
                ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
            });
            
            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createMatrixPreview(ctx, canvas, demo) {
        const columns = [];
        const fontSize = 10;
        const columnCount = Math.floor(canvas.width / fontSize);
        
        for (let i = 0; i < columnCount; i++) {
            columns.push({
                x: i * fontSize,
                y: Math.random() * canvas.height,
                chars: this.generateMatrixChars(8),
                speed: Math.random() * 2 + 1,
                charIndex: 0
            });
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
            ctx.textAlign = 'left';
            
            columns.forEach(column => {
                column.y += column.speed;
                if (column.y > canvas.height) {
                    column.y = -fontSize;
                    column.charIndex = (column.charIndex + 1) % column.chars.length;
                }
                
                const char = column.chars[column.charIndex];
                ctx.fillStyle = demo.colors[0];
                ctx.fillText(char, column.x, column.y);
            });
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createWireframePreview(ctx, canvas, demo) {
        const points = [];
        const connections = [];
        
        for (let i = 0; i < 8; i++) {
            points.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1
            });
        }
        
        // Create connections
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (Math.random() > 0.5) {
                    connections.push([i, j]);
                }
            }
        }
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Update points
            points.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });
            
            // Draw connections
            ctx.strokeStyle = demo.colors[0];
            ctx.lineWidth = 1;
            connections.forEach(([i, j]) => {
                const p1 = points[i];
                const p2 = points[j];
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                
                if (distance < 100) {
                    ctx.globalAlpha = 1 - (distance / 100);
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
            
            ctx.globalAlpha = 1;
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    createGlitchPreview(ctx, canvas, demo) {
        const text = 'GLITCH';
        let glitchOffset = 0;
        let glitchTime = 0;
        
        const animate = () => {
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.font = '24px Orbitron';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            glitchTime += 0.1;
            
            if (Math.random() < 0.1) {
                glitchOffset = (Math.random() - 0.5) * 10;
            } else {
                glitchOffset *= 0.9;
            }
            
            // Main text
            ctx.fillStyle = demo.colors[0];
            ctx.fillText(text, centerX + glitchOffset, centerY);
            
            // Glitch effect
            if (Math.random() < 0.05) {
                ctx.fillStyle = demo.colors[1];
                ctx.fillText(text, centerX + glitchOffset + 2, centerY);
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    generateMatrixChars(length) {
        const chars = [];
        for (let i = 0; i < length; i++) {
            chars.push(String.fromCharCode(0x30A0 + Math.random() * 96));
        }
        return chars;
    }
    
    launchFullScreenDemo(demoId) {
        const demo = this.demoGallery.find(d => d.id === demoId);
        if (!demo) return;

        console.log('Launching fullscreen demo:', demo.title);

        // Show fullscreen overlay
        const overlay = document.getElementById('fullscreen-demo');
        const titleElem = document.getElementById('demo-title');
        const descElem = document.getElementById('demo-description');
        if (!overlay || !titleElem || !descElem) return;

        // Set title and description
        titleElem.textContent = demo.title;
        descElem.textContent = demo.description;

        // Show overlay
        overlay.style.display = 'block';
        overlay.classList.add('active');

        // Clear canvas
        if (this.fullscreenCtx) {
            this.fullscreenCtx.clearRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
        }

        // Set current demo
        this.currentDemo = demo;

        // Initialize audio if needed
        this.initializeAudio();

        // Start audio if enabled
        if (this.audioEnabled && window.darkWaveAudio && this.audioInitialized) {
            // Stop any existing track first
            window.darkWaveAudio.stopCurrentTrack();
            // Start the new track
            window.darkWaveAudio.playDemosceneTrack(demo.id);
        }

        // Start the demo animation
        this.runFullscreenDemo(demo);

        // Attach close button handler (only once)
        if (!this._closeHandlerAttached) {
            const closeBtn = document.getElementById('demo-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeFullscreenDemo();
                });
                this._closeHandlerAttached = true;
            }
        }
    }
    
    closeFullscreenDemo() {
        const overlay = document.getElementById('fullscreen-demo');
        if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.remove('active');
        }
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Stop audio and cleanup
        if (window.darkWaveAudio) {
            window.darkWaveAudio.stopCurrentTrack();
            // Reset mute state
            if (!this.audioEnabled) {
                window.darkWaveAudio.toggleMute(); // This will unmute
                this.audioEnabled = true;
            }
        }
        
        this.currentDemo = null;
        
        // Update button appearance
        const audioToggle = document.getElementById('demo-audio-toggle');
        if (audioToggle) {
            audioToggle.textContent = '♪';
            audioToggle.title = 'Mute Audio';
        }
        
        console.log('Fullscreen demo closed and audio cleaned up');
    }

    runFullscreenDemo(demo) {
        // Stop any previous animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        if (!this.fullscreenCtx || !this.fullscreenCanvas) return;
        
        // Choose animation based on demo type
        let animate;
        switch (demo.type) {
            case 'particles':
                animate = this.fullscreenParticleDemo(demo);
                break;
            case 'matrix':
                animate = this.fullscreenMatrixDemo(demo);
                break;
            case 'wireframe':
                animate = this.fullscreenWireframeDemo(demo);
                break;
            case 'glitch':
                animate = this.fullscreenGlitchDemo(demo);
                break;
            default:
                this.fullscreenCtx.clearRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
                this.fullscreenCtx.fillStyle = '#fff';
                this.fullscreenCtx.font = '24px sans-serif';
                this.fullscreenCtx.fillText('Demo not implemented', 50, 50);
                return;
        }
        
        // Start animation
        const loop = () => {
            animate();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    fullscreenParticleDemo(demo) {
        const particles = [];
        const particleCount = Math.min(200, Math.floor((this.fullscreenCanvas.width * this.fullscreenCanvas.height) / 10000));
        
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * this.fullscreenCanvas.width,
                y: Math.random() * this.fullscreenCanvas.height,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 6 + 2,
                color: demo.colors[Math.floor(Math.random() * demo.colors.length)],
                life: Math.random() * Math.PI * 2,
                maxLife: Math.random() * 100 + 50
            });
        }
        
        return () => {
            this.fullscreenCtx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            this.fullscreenCtx.fillRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
            
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.life += 0.02;
                
                // Bounce off edges
                if (p.x < 0 || p.x > this.fullscreenCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.fullscreenCanvas.height) p.vy *= -1;
                
                // Keep particles in bounds
                p.x = Math.max(0, Math.min(this.fullscreenCanvas.width, p.x));
                p.y = Math.max(0, Math.min(this.fullscreenCanvas.height, p.y));
                
                // Pulsing effect
                const pulse = Math.sin(p.life) * 0.3 + 0.7;
                const size = p.size * pulse;
                
                this.fullscreenCtx.fillStyle = p.color;
                this.fullscreenCtx.globalAlpha = pulse;
                this.fullscreenCtx.fillRect(p.x - size/2, p.y - size/2, size, size);
                
                // Add glow effect
                this.fullscreenCtx.shadowColor = p.color;
                this.fullscreenCtx.shadowBlur = size * 2;
                this.fullscreenCtx.fillRect(p.x - size/2, p.y - size/2, size, size);
                this.fullscreenCtx.shadowBlur = 0;
            });
            
            this.fullscreenCtx.globalAlpha = 1;
        };
    }

    fullscreenMatrixDemo(demo) {
        const fontSize = Math.max(16, Math.floor(this.fullscreenCanvas.width / 80));
        const columns = Math.floor(this.fullscreenCanvas.width / fontSize);
        const drops = Array(columns).fill(1);
        const speeds = Array(columns).fill(0).map(() => Math.random() * 2 + 1);
        
        return () => {
            this.fullscreenCtx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            this.fullscreenCtx.fillRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
            
            this.fullscreenCtx.font = `${fontSize}px 'Share Tech Mono', monospace`;
            this.fullscreenCtx.textAlign = 'left';
            
            for (let i = 0; i < drops.length; i++) {
                const text = String.fromCharCode(0x30A0 + Math.random() * 96);
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                
                // Main character
                this.fullscreenCtx.fillStyle = demo.colors[0];
                this.fullscreenCtx.fillText(text, x, y);
                
                // Trail effect
                for (let j = 1; j < 10; j++) {
                    const trailY = y - j * fontSize;
                    if (trailY > 0) {
                        this.fullscreenCtx.globalAlpha = 1 - (j * 0.1);
                        this.fullscreenCtx.fillStyle = demo.colors[Math.min(j, demo.colors.length - 1)];
                        this.fullscreenCtx.fillText(text, x, trailY);
                    }
                }
                
                this.fullscreenCtx.globalAlpha = 1;
                
                if (drops[i] * fontSize > this.fullscreenCanvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speeds[i] * 0.1;
            }
        };
    }

    fullscreenWireframeDemo(demo) {
        const points = [];
        const connections = [];
        const pointCount = Math.min(50, Math.floor((this.fullscreenCanvas.width * this.fullscreenCanvas.height) / 20000));
        
        for (let i = 0; i < pointCount; i++) {
            points.push({
                x: Math.random() * this.fullscreenCanvas.width,
                y: Math.random() * this.fullscreenCanvas.height,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                pulse: Math.random() * Math.PI * 2
            });
        }
        
        // Create connections based on proximity
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                const distance = Math.sqrt((points[i].x - points[j].x) ** 2 + (points[i].y - points[j].y) ** 2);
                if (distance < 200) {
                    connections.push([i, j, distance]);
                }
            }
        }
        
        return () => {
            this.fullscreenCtx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            this.fullscreenCtx.fillRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
            
            // Update points
            points.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.05;
                
                // Bounce off edges
                if (p.x < 0 || p.x > this.fullscreenCanvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > this.fullscreenCanvas.height) p.vy *= -1;
                
                // Keep in bounds
                p.x = Math.max(0, Math.min(this.fullscreenCanvas.width, p.x));
                p.y = Math.max(0, Math.min(this.fullscreenCanvas.height, p.y));
            });
            
            // Draw connections
            connections.forEach(([i, j, maxDistance]) => {
                const p1 = points[i];
                const p2 = points[j];
                const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
                
                if (distance < maxDistance) {
                    const alpha = 1 - (distance / maxDistance);
                    const pulse = (Math.sin(p1.pulse) + Math.sin(p2.pulse)) * 0.5 + 0.5;
                    
                    this.fullscreenCtx.strokeStyle = demo.colors[0];
                    this.fullscreenCtx.lineWidth = 2 * alpha * pulse;
                    this.fullscreenCtx.globalAlpha = alpha * pulse;
                    
                    this.fullscreenCtx.beginPath();
                    this.fullscreenCtx.moveTo(p1.x, p1.y);
                    this.fullscreenCtx.lineTo(p2.x, p2.y);
                    this.fullscreenCtx.stroke();
                }
            });
            
            this.fullscreenCtx.globalAlpha = 1;
            
            // Draw nodes
            points.forEach(p => {
                const pulse = Math.sin(p.pulse) * 0.3 + 0.7;
                this.fullscreenCtx.fillStyle = demo.colors[1];
                this.fullscreenCtx.globalAlpha = pulse;
                this.fullscreenCtx.beginPath();
                this.fullscreenCtx.arc(p.x, p.y, 4 * pulse, 0, Math.PI * 2);
                this.fullscreenCtx.fill();
            });
            
            this.fullscreenCtx.globalAlpha = 1;
        };
    }

    fullscreenGlitchDemo(demo) {
        const texts = ['GLITCH', 'CORRUPT', 'ERROR', 'SYSTEM', 'HACK'];
        let currentText = 0;
        let glitchOffset = 0;
        let glitchTime = 0;
        let textChangeTime = 0;
        
        return () => {
            this.fullscreenCtx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            this.fullscreenCtx.fillRect(0, 0, this.fullscreenCanvas.width, this.fullscreenCanvas.height);
            
            const fontSize = Math.min(120, Math.floor(this.fullscreenCanvas.width / 8));
            this.fullscreenCtx.font = `${fontSize}px Orbitron`;
            this.fullscreenCtx.textAlign = 'center';
            this.fullscreenCtx.textBaseline = 'middle';
            
            const centerX = this.fullscreenCanvas.width / 2;
            const centerY = this.fullscreenCanvas.height / 2;
            
            glitchTime += 0.1;
            textChangeTime += 0.1;
            
            // Change text periodically
            if (textChangeTime > 3) {
                currentText = (currentText + 1) % texts.length;
                textChangeTime = 0;
            }
            
            const text = texts[currentText];
            
            // Glitch effect
            if (Math.random() < 0.1) {
                glitchOffset = (Math.random() - 0.5) * 20;
            } else {
                glitchOffset *= 0.9;
            }
            
            // Main text
            this.fullscreenCtx.fillStyle = demo.colors[0];
            this.fullscreenCtx.fillText(text, centerX + glitchOffset, centerY);
            
            // Glitch layers
            if (Math.random() < 0.05) {
                this.fullscreenCtx.fillStyle = demo.colors[1];
                this.fullscreenCtx.fillText(text, centerX + glitchOffset + 4, centerY);
            }
            
            if (Math.random() < 0.03) {
                this.fullscreenCtx.fillStyle = demo.colors[2];
                this.fullscreenCtx.fillText(text, centerX + glitchOffset - 2, centerY + 2);
            }
            
            // Scanline effect
            if (Math.random() < 0.1) {
                const scanY = Math.random() * this.fullscreenCanvas.height;
                this.fullscreenCtx.fillStyle = 'rgba(255, 0, 255, 0.3)';
                this.fullscreenCtx.fillRect(0, scanY, this.fullscreenCanvas.width, 2);
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired, initializing DemoscenePlatform...');
    try {
        window.demoscenePlatform = new DemoscenePlatform();
        console.log('DemoscenePlatform initialized successfully');
    } catch (error) {
        console.error('Failed to initialize DemoscenePlatform:', error);
    }
});

// Fallback for immediate execution
if (document.readyState !== 'loading') {
    console.log('Document already loaded, initializing immediately...');
    try {
        window.demoscenePlatform = new DemoscenePlatform();
        console.log('DemoscenePlatform initialized successfully (immediate)');
    } catch (error) {
        console.error('Failed to initialize DemoscenePlatform (immediate):', error);
    }
} 