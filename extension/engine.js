/**
 * PassEvolver - Extension Deterministic Evolution Engine
 * Version 1.2
 */

export function hashFNV1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

export function createMulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STANDARD_SYMBOLS = '!@#$%^&*-+=~';
const URL_SAFE_SYMBOLS = '-_.~@';

export function evolvePassword(phrase, targetLength = 32, isUrlSafe = false, algorithm = 'matrix', serviceSalt = '') {
  if (!phrase || typeof phrase !== 'string') return '';

  const seededInput = serviceSalt ? `${phrase.trim()}:${serviceSalt.trim()}` : phrase.trim();
  const length = Math.max(8, Math.min(32, Math.round(targetLength)));
  const symbols = isUrlSafe ? URL_SAFE_SYMBOLS : STANDARD_SYMBOLS;

  const seed = hashFNV1a(seededInput);
  const rng = createMulberry32(seed);

  let stage2 = '';
  for (let i = 0; i < phrase.length; i++) {
    const code = phrase.charCodeAt(i);
    const shift = ((seed + i * 7) % 25) + 1;
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

  let stage3 = '';
  for (let i = 0; i < stage2.length; i++) {
    const char = stage2[i];
    if ((seed + i) % 3 === 0) stage3 += char.toUpperCase();
    else stage3 += char;
  }

  let stage4 = stage3 + '_x86';
  let stage5 = stage4 + '-matrix-';

  const digit1 = (seed % 9) + 1;
  const insertPos6 = (seed % (stage5.length - 1)) + 1;
  let stage6 = stage5.slice(0, insertPos6) + digit1 + stage5.slice(insertPos6);

  const symbolChar1 = symbols[(seed >>> 2) % symbols.length];
  const insertPos7 = ((seed >>> 3) % (stage6.length - 1)) + 1;
  let stage7 = stage6.slice(0, insertPos7) + symbolChar1 + stage6.slice(insertPos7);

  let stage8 = stage7.split('').reverse().join('');

  let stage9 = '';
  const fillChars = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < stage8.length; i++) {
    stage9 += stage8[i];
    if ((i + 1) % 4 === 0) {
      stage9 += fillChars[(seed + i * 13) % fillChars.length];
    }
  }

  while (stage9.length < length + 10) stage9 += stage9;

  const charArray = stage9.split('');
  for (let i = charArray.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [charArray[i], charArray[j]] = [charArray[j], charArray[i]];
  }
  let stage10 = charArray.join('');

  if (isUrlSafe) {
    stage10 = stage10.replace(/[^A-Za-z0-9_\-.~@]/g, (match, offset) => {
      return URL_SAFE_SYMBOLS[(seed + offset) % URL_SAFE_SYMBOLS.length];
    });
  }

  let stage11 = stage10.slice(0, length - 1);
  if (!/[A-Z]/.test(stage11)) stage11 = stage11.slice(0, 1) + String.fromCharCode(65 + (seed % 26)) + stage11.slice(2);
  if (!/[0-9]/.test(stage11)) stage11 = stage11.slice(0, 3) + (seed % 10) + stage11.slice(4);

  const finalSymbol = symbols[seed % symbols.length];
  let finalPassword = stage11 + finalSymbol;

  if (isUrlSafe) finalPassword = finalPassword.replace(/[^A-Za-z0-9_\-.~@]/g, '-');
  return finalPassword;
}
