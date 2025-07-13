// WebGLUtils.js - Advanced WebGL Utilities for Demoscene Platform

class WebGLUtils {
    constructor() {
        this.gl = null;
        this.programs = new Map();
        this.textures = new Map();
        this.buffers = new Map();
        this.isInitialized = false;
    }

    // Initialize WebGL context
    init(canvas) {
        try {
            this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!this.gl) {
                throw new Error('WebGL not supported');
            }

            // Set canvas size
            this.resizeCanvas(canvas);
            
            // Enable features
            this.gl.enable(this.gl.DEPTH_TEST);
            this.gl.enable(this.gl.BLEND);
            this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
            
            this.isInitialized = true;
            console.log('WebGL initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize WebGL:', error);
            return false;
        }
    }

    // Resize canvas with proper pixel ratio
    resizeCanvas(canvas) {
        const rect = canvas.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        
        canvas.width = rect.width * pixelRatio;
        canvas.height = rect.height * pixelRatio;
        
        if (this.gl) {
            this.gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    // Compile shader
    compileShader(source, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Shader compilation error: ${error}`);
        }

        return shader;
    }

    // Create shader program
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(vertexSource, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSource, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(`Program linking error: ${error}`);
        }

        // Clean up shaders
        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        return program;
    }

    // Create buffer
    createBuffer(data, type = this.gl.ARRAY_BUFFER) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(type, buffer);
        this.gl.bufferData(type, data, this.gl.STATIC_DRAW);
        return buffer;
    }

    // Create texture
    createTexture(image, options = {}) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        const {
            minFilter = this.gl.LINEAR,
            magFilter = this.gl.LINEAR,
            wrapS = this.gl.CLAMP_TO_EDGE,
            wrapT = this.gl.CLAMP_TO_EDGE
        } = options;

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, minFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, magFilter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrapS);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrapT);

        if (image) {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        }

        return texture;
    }

    // Generate procedural texture
    generateProceduralTexture(width, height, generator) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (y * width + x) * 4;
                const color = generator(x, y, width, height);
                
                data[index] = color.r || 0;     // R
                data[index + 1] = color.g || 0; // G
                data[index + 2] = color.b || 0; // B
                data[index + 3] = color.a || 255; // A
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        return this.createTexture(canvas);
    }

    // Create mesh generators
    createQuad() {
        const vertices = new Float32Array([
            -1, -1, 0,  0, 0,
             1, -1, 0,  1, 0,
             1,  1, 0,  1, 1,
            -1,  1, 0,  0, 1
        ]);
        
        const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
        
        return {
            vertices: this.createBuffer(vertices),
            indices: this.createBuffer(indices, this.gl.ELEMENT_ARRAY_BUFFER),
            indexCount: indices.length
        };
    }

    createCube() {
        const vertices = new Float32Array([
            // Front face
            -1, -1,  1,  0, 0,
             1, -1,  1,  1, 0,
             1,  1,  1,  1, 1,
            -1,  1,  1,  0, 1,
            // Back face
            -1, -1, -1,  1, 0,
             1, -1, -1,  0, 0,
             1,  1, -1,  0, 1,
            -1,  1, -1,  1, 1,
            // Top face
            -1,  1, -1,  0, 1,
             1,  1, -1,  1, 1,
             1,  1,  1,  1, 0,
            -1,  1,  1,  0, 0,
            // Bottom face
            -1, -1, -1,  1, 1,
             1, -1, -1,  0, 1,
             1, -1,  1,  0, 0,
            -1, -1,  1,  1, 0,
            // Right face
             1, -1, -1,  1, 0,
             1,  1, -1,  1, 1,
             1,  1,  1,  0, 1,
             1, -1,  1,  0, 0,
            // Left face
            -1, -1, -1,  0, 0,
            -1,  1, -1,  0, 1,
            -1,  1,  1,  1, 1,
            -1, -1,  1,  1, 0
        ]);
        
        const indices = new Uint16Array([
            0,  1,  2,    0,  2,  3,   // front
            4,  5,  6,    4,  6,  7,   // back
            8,  9,  10,   8,  10, 11,  // top
            12, 13, 14,   12, 14, 15,  // bottom
            16, 17, 18,   16, 18, 19,  // right
            20, 21, 22,   20, 22, 23   // left
        ]);
        
        return {
            vertices: this.createBuffer(vertices),
            indices: this.createBuffer(indices, this.gl.ELEMENT_ARRAY_BUFFER),
            indexCount: indices.length
        };
    }

    createSphere(segments = 32) {
        const vertices = [];
        const indices = [];
        
        for (let lat = 0; lat <= segments; lat++) {
            const theta = lat * Math.PI / segments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);
            
            for (let lon = 0; lon <= segments; lon++) {
                const phi = lon * 2 * Math.PI / segments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);
                
                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;
                const u = lon / segments;
                const v = lat / segments;
                
                vertices.push(x, y, z, u, v);
            }
        }
        
        for (let lat = 0; lat < segments; lat++) {
            for (let lon = 0; lon < segments; lon++) {
                const first = lat * (segments + 1) + lon;
                const second = first + segments + 1;
                
                indices.push(first, second, first + 1);
                indices.push(second, second + 1, first + 1);
            }
        }
        
        return {
            vertices: this.createBuffer(new Float32Array(vertices)),
            indices: this.createBuffer(new Uint16Array(indices), this.gl.ELEMENT_ARRAY_BUFFER),
            indexCount: indices.length
        };
    }

    // Matrix utilities
    createProjectionMatrix(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const rangeInv = 1.0 / (near - far);
        
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    }

    createRotationMatrix(angle, axis) {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const [x, y, z] = axis;
        
        return [
            x * x * (1 - c) + c, x * y * (1 - c) - z * s, x * z * (1 - c) + y * s, 0,
            y * x * (1 - c) + z * s, y * y * (1 - c) + c, y * z * (1 - c) - x * s, 0,
            x * z * (1 - c) - y * s, y * z * (1 - c) + x * s, z * z * (1 - c) + c, 0,
            0, 0, 0, 1
        ];
    }

    createTranslationMatrix(x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];
    }

    createScaleMatrix(x, y, z) {
        return [
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ];
    }

    multiplyMatrices(a, b) {
        const result = new Array(16);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                let sum = 0;
                for (let k = 0; k < 4; k++) {
                    sum += a[i * 4 + k] * b[k * 4 + j];
                }
                result[i * 4 + j] = sum;
            }
        }
        return result;
    }

    // Render utilities
    clear(color = [0, 0, 0, 1]) {
        this.gl.clearColor(...color);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    useProgram(program) {
        this.gl.useProgram(program);
    }

    setUniform(program, name, value, type = 'float') {
        const location = this.gl.getUniformLocation(program, name);
        if (location === null) return;

        switch (type) {
            case 'float':
                this.gl.uniform1f(location, value);
                break;
            case 'int':
                this.gl.uniform1i(location, value);
                break;
            case 'vec2':
                this.gl.uniform2f(location, value[0], value[1]);
                break;
            case 'vec3':
                this.gl.uniform3f(location, value[0], value[1], value[2]);
                break;
            case 'vec4':
                this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
                break;
            case 'mat4':
                this.gl.uniformMatrix4fv(location, false, value);
                break;
        }
    }

    setAttribute(program, name, buffer, size, type = this.gl.FLOAT, normalized = false, stride = 0, offset = 0) {
        const location = this.gl.getAttribLocation(program, name);
        if (location === -1) return;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.enableVertexAttribArray(location);
        this.gl.vertexAttribPointer(location, size, type, normalized, stride, offset);
    }

    drawMesh(mesh, mode = this.gl.TRIANGLES) {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
        this.gl.drawElements(mode, mesh.indexCount, this.gl.UNSIGNED_SHORT, 0);
    }

    // Post-processing effects
    createBloomEffect(threshold = 0.8, intensity = 1.0) {
        const bloomVertexShader = `
            attribute vec3 position;
            attribute vec2 texCoord;
            varying vec2 vTexCoord;
            
            void main() {
                gl_Position = vec4(position, 1.0);
                vTexCoord = texCoord;
            }
        `;

        const bloomFragmentShader = `
            precision mediump float;
            uniform sampler2D u_texture;
            uniform float u_threshold;
            uniform float u_intensity;
            varying vec2 vTexCoord;
            
            void main() {
                vec4 color = texture2D(u_texture, vTexCoord);
                float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
                
                if (brightness > u_threshold) {
                    gl_FragColor = color * u_intensity;
                } else {
                    gl_FragColor = vec4(0.0);
                }
            }
        `;

        return this.createProgram(bloomVertexShader, bloomFragmentShader);
    }

    // Utility functions
    degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    radToDeg(radians) {
        return radians * 180 / Math.PI;
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    lerp(start, end, factor) {
        return start + (end - start) * factor;
    }

    // Cleanup
    dispose() {
        if (this.gl) {
            // Clean up programs
            this.programs.forEach(program => {
                this.gl.deleteProgram(program);
            });
            this.programs.clear();

            // Clean up textures
            this.textures.forEach(texture => {
                this.gl.deleteTexture(texture);
            });
            this.textures.clear();

            // Clean up buffers
            this.buffers.forEach(buffer => {
                this.gl.deleteBuffer(buffer);
            });
            this.buffers.clear();
        }
    }
}

// Global WebGL utilities instance
window.webGLUtils = new WebGLUtils(); 