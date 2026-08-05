/**
 * PassEvolver - UI Controller v1.2
 * Matches Stitch Mockup UI + Pure White Glowing Aura Cursor + 10x Determinism Verifier
 * + Option A: Syntax Highlighting & Mask/Reveal Eye Toggle.
 */

import { evolvePassword, analyzePassword } from './engine.js';

export class UIController {
  constructor(matrixRainInstance, shieldCanvasInstance) {
    this.matrix = matrixRainInstance;
    this.shield = shieldCanvasInstance;

    // DOM Elements
    this.phraseInput = document.getElementById('phrase-input');
    this.lengthSlider = document.getElementById('length-slider');
    this.lengthValDisplay = document.getElementById('length-val-display');
    this.urlSafeToggle = document.getElementById('url-safe-toggle');

    // Output & Copy
    this.outputDisplay = document.getElementById('output-display');
    this.copyBtn = document.getElementById('copy-btn');
    this.toggleMaskBtn = document.getElementById('toggle-mask-btn');
    this.genTimeDisplay = document.getElementById('gen-time-display');

    // Entropy & Stats
    this.entropyRatingLabel = document.getElementById('entropy-rating-label');
    this.segItems = document.querySelectorAll('.seg-item');
    this.statEntropy = document.getElementById('stat-entropy');
    this.statLength = document.getElementById('stat-length');
    this.statAlgorithm = document.getElementById('stat-algorithm');

    // 10x Verifier
    this.testInput = document.getElementById('test-input');
    this.runTestBtn = document.getElementById('run-test-btn');
    this.testResultsLog = document.getElementById('test-results-log');
    this.verifierStatusBadge = document.getElementById('verifier-status-badge');

    // History Container
    this.historyListContainer = document.getElementById('history-list-container');

    // Modals
    this.shortcutsModal = document.getElementById('shortcuts-modal');
    this.openShortcutsBtn = document.getElementById('open-shortcuts-btn');
    this.closeShortcutsModalBtn = document.getElementById('close-shortcuts-modal');

    this.extensionModal = document.getElementById('extension-modal');
    this.openExtensionModalBtn = document.getElementById('open-extension-modal-btn');
    this.closeExtensionModalBtn = document.getElementById('close-extension-modal');

    // Toast & Cursor
    this.toastContainer = document.getElementById('toast-container');
    this.cursorGlow = document.getElementById('cursor-glow');

    // State
    this.currentPhrase = '';
    this.currentLength = 32;
    this.isUrlSafe = false;
    this.isMasked = false; // Mask/reveal state
    this.lastEvolvedPassword = '';
    this.history = [
      { name: 'quantum-shield-v1', time: '14:32:01' },
      { name: 'internal-ops-root', time: '12:10:44' }
    ];
  }

  init() {
    this.bindEvents();
    this.initCursorGlow();
    this.update();
    this.refreshIcons();
  }

  initCursorGlow() {
    if (!this.cursorGlow) return;
    window.addEventListener('mousemove', (e) => {
      this.cursorGlow.style.left = `${e.clientX}px`;
      this.cursorGlow.style.top = `${e.clientY}px`;
    });
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  bindEvents() {
    // Typing input
    this.phraseInput?.addEventListener('input', () => {
      this.currentPhrase = this.phraseInput.value;
      this.update();
    });

    // Slider
    this.lengthSlider?.addEventListener('input', () => {
      this.currentLength = parseInt(this.lengthSlider.value, 10);
      if (this.lengthValDisplay) this.lengthValDisplay.textContent = this.currentLength;
      this.update();
    });

    // URL-Safe toggle
    this.urlSafeToggle?.addEventListener('change', () => {
      this.isUrlSafe = this.urlSafeToggle.checked;
      this.update();
      this.showToast(this.isUrlSafe ? 'URL-Safe Mode Enabled' : 'Standard Mode Enabled', 'info');
    });

    // Mask / Reveal Eye Toggle Button
    this.toggleMaskBtn?.addEventListener('click', () => {
      this.isMasked = !this.isMasked;
      if (this.toggleMaskBtn) {
        this.toggleMaskBtn.innerHTML = this.isMasked 
          ? '<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>' 
          : '<i data-lucide="eye" style="width: 18px; height: 18px;"></i>';
        this.refreshIcons();
      }
      this.renderPasswordDisplay();
      this.showToast(this.isMasked ? 'Password Masked' : 'Password Revealed', 'info');
    });

    // Copy Button
    this.copyBtn?.addEventListener('click', () => {
      this.copyOutputToClipboard();
    });

    // 10x Verifier Button
    this.runTestBtn?.addEventListener('click', () => {
      this.runDeterminismTest();
    });

    // Presets
    document.querySelectorAll('.preset-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phrase = e.currentTarget.dataset.phrase;
        if (phrase) {
          document.querySelectorAll('.preset-pill-btn').forEach(c => c.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.phraseInput.value = phrase;
          this.currentPhrase = phrase;
          this.update();
          this.addToHistory(phrase);
          this.showToast(`Loaded preset phrase: "${phrase}"`, 'info');
        }
      });
    });

