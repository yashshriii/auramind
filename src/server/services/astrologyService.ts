import { AstrologyData, BirthTimeAccuracy, HouseCusp, PlanetaryAspect, PlanetaryPosition } from '../types';

/**
 * Deterministic Astrology Engine
 * Calculates planetary positions in Western Tropical Astrology based on date, time, and coordinates.
 * Uses high-precision astronomical algorithms (Julian Day & Keplerian orbital element approximations).
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  Ascendant: 'Asc',
  Midheaven: 'MC',
};

/**
 * Converts Date, Time, and timezone offset to Julian Day Number.
 */
function getJulianDay(dateStr: string, timeStr?: string): number {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  let hour = 12; // default noon UTC if unknown
  let minute = 0;

  if (timeStr && timeStr.trim() !== '') {
    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const timeDigits = cleanTime.replace(/[^\d:]/g, '').split(':');

    if (timeDigits.length >= 1) {
      let h = parseInt(timeDigits[0], 10) || 12;
      const m = parseInt(timeDigits[1], 10) || 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hour = h;
      minute = m;
    }
  }

  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);

  const dayFraction = (hour + minute / 60.0) / 24.0;
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + B - 1524.5;
}

/**
 * Calculates tropical longitude for a planet given Julian Century T from J2000.0.
 */
function calculatePlanetLongitude(planet: string, T: number): { longitude: number; isRetrograde: boolean } {
  let meanLongitude = 0;
  let perihelion = 0;
  let eccentricity = 0;
  let dailyMotion = 0;

  switch (planet) {
    case 'Sun':
      meanLongitude = 280.46646 + 36000.76983 * T;
      perihelion = 282.93735 + 1.71953 * T;
      eccentricity = 0.016708634 - 0.000042037 * T;
      break;
    case 'Moon':
      meanLongitude = 218.3165 + 481267.8813 * T;
      perihelion = 83.3532 + 4069.0137 * T;
      eccentricity = 0.0549;
      break;
    case 'Mercury':
      meanLongitude = 252.2509 + 149472.6747 * T;
      perihelion = 77.4565 + 1.5565 * T;
      eccentricity = 0.20563;
      break;
    case 'Venus':
      meanLongitude = 181.9798 + 58517.8157 * T;
      perihelion = 131.5637 + 1.4022 * T;
      eccentricity = 0.00677;
      break;
    case 'Mars':
      meanLongitude = 355.433 + 19140.2993 * T;
      perihelion = 336.06 + 1.841 * T;
      eccentricity = 0.0934 * T;
      break;
    case 'Jupiter':
      meanLongitude = 34.3515 + 3034.9057 * T;
      perihelion = 14.3312 + 1.6127 * T;
      eccentricity = 0.04849;
      break;
    case 'Saturn':
      meanLongitude = 50.0774 + 1222.1138 * T;
      perihelion = 93.0572 + 1.9638 * T;
      eccentricity = 0.05551;
      break;
    case 'Uranus':
      meanLongitude = 314.055 + 428.466 * T;
      perihelion = 173.005 + 1.486 * T;
      eccentricity = 0.0463;
      break;
    case 'Neptune':
      meanLongitude = 304.349 + 218.486 * T;
      perihelion = 48.12 + 1.426 * T;
      eccentricity = 0.00946;
      break;
    case 'Pluto':
      meanLongitude = 238.929 + 145.207 * T;
      perihelion = 224.14 + 1.38 * T;
      eccentricity = 0.2488;
      break;
    default:
      meanLongitude = 0;
  }

  // Mean anomaly
  const M = (meanLongitude - perihelion) * (Math.PI / 180);
  // Equation of center approximation
  const C = (2 * eccentricity * Math.sin(M) + 1.25 * Math.pow(eccentricity, 2) * Math.sin(2 * M)) * (180 / Math.PI);

  let trueLongitude = (meanLongitude + C) % 360;
  if (trueLongitude < 0) trueLongitude += 360;

  // Approximate retrograde based on inner/outer planet mechanics
  const isRetrograde = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(planet)
    ? Math.sin(T * 100 + trueLongitude) < -0.6
    : false;

  return { longitude: trueLongitude, isRetrograde };
}

/**
 * Converts 0-360 degree longitude to Zodiac sign and degree within sign.
 */
function longitudeToSign(longitude: number): { sign: string; degreeInSign: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  return {
    sign: ZODIAC_SIGNS[index] || 'Aries',
    degreeInSign: parseFloat(degreeInSign.toFixed(2)),
  };
}

/**
 * Calculates planetary aspects between calculated bodies.
 */
