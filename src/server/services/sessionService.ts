import { SessionContextData } from '../types';
import crypto from 'crypto';

/**
 * Session & Telemetry Context Service
 * Sanitizes consented client environment context.
 */

export function parseUserAgent(uaString = ''): { browser: string; os: string; deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' } {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'desktop';

  const ua = uaString.toLowerCase();

  // Detect OS
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('linux')) os = 'Linux';

  // Detect Browser
  if (ua.includes('edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('chrome/')) browser = 'Google Chrome';
  else if (ua.includes('safari/')) browser = 'Apple Safari';
  else if (ua.includes('firefox/')) browser = 'Mozilla Firefox';

  // Detect Device Category
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    deviceType = 'mobile';
  } else if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet';
  }

  return { browser, os, deviceType };
}

export function createSessionRecord(clientData: Partial<SessionContextData>, reqHeaders: Record<string, string | string[] | undefined>): SessionContextData {
  const userAgentStr = typeof reqHeaders['user-agent'] === 'string' ? reqHeaders['user-agent'] : '';
  const { browser, os, deviceType } = parseUserAgent(userAgentStr);

  return {
    sessionId: clientData.sessionId || crypto.randomUUID(),
    browser: clientData.browser || browser,
    os: clientData.os || os,
    deviceType: clientData.deviceType || deviceType,
    language: clientData.language || (typeof reqHeaders['accept-language'] === 'string' ? reqHeaders['accept-language'].split(',')[0] : 'en-US'),
    timezone: clientData.timezone || 'UTC',
    screenWidth: clientData.screenWidth,
    screenHeight: clientData.screenHeight,
    connectionSpeed: clientData.connectionSpeed,
    saveData: clientData.saveData,
    ipApproxLocation: clientData.ipApproxLocation || {
      country: typeof reqHeaders['cf-ipcountry'] === 'string' ? reqHeaders['cf-ipcountry'] : undefined,
    },
  };
}
