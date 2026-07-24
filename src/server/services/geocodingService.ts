import { GeocodedLocation } from '../types';

/**
 * Geocoding Service
 * Abstract server-side geocoding service layer for converting birthplace strings
 * into normalized coordinates (lat/long) and region metadata.
 * Uses OpenStreetMap Nominatim as the primary free engine with rate-limiting,
 * caching, and optional API key support for external providers (e.g. Geoapify/Google).
 */

const geocodeCache = new Map<string, GeocodedLocation>();
let lastNominatimRequestTime = 0;

// Instant fallback dictionary for common cities / regions
const POPULAR_LOCATIONS: Record<string, GeocodedLocation> = {
  mumbai: {
    formattedName: 'Mumbai, Maharashtra, India',
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  delhi: {
    formattedName: 'New Delhi, Delhi, India',
    city: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  },
  dabra: {
    formattedName: 'Dabra, Madhya Pradesh, India',
    city: 'Dabra',
    region: 'Madhya Pradesh',
    country: 'India',
    latitude: 25.8897,
    longitude: 78.3341,
    timezone: 'Asia/Kolkata',
  },
  gwalior: {
    formattedName: 'Gwalior, Madhya Pradesh, India',
    city: 'Gwalior',
    region: 'Madhya Pradesh',
    country: 'India',
    latitude: 26.2183,
    longitude: 78.1828,
    timezone: 'Asia/Kolkata',
  },
  bhopal: {
    formattedName: 'Bhopal, Madhya Pradesh, India',
    city: 'Bhopal',
    region: 'Madhya Pradesh',
    country: 'India',
    latitude: 23.2599,
    longitude: 77.4126,
    timezone: 'Asia/Kolkata',
  },
  indore: {
    formattedName: 'Indore, Madhya Pradesh, India',
    city: 'Indore',
    region: 'Madhya Pradesh',
    country: 'India',
    latitude: 22.7196,
    longitude: 75.8577,
    timezone: 'Asia/Kolkata',
  },
  london: {
    formattedName: 'London, Greater London, United Kingdom',
    city: 'London',
    region: 'England',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
  },
  'new york': {
    formattedName: 'New York City, New York, United States',
    city: 'New York City',
    region: 'New York',
    country: 'United States',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
  },
  tokyo: {
    formattedName: 'Tokyo, Japan',
    city: 'Tokyo',
    region: 'Tokyo',
    country: 'Japan',
    latitude: 35.6762,
    longitude: 139.6503,
    timezone: 'Asia/Tokyo',
  },
};

/**
 * Throttle helper to respect Nominatim 1 request per second usage policy
 */
async function enforceMinInterval(minMs = 1000): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastNominatimRequestTime;
  if (elapsed < minMs) {
    await new Promise((resolve) => setTimeout(resolve, minMs - elapsed));
  }
  lastNominatimRequestTime = Date.now();
}

/**
 * Main Geocoding function
 */
export async function geocodeBirthplace(place: string): Promise<GeocodedLocation | null> {
  if (!place || typeof place !== 'string' || !place.trim()) {
    return null;
  }

  const cleanKey = place.trim().toLowerCase();

  // 1. Check in-memory cache
  if (geocodeCache.has(cleanKey)) {
    return geocodeCache.get(cleanKey)!;
  }

  // 2. Check popular dictionary
  for (const [key, loc] of Object.entries(POPULAR_LOCATIONS)) {
    if (cleanKey === key || cleanKey.includes(key)) {
      geocodeCache.set(cleanKey, loc);
      return loc;
    }
  }

  // 3. OpenStreetMap Nominatim Request (Server-side)
  try {
    await enforceMinInterval(1000);

    const endpoint = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(
      place.trim()
    )}&limit=1`;

    const response = await fetch(endpoint, {
      headers: {
        'User-Agent': 'AuraBrain-AstrologyApp/1.0 (contact: support@aurabrain.app)',
        'Accept-Language': 'en',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const address = item.address || {};
          const displayName = item.display_name || place;
          const nameParts = displayName.split(',').map((s: string) => s.trim());

          const city =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            nameParts[0] ||
            place;

          const region = address.state || address.region || (nameParts.length > 2 ? nameParts[nameParts.length - 2] : '');
          const country = address.country || nameParts[nameParts.length - 1] || '';

          // Infer basic timezone from country / coordinates
          let timezone = 'UTC';
          if (country.toLowerCase().includes('india') || country.toLowerCase() === 'in') {
            timezone = 'Asia/Kolkata';
          } else if (country.toLowerCase().includes('united states') || country.toLowerCase() === 'us') {
            timezone = 'America/New_York';
          } else if (country.toLowerCase().includes('united kingdom') || country.toLowerCase() === 'uk') {
            timezone = 'Europe/London';
          }

          const loc: GeocodedLocation = {
            formattedName: displayName,
            city,
            region,
            country,
            latitude: lat,
            longitude: lon,
            timezone,
          };

          geocodeCache.set(cleanKey, loc);
          return loc;
        }
      }
    }
  } catch (err) {
    console.warn('Nominatim geocoding network error:', err);
  }

  // If geocoding fails or place not found, return null
  return null;
}
