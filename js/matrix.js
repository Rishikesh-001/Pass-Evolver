/**
 * Pass Evolver - Enterprise Red Matrix Rain Animation Engine
 * Version 1.2 - Slower Speed, Random Character Opacity, Bright Streaks & Ambient Floating Particles
 */

export class MatrixRain {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    this.isRunning = false;

    // Characters: Katakana, Latin, Digits, Math, Hex, Cyber symbols
    this.chars = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEF<>[]=+/!@#$%^&*~';
    this.fontSize = 14;
    this.columns = 0;
    this.drops = [];
    this.opacities = [];
    this.particles = [];

    // Color Palette
    this.brightStreakColor = '#FFFFFF';
    this.primaryGlowColor = '#FF355E';
    this.deepCrimsonColor = '#B00020';

    this.lastFrameTime = 0;
    this.fps = 24; // Slower, non-distracting frame rate for enterprise polish

    this.resizeHandler = this.handleResize.bind(this);
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', this.resizeHandler);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.start();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.columns = Math.floor(this.canvas.width / this.fontSize);
    this.drops = [];
    this.opacities = [];

    for (let i = 0; i < this.columns; i++) {
      this.drops[i] = Math.floor(Math.random() * -50);
      this.opacities[i] = 0.2 + Math.random() * 0.75;
    }

    // Initialize subtle floating particles
    this.particles = [];
    for (let i = 0; i < 30; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        radius: 1 + Math.random() * 1.5,
        alpha: 0.1 + Math.random() * 0.3,
        speedY: -0.2 - Math.random() * 0.3,
      });
    }
  }

  draw(currentTime) {
    if (!this.isRunning || !this.ctx) return;

    this.animationId = requestAnimationFrame((timestamp) => this.draw(timestamp));

    // Frame rate throttle for slow, elegant animation
    const delta = currentTime - this.lastFrameTime;
    if (delta < 1000 / this.fps) return;
    this.lastFrameTime = currentTime;

    // Fade trail over matte black (#0A090B)
    this.ctx.fillStyle = 'rgba(10, 9, 11, 0.12)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', monospace`;

    // Render Matrix Columns
    for (let i = 0; i < this.drops.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * this.fontSize;
      const y = this.drops[i] * this.fontSize;

      // Random opacity & streak coloring
      const isBrightStreak = Math.random() > 0.96;
      if (isBrightStreak) {
        this.ctx.fillStyle = this.brightStreakColor;
      } else if (Math.random() > 0.6) {
        this.ctx.fillStyle = `rgba(255, 53, 94, ${this.opacities[i]})`;
      } else {
        this.ctx.fillStyle = `rgba(176, 0, 32, ${this.opacities[i] * 0.7})`;
      }

      this.ctx.fillText(char, x, y);

      if (y > this.canvas.height && Math.random() > 0.98) {
        this.drops[i] = 0;
        this.opacities[i] = 0.2 + Math.random() * 0.75;
      }

      this.drops[i]++;
    }

    // Render Floating Particles
    for (let p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(255, 53, 94, ${p.alpha})`;
      this.ctx.fill();

      p.y += p.speedY;
      if (p.y < 0) {
        p.y = this.canvas.height;
        p.x = Math.random() * this.canvas.width;
      }
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.draw(this.lastFrameTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
    return this.isRunning;
  }

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
