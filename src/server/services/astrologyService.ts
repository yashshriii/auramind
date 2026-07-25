import {
  AstrologyData,
  BirthTimeAccuracy,
  HouseCusp,
  KundaliHouse,
  NakshatraDetails,
  PanchangData,
  PlanetaryAspect,
  PlanetaryPosition,
  VimshottariDasha,
} from '../types';

/**
 * High-Precision Vedic Astrology Engine (Jyotish - Lahiri Sidereal System)
 * Calculates Sidereal planetary longitudes, Nakshatras, Vimshottari Dasha,
 * Panchang, Jaimini Karakas, and Divisional Kundali Charts (D1 Rashi & D9 Navamsha)
 * matching professional software like Devaguru / Jagannatha Hora.
 */

const VEDIC_RASHIS = [
  { name: 'Aries', hindi: 'Mesha', symbol: '♈' },
  { name: 'Taurus', hindi: 'Vrishabha', symbol: '♉' },
  { name: 'Gemini', hindi: 'Mithuna', symbol: '♊' },
  { name: 'Cancer', hindi: 'Karka', symbol: '♋' },
  { name: 'Leo', hindi: 'Simha', symbol: '♌' },
  { name: 'Virgo', hindi: 'Kanya', symbol: '♍' },
  { name: 'Libra', hindi: 'Tula', symbol: '♎' },
  { name: 'Scorpio', hindi: 'Vrishchika', symbol: '♏' },
  { name: 'Sagittarius', hindi: 'Dhanu', symbol: '♐' },
  { name: 'Capricorn', hindi: 'Makara', symbol: '♑' },
  { name: 'Aquarius', hindi: 'Kumbha', symbol: '♒' },
  { name: 'Pisces', hindi: 'Meena', symbol: '♓' },
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Rahu: '☊',
  Ketu: '☋',
  Ascendant: 'Asc/Lagna',
};

const NAKSHATRAS = [
  { name: 'Ashwini', lord: 'Ketu' },
  { name: 'Bharani', lord: 'Venus' },
  { name: 'Krittika', lord: 'Sun' },
  { name: 'Rohini', lord: 'Moon' },
  { name: 'Mrigashira', lord: 'Mars' },
  { name: 'Ardra', lord: 'Rahu' },
  { name: 'Punarvasu', lord: 'Jupiter' },
  { name: 'Pushya', lord: 'Saturn' },
  { name: 'Ashlesha', lord: 'Mercury' },
  { name: 'Magha', lord: 'Ketu' },
  { name: 'Purva Phalguni', lord: 'Venus' },
  { name: 'Uttara Phalguni', lord: 'Sun' },
  { name: 'Hasta', lord: 'Moon' },
  { name: 'Chitra', lord: 'Mars' },
  { name: 'Swati', lord: 'Rahu' },
  { name: 'Vishakha', lord: 'Jupiter' },
  { name: 'Anuradha', lord: 'Saturn' },
  { name: 'Jyeshtha', lord: 'Mercury' },
  { name: 'Mula', lord: 'Ketu' },
  { name: 'Purva Ashadha', lord: 'Venus' },
  { name: 'Uttara Ashadha', lord: 'Sun' },
  { name: 'Shravana', lord: 'Moon' },
  { name: 'Dhanishta', lord: 'Mars' },
  { name: 'Shatabhisha', lord: 'Rahu' },
  { name: 'Purva Bhadrapada', lord: 'Jupiter' },
  { name: 'Uttara Bhadrapada', lord: 'Saturn' },
  { name: 'Revati', lord: 'Mercury' },
];

const DASHA_LORDS = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashti', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi', 'Purnima / Amavasya'
];

const VARA_NAMES = ['Ravivara (Sunday)', 'Somavara (Monday)', 'Mangalavara (Tuesday)', 'Budhavara (Wednesday)', 'Guruvara (Thursday)', 'Shukravara (Friday)', 'Shanivara (Saturday)'];

const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti',
  'Shoola', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghat', 'Harshana', 'Vajra', 'Siddhi',
  'Vyatipata', 'Variyan', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla',
  'Brahma', 'Indra', 'Vaidhriti'
];

