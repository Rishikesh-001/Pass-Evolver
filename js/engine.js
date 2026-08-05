/**
 * Pass Evolver - Deterministic Password Evolution Engine
 * Version 1.2
 * 
 * Supports target output lengths from 8 up to 32 characters.
 */

// 32-bit FNV-1a Hash function to create a repeatable numerical seed
export function hashFNV1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

// Mulberry32 PRNG for deterministic, seeded pseudo-random number generation
export function createMulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Allowed Symbol Sets
const STANDARD_SYMBOLS = '!@#$%^&*-+=~';
const URL_SAFE_SYMBOLS = '-_.~@';
const STEALTH_SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const THEMATIC_TOKENS = ['-matrix-', '-cyber-', '-shd-', '-evl-', '-sec-', '-v12-'];
const CODE_SNIPPETS = ['_x86', '0x', '_v1', '_sys', '_net', '_dev'];

/**
 * Main Password Evolution Function
 * @param {string} phrase - Memorable input phrase
 * @param {number} targetLength - Output character length (8 to 32)
 * @param {boolean} isUrlSafe - Whether to restrict output to URL-safe characters
 * @param {string} algorithm - 'matrix' | 'stealth' | 'alpha' | 'pin'
 * @param {string} serviceSalt - Optional site/domain tag
 */
export function evolvePassword(phrase, targetLength = 32, isUrlSafe = false, algorithm = 'matrix', serviceSalt = '') {
  if (!phrase || typeof phrase !== 'string') {
    return '';
  }

  const seededInput = serviceSalt ? `${phrase.trim()}:${serviceSalt.trim()}` : phrase.trim();

  // Numeric PIN Algorithm
  if (algorithm === 'pin') {
    const pinLength = Math.max(4, Math.min(32, Math.round(targetLength)));
    const seed = hashFNV1a(seededInput);
    const rng = createMulberry32(seed);
    let pin = '';
    for (let i = 0; i < pinLength; i++) {
      pin += Math.floor(rng() * 10);
    }
    return pin;
  }

  // Ensure length boundary (8 to 32 characters)
  const length = Math.max(8, Math.min(32, Math.round(targetLength)));
  const symbols = isUrlSafe ? URL_SAFE_SYMBOLS : (algorithm === 'stealth' ? STEALTH_SYMBOLS : STANDARD_SYMBOLS);

  // Stage 1: Seed Generation
  const seed = hashFNV1a(seededInput);
  const rng = createMulberry32(seed);

  // Stage 2: Position-based Shift
  let stage2 = '';
  const shiftMultiplier = algorithm === 'stealth' ? 11 : (algorithm === 'alpha' ? 13 : 7);
  for (let i = 0; i < phrase.length; i++) {
    const code = phrase.charCodeAt(i);
    const shift = ((seed + i * shiftMultiplier) % 25) + 1;
    let shiftedCode = code;

    if (code >= 65 && code <= 90) {
      shiftedCode = 65 + ((code - 65 + shift) % 26);
    } else if (code >= 97 && code <= 122) {
      shiftedCode = 97 + ((code - 97 + shift) % 26);
    } else if (code >= 48 && code <= 57) {
      shiftedCode = 48 + ((code - 48 + shift) % 10);
    }
    stage2 += String.fromCharCode(shiftedCode);
  }

  // Stage 3: Uppercase Substitutions
  let stage3 = '';
  const upperModulo = algorithm === 'alpha' ? 2 : 3;
  for (let i = 0; i < stage2.length; i++) {
    const char = stage2[i];
    if ((seed + i) % upperModulo === 0) {
      stage3 += char.toUpperCase();
    } else {
      stage3 += char;
    }
  }

  // Stage 4: Code Characters
  const codeSnippet = CODE_SNIPPETS[(seed + phrase.length) % CODE_SNIPPETS.length];
  let stage4 = stage3 + codeSnippet;

  // Stage 5: Thematic Token
  const thematicToken = THEMATIC_TOKENS[seed % THEMATIC_TOKENS.length];
  let stage5 = stage4 + thematicToken;

  // Stage 6: Hash-derived Digits
  const digit1 = (seed % 9) + 1;
  const digit2 = ((seed >>> 4) % 10);
  const insertPos6 = (seed % (stage5.length - 1)) + 1;
  let stage6 = stage5.slice(0, insertPos6) + digit1 + digit2 + stage5.slice(insertPos6);

  // Stage 7: Symbol Insertion
  const symbolChar1 = symbols[(seed >>> 2) % symbols.length];
  const insertPos7 = ((seed >>> 3) % (stage6.length - 1)) + 1;
  let stage7 = stage6.slice(0, insertPos7) + symbolChar1 + stage6.slice(insertPos7);

  // Stage 8: String Reversal
  let stage8 = stage7.split('').reverse().join('');

  // Stage 9: Lowercase Fill
  let stage9 = '';
  const fillChars = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stage8.length; i++) {
    stage9 += stage8[i];
    if ((i + 1) % 4 === 0) {
      const fillChar = fillChars[(seed + i * 13) % fillChars.length];
      stage9 += fillChar;
    }
  }

  // Repeat sequence if target length > generated string length
  while (stage9.length < length + 10) {
    stage9 += stage9;
  }

  // Stage 10: Seeded Permutation
  const charArray = stage9.split('');
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
  }
  let stage10 = charArray.join('');

  // Sanitize for URL-Safe if requested
  if (isUrlSafe) {
    stage10 = stage10.replace(/[^A-Za-z0-9_\-.~@]/g, (match, offset) => {
      return URL_SAFE_SYMBOLS[(seed + offset) % URL_SAFE_SYMBOLS.length];
    });
  }

  // Stage 11: Trimming to Target Length
  let stage11 = stage10.slice(0, length - 1);

  // Enforce character variety
  let hasUpper = /[A-Z]/.test(stage11);
  let hasDigit = /[0-9]/.test(stage11);

  if (!hasUpper) {
    stage11 = stage11.slice(0, 1) + String.fromCharCode(65 + (seed % 26)) + stage11.slice(2);
  }
  if (!hasDigit) {
    stage11 = stage11.slice(0, 3) + (seed % 10) + stage11.slice(4);
  }

  // Stage 12: Final Symbol
  const finalSymbol = symbols[seed % symbols.length];
  let finalPassword = stage11 + finalSymbol;

  // Final URL-Safe check
  if (isUrlSafe) {
    finalPassword = finalPassword.replace(/[^A-Za-z0-9_\-.~@]/g, '-');
  }

  return finalPassword;
}

