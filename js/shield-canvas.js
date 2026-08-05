/**
 * Pass Evolver - Cyber Shield Radar Canvas Animation Engine
 * Version 1.2
 * 
 * Renders a glowing 3D cybersecurity shield with a lock, concentric rotating binary rings,
 * radar arc sweeps, perspective grid, and expanding data shockwaves (100% offline).
 */

export class CyberShieldCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.animationId = null;
    this.isRunning = false;

    // Rotation angles & state
    this.angle1 = 0;
    this.angle2 = 0;
    this.angle3 = 0;
    this.pulsePhase = 0;
    this.waves = [];

    // Binary Strings for Rings
    this.binaryStr1 = '01101001 11010010 01000101 11100011 00101101 10011010 11001101 ';
    this.binaryStr2 = '10010110 01110100 11001010 00110101 11110000 00001111 10101010 ';

    this.primaryColor = '#FF355E';
    this.glowColor = 'rgba(255, 53, 94, 0.4)';
    this.dimColor = 'rgba(176, 0, 32, 0.25)';

    this.resizeHandler = this.handleResize.bind(this);
  }

  init() {
    this.handleResize();
    window.addEventListener('resize', this.resizeHandler);

    // Initialize shockwaves
    this.waves = [
      { r: 80, speed: 0.8, alpha: 0.6 },
      { r: 180, speed: 0.8, alpha: 0.4 },
      { r: 280, speed: 0.8, alpha: 0.2 }
    ];

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      this.start();
    }
  }

  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw() {
    if (!this.isRunning || !this.ctx) return;

    this.animationId = requestAnimationFrame(() => this.draw());

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    // Clear canvas
    this.ctx.clearRect(0, 0, w, h);

    // Update animation states
    this.angle1 += 0.003;
    this.angle2 -= 0.004;
    this.angle3 += 0.002;
    this.pulsePhase += 0.03;

    // 1. Draw Perspective Grid Background
    this.drawGrid(w, h, cx, cy);

    // 2. Draw Pulsing Data Waves
    this.drawWaves(cx, cy);

    // 3. Draw Concentric Rotating Binary & Radar Rings
    this.drawBinaryRings(cx, cy);

    // 4. Draw Central 3D Glowing Cyber Shield & Lock Icon
    this.drawCyberShield(cx, cy);
  }

  drawGrid(w, h, cx, cy) {
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(255, 53, 94, 0.04)';
    this.ctx.lineWidth = 1;

    // Concentric grid circles
    for (let r = 100; r < Math.max(w, h); r += 120) {
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Radial perspective lines
    const lineCount = 16;
    for (let i = 0; i < lineCount; i++) {
      const a = (i / lineCount) * Math.PI * 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.lineTo(cx + Math.cos(a) * w, cy + Math.sin(a) * h * 0.5);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawWaves(cx, cy) {
    this.ctx.save();
    for (let wave of this.waves) {
      this.ctx.beginPath();
      this.ctx.ellipse(cx, cy, wave.r * 1.4, wave.r * 0.7, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(255, 53, 94, ${wave.alpha * 0.3})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      wave.r += wave.speed;
      wave.alpha -= 0.002;

      if (wave.alpha <= 0 || wave.r > 450) {
        wave.r = 60;
        wave.alpha = 0.5;
      }
    }
    this.ctx.restore();
  }

  drawBinaryRings(cx, cy) {
    this.ctx.save();
    this.ctx.font = "12px 'JetBrains Mono', monospace";

    // Ring 1 (Outer Binary Ring)
    const r1X = 320;
    const r1Y = 160;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle1);
    this.ctx.fillStyle = 'rgba(255, 53, 94, 0.35)';

    for (let i = 0; i < this.binaryStr1.length; i++) {
      const a = (i / this.binaryStr1.length) * Math.PI * 2;
      const x = Math.cos(a) * r1X;
      const y = Math.sin(a) * r1Y;
      this.ctx.fillText(this.binaryStr1[i], x, y);
    }
    this.ctx.restore();

    // Ring 2 (Middle Dashed Radar Arcs)
    const r2X = 250;
    const r2Y = 125;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle2);
    this.ctx.strokeStyle = 'rgba(255, 53, 94, 0.45)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([40, 20, 10, 20]);
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, r2X, r2Y, 0, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();

    // Ring 3 (Inner Binary Ring)
    const r3X = 180;
    const r3Y = 90;
    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(this.angle3);
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';

    for (let i = 0; i < this.binaryStr2.length; i++) {
      const a = (i / this.binaryStr2.length) * Math.PI * 2;
      const x = Math.cos(a) * r3X;
      const y = Math.sin(a) * r3Y;
      this.ctx.fillText(this.binaryStr2[i], x, y);
    }
    this.ctx.restore();

    this.ctx.restore();
  }

  drawCyberShield(cx, cy) {
    this.ctx.save();
    this.ctx.translate(cx, cy - 20);

    const pulseScale = 1 + Math.sin(this.pulsePhase) * 0.03;
    this.ctx.scale(pulseScale, pulseScale);

    // Ambient Shield Glow Behind
    this.ctx.shadowColor = '#FF355E';
    this.ctx.shadowBlur = 30 + Math.sin(this.pulsePhase) * 10;

    // Draw 3D Layered Shield Outlines
    const layers = [
      { scale: 1.08, color: 'rgba(255, 53, 94, 0.15)', width: 1 },
      { scale: 1.04, color: 'rgba(255, 53, 94, 0.3)', width: 1.5 },
      { scale: 1.0, color: '#FF355E', width: 2.5 }
    ];

    for (let l of layers) {
      this.ctx.save();
      this.ctx.scale(l.scale, l.scale);
      this.ctx.strokeStyle = l.color;
      this.ctx.lineWidth = l.width;

      this.ctx.beginPath();
      // Shield Outer Path
      this.ctx.moveTo(0, -90);
      this.ctx.quadraticCurveTo(70, -75, 80, -30);
      this.ctx.quadraticCurveTo(80, 45, 0, 90);
      this.ctx.quadraticCurveTo(-80, 45, -80, -30);
      this.ctx.quadraticCurveTo(-70, -75, 0, -90);
      this.ctx.closePath();
      this.ctx.stroke();

      if (l.scale === 1.0) {
        this.ctx.fillStyle = 'rgba(10, 9, 11, 0.65)';
        this.ctx.fill();
      }
      this.ctx.restore();
    }

    // Draw Central Lock Icon inside Shield
    this.ctx.shadowBlur = 15;
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.fillStyle = 'rgba(255, 53, 94, 0.2)';
    this.ctx.lineWidth = 2.5;

    // Lock Body
    this.ctx.beginPath();
    this.ctx.roundRect(-24, -5, 48, 42, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Lock Shackle Arc
    this.ctx.beginPath();
    this.ctx.arc(0, -5, 16, Math.PI, 0);
    this.ctx.lineTo(16, -5);
    this.ctx.lineTo(-16, -5);
    this.ctx.stroke();

    // Keyhole
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.beginPath();
    this.ctx.arc(0, 10, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillRect(-2, 10, 4, 10);

    this.ctx.restore();
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.draw();
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

  destroy() {
    this.stop();
    window.removeEventListener('resize', this.resizeHandler);
  }
}