    // Extension Modal
    this.openExtensionModalBtn?.addEventListener('click', () => {
      if (this.extensionModal) this.extensionModal.classList.add('active');
    });
    this.closeExtensionModalBtn?.addEventListener('click', () => {
      if (this.extensionModal) this.extensionModal.classList.remove('active');
    });

    // Shortcuts Modal
    this.openShortcutsBtn?.addEventListener('click', () => {
      if (this.shortcutsModal) this.shortcutsModal.classList.add('active');
    });
    this.closeShortcutsModalBtn?.addEventListener('click', () => {
      if (this.shortcutsModal) this.shortcutsModal.classList.remove('active');
    });

    // Global Key Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.shortcutsModal) this.shortcutsModal.classList.remove('active');
        if (this.extensionModal) this.extensionModal.classList.remove('active');
      } else if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.copyOutputToClipboard();
      }
    });
  }

  update() {
    if (!this.currentPhrase.trim()) {
      this.lastEvolvedPassword = '';
      this.outputDisplay.textContent = 'Enter a phrase above...';
      this.outputDisplay.classList.add('placeholder');
      if (this.genTimeDisplay) this.genTimeDisplay.textContent = '0.00ms ⚡';
      this.updateStats('', '0.00');
      return;
    }

    this.outputDisplay.classList.remove('placeholder');

    const t0 = performance.now();
    const evolved = evolvePassword(this.currentPhrase, this.currentLength, this.isUrlSafe, 'matrix', '');
    const t1 = performance.now();
    const elapsed = (t1 - t0).toFixed(2);

    this.lastEvolvedPassword = evolved;
    this.renderPasswordDisplay();
    if (this.genTimeDisplay) this.genTimeDisplay.textContent = `${elapsed}ms ⚡`;

    this.updateStats(evolved, elapsed);
  }

  renderPasswordDisplay() {
    if (!this.lastEvolvedPassword) return;
    this.outputDisplay.innerHTML = this.formatSyntaxPassword(this.lastEvolvedPassword, this.isMasked);
  }

  formatSyntaxPassword(password, isMasked = false) {
    let html = '';
    for (let i = 0; i < password.length; i++) {
      const char = password[i];
      const displayChar = isMasked ? '•' : char;

      if (/[0-9]/.test(char)) {
        html += `<span class="pwd-digit">${displayChar}</span>`;
      } else if (/[^A-Za-z0-9]/.test(char)) {
        html += `<span class="pwd-symbol">${displayChar}</span>`;
      } else if (/[A-Z]/.test(char)) {
        html += `<span class="pwd-upper">${displayChar}</span>`;
      } else {
        html += `<span class="pwd-lower">${displayChar}</span>`;
      }
    }
    return html;
  }

  updateStats(password, elapsedMs) {
    const stats = analyzePassword(password);

    let fillGreenCount = 0;
    let fillWhiteCount = 0;

    if (stats.entropyBits >= 150) {
      fillGreenCount = 5;
      fillWhiteCount = 1;
    } else if (stats.entropyBits >= 110) {
      fillGreenCount = 4;
      fillWhiteCount = 1;
    } else if (stats.entropyBits >= 80) {
      fillGreenCount = 3;
    } else if (stats.entropyBits >= 40) {
      fillGreenCount = 2;
    } else if (stats.length > 0) {
      fillGreenCount = 1;
    }

    this.segItems.forEach((seg, idx) => {
      seg.className = 'seg-item';
      if (idx < fillGreenCount) {
        seg.classList.add('filled-green');
      } else if (idx < fillGreenCount + fillWhiteCount) {
        seg.classList.add('filled-white');
      }
    });

    if (this.entropyRatingLabel) {
      this.entropyRatingLabel.textContent = stats.entropyBits >= 150 ? 'CRITICAL_MAXIMUM' : stats.rating.toUpperCase().replace(' ', '_');
    }

    if (this.statEntropy) this.statEntropy.textContent = `${stats.entropyBits} bits`;
    if (this.statLength) this.statLength.textContent = `${stats.length} chars`;
    if (this.statAlgorithm) this.statAlgorithm.textContent = 'SHA-512/256';
  }

  runDeterminismTest() {
    const testPhrase = this.testInput?.value.trim() || 'quantum-shield-v1';
    if (this.testInput) this.testInput.value = testPhrase;

    let logHtml = '';
    const outputs = [];
    let isAllMatch = true;

    for (let i = 1; i <= 10; i++) {
      const t0 = performance.now();
      const pwd = evolvePassword(testPhrase, this.currentLength, this.isUrlSafe, 'matrix', '');
      const t1 = performance.now();
      const elapsed = (t1 - t0).toFixed(2);

      outputs.push(pwd);
      if (i > 1 && pwd !== outputs[0]) {
        isAllMatch = false;
      }

      logHtml += `
        <div class="test-run-row">
          <span>Run #${i}</span>
          <span class="test-run-pwd">${pwd}</span>
          <span>${elapsed} ms</span>
        </div>
      `;
    }

    if (this.testResultsLog) {
      this.testResultsLog.innerHTML = logHtml;
    }

    if (this.verifierStatusBadge) {
      this.verifierStatusBadge.textContent = isAllMatch ? '🟢 100% DETERMINISTIC MATCH' : '🔴 MISMATCH DETECTED';
      this.verifierStatusBadge.style.color = isAllMatch ? 'var(--accent-neon-green)' : '#FF355E';
    }

    this.showToast(isAllMatch ? 'Determinism Verified: 10/10 Runs Matched!' : 'Test Failed', isAllMatch ? 'success' : 'warning');
  }

  copyOutputToClipboard() {
    const password = this.lastEvolvedPassword;
    if (!password) {
      this.showToast('Nothing to copy. Enter a phrase first!', 'warning');
      return;
    }

    navigator.clipboard.writeText(password).then(() => {
      this.showToast('Password copied to clipboard!', 'success');
      this.animateCopyButton();
      this.addToHistory(this.currentPhrase || 'generated-key');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = password;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('Password copied to clipboard!', 'success');
      this.animateCopyButton();
      this.addToHistory(this.currentPhrase || 'generated-key');
    });
  }

  animateCopyButton() {
    if (!this.copyBtn) return;
    const originalContent = this.copyBtn.innerHTML;
    this.copyBtn.classList.add('copied');
    this.copyBtn.innerHTML = '<i data-lucide="check" style="width: 16px; height: 16px;"></i> COPIED!';
    this.refreshIcons();

    setTimeout(() => {
      this.copyBtn.classList.remove('copied');
      this.copyBtn.innerHTML = originalContent;
      this.refreshIcons();
    }, 2000);
  }

  addToHistory(phrase) {
    if (!phrase || phrase === 'generated-key') return;
    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    this.history.unshift({ name: phrase.toLowerCase().replace(/\s+/g, '-').slice(0, 20), time: timeStr });
    if (this.history.length > 5) this.history.pop();
    this.renderHistory();
  }

  renderHistory() {
    if (!this.historyListContainer) return;
    let html = '';
    this.history.forEach(item => {
      html += `
        <div class="history-item-row">
          <span class="history-name">${item.name}</span>
          <span class="history-time">${item.time}</span>
        </div>
      `;
    });
    this.historyListContainer.innerHTML = html;
  }

  showToast(message, type = 'info') {
    if (!this.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'info';
    if (type === 'success') iconName = 'check-circle';
    if (type === 'warning') iconName = 'alert-triangle';

    toast.innerHTML = `
      <i data-lucide="${iconName}"></i>
      <span>${message}</span>
    `;

    this.toastContainer.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }
}
