// main.js - Main Application Controller for DarkWave Demoscene Platform

class DarkWaveApp {
    constructor() {
        this.currentTheme = 'dark';
        this.currentSection = 'hero';
        this.isLoading = true;
        this.quantumVortex = null;
        this.audioSystem = null;
        this.loadingProgress = 0;
        this.fpsCounter = { frames: 0, lastTime: 0, current: 60 };
        
        this.init();
    }

    async init() {
        console.log('Initializing DarkWave Demoscene Platform...');
        
        // Show loading screen
        this.showLoadingScreen();
        
        // Initialize components
        await this.initializeComponents();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize Quantum Vortex
        this.initializeQuantumVortex();
        
        // Initialize audio system
        this.initializeAudioSystem();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup theme system
        this.setupThemeSystem();
        
        // Setup editor functionality
        this.setupEditor();
        
        // Setup community features
        this.setupCommunity();
        
        // Hide loading screen
        this.hideLoadingScreen();
        
        console.log('DarkWave Demoscene Platform initialized successfully');
    }

    async initializeComponents() {
        const components = [
            { name: 'WebGL Utils', init: () => window.webGLUtils },
            { name: 'DarkWave Core', init: () => window.darkWaveCore },
            { name: 'DarkWave Audio', init: () => window.darkWaveAudio },
            { name: 'Demoscene Platform', init: () => window.demoscenePlatform }
        ];

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            this.updateLoadingProgress((i + 1) / components.length * 100, `Loading ${component.name}...`);
            
            try {
                await component.init();
                console.log(`${component.name} loaded successfully`);
            } catch (error) {
                console.error(`Failed to load ${component.name}:`, error);
            }
            
            // Small delay for visual feedback
            await this.delay(200);
        }
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
        }
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    updateLoadingProgress(progress, text) {
        this.loadingProgress = progress;
        
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    initializeQuantumVortex() {
        const heroCanvas = document.getElementById('hero-webgl');
        if (heroCanvas && window.QuantumVortex) {
            this.quantumVortex = new QuantumVortex(heroCanvas);
            this.quantumVortex.start();
            
            // Update stats
            this.updateStats();
        }
    }

    initializeAudioSystem() {
        if (window.darkWaveAudio) {
            this.audioSystem = window.darkWaveAudio;
            
            // Start ambient track
            this.audioSystem.startAmbientTrack();
            
            // Setup audio visualization
            this.setupAudioVisualization();
        }
    }

    setupAudioVisualization() {
        const audioCanvas = document.getElementById('audio-canvas');
        if (!audioCanvas) return;

        const ctx = audioCanvas.getContext('2d');
        const width = audioCanvas.width;
        const height = audioCanvas.height;

        const animate = () => {
            if (!this.audioSystem) return;

            // Get audio data
            const audioData = this.audioSystem.createVisualizerData();
            
            // Clear canvas
            ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw audio bars
            const barWidth = width / audioData.length;
            audioData.forEach((value, index) => {
                const barHeight = (value / 255) * height;
                const x = index * barWidth;
                const y = height - barHeight;

                // Create gradient
                const gradient = ctx.createLinearGradient(x, y, x, height);
                gradient.addColorStop(0, '#b388ff');
                gradient.addColorStop(1, '#00ffff');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, barWidth - 1, barHeight);
            });

            requestAnimationFrame(animate);
        };

        animate();
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboard(e);
        });

        // Intersection Observer for lazy loading
        this.setupIntersectionObserver();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.navigateToSection(section);
            });
        });

        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupThemeSystem() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Load saved theme
        const savedTheme = localStorage.getItem('darkwave-theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        }
    }

    setupEditor() {
        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        const editorPanels = document.querySelectorAll('.editor-panel');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.getAttribute('data-tab');
                this.switchEditorTab(tabName);
            });
        });

        // Editor controls
        this.setupEditorControls();
    }

    setupEditorControls() {
        // Particle count slider
        const particleSlider = document.getElementById('particle-count-input');
        const particleDisplay = document.getElementById('particle-count-display');
        
        if (particleSlider && particleDisplay) {
            particleSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                particleDisplay.textContent = value;
                if (this.quantumVortex) {
                    this.quantumVortex.setParticleCount(parseInt(value));
                }
            });
        }

        // Speed slider
        const speedSlider = document.getElementById('speed-input');
        const speedDisplay = document.getElementById('speed-display');
        
        if (speedSlider && speedDisplay) {
            speedSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                speedDisplay.textContent = parseFloat(value).toFixed(1);
            });
        }

        // Code editor
        this.setupCodeEditor();
    }

    setupCodeEditor() {
        const codeTextarea = document.getElementById('code-textarea');
        const codeConsole = document.getElementById('code-console');

        if (codeTextarea && codeConsole) {
            // Syntax highlighting (basic)
            codeTextarea.addEventListener('input', () => {
                // Basic syntax highlighting could be added here
            });
        }
    }

    setupCommunity() {
        // Comments system
        this.setupComments();
        
        // Chat system
        this.setupChat();
        
        // Leaderboard
        this.loadLeaderboard();
    }

    setupComments() {
        const commentForm = document.getElementById('comment-form');
        const commentList = document.getElementById('comment-list');

        if (commentForm) {
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addComment();
            });
        }

        // Load existing comments
        this.loadComments();
    }

    setupChat() {
        const chatForm = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');

        if (chatForm) {
            chatForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendChatMessage();
            });
        }

        // Simulate chat messages
        this.simulateChat();
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        // Observe sections for animations
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    navigateToSection(section) {
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[data-section="${section}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }

        // Scroll to section
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }

        this.currentSection = section;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('darkwave-theme', theme);

        // Update theme button
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            const themeIcon = themeBtn.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
            }
        }
    }

    switchEditorTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }

        // Update editor panels
        document.querySelectorAll('.editor-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const activePanel = document.getElementById(`${tabName}-editor`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
    }

    addComment() {
        const authorInput = document.getElementById('comment-author');
        const commentInput = document.getElementById('comment-input');
        const commentList = document.getElementById('comment-list');

        if (!authorInput || !commentInput || !commentList) return;

        const author = authorInput.value.trim();
        const comment = commentInput.value.trim();

        if (!author || !comment) return;

        // Create comment element
        const commentElement = document.createElement('li');
        commentElement.innerHTML = `
            <strong>${author}</strong>
            <span class="comment-time">${new Date().toLocaleTimeString()}</span>
            <p>${comment}</p>
        `;

        commentList.appendChild(commentElement);

        // Save to localStorage
        this.saveComments();

        // Clear inputs
        authorInput.value = '';
        commentInput.value = '';
    }

    loadComments() {
        const commentList = document.getElementById('comment-list');
        if (!commentList) return;

        const comments = JSON.parse(localStorage.getItem('darkwave-comments') || '[]');
        
        comments.forEach(comment => {
            const commentElement = document.createElement('li');
            commentElement.innerHTML = `
                <strong>${comment.author}</strong>
                <span class="comment-time">${comment.time}</span>
                <p>${comment.text}</p>
            `;
            commentList.appendChild(commentElement);
        });
    }

    saveComments() {
        const commentList = document.getElementById('comment-list');
        if (!commentList) return;

        const comments = [];
        commentList.querySelectorAll('li').forEach(li => {
            const author = li.querySelector('strong').textContent;
            const time = li.querySelector('.comment-time').textContent;
            const text = li.querySelector('p').textContent;
            
            comments.push({ author, time, text });
        });

        localStorage.setItem('darkwave-comments', JSON.stringify(comments));
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        const chatMessages = document.getElementById('chat-messages');

        if (!chatInput || !chatMessages) return;

        const message = chatInput.value.trim();
        if (!message) return;

        // Add message
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.innerHTML = `
            <strong>You</strong>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
            <p>${message}</p>
        `;

        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        chatInput.value = '';
    }

    simulateChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        const botMessages = [
            "Awesome demo! 🔥",
            "The quantum vortex is incredible!",
            "How did you create those particle effects?",
            "The audio sync is perfect!",
            "Can't wait to see more demos!"
        ];

        const botNames = ['CyberPunk', 'NeonRider', 'GlitchMaster', 'VortexFan'];

        setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance every interval
                const messageElement = document.createElement('div');
                messageElement.className = 'message';
                
                const botName = botNames[Math.floor(Math.random() * botNames.length)];
                const message = botMessages[Math.floor(Math.random() * botMessages.length)];
                
                messageElement.innerHTML = `
                    <strong>${botName}</strong>
                    <span class="message-time">${new Date().toLocaleTimeString()}</span>
                    <p>${message}</p>
                `;

                chatMessages.appendChild(messageElement);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }, 5000); // Every 5 seconds
    }

    loadLeaderboard() {
        const leaderboardList = document.getElementById('leaderboard-list');
        if (!leaderboardList) return;

        const demos = [
            { rank: 1, title: 'Quantum Vortex', author: 'DarkWave', score: 98 },
            { rank: 2, title: 'Neon Matrix', author: 'CyberPunk', score: 95 },
            { rank: 3, title: 'Glitch Storm', author: 'NeonRider', score: 92 },
            { rank: 4, title: 'Vortex Pulse', author: 'GlitchMaster', score: 89 },
            { rank: 5, title: 'Digital Rain', author: 'VortexFan', score: 87 }
        ];

        demos.forEach(demo => {
            const demoElement = document.createElement('div');
            demoElement.className = 'leaderboard-item';
            demoElement.innerHTML = `
                <span class="rank">#${demo.rank}</span>
                <span class="title">${demo.title}</span>
                <span class="author">${demo.author}</span>
                <span class="score">${demo.score}</span>
            `;
            leaderboardList.appendChild(demoElement);
        });
    }

    updateStats() {
        if (!this.quantumVortex) return;

        const stats = this.quantumVortex.getStats();
        
        // Update particle count
        const particleCount = document.getElementById('particle-count');
        if (particleCount) {
            particleCount.textContent = stats.particleCount;
        }

        // Update FPS
        const fpsCounter = document.getElementById('fps-counter');
        if (fpsCounter) {
            fpsCounter.textContent = stats.fps;
        }

        // Update audio level
        const audioLevel = document.getElementById('audio-level');
        if (audioLevel) {
            audioLevel.textContent = Math.round(stats.audioLevel * 100);
        }

        // Continue updating
        requestAnimationFrame(() => this.updateStats());
    }

    handleResize() {
        // Resize Quantum Vortex canvas
        if (this.quantumVortex && this.quantumVortex.canvas) {
            window.webGLUtils.resizeCanvas(this.quantumVortex.canvas);
        }
    }

    handleKeyboard(e) {
        switch(e.code) {
            case 'KeyT':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleTheme();
                }
                break;
            case 'KeyM':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.toggleAudio();
                }
                break;
            case 'Escape':
                this.closeFullscreenDemo();
                break;
        }
    }

    toggleAudio() {
        if (this.audioSystem) {
            this.audioSystem.toggleMute();
        }
    }

    closeFullscreenDemo() {
        const fullscreenDemo = document.getElementById('fullscreen-demo');
        if (fullscreenDemo) {
            fullscreenDemo.classList.remove('active');
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Export functions for global access
    exportDemo() {
        console.log('Exporting demo...');
        // Implementation for demo export
    }

    shareDemo() {
        console.log('Sharing demo...');
        // Implementation for demo sharing
    }

    saveDemo() {
        console.log('Saving demo...');
        // Implementation for demo saving
    }
}

// Global functions for HTML onclick handlers
window.scrollToSection = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

window.clearCanvas = function() {
    const canvas = document.getElementById('editor-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
};

window.addParticle = function() {
    // Implementation for adding particles
    console.log('Adding particle...');
};

window.playDemo = function() {
    // Implementation for playing demo
    console.log('Playing demo...');
};

window.stopDemo = function() {
    // Implementation for stopping demo
    console.log('Stopping demo...');
};

window.playChiptune = function() {
    if (window.darkWaveAudio) {
        window.darkWaveAudio.playChiptuneMelody();
    }
};

window.stopAudio = function() {
    if (window.darkWaveAudio) {
        window.darkWaveAudio.stopCurrentTrack();
    }
};

window.generateSynth = function() {
    if (window.darkWaveAudio) {
        window.darkWaveAudio.createChiptuneMelody();
    }
};

window.runCode = function() {
    const textarea = document.getElementById('code-textarea');
    const console = document.getElementById('code-console');
    
    if (textarea && console) {
        try {
            const code = textarea.value;
            const result = eval(code);
            console.innerHTML += `<div class="output">${result}</div>`;
        } catch (error) {
            console.innerHTML += `<div class="error">Error: ${error.message}</div>`;
        }
    }
};

window.clearCode = function() {
    const textarea = document.getElementById('code-textarea');
    const console = document.getElementById('code-console');
    
    if (textarea) textarea.value = '';
    if (console) console.innerHTML = '';
};

window.loadTemplate = function() {
    const textarea = document.getElementById('code-textarea');
    if (textarea) {
        textarea.value = `// Basic particle system template
const canvas = document.getElementById('editor-canvas');
const ctx = canvas.getContext('2d');

const particles = [];

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1.0
    };
}

function animate() {
    ctx.fillStyle = 'rgba(13, 11, 30, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;
        
        if (particle.life > 0) {
            ctx.fillStyle = \`rgba(179, 136, 255, \${particle.life})\`;
            ctx.fillRect(particle.x, particle.y, 2, 2);
        }
    });
    
    if (particles.length < 100) {
        particles.push(createParticle());
    }
    
    requestAnimationFrame(animate);
}

animate();`;
    }
};

window.initWebGL = function() {
    const canvas = document.getElementById('webgl-canvas');
    if (canvas && window.webGLUtils) {
        window.webGLUtils.init(canvas);
        console.log('WebGL initialized');
    }
};

window.loadShader = function() {
    console.log('Loading shader...');
    // Implementation for loading shader
};

window.renderWebGL = function() {
    console.log('Rendering WebGL...');
    // Implementation for WebGL rendering
};

window.loadTutorial = function(tutorialId) {
    console.log(`Loading tutorial: ${tutorialId}`);
    // Implementation for loading tutorials
};

window.exportDemo = function() {
    if (window.darkWaveApp) {
        window.darkWaveApp.exportDemo();
    }
};

window.shareDemo = function() {
    if (window.darkWaveApp) {
        window.darkWaveApp.shareDemo();
    }
};

window.saveDemo = function() {
    if (window.darkWaveApp) {
        window.darkWaveApp.saveDemo();
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.darkWaveApp = new DarkWaveApp();
}); 