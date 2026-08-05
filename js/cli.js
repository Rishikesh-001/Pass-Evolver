/**
 * Pass Evolver - Power User CLI Command Parser Module
 * Allows power users to interact with Pass Evolver via terminal command drawer.
 */

import { evolvePassword } from './engine.js';

export class CLIParser {
  constructor(uiController) {
    this.ui = uiController;
  }

  execute(commandStr) {
    const raw = commandStr.trim();
    if (!raw) return { success: true, output: '' };

    const parts = this.tokenize(raw);
    const cmd = parts[0]?.toLowerCase();

    switch (cmd) {
      case 'help':
        return {
          success: true,
          output: `
AVAILABLE COMMANDS:
  evolve <phrase> [options]  - Generate password from phrase
    -l, --length <8-20>     - Set output length (default: 16)
    -s, --salt <tag>        - Set domain/service salt
    -a, --alg <name>        - Set algorithm (matrix, stealth, alpha, pin)
    -u, --urlsafe           - Enable URL-safe mode
  
  batch <p1, p2, p3>       - Generate batch outputs for comma-separated phrases
  matrix <on|off|toggle>  - Control Matrix Rain canvas background
  urlsafe <on|off>        - Toggle URL-Safe mode
  clear                   - Clear CLI output log
  help                    - Show this help menu
          `.trim()
        };

      case 'clear':
        return { success: true, action: 'CLEAR' };

      case 'matrix':
        const mode = parts[1]?.toLowerCase();
        if (mode === 'on') {
          if (this.ui.matrix) this.ui.matrix.start();
          return { success: true, output: 'Matrix Rain background STARTED.' };
        } else if (mode === 'off') {
          if (this.ui.matrix) this.ui.matrix.stop();
          return { success: true, output: 'Matrix Rain background STOPPED.' };
        } else {
          if (this.ui.matrix) this.ui.matrix.toggle();
          return { success: true, output: 'Matrix Rain background TOGGLED.' };
        }

      case 'urlsafe':
        const uMode = parts[1]?.toLowerCase();
        const enableUrl = uMode === 'on' || uMode === 'true' || uMode === '1';
        this.ui.urlSafeToggle.checked = enableUrl;
        this.ui.isUrlSafe = enableUrl;
        this.ui.update();
        return { success: true, output: `URL-Safe mode set to: ${enableUrl}` };

      case 'evolve':
        return this.handleEvolve(parts.slice(1));

      case 'batch':
        const batchInput = parts.slice(1).join(' ');
        if (!batchInput) {
          return { success: false, output: 'Usage: batch <phrase1, phrase2, phrase3>' };
        }
        const list = batchInput.split(',').map(s => s.trim()).filter(Boolean);
        const results = list.map(p => `${p.padEnd(20)} => ${evolvePassword(p, this.ui.currentLength, this.ui.isUrlSafe, this.ui.currentAlgorithm, this.ui.currentSalt)}`);
        return { success: true, output: results.join('\n') };

      default:
        return {
          success: false,
          output: `Command not recognized: "${cmd}". Type "help" for a list of available commands.`
        };
    }
  }

  handleEvolve(args) {
    let phrase = '';
    let length = this.ui.currentLength;
    let salt = this.ui.currentSalt;
    let alg = this.ui.currentAlgorithm;
    let urlSafe = this.ui.isUrlSafe;

    let i = 0;
    while (i < args.length) {
      const arg = args[i];
      if (arg === '-l' || arg === '--length') {
        length = parseInt(args[i + 1], 10) || 16;
        i += 2;
      } else if (arg === '-s' || arg === '--salt') {
        salt = args[i + 1] || '';
        i += 2;
      } else if (arg === '-a' || arg === '--alg') {
        const aVal = args[i + 1]?.toLowerCase();
        if (aVal.includes('stealth')) alg = 'stealth';
        else if (aVal.includes('alpha')) alg = 'alpha';
        else if (aVal.includes('pin')) alg = 'pin';
        else alg = 'matrix';
        i += 2;
      } else if (arg === '-u' || arg === '--urlsafe') {
        urlSafe = true;
        i += 1;
      } else {
        if (!phrase) {
          phrase = arg;
        } else {
          phrase += ' ' + arg;
        }
        i += 1;
      }
    }

    if (!phrase) {
      return { success: false, output: 'Usage: evolve <phrase> [-l length] [-s salt] [-a alg] [-u]' };
    }

    // Set UI values
    this.ui.phraseInput.value = phrase;
    this.ui.currentPhrase = phrase;
    this.ui.currentLength = length;
    this.ui.currentSalt = salt;
    this.ui.currentAlgorithm = alg;
    this.ui.isUrlSafe = urlSafe;
    this.ui.lengthSlider.value = length;
    if (this.ui.saltInput) this.ui.saltInput.value = salt;
    if (this.ui.algSelect) this.ui.algSelect.value = alg;
    this.ui.urlSafeToggle.checked = urlSafe;

    this.ui.update();

    const output = evolvePassword(phrase, length, urlSafe, alg, salt);
    return {
      success: true,
      output: `[SUCCESS]\nPhrase: "${phrase}"\nSalt: "${salt}"\nAlgorithm: ${alg.toUpperCase()}\nEvolved Password: ${output}`
    };
  }

  tokenize(str) {
    const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens = [];
    let match;
    while ((match = regex.exec(str)) !== null) {
      tokens.push(match[1] || match[2] || match[0]);
    }
    return tokens;
  }
}
