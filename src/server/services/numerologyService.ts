import { NumerologyData } from '../types';

/**
 * Numerology Engine
 * Implements Pythagorean numerology calculations deterministically.
 * Master Numbers (11, 22, 33) are preserved where standard in Pythagorean methodology.
 */

// Letter to Pythagorean digit map (A=1, B=2, ..., I=9, J=1, etc.)
const LETTER_MAP: Record<string, number> = {
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

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

/**
 * Sums digits of a number until it reaches a single digit (1-9) or a Master Number (11, 22, 33).
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
 * Calculates Life Path Number from DOB string (YYYY-MM-DD).
 * Method: Reduce Month, Day, and Year individually, then sum and reduce.
 */
export function calculateLifePathNumber(birthDateStr: string): { lifePath: number; isMaster: boolean } {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) {
    return { lifePath: 1, isMaster: false };
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const reducedMonth = reduceNumber(month, true);
  const reducedDay = reduceNumber(day, true);
  const reducedYear = reduceNumber(year, true);

  const totalSum = reducedMonth + reducedDay + reducedYear;
  const lifePath = reduceNumber(totalSum, true);
  const isMaster = lifePath === 11 || lifePath === 22 || lifePath === 33;

  return { lifePath, isMaster };
}

/**
 * Calculates Birthday Number from day of birth.
 */
export function calculateBirthdayNumber(birthDateStr: string): number {
  const parts = birthDateStr.split('-');
  if (parts.length !== 3) return 1;
  const day = parseInt(parts[2], 10);
  return reduceNumber(day, true);
}

/**
 * Calculates Expression (Destiny) Number, Soul Urge Number, and Personality Number from full name.
 */
export function calculateNameNumbers(fullName: string): {
  expressionNumber: number;
  soulUrgeNumber: number;
  personalityNumber: number;
} {
  const cleanName = fullName.toLowerCase().replace(/[^a-z]/g, '');

  let expressionSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;

  for (let i = 0; i < cleanName.length; i++) {
    const char = cleanName[i];
    const val = LETTER_MAP[char] || 0;
    expressionSum += val;

    if (VOWELS.has(char)) {
      soulUrgeSum += val;
    } else {
      personalitySum += val;
    }
  }

  return {
    expressionNumber: reduceNumber(expressionSum, true),
    soulUrgeNumber: reduceNumber(soulUrgeSum, true),
    personalityNumber: reduceNumber(personalitySum, true),
  };
}

/**
 * Calculates Personal Year Number for the current calendar year.
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
 * Main service call to get full numerology data.
 */
export function calculateNumerology(fullName: string, birthDateStr: string): NumerologyData {
  const { lifePath, isMaster } = calculateLifePathNumber(birthDateStr);
  const birthdayNumber = calculateBirthdayNumber(birthDateStr);
  const { expressionNumber, soulUrgeNumber, personalityNumber } = calculateNameNumbers(fullName);
  const personalYear = calculatePersonalYear(birthDateStr);

  const masterNotes: string[] = [];
  if (isMaster) {
    masterNotes.push(`Life Path ${lifePath} is a Master Number representing heightened potential and intuitive frequency.`);
  }

  return {
    lifePathNumber: lifePath,
    birthdayNumber,
    expressionNumber,
    soulUrgeNumber,
    personalityNumber,
    personalYear,
    isMasterLifePath: isMaster,
    masterNotes,
  };
}
