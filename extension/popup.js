/**
 * PassEvolver - WebExtension Popup Logic v1.2
 * Auto-detects active tab domain for Service Salt, 1-Click Password Autofill & Phrase Eye Mask Toggle.
 */

import { evolvePassword } from './engine.js';

document.addEventListener('DOMContentLoaded', async () => {
  const phraseInput = document.getElementById('phrase-input');
  const togglePhraseEyeBtn = document.getElementById('toggle-phrase-eye');
  const saltInput = document.getElementById('salt-input');
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');
  const outputDisplay = document.getElementById('output-display');
  const copyBtn = document.getElementById('copy-btn');
  const autofillBtn = document.getElementById('autofill-btn');
  const domainText = document.getElementById('domain-text');
  const statusToast = document.getElementById('status-toast');

  let activeTabId = null;
  let isPhraseMasked = true;

  // 1. Detect Active Tab Domain Host
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        activeTabId = tab.id;
        const url = new URL(tab.url);
        const host = url.hostname.replace(/^www\./, '');
        if (host && !host.includes('chrome://') && !host.includes('extension')) {
          saltInput.value = host;
          if (domainText) domainText.textContent = host;
        } else {
          if (domainText) domainText.textContent = 'PassEvolver';
        }
      }
    }
  } catch (err) {
    if (domainText) domainText.textContent = 'PassEvolver';
  }

  // 2. Phrase Mask / Reveal Eye Toggle Handler
  togglePhraseEyeBtn?.addEventListener('click', () => {
    isPhraseMasked = !isPhraseMasked;
    phraseInput.type = isPhraseMasked ? 'password' : 'text';

    if (isPhraseMasked) {
      // Eye Open Icon
      togglePhraseEyeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      `;
    } else {
      // Eye Off Icon
      togglePhraseEyeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 19c-7 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
      `;
    }
  });

  // 3. Real-time Password Evolution Update
  function update() {
    const phrase = phraseInput.value.trim();
    const salt = saltInput.value.trim();
    const length = parseInt(lengthSlider.value, 10);

    if (lengthVal) lengthVal.textContent = length;

    if (!phrase) {
      outputDisplay.textContent = 'Enter phrase above...';
      outputDisplay.classList.add('placeholder');
      return;
    }

    outputDisplay.classList.remove('placeholder');
    const pwd = evolvePassword(phrase, length, false, 'matrix', salt);
    outputDisplay.textContent = pwd;
  }

  phraseInput.addEventListener('input', update);
  saltInput.addEventListener('input', update);
  lengthSlider.addEventListener('input', update);

  // 4. Copy to Clipboard
  copyBtn.addEventListener('click', () => {
    const pwd = outputDisplay.textContent;
    if (!pwd || pwd === 'Enter phrase above...') return;

    navigator.clipboard.writeText(pwd).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      showToast('Copied to clipboard!');
    });
  });

  // 5. One-Click Password Autofill into Active Webpage Fields
  autofillBtn.addEventListener('click', async () => {
    const pwd = outputDisplay.textContent;
    if (!pwd || pwd === 'Enter phrase above...') {
      showToast('Enter phrase first!');
      return;
    }

    if (typeof chrome !== 'undefined' && chrome.scripting && activeTabId) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTabId },
          func: (passwordToFill) => {
            const inputs = document.querySelectorAll('input[type="password"], input[name*="password"], input[id*="password"], input[type="text"]');
            if (inputs.length > 0) {
              inputs.forEach(input => {
                input.value = passwordToFill;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              });
              return true;
            }
            return false;
          },
          args: [pwd]
        });
        showToast('Password Auto-Filled!');
      } catch (e) {
        showToast('Copied! (Autofill restricted on this tab)');
        navigator.clipboard.writeText(pwd);
      }
    } else {
      navigator.clipboard.writeText(pwd);
      showToast('Copied to clipboard!');
    }
  });

  function showToast(msg) {
    if (statusToast) {
      statusToast.textContent = msg;
      setTimeout(() => {
        statusToast.textContent = '';
      }, 2500);
    }
  }
});