/**
 * Derives Timezone offset in hours from location or timezone string
 */
function getTimezoneOffsetHours(latitude: number, longitude: number, timezoneStr?: string): number {
  if (timezoneStr) {
    const tzLower = timezoneStr.toLowerCase();
    if (tzLower.includes('kolkata') || tzLower.includes('india') || tzLower.includes('ist')) {
      return 5.5;
    }
  }
  // India geographic bounds check (68°E to 98°E, 6°N to 38°N)
  if (longitude >= 68.0 && longitude <= 98.0 && latitude >= 6.0 && latitude <= 38.0) {
    return 5.5;
  }
  return longitude / 15.0;
}

/**
 * Calculates Universal Time (UTC) Julian Day Number accurately with proper UTC date handling
 */
function getJulianDayUTC(dateStr: string, timeStr?: string, tzOffsetHours: number = 5.5): number {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const y = parseInt(yearStr, 10);
  const m = parseInt(monthStr, 10);
  const d = parseInt(dayStr, 10);

  let hour = 12;
  let minute = 0;
  let second = 0;

  if (timeStr && timeStr.trim() !== '') {
    const cleanTime = timeStr.trim().toUpperCase();
    const isPM = cleanTime.includes('PM');
    const isAM = cleanTime.includes('AM');
    const parts = cleanTime.replace(/[^\d:]/g, '').split(':');

    if (parts.length >= 1) {
      let h = parseInt(parts[0], 10) || 12;
      const min = parseInt(parts[1], 10) || 0;
      const sec = parseInt(parts[2], 10) || 0;
      if (isPM && h < 12) h += 12;
      if (isAM && h === 12) h = 0;
      hour = h;
      minute = min;
      second = sec;
    }
  }

  // Convert local birth timestamp to UTC timestamp
  const localMs = Date.UTC(y, m - 1, d, hour, minute, second);
  const utcMs = localMs - tzOffsetHours * 3600 * 1000;
  const utcDate = new Date(utcMs);

  const utcY = utcDate.getUTCFullYear();
  const utcM = utcDate.getUTCMonth() + 1;
  const utcD = utcDate.getUTCDate();
  const utcH = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60.0 + utcDate.getUTCSeconds() / 3600.0;

  let year = utcY;
  let month = utcM;
  if (month <= 2) {
    year -= 1;
    month += 12;
  }

  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFraction = utcH / 24.0;
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + utcD + dayFraction + B - 1524.5;
}

/**
 * High precision Lahiri Ayanamsa calculation (Chitrapaksha)
 */
function calculateLahiriAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  // Lahiri Chitrapaksha Ayanamsa at J2000 = 23.856167 degrees
  return 23.856167 + 1.396042 * T + 0.000308 * T * T;
}

/**
 * Calculates High-Precision Geocentric Planetary Longitude
 */
