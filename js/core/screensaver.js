// neuOS Starfield Background - Chillhouse Vibes
// neu-os

class Star {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.2 + 1.8; // Bigger stars (1.8-4px)
        this.opacity = Math.random() * 0.6 + 0.4; // Varied opacity
        this.twinkle = Math.random() * Math.PI * 2; // Twinkle phase
        this.twinkleSpeed = Math.random() * 0.015 + 0.005; // Slower twinkle for calm pulse
        this.pulse = Math.random() * Math.PI * 2; // Pulse phase
        this.pulseSpeed = Math.random() * 0.01 + 0.005; // Slow pulse speed
        // Chillhouse color palette
        const colors = [
            'rgba(255, 255, 255, 0.8)', // Pure white
            'rgba(173, 216, 230, 0.7)', // Light blue
            'rgba(147, 197, 253, 0.6)', // Sky blue
            'rgba(196, 181, 253, 0.5)', // Lavender
            'rgba(167, 139, 250, 0.4)'  // Purple
        ];
        this.baseColor = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // All stars drift together - moving slowly right and up
        this.x += 0.1; // Slow rightward drift
        this.y -= 0.05; // Slow upward drift
        this.twinkle += this.twinkleSpeed;
        this.pulse += this.pulseSpeed; // Update pulse
        // Wrap around edges for infinite feel
        if (this.x > this.width + 10) this.x = -10;
        if (this.y < -10) this.y = this.height + 10;
    }

    draw(ctx) {
        const twinkleFactor = Math.sin(this.twinkle) * 0.3 + 0.7;
        const pulseFactor = Math.sin(this.pulse) * 0.2 + 0.8; // Calm pulse (0.6-1.0)
        const currentOpacity = this.opacity * twinkleFactor * pulseFactor;
        const currentSize = this.size * pulseFactor; // Size also pulses gently
        ctx.fillStyle = this.baseColor.replace(/[\d.]+\)$/, `${currentOpacity})`);
        ctx.fillRect(Math.round(this.x), Math.round(this.y), currentSize, currentSize);
    }
}

class ShootingStar {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // Randomize starting position off-screen for natural entry (e.g., from top or sides)
        this.x = Math.random() * width * 1.5 - width * 0.25; // Slightly off left/right
        this.y = -50 + Math.random() * height * 0.2; // Start above top, slight variation

        // Randomize direction with a downward bias (angle in degrees, 20-160 for variety, but mostly diagonal)
        const angle = Math.random() * 140 + 20; // Biased towards 45-90 degrees for diagonal falls
        const speed = (Math.random() * 3 + 4); // Speed 4-7 for quicker streak
        this.speedX = Math.cos(angle * Math.PI / 180) * speed;
        this.speedY = Math.sin(angle * Math.PI / 180) * speed;

        this.length = Math.random() * 60 + 30; // Longer trails (30-90) to span more screen
        this.opacity = 1; // Starting opacity
        this.trail = []; // Now each trail point will have {x, y, opacity}
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Add current position to trail with full opacity
        this.trail.push({x: this.x, y: this.y, opacity: this.opacity});

        // Fade overall opacity slightly slower for longer visibility
        this.opacity -= 0.015;

        // Limit trail length and fade older points
        if (this.trail.length > this.length) {
            this.trail.shift();
        }

        // Graduate opacity: reduce for older trail points (tail fainter)
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].opacity = this.opacity * (i / this.trail.length); // Linear gradient: tail ~0, head ~1
        }

        // Remove if faded or off-screen
        if (this.opacity <= 0 || this.x > this.width + 100 || this.x < -100 || this.y > this.height + 100 || this.y < -100) {
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.beginPath();
        if (this.trail.length > 0) {
            ctx.moveTo(this.trail[0].x, this.trail[0].y);
            for (let i = 1; i < this.trail.length; i++) {
                ctx.lineTo(this.trail[i].x, this.trail[i].y);
            }
        }

        // Add subtle glow
        ctx.shadowColor = 'white';
        ctx.shadowBlur = 3; // Faint glow effect
        ctx.strokeStyle = 'rgba(255, 255, 255, 1)'; // Pure white, opacity handled per segment
        ctx.lineWidth = 1; // Thinner for realism

        // Draw with graduated opacity (requires drawing segments individually for varying alpha)
        for (let i = 1; i < this.trail.length; i++) {
            ctx.beginPath(); // Reset path for each segment
            ctx.moveTo(this.trail[i-1].x, this.trail[i-1].y);
            ctx.lineTo(this.trail[i].x, this.trail[i].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.trail[i].opacity})`;
            ctx.stroke();
        }

        ctx.shadowBlur = 0; // Reset glow to avoid affecting other drawings
    }
}

class StarfieldBackground {
    constructor() {
        this.canvas = document.getElementById('starfield-bg');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.stars = [];
        this.shootingStars = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.initStars();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initStars();
        });
        this.animate();
    }

    resizeCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    initStars() {
        this.stars = [];
        const numStars = Math.floor((this.width * this.height) / 8000);
        for (let i = 0; i < numStars; i++) {
            this.stars.push(new Star(this.width, this.height));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.stars.forEach(star => {
            star.update();
            star.draw(this.ctx);
        });
        this.shootingStars = this.shootingStars.filter(star => !star.update());
        this.shootingStars.forEach(star => star.draw(this.ctx));
        // More frequent shooting stars
        if (Math.random() < 0.008) {
            this.shootingStars.push(new ShootingStar(this.width, this.height));
        }
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

window.StarfieldBackground = StarfieldBackground; 