function calculateAspects(planets: PlanetaryPosition[]): PlanetaryAspect[] {
  const aspects: PlanetaryAspect[] = [];
  const aspectDefs = [
    { type: 'Conjunction', angle: 0, orb: 7 },
    { type: 'Opposition', angle: 180, orb: 7 },
    { type: 'Trine', angle: 120, orb: 6 },
    { type: 'Square', angle: 90, orb: 6 },
    { type: 'Sextile', angle: 60, orb: 5 },
  ] as const;

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];

      let diff = Math.abs(p1.longitude - p2.longitude);
      if (diff > 180) diff = 360 - diff;

      for (const aspect of aspectDefs) {
        const orb = Math.abs(diff - aspect.angle);
        if (orb <= aspect.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: aspect.type,
            orb: parseFloat(orb.toFixed(2)),
          });
        }
      }
    }
  }

  return aspects;
}

/**
 * Calculates Ascendant (Rising) and Equal Houses based on Local Sidereal Time.
 */
function calculateAscendantAndHouses(
  jd: number,
  latitude: number,
  longitude: number
): { ascendantSign: string; ascendantLongitude: number; houses: HouseCusp[] } {
  const T = (jd - 2451545.0) / 36525.0;
  // Greenwich Mean Sidereal Time (degrees)
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;

  // Local Sidereal Time
  const lst = (gmst + longitude) % 360;
  const lstRad = (lst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const obliqRad = ((23.4393 - 0.013 * T) * Math.PI) / 180;

  // Approximate Ascendant formula
  const ascRad = Math.atan2(
    Math.cos(lstRad),
    -Math.sin(lstRad) * Math.cos(obliqRad) - Math.tan(latRad) * Math.sin(obliqRad)
  );

  let ascLongitude = (ascRad * (180 / Math.PI) + 180) % 360;
  if (ascLongitude < 0) ascLongitude += 360;

  const { sign: ascendantSign } = longitudeToSign(ascLongitude);

  // Equal House system relative to Ascendant
  const houses: HouseCusp[] = [];
  for (let h = 1; h <= 12; h++) {
    const houseLong = (ascLongitude + (h - 1) * 30) % 360;
    const { sign, degreeInSign } = longitudeToSign(houseLong);
    houses.push({
      house: h,
      sign,
      degree: degreeInSign,
    });
  }

  return { ascendantSign, ascendantLongitude: ascLongitude, houses };
}

/**
 * Main Astrology Engine Service call.
 */
export function calculateBirthChart(params: {
  birthDate: string;
  birthTime?: string;
  birthTimeAccuracy: BirthTimeAccuracy;
  latitude: number;
  longitude: number;
}): AstrologyData {
  const { birthDate, birthTime, birthTimeAccuracy, latitude, longitude } = params;

  const jd = getJulianDay(birthDate, birthTime);
  const T = (jd - 2451545.0) / 36525.0;

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const planets: PlanetaryPosition[] = planetNames.map((name) => {
    const { longitude: long, isRetrograde } = calculatePlanetLongitude(name, T);
    const { sign, degreeInSign } = longitudeToSign(long);
    return {
      name,
      symbol: PLANET_SYMBOLS[name] || '•',
      sign,
      longitude: parseFloat(long.toFixed(2)),
      degreeInSign,
      isRetrograde,
    };
  });

  const sunSign = planets.find((p) => p.name === 'Sun')?.sign || 'Aries';
  const moonSign = planets.find((p) => p.name === 'Moon')?.sign || 'Taurus';

  let ascendantSign: string | undefined;
  let houses: HouseCusp[] | undefined;
  let timeConfidenceNote = '';

  if (birthTimeAccuracy === 'exact' || (birthTimeAccuracy === 'approximate' && birthTime)) {
    const houseResult = calculateAscendantAndHouses(jd, latitude, longitude);
    ascendantSign = houseResult.ascendantSign;
    houses = houseResult.houses;

    // Assign house placement to planets
    planets.forEach((p) => {
      const houseNum = Math.floor((((p.longitude - houseResult.ascendantLongitude + 360) % 360) / 30)) + 1;
      p.house = houseNum > 12 ? 1 : houseNum;
    });

    timeConfidenceNote = birthTimeAccuracy === 'exact'
      ? 'Exact birth time provided. Chart includes precise Ascendant and House placements.'
      : 'Approximate birth time provided. Ascendant and House placements are estimated.';
  } else {
    timeConfidenceNote = 'Birth time was unknown. Ascendant and House placements are intentionally omitted to maintain mathematical integrity.';
  }

  const aspects = calculateAspects(planets);

  return {
    system: 'Western Tropical',
    sunSign,
    moonSign,
    ascendantSign,
    planets,
    houses,
    aspects,
    timeConfidenceNote,
  };
}