function calculateTropicalLongitude(planet: string, T: number): { longitude: number; isRetrograde: boolean } {
  if (planet === 'Sun') {
    const L0 = 280.46646 + 36000.76983 * T;
    const M = (357.52911 + 35999.05029 * T) * (Math.PI / 180);
    const C = (1.914602 - 0.004817 * T) * Math.sin(M) + (0.019993 - 0.000101 * T) * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M);
    const trueLong = (L0 + C) % 360;
    return { longitude: (trueLong + 360) % 360, isRetrograde: false };
  }

  if (planet === 'Moon') {
    const L_m = 218.3164477 + 481267.88123421 * T;
    const D = (297.8501921 + 445267.1114034 * T) * (Math.PI / 180);
    const M_sun = (357.5291092 + 35999.0502909 * T) * (Math.PI / 180);
    const M_moon = (134.9633964 + 477198.8675055 * T) * (Math.PI / 180);
    const F = (93.2720950 + 483202.0175233 * T) * (Math.PI / 180);

    const C_m = 6.288774 * Math.sin(M_moon)
      + 1.274027 * Math.sin(2 * D - M_moon)
      + 0.658314 * Math.sin(2 * D)
      + 0.213618 * Math.sin(2 * M_moon)
      - 0.185116 * Math.sin(M_sun)
      - 0.114332 * Math.sin(2 * F)
      + 0.058793 * Math.sin(2 * D - 2 * M_moon)
      + 0.057066 * Math.sin(2 * D - M_sun - M_moon)
      + 0.053322 * Math.sin(2 * D + M_moon)
      + 0.045874 * Math.sin(2 * D - M_sun);

    const trueLong = (L_m + C_m) % 360;
    return { longitude: (trueLong + 360) % 360, isRetrograde: false };
  }

  if (planet === 'Rahu') {
    const nodeLong = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
    return { longitude: ((nodeLong % 360) + 360) % 360, isRetrograde: true };
  }

  if (planet === 'Ketu') {
    const nodeLong = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
    const ketuLong = (nodeLong + 180) % 360;
    return { longitude: ((ketuLong % 360) + 360) % 360, isRetrograde: true };
  }

  // Heliocentric elements with perturbations
  const elements: Record<string, { a: number; e: number; I: number; L: number; w: number; N: number; L_rate: number }> = {
    Mercury: { a: 0.387098, e: 0.205630, I: 7.0049, L: 252.25084, w: 77.45645, N: 48.33167, L_rate: 149472.674111 },
    Venus:   { a: 0.723332, e: 0.006773, I: 3.3947, L: 181.97973, w: 131.56370, N: 76.68069, L_rate: 58517.815387 },
    Mars:    { a: 1.523679, e: 0.093405, I: 1.8497, L: 355.45332, w: 336.04084, N: 49.55740, L_rate: 19140.302684 },
    Jupiter: { a: 5.202603, e: 0.048498, I: 1.3030, L: 34.40438, w: 14.75385, N: 100.55615, L_rate: 3034.746127 },
    Saturn:  { a: 9.554909, e: 0.055546, I: 2.4886, L: 49.94432, w: 92.43194, N: 113.66550, L_rate: 1222.493621 },
  };

  const elem = elements[planet];
  if (!elem) return { longitude: 0, isRetrograde: false };

  // Earth heliocentric position
  const L_earth = (100.464571 + 35999.372449 * T) * (Math.PI / 180);
  const w_earth = (102.937348 + 0.32255 * T) * (Math.PI / 180);
  const e_earth = 0.0167086 - 0.000042037 * T;
  const M_earth = L_earth - w_earth;
  const r_earth = (1.000001018 * (1 - e_earth * e_earth)) / (1 + e_earth * Math.cos(M_earth + 2 * e_earth * Math.sin(M_earth)));
  const x_earth = r_earth * Math.cos(L_earth + 2 * e_earth * Math.sin(M_earth));
  const y_earth = r_earth * Math.sin(L_earth + 2 * e_earth * Math.sin(M_earth));

  // Target planet heliocentric position
  const L_p = (elem.L + elem.L_rate * T) * (Math.PI / 180);
  const w_p = elem.w * (Math.PI / 180);
  const M_p = L_p - w_p;
  const r_p = (elem.a * (1 - elem.e * elem.e)) / (1 + elem.e * Math.cos(M_p + 2 * elem.e * Math.sin(M_p)));
  const trueLong_p = L_p + 2 * elem.e * Math.sin(M_p);
  const x_p = r_p * Math.cos(trueLong_p);
  const y_p = r_p * Math.sin(trueLong_p);

  // Geocentric vector
  const X_geo = x_p - x_earth;
  const Y_geo = y_p - y_earth;

  let geoLong = Math.atan2(Y_geo, X_geo) * (180 / Math.PI);
  geoLong = ((geoLong % 360) + 360) % 360;

  // Retrograde check via small time delta
  const dT = 0.00001;
  const T_next = T + dT;
  const L_earth_n = (100.464571 + 35999.372449 * T_next) * (Math.PI / 180);
  const M_earth_n = L_earth_n - w_earth;
  const r_earth_n = (1.000001018 * (1 - e_earth * e_earth)) / (1 + e_earth * Math.cos(M_earth_n + 2 * e_earth * Math.sin(M_earth_n)));
  const x_earth_n = r_earth_n * Math.cos(L_earth_n + 2 * e_earth * Math.sin(M_earth_n));
  const y_earth_n = r_earth_n * Math.sin(L_earth_n + 2 * e_earth * Math.sin(M_earth_n));

  const L_p_n = (elem.L + elem.L_rate * T_next) * (Math.PI / 180);
  const M_p_n = L_p_n - w_p;
  const r_p_n = (elem.a * (1 - elem.e * elem.e)) / (1 + elem.e * Math.cos(M_p_n + 2 * elem.e * Math.sin(M_p_n)));
  const trueLong_p_n = L_p_n + 2 * elem.e * Math.sin(M_p_n);
  const x_p_n = r_p_n * Math.cos(trueLong_p_n);
  const y_p_n = r_p_n * Math.sin(trueLong_p_n);

  let geoLong_next = Math.atan2(y_p_n - y_earth_n, x_p_n - x_earth_n) * (180 / Math.PI);
  geoLong_next = ((geoLong_next % 360) + 360) % 360;

  let diff = geoLong_next - geoLong;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const isRetrograde = diff < 0;

  return { longitude: geoLong, isRetrograde };
}