/**
 * Calculates Shannon entropy and statistics
 */
export function analyzePassword(password) {
  if (!password) {
    return {
      length: 0,
      entropyBits: 0,
      uppercaseCount: 0,
      lowercaseCount: 0,
      numberCount: 0,
      symbolCount: 0,
      rating: 'Empty'
    };
  }

  const length = password.length;
  let uppercaseCount = 0;
  let lowercaseCount = 0;
  let numberCount = 0;
  let symbolCount = 0;

  for (let char of password) {
    if (/[A-Z]/.test(char)) uppercaseCount++;
    else if (/[a-z]/.test(char)) lowercaseCount++;
    else if (/[0-9]/.test(char)) numberCount++;
    else symbolCount++;
  }

  let poolSize = 0;
  if (uppercaseCount > 0) poolSize += 26;
  if (lowercaseCount > 0) poolSize += 26;
  if (numberCount > 0) poolSize += 10;
  if (symbolCount > 0) poolSize += 32;

  const entropyBits = Math.round((length * (poolSize > 0 ? Math.log2(poolSize) : 0)) * 10) / 10;

  let rating = 'Weak';
  if (entropyBits >= 120) rating = 'Critical Maximum';
  else if (entropyBits >= 80) rating = 'Very Strong';
  else if (entropyBits >= 60) rating = 'Strong';
  else if (entropyBits >= 40) rating = 'Moderate';

  return {
    length,
    entropyBits,
    uppercaseCount,
    lowercaseCount,
    numberCount,
    symbolCount,
    rating
  };
}
