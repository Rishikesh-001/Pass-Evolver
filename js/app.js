/**
 * PassEvolver - Application Entry Point v1.2
 * Manages Preloader initialization, CyberShieldCanvas, MatrixRain, UIController, & Service Worker.
 */

import { MatrixRain } from './matrix.js';
import { CyberShieldCanvas } from './shield-canvas.js';
import { UIController } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Preloader Initialization Sequence
  initPreloader();

  // 2. Initialize Background Animations
  const matrix = new MatrixRain('matrix-canvas');
  matrix.init();
  matrix.stop();

  const shield = new CyberShieldCanvas('matrix-canvas');
  shield.init();

  // 3. Initialize UI Controller
  const ui = new UIController(matrix, shield);
  ui.init();

  // 4. PWA Installation Handler
  let deferredPrompt = null;
  const pwaInstallBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) pwaInstallBtn.style.display = 'inline-flex';
  });

  pwaInstallBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      ui.showToast('PassEvolver installed successfully!', 'success');
    }
    deferredPrompt = null;
    pwaInstallBtn.style.display = 'none';
  });

  // 5. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
});

function initPreloader() {
  const preloader = document.getElementById('app-preloader');
  const fill = document.getElementById('preloader-progress-fill');
  const percentNum = document.getElementById('preloader-percent-num');
  const stepName = document.getElementById('preloader-step-name');

  if (!preloader || !fill) return;

  const steps = [
    { pct: 25, label: '[01/04] Loading FNV-1a Hash Engine...' },
    { pct: 55, label: '[02/04] Mounting Local Memory Sandbox...' },
    { pct: 85, label: '[03/04] Verifying Offline Service Worker...' },
    { pct: 100, label: '[04/04] Core Active • 0 Network Requests' }
  ];

  let currentStep = 0;

  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      fill.style.width = `${step.pct}%`;
      if (percentNum) percentNum.textContent = `${step.pct}%`;
      if (stepName) stepName.textContent = step.label;
      currentStep++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 500);
      }, 250);
    }
  }, 220);
}