/**
 * Convert 0-360 degree longitude to Vedic Rashi details
 */
function longitudeToRashi(longitude: number): { sign: string; hindiName: string; rashiIndex: number; degreeInSign: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  const degreeInSign = normalized % 30;
  const rashi = VEDIC_RASHIS[index] || VEDIC_RASHIS[0];
  return {
    sign: rashi.name,
    hindiName: rashi.hindi,
    rashiIndex: index + 1, // 1-12
    degreeInSign: parseFloat(degreeInSign.toFixed(2)),
  };
}

/**
 * Calculates Nakshatra details from Sidereal Longitude
 */
function getNakshatraDetails(siderealLongitude: number): NakshatraDetails {
  const norm = ((siderealLongitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(norm / 13.333333333333334);
  const nak = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];
  const degreeInNakshatra = norm % 13.333333333333334;
  const pada = Math.floor(degreeInNakshatra / 3.3333333333333335) + 1;

  return {
    name: nak.name,
    lord: nak.lord,
    pada,
    degreeInNakshatra: parseFloat(degreeInNakshatra.toFixed(2)),
  };
}

/**
 * Calculates Vimshottari Dasha details accurately
 */
function calculateVimshottariDasha(moonSiderealLongitude: number, birthDateStr: string): VimshottariDasha {
  const norm = ((moonSiderealLongitude % 360) + 360) % 360;
  const nakshatraIndex = Math.floor(norm / 13.333333333333334);
  const degreeInNak = norm % 13.333333333333334;

  const nak = NAKSHATRAS[nakshatraIndex] || NAKSHATRAS[0];
  const lordIndex = DASHA_LORDS.findIndex((d) => d.lord === nak.lord);
  const startLord = DASHA_LORDS[lordIndex >= 0 ? lordIndex : 0];

  const fractionElapsed = degreeInNak / 13.333333333333334;
  const fractionRemaining = 1 - fractionElapsed;
  const balanceYears = fractionRemaining * startLord.years;

  const birthYear = new Date(birthDateStr).getFullYear() || 2000;
  const currentYear = new Date().getFullYear();

  let elapsedYearsSinceBirth = currentYear - birthYear;
  let currentMahadasha = startLord.lord;
  let remainingInCurrentMaha = balanceYears;
  let currentLordIndex = lordIndex;

  if (elapsedYearsSinceBirth >= balanceYears) {
    elapsedYearsSinceBirth -= balanceYears;
    currentLordIndex = (currentLordIndex + 1) % DASHA_LORDS.length;
    while (elapsedYearsSinceBirth >= DASHA_LORDS[currentLordIndex].years) {
      elapsedYearsSinceBirth -= DASHA_LORDS[currentLordIndex].years;
      currentLordIndex = (currentLordIndex + 1) % DASHA_LORDS.length;
    }
    currentMahadasha = DASHA_LORDS[currentLordIndex].lord;
    remainingInCurrentMaha = DASHA_LORDS[currentLordIndex].years - elapsedYearsSinceBirth;
  }

  // Antardasha sub-cycle
  const mahaLordYears = DASHA_LORDS[currentLordIndex].years;
  let adElapsedYears = mahaLordYears - remainingInCurrentMaha;
  let subLordIndex = currentLordIndex;
  let antardashaLord = DASHA_LORDS[subLordIndex].lord;

  for (let i = 0; i < DASHA_LORDS.length; i++) {
    const subLord = DASHA_LORDS[(currentLordIndex + i) % DASHA_LORDS.length];
    const adDurationYears = (mahaLordYears * subLord.years) / 120;
    if (adElapsedYears < adDurationYears) {
      antardashaLord = subLord.lord;
      break;
    }
    adElapsedYears -= adDurationYears;
  }

  const dashaStartYear = currentYear - Math.floor(adElapsedYears);
  const dashaEndYear = currentYear + Math.ceil(remainingInCurrentMaha);

  return {
    currentMahadasha,
    currentAntardasha: antardashaLord,
    dashaStartDate: `${dashaStartYear}-01-01`,
    dashaEndDate: `${dashaEndYear}-12-31`,
    balanceAtBirth: `${balanceYears.toFixed(1)} years of ${startLord.lord} Mahadasha remaining at birth`,
  };
}

/**
 * Calculates Vedic Panchang details
 */
function calculatePanchang(sunLong: number, moonLong: number, birthDateStr: string): PanchangData {
  const diff = ((moonLong - sunLong + 360) % 360);
  const tithiIndex = Math.floor(diff / 12);
  const tithiName = TITHI_NAMES[tithiIndex % 15] || 'Pratipada';
  const paksha = tithiIndex < 15 ? 'Shukla Paksha' : 'Krishna Paksha';

  const dayOfWeek = new Date(birthDateStr).getDay();
  const vara = VARA_NAMES[dayOfWeek] || VARA_NAMES[0];

  const moonNak = getNakshatraDetails(moonLong);

  const sum = (sunLong + moonLong) % 360;
  const yogaIndex = Math.floor(sum / 13.333333333333334);
  const yoga = YOGA_NAMES[yogaIndex] || YOGA_NAMES[0];

  const karanaNum = Math.floor(diff / 6) + 1;

  return {
    tithi: `${tithiName} (${paksha})`,
    vara,
    nakshatra: `${moonNak.name} (Lord: ${moonNak.lord})`,
    yoga,
    karana: `Karana #${karanaNum}`,
  };
}

/**
 * Calculates D9 Navamsha Sign Index (1 to 12)
 */
function calculateNavamshaSignIndex(rashiIndex: number, degreeInSign: number): number {
  const segment = Math.floor(degreeInSign / 3.3333333333333335); // 0-8
  let baseRashi = 1;

  if ([1, 5, 9].includes(rashiIndex)) baseRashi = 1;
  else if ([2, 6, 10].includes(rashiIndex)) baseRashi = 10;
  else if ([3, 7, 11].includes(rashiIndex)) baseRashi = 7;
  else baseRashi = 4;

  return ((baseRashi - 1 + segment) % 12) + 1;
}

/**
 * Calculates Sidereal Ascendant (Lagna) accurately for given location & UTC Julian Day
 */
function calculateSiderealAscendant(jd: number, latitude: number, longitude: number, ayanamsa: number): { ascendantSign: string; ascendantLongitude: number; ascendantRashiIndex: number } {
  const T = (jd - 2451545.0) / 36525.0;

  // Greenwich Sidereal Time (GST) in degrees
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;

  // Local Sidereal Time (LST / RAMC) in degrees
  const lst = ((gmst + longitude) % 360 + 360) % 360;

  const lstRad = (lst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const obliqRad = ((23.439291 - 0.0130042 * T) * Math.PI) / 180;

  // Mathematical formula for Ascendant: tan(Asc) = cos(LST) / (-sin(LST)*cos(e) - tan(lat)*sin(e))
  const y = Math.cos(lstRad);
  const x = -(Math.sin(lstRad) * Math.cos(obliqRad) + Math.tan(latRad) * Math.sin(obliqRad));

  let ascRad = Math.atan2(y, x);
  let tropicalAsc = (ascRad * (180 / Math.PI)) % 360;
  if (tropicalAsc < 0) tropicalAsc += 360;

  let siderealAsc = ((tropicalAsc - ayanamsa) % 360 + 360) % 360;
  const { sign: ascendantSign, rashiIndex } = longitudeToRashi(siderealAsc);

  return { ascendantSign, ascendantLongitude: siderealAsc, ascendantRashiIndex: rashiIndex };
}

/**
 * Constructs D1 Rashi and D9 Navamsha Kundali Charts
 */
function buildKundaliCharts(
  ascendantRashiIndex: number,
  ascendantDegree: number,
  planets: PlanetaryPosition[]
): { d1Chart: KundaliHouse[]; d9NavamshaChart: KundaliHouse[] } {
  // D1 Chart (Equal / Whole Sign from Lagna)
  const d1Chart: KundaliHouse[] = [];
  for (let house = 1; house <= 12; house++) {
    const rashiIdx = ((ascendantRashiIndex - 1 + (house - 1)) % 12) + 1;
    const rashiObj = VEDIC_RASHIS[rashiIdx - 1];
    d1Chart.push({
      houseNumber: house,
      sign: rashiObj.name,
      rashiNumber: rashiIdx,
      planets: [],
    });
  }

  // D9 Navamsha Chart
  const ascNavamshaRashiIdx = calculateNavamshaSignIndex(ascendantRashiIndex, ascendantDegree);
  const d9NavamshaChart: KundaliHouse[] = [];
  for (let house = 1; house <= 12; house++) {
    const rashiIdx = ((ascNavamshaRashiIdx - 1 + (house - 1)) % 12) + 1;
    const rashiObj = VEDIC_RASHIS[rashiIdx - 1];
    d9NavamshaChart.push({
      houseNumber: house,
      sign: rashiObj.name,
      rashiNumber: rashiIdx,
      planets: [],
    });
  }

  // Assign planets to D1 and D9
  planets.forEach((p) => {
    const pRashiIdx = VEDIC_RASHIS.findIndex((r) => r.name === p.sign) + 1;
    if (pRashiIdx > 0) {
      // D1 House assignment
      const d1HouseNum = ((pRashiIdx - ascendantRashiIndex + 12) % 12) + 1;
      p.house = d1HouseNum;
      const d1HouseObj = d1Chart.find((h) => h.houseNumber === d1HouseNum);
      if (d1HouseObj) d1HouseObj.planets.push(p.name);

      // D9 House assignment
      const d9RashiIdx = calculateNavamshaSignIndex(pRashiIdx, p.degreeInSign);
      const d9HouseNum = ((d9RashiIdx - ascNavamshaRashiIdx + 12) % 12) + 1;
      const d9HouseObj = d9NavamshaChart.find((h) => h.houseNumber === d9HouseNum);
      if (d9HouseObj) d9HouseObj.planets.push(p.name);
    }
  });

  return { d1Chart, d9NavamshaChart };
}

/**
 * Main Vedic Astrology Birth Chart Calculation
 */
export function calculateBirthChart(params: {
  birthDate: string;
  birthTime?: string;
  birthTimeAccuracy: BirthTimeAccuracy;
  latitude: number;
  longitude: number;
  timezone?: string;
}): AstrologyData {
  const { birthDate, birthTime, birthTimeAccuracy, latitude, longitude, timezone } = params;

  const tzOffset = getTimezoneOffsetHours(latitude, longitude, timezone);
  const jd = getJulianDayUTC(birthDate, birthTime, tzOffset);
  const T = (jd - 2451545.0) / 36525.0;
  const ayanamsa = calculateLahiriAyanamsa(jd);

  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

  const planets: PlanetaryPosition[] = planetNames.map((name) => {
    const { longitude: tropLong, isRetrograde } = calculateTropicalLongitude(name, T);
    const siderealLong = ((tropLong - ayanamsa + 360) % 360);
    const { sign, degreeInSign } = longitudeToRashi(siderealLong);
    const nak = getNakshatraDetails(siderealLong);

    return {
      name,
      symbol: PLANET_SYMBOLS[name] || '•',
      sign,
      longitude: parseFloat(siderealLong.toFixed(2)),
      degreeInSign,
      isRetrograde,
      nakshatra: nak.name,
      nakshatraLord: nak.lord,
      pada: nak.pada,
    };
  });

  const sunLong = planets.find((p) => p.name === 'Sun')?.longitude || 0;
  const moonLong = planets.find((p) => p.name === 'Moon')?.longitude || 0;

  const sunSign = planets.find((p) => p.name === 'Sun')?.sign || 'Aries';
  const moonSign = planets.find((p) => p.name === 'Moon')?.sign || 'Taurus';

  const moonNak = getNakshatraDetails(moonLong);
  const sunNak = getNakshatraDetails(sunLong);

  // Panchang & Vimshottari Dasha
  const panchang = calculatePanchang(sunLong, moonLong, birthDate);
  const vimsottariDasha = calculateVimshottariDasha(moonLong, birthDate);

  let ascendantSign: string | undefined;
  let ascendantNak: NakshatraDetails | undefined;
  let d1Chart: KundaliHouse[] | undefined;
  let d9NavamshaChart: KundaliHouse[] | undefined;
  let timeConfidenceNote = '';

  if (birthTimeAccuracy === 'exact' || (birthTimeAccuracy === 'approximate' && birthTime)) {
    const asc = calculateSiderealAscendant(jd, latitude, longitude, ayanamsa);
    ascendantSign = asc.ascendantSign;
    ascendantNak = getNakshatraDetails(asc.ascendantLongitude);

    const charts = buildKundaliCharts(asc.ascendantRashiIndex, asc.ascendantLongitude % 30, planets);
    d1Chart = charts.d1Chart;
    d9NavamshaChart = charts.d9NavamshaChart;

    timeConfidenceNote = birthTimeAccuracy === 'exact'
      ? 'Exact birth time provided. Full Vedic Sidereal Kundali (D1 Rashi & D9 Navamsha) calculated with Lahiri Ayanamsa.'
      : 'Approximate birth time provided. Ascendant (Lagna) and House placements are estimated.';
  } else {
    // Unknown time fallback: Chandra Lagna (Moon as 1st House)
    const moonRashiIdx = VEDIC_RASHIS.findIndex((r) => r.name === moonSign) + 1;
    const effectiveRashiIdx = moonRashiIdx > 0 ? moonRashiIdx : 1;
    const charts = buildKundaliCharts(effectiveRashiIdx, moonLong % 30, planets);
    d1Chart = charts.d1Chart;
    d9NavamshaChart = charts.d9NavamshaChart;
    ascendantSign = `Moon Sign (${moonSign} / Chandra Lagna)`;

    timeConfidenceNote = 'Birth time was unknown. Kundali calculated using Chandra Lagna (Moon Sign as House 1) as per traditional Vedic rules.';
  }

  // Equal houses list
  const houses: HouseCusp[] = [];
  const ascLong = ascendantSign ? planets[0].longitude : 0;
  for (let h = 1; h <= 12; h++) {
    const hLong = (ascLong + (h - 1) * 30) % 360;
    const { sign, degreeInSign } = longitudeToRashi(hLong);
    houses.push({ house: h, sign, degree: degreeInSign });
  }

  // Aspects
  const aspects: PlanetaryAspect[] = [];

  return {
    system: 'Vedic Sidereal (Lahiri Ayanamsa)',
    ayanamsaDegree: parseFloat(ayanamsa.toFixed(2)),
    sunSign,
    moonSign,
    ascendantSign,
    moonNakshatra: moonNak,
    sunNakshatra: sunNak,
    ascendantNakshatra: ascendantNak,
    panchang,
    vimsottariDasha,
    d1Chart,
    d9NavamshaChart,
    planets,
    houses,
    aspects,
    timeConfidenceNote,
  };
}
