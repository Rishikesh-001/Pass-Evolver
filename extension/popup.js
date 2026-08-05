/**
 * PassEvolver - WebExtension Popup Logic v1.2
 * Auto-detects active tab domain for Service Salt & executes one-click password Autofill into web fields.
 */

import { evolvePassword } from './engine.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();

  const phraseInput = document.getElementById('phrase-input');
  const saltInput = document.getElementById('salt-input');
  const lengthSlider = document.getElementById('length-slider');
  const lengthVal = document.getElementById('length-val');
  const outputDisplay = document.getElementById('output-display');
  const copyBtn = document.getElementById('copy-btn');
  const autofillBtn = document.getElementById('autofill-btn');
  const domainText = document.getElementById('domain-text');
  const statusToast = document.getElementById('status-toast');

  let activeTabId = null;

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
    console.log('Running standalone mode');
    if (domainText) domainText.textContent = 'PassEvolver';
  }

  // 2. Real-time Password Evolution Update
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

  // 3. Copy to Clipboard
  copyBtn.addEventListener('click', () => {
    const pwd = outputDisplay.textContent;
    if (!pwd || pwd === 'Enter phrase above...') return;

    navigator.clipboard.writeText(pwd).then(() => {
      showToast('Copied to clipboard!');
    });
  });

  // 4. One-Click Password Autofill into Active Webpage Fields
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
            // Find password inputs on active page
            const inputs = document.querySelectorAll('input[type="password"], input[name*="password"], input[id*="password"]');
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
