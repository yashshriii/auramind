import { GeocodedLocation } from '../types';

/**
 * Geocoding Service
 * Abstraction layer for resolving birthplace strings into geographic coordinates and timezone metadata.
 */

const geocodeCache = new Map<string, GeocodedLocation>();

// Fallback lookup table for common cities if Nominatim is unreachable or rate-limited
const POPULAR_LOCATIONS: Record<string, GeocodedLocation> = {
  mumbai: {
    formattedName: 'Mumbai, Maharashtra, India',
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
  },
  delhi: {
    formattedName: 'New Delhi, Delhi, India',
    city: 'New Delhi',
    region: 'Delhi',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
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
    longitude: -74.0060,
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

export async function geocodeBirthplace(place: string): Promise<GeocodedLocation> {
  const cleanKey = place.trim().toLowerCase();

  if (geocodeCache.has(cleanKey)) {
    return geocodeCache.get(cleanKey)!;
  }

  // Check fallback dictionary
  for (const [key, loc] of Object.entries(POPULAR_LOCATIONS)) {
    if (cleanKey.includes(key)) {
      geocodeCache.set(cleanKey, loc);
      return loc;
    }
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`,
      {
        headers: {
          'User-Agent': 'PersonalInsightsApp/1.0 (contact@personalinsights.app)',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        const displayName = item.display_name || place;
        const nameParts = displayName.split(',').map((s: string) => s.trim());

        const loc: GeocodedLocation = {
          formattedName: displayName,
          city: nameParts[0] || place,
          region: nameParts.length > 2 ? nameParts[nameParts.length - 2] : '',
          country: nameParts[nameParts.length - 1] || '',
          latitude: lat,
          longitude: lon,
          timezone: 'UTC', // Default to UTC if timezone service omitted
        };

        geocodeCache.set(cleanKey, loc);
        return loc;
      }
    }
  } catch (err) {
    console.warn('Geocoding API network error, using default location fallback:', err);
  }

  // Generic fallback if network fails or location not found
  const fallbackLoc: GeocodedLocation = {
    formattedName: place,
    city: place,
    region: '',
    country: '',
    latitude: 20.0,
    longitude: 77.0,
    timezone: 'UTC',
  };

  geocodeCache.set(cleanKey, fallbackLoc);
  return fallbackLoc;
}
