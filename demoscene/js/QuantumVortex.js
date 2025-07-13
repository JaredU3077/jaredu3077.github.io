// QuantumVortex.js - Advanced 3D WebGL Vortex Demo with Audio Reactivity

class QuantumVortex {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = null;
        this.program = null;
        this.particles = [];
        this.blackHole = { x: 0, y: 0, z: 0, mass: 1000 };
        this.time = 0;
        this.audioData = null;
        this.isRunning = false;
        this.particleCount = 1000;
        this.camera = {
            x: 0, y: 0, z: 5,
            targetX: 0, targetY: 0, targetZ: 0,
            rotationX: 0, rotationY: 0
        };
        this.mouse = { x: 0, y: 0, isDown: false };
        this.zoom = 1;
        
        this.init();
    }

    init() {
        if (!window.webGLUtils) {
            console.error('WebGLUtils not available');
            return false;
        }

        // Initialize WebGL
        if (!window.webGLUtils.init(this.canvas)) {
            console.error('Failed to initialize WebGL');
            return false;
        }

        this.gl = window.webGLUtils.gl;
        
        // Create shader program
        this.createShaders();
        
        // Initialize particles
        this.initParticles();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Quantum Vortex initialized');
        return true;
    }

    createShaders() {
        const vertexShader = `
            attribute vec3 a_position;
            attribute vec3 a_velocity;
            attribute float a_life;
            attribute float a_size;
            
            uniform mat4 u_modelViewMatrix;
            uniform mat4 u_projectionMatrix;
            uniform float u_time;
            uniform vec3 u_blackHole;
            uniform float u_blackHoleMass;
            
            varying float v_life;
            varying vec3 v_position;
            
            void main() {
                // Apply black hole physics
                vec3 toBlackHole = u_blackHole - a_position;
                float distance = length(toBlackHole);
                vec3 force = normalize(toBlackHole) * u_blackHoleMass / (distance * distance + 0.1);
                
                // Update position with velocity and force
                vec3 newPosition = a_position + a_velocity * u_time + force * u_time * u_time * 0.5;
                
                // Apply vortex rotation
                float angle = u_time * 2.0 + distance * 0.5;
                mat3 rotation = mat3(
                    cos(angle), -sin(angle), 0.0,
                    sin(angle), cos(angle), 0.0,
                    0.0, 0.0, 1.0
                );
                newPosition = rotation * newPosition;
                
                // Calculate final position
                vec4 worldPosition = vec4(newPosition, 1.0);
                gl_Position = u_projectionMatrix * u_modelViewMatrix * worldPosition;
                
                // Set point size based on life and distance
                float size = a_size * (1.0 - distance * 0.1) * (0.5 + 0.5 * a_life);
                gl_PointSize = max(size, 1.0);
                
                v_life = a_life;
                v_position = newPosition;
            }
        `;

        const fragmentShader = `
            precision mediump float;
            
            uniform float u_time;
            uniform vec3 u_audioData;
            
            varying float v_life;
            varying vec3 v_position;
            
            void main() {
                // Create circular particle
                vec2 center = gl_PointCoord - vec2(0.5);
                float dist = length(center);
                if (dist > 0.5) discard;
                
                // Create glow effect
                float glow = 1.0 - dist * 2.0;
                glow = pow(glow, 2.0);
                
                // Audio-reactive colors
                vec3 color1 = vec3(0.7, 0.2, 1.0); // Purple
                vec3 color2 = vec3(0.0, 1.0, 0.6); // Cyan
                vec3 color3 = vec3(1.0, 0.0, 0.5); // Pink
                
                // Mix colors based on audio data
                vec3 finalColor = mix(color1, color2, u_audioData.x);
                finalColor = mix(finalColor, color3, u_audioData.y);
                
                // Add time-based color variation
                float timeVar = sin(u_time * 3.0 + v_position.x * 10.0) * 0.5 + 0.5;
                finalColor = mix(finalColor, vec3(1.0, 1.0, 0.0), timeVar * 0.3);
                
                // Apply life and glow
                float alpha = v_life * glow;
                gl_FragColor = vec4(finalColor, alpha);
            }
        `;

        this.program = window.webGLUtils.createProgram(vertexShader, fragmentShader);
    }

    initParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            // Create particles in a sphere around the black hole
            const radius = 10 + Math.random() * 20;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            this.particles.push({
                position: [x, y, z],
                velocity: [
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                ],
                life: Math.random(),
                size: Math.random() * 3 + 1,
                maxLife: 1.0
            });
        }
    }

    setupEventListeners() {
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.isDown = false;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.mouse.isDown) {
                const deltaX = e.clientX - this.mouse.x;
                const deltaY = e.clientY - this.mouse.y;
                
                this.camera.rotationY += deltaX * 0.01;
                this.camera.rotationX += deltaY * 0.01;
                
                this.camera.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotationX));
                
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY;
            }
        });

        // Zoom controls
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom = Math.max(0.1, Math.min(10, this.zoom));
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyR':
                    this.reset();
                    break;
            }
        });
    }

    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            // Update life
            particle.life -= deltaTime * 0.5;
            
            // Reset particle if it's dead or too close to black hole
            const distance = Math.sqrt(
                particle.position[0] * particle.position[0] +
                particle.position[1] * particle.position[1] +
                particle.position[2] * particle.position[2]
            );
            
            if (particle.life <= 0 || distance < 0.5) {
                // Respawn particle
                const radius = 15 + Math.random() * 10;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                
                particle.position[0] = radius * Math.sin(phi) * Math.cos(theta);
                particle.position[1] = radius * Math.sin(phi) * Math.sin(theta);
                particle.position[2] = radius * Math.cos(phi);
                
                particle.velocity[0] = (Math.random() - 0.5) * 2;
                particle.velocity[1] = (Math.random() - 0.5) * 2;
                particle.velocity[2] = (Math.random() - 0.5) * 2;
                
                particle.life = 1.0;
                particle.size = Math.random() * 3 + 1;
            }
        });
    }

    updateCamera() {
        // Smooth camera movement
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
        this.camera.z += (this.camera.targetZ - this.camera.z) * 0.1;
    }

    render() {
        if (!this.gl || !this.program) return;

        const gl = this.gl;
        
        // Clear
        gl.clearColor(0.05, 0.04, 0.12, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Use program
        gl.useProgram(this.program);
        
        // Set uniforms
        window.webGLUtils.setUniform(this.program, 'u_time', this.time, 'float');
        window.webGLUtils.setUniform(this.program, 'u_blackHole', [this.blackHole.x, this.blackHole.y, this.blackHole.z], 'vec3');
        window.webGLUtils.setUniform(this.program, 'u_blackHoleMass', this.blackHole.mass, 'float');
        
        // Audio data
        const audioData = this.audioData || [0.5, 0.5, 0.5];
        window.webGLUtils.setUniform(this.program, 'u_audioData', audioData, 'vec3');
        
        // Create matrices
        const aspect = this.canvas.width / this.canvas.height;
        const projectionMatrix = window.webGLUtils.createProjectionMatrix(
            window.webGLUtils.degToRad(60), aspect, 0.1, 1000
        );
        
        // Camera matrix
        const cameraMatrix = window.webGLUtils.createTranslationMatrix(
            -this.camera.x, -this.camera.y, -this.camera.z * this.zoom
        );
        
        const rotationX = window.webGLUtils.createRotationMatrix(this.camera.rotationX, [1, 0, 0]);
        const rotationY = window.webGLUtils.createRotationMatrix(this.camera.rotationY, [0, 1, 0]);
        
        const modelViewMatrix = window.webGLUtils.multiplyMatrices(
            window.webGLUtils.multiplyMatrices(rotationY, rotationX),
            cameraMatrix
        );
        
        window.webGLUtils.setUniform(this.program, 'u_projectionMatrix', projectionMatrix, 'mat4');
        window.webGLUtils.setUniform(this.program, 'u_modelViewMatrix', modelViewMatrix, 'mat4');
        
        // Create particle data
        const positions = [];
        const velocities = [];
        const lives = [];
        const sizes = [];
        
        this.particles.forEach(particle => {
            positions.push(...particle.position);
            velocities.push(...particle.velocity);
            lives.push(particle.life);
            sizes.push(particle.size);
        });
        
        // Create buffers
        const positionBuffer = window.webGLUtils.createBuffer(new Float32Array(positions));
        const velocityBuffer = window.webGLUtils.createBuffer(new Float32Array(velocities));
        const lifeBuffer = window.webGLUtils.createBuffer(new Float32Array(lives));
        const sizeBuffer = window.webGLUtils.createBuffer(new Float32Array(sizes));
        
        // Set attributes
        window.webGLUtils.setAttribute(this.program, 'a_position', positionBuffer, 3);
        window.webGLUtils.setAttribute(this.program, 'a_velocity', velocityBuffer, 3);
        window.webGLUtils.setAttribute(this.program, 'a_life', lifeBuffer, 1);
        window.webGLUtils.setAttribute(this.program, 'a_size', sizeBuffer, 1);
        
        // Draw particles
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.drawArrays(gl.POINTS, 0, this.particles.length);
        gl.disable(gl.BLEND);
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now() * 0.001;
        const deltaTime = currentTime - this.time;
        this.time = currentTime;

        // Update particles
        this.updateParticles(deltaTime);
        
        // Update camera
        this.updateCamera();
        
        // Render
        this.render();
        
        // Continue animation
        requestAnimationFrame(() => this.animate());
    }

    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.time = performance.now() * 0.001;
        this.animate();
        
        console.log('Quantum Vortex started');
    }

    stop() {
        this.isRunning = false;
        console.log('Quantum Vortex stopped');
    }

    togglePause() {
        if (this.isRunning) {
            this.stop();
        } else {
            this.start();
        }
    }

    reset() {
        this.initParticles();
        this.camera.rotationX = 0;
        this.camera.rotationY = 0;
        this.zoom = 1;
        this.time = 0;
    }

    setAudioData(data) {
        this.audioData = data;
    }

    setParticleCount(count) {
        this.particleCount = Math.max(100, Math.min(5000, count));
        this.initParticles();
    }

    setBlackHoleMass(mass) {
        this.blackHole.mass = Math.max(100, Math.min(5000, mass));
    }

    // Get stats for UI
    getStats() {
        return {
            particleCount: this.particles.length,
            fps: this.isRunning ? 60 : 0,
            audioLevel: this.audioData ? this.audioData[0] : 0
        };
    }

    // Cleanup
    dispose() {
        this.stop();
        if (this.gl) {
            this.gl.deleteProgram(this.program);
        }
    }
}

// Global Quantum Vortex instance
window.quantumVortex = null; 