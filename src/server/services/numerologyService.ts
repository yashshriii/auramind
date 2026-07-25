import { NumerologyData } from '../types';

/**
 * Advanced Numerology Engine
 * Implements Pythagorean & Chaldean numerology, Kármic Debt Numbers,
 * Pinnacle Cycles, and Lo Shu Grid digit frequency matrix.
 */

const PYTHAGOREAN_LETTER_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const CHALDEAN_LETTER_MAP: Record<string, number> = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

/**
 * Reduces a number to a single digit (1-9) or Master Number (11, 22, 33).
 */
export function reduceNumber(num: number, keepMasterNumbers = true): number {
  if (num <= 0) return 0;

  while (num > 9) {
    if (keepMasterNumbers && (num === 11 || num === 22 || num === 33)) {
      return num;
    }
    num = num
      .toString()
      .split('')
      .reduce((sum, char) => sum + parseInt(char, 10), 0);
  }
  return num;
}

/**
 * Checks for Kármic Debt Numbers (13, 14, 16, 19) in intermediate sums.
 */
function checkForKarmicDebt(rawSums: number[]): number[] {
  const karmicSet = new Set<number>();
  const KARMIC_NUMS = [13, 14, 16, 19];

  rawSums.forEach((val) => {
    if (KARMIC_NUMS.includes(val)) {
      karmicSet.add(val);
    }
  });

  return Array.from(karmicSet);
}

/**
 * Calculates Life Path Number and checks for Kármic Debt.
 */
export function calculateLifePathNumber(birthDateStr: string): { lifePath: number; isMaster: boolean; rawSum: number } {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) {
    return { lifePath: 1, isMaster: false, rawSum: 1 };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const reducedMonth = reduceNumber(month, true);
  const reducedDay = reduceNumber(day, true);
  const reducedYear = reduceNumber(year, true);

  const rawSum = reducedMonth + reducedDay + reducedYear;
  const lifePath = reduceNumber(rawSum, true);
  const isMaster = lifePath === 11 || lifePath === 22 || lifePath === 33;

  return { lifePath, isMaster, rawSum };
}

/**
 * Calculates Birthday Number.
 */
export function calculateBirthdayNumber(birthDateStr: string): number {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) return 1;
  const day = parseInt(parts[2], 10);
  return reduceNumber(day, true);
}

/**
 * Calculates Pythagorean and Chaldean Expression (Destiny) Numbers, Soul Urge, and Personality.
 */
export function calculateNameNumbers(fullName: string): {
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
  chaldeanExpressionNumber: number;
  expressionRawSum: number;
} {
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');

  let pythSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;
  let chaldeanSum = 0;

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const pVal = PYTHAGOREAN_LETTER_MAP[char] || 0;
    const cVal = CHALDEAN_LETTER_MAP[char] || 0;

    pythSum += pVal;
    chaldeanSum += cVal;

    if (VOWELS.has(char)) {
      soulUrgeSum += pVal;
    } else {
      personalitySum += pVal;
    }
  }

  return {
    expressionNumber: reduceNumber(pythSum, true),
    soulUrgeNumber: reduceNumber(soulUrgeSum, true),
    personalityNumber: reduceNumber(personalitySum, true),
    chaldeanExpressionNumber: reduceNumber(chaldeanSum, true),
    expressionRawSum: pythSum,
  };
}

/**
 * Calculates Personal Year Number.
 */
export function calculatePersonalYear(birthDateStr: string, targetYear = new Date().getFullYear()): number {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) return 1;

  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const reducedMonth = reduceNumber(month, true);
  const reducedDay = reduceNumber(day, true);
  const reducedTargetYear = reduceNumber(targetYear, true);

  return reduceNumber(reducedMonth + reducedDay + reducedTargetYear, true);
}

/**
 * Calculates 4 Pinnacle Cycles based on Life Path Number.
 */
function calculatePinnacleCycles(birthDateStr: string, lifePath: number): Array<{ phase: number; ageRange: string; number: number }> {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) return [];

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const m = reduceNumber(month, true);
  const d = reduceNumber(day, true);
  const y = reduceNumber(year, true);

  const p1 = reduceNumber(m + d, true);
  const p2 = reduceNumber(d + y, true);
  const p3 = reduceNumber(p1 + p2, true);
  const p4 = reduceNumber(m + y, true);

  const p1EndAge = 36 - (lifePath > 9 ? reduceNumber(lifePath, false) : lifePath);

  return [
    { phase: 1, ageRange: `Birth to Age ${p1EndAge}`, number: p1 },
    { phase: 2, ageRange: `Age ${p1EndAge + 1} to ${p1EndAge + 9}`, number: p2 },
    { phase: 3, ageRange: `Age ${p1EndAge + 10} to ${p1EndAge + 18}`, number: p3 },
    { phase: 4, ageRange: `Age ${p1EndAge + 19}+`, number: p4 },
  ];
}

/**
 * Calculates Lo Shu Grid frequency count (1 to 9 digits in birth date YYYY-MM-DD).
 */
function calculateLoShuGrid(birthDateStr: string): Record<number, number> {
  const grid: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  const digits = birthDateStr.replace(/\D/g, '');

  for (const char of digits) {
    const num = parseInt(char, 10);
    if (num >= 1 && num <= 9) {
      grid[num] = (grid[num] || 0) + 1;
    }
  }

  return grid;
}

/**
 * Main Numerology Calculation Service
 */
export function calculateNumerology(fullName: string, birthDateStr: string): NumerologyData {
  const { lifePath, isMaster, rawSum: lifePathRaw } = calculateLifePathNumber(birthDateStr);
  const birthdayNumber = calculateBirthdayNumber(birthDateStr);
  const {
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    chaldeanExpressionNumber,
    expressionRawSum,
  } = calculateNameNumbers(fullName);

  const personalYear = calculatePersonalYear(birthDateStr);

  const rawDay = parseInt(birthDateStr.split('-')[2] || '0', 10);
  const karmicDebtNumbers = checkForKarmicDebt([lifePathRaw, expressionRawSum, rawDay]);

  const masterNotes: string[] = [];
  if (isMaster) {
    masterNotes.push(`Life Path ${lifePath} is a Master Number representing high intuitive frequency and spiritual mastery.`);
  }

  if (karmicDebtNumbers.length > 0) {
    masterNotes.push(`Kármic Debt Number(s) detected: ${karmicDebtNumbers.join(', ')}. Indicates specific soul lessons around discipline, freedom, or responsibility.`);
  }

  const pinnacles = calculatePinnacleCycles(birthDateStr, lifePath);
  const loShuGrid = calculateLoShuGrid(birthDateStr);

  return {
    lifePathNumber: lifePath,
    birthdayNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    personalYear,
    isMasterLifePath: isMaster,
    masterNotes,
    karmicDebtNumbers,
    pinnacles,
    loShuGrid,
    chaldeanExpressionNumber,
  };
}
