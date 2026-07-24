import crypto from 'crypto';

export interface SessionTelemetry {
  sessionId: string;
  ip: string;
  approxLocation: {
    city?: string;
    region?: string;
    country?: string;
  };
  browser: string;
  os: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  language: string;
  timezone: string;
  referrer: string;
  connectionSpeed: string;
  networkType: string;
  cookiesEnabled: boolean;
  localStorageKeysCount: number;
  firstSeen: string;
  lastActive: string;
  userProfile?: {
    fullName: string;
    email?: string;
    birthDate: string;
    birthTime?: string;
    birthPlace: string;
    age: number;
    sunSign: string;
    moonSign: string;
    lifePathNumber: number;
    analysisId: string;
  };
  qaLogs: Array<{
    id: string;
    question: string;
    answer: string;
    timestamp: string;
  }>;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  category: 'API' | 'AUTH' | 'ANALYSIS' | 'CHAT' | 'SYSTEM';
  message: string;
  details?: Record<string, any>;
}

// In-memory bounded collections
const MAX_SESSIONS = 300;
const MAX_LOGS = 300;
const MAX_QA_PER_SESSION = 50;

const sessionsMap = new Map<string, SessionTelemetry>();
const systemLogs: SystemLog[] = [];

/**
 * Add a rolling system log entry
 */
export function addSystemLog(
  level: 'info' | 'warn' | 'error',
  category: 'API' | 'AUTH' | 'ANALYSIS' | 'CHAT' | 'SYSTEM',
  message: string,
  details?: Record<string, any>
): void {
  const log: SystemLog = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details,
  };

  systemLogs.unshift(log);

  // Maintain bounded log buffer to optimize memory
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.length = MAX_LOGS;
  }
}

/**
 * Extract client IP from HTTP Request headers
 */
export function extractClientIp(reqHeaders: Record<string, string | string[] | undefined>, socketIp?: string): string {
  const xForwardedFor = reqHeaders['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(xForwardedFor) && xForwardedFor.length > 0) {
    return xForwardedFor[0].trim();
  }
  const cfIp = reqHeaders['cf-connecting-ip'];
  if (typeof cfIp === 'string') return cfIp;

  const realIp = reqHeaders['x-real-ip'];
  if (typeof realIp === 'string') return realIp;

  return socketIp || '127.0.0.1';
}

/**
 * Parse browser, OS, and device type from User-Agent string
 */
export function parseUserAgentDetailed(uaString = ''): {
  browser: string;
  os: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
} {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'desktop';

  const ua = uaString.toLowerCase();

  // OS detection
  if (ua.includes('windows nt 10.0')) os = 'Windows 10/11';
  else if (ua.includes('windows nt')) os = 'Windows';
  else if (ua.includes('macintosh') || ua.includes('mac os x')) os = 'macOS';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('iphone')) os = 'iOS (iPhone)';
  else if (ua.includes('ipad')) os = 'iOS (iPad)';
  else if (ua.includes('linux')) os = 'Linux';

  // Browser detection
  if (ua.includes('edg/')) {
    const match = ua.match(/edg\/([\d.]+)/);
    browser = `Microsoft Edge ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('chrome/')) {
    const match = ua.match(/chrome\/([\d.]+)/);
    browser = `Google Chrome ${match ? match[1].split('.')[0] : ''}`;
  } else if (ua.includes('safari/') && !ua.includes('chrome')) {
    const match = ua.match(/version\/([\d.]+)/);
    browser = `Apple Safari ${match ? match[1] : ''}`;
  } else if (ua.includes('firefox/')) {
    const match = ua.match(/firefox\/([\d.]+)/);
    browser = `Mozilla Firefox ${match ? match[1] : ''}`;
  }

  // Device detection
  if (ua.includes('ipad') || ua.includes('tablet')) {
    deviceType = 'tablet';
  } else if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
    deviceType = 'mobile';
  }

  return { browser: browser.trim(), os, deviceType };
}

/**
 * Register or update session telemetry
 */
export function recordSessionContext(
  body: Record<string, any>,
  reqHeaders: Record<string, string | string[] | undefined>,
  socketIp?: string
): SessionTelemetry {
  const sessionId = body.sessionId || reqHeaders['x-session-id'] || crypto.randomUUID();
  const ip = extractClientIp(reqHeaders, socketIp);
  const userAgentStr = typeof reqHeaders['user-agent'] === 'string' ? reqHeaders['user-agent'] : '';
  const { browser, os, deviceType } = parseUserAgentDetailed(userAgentStr);

  const countryHeader = reqHeaders['cf-ipcountry'] || reqHeaders['x-appengine-country'];
  const country = typeof countryHeader === 'string' ? countryHeader : body.ipApproxLocation?.country || 'Detected IP Location';

  const existing = sessionsMap.get(sessionId);
  const now = new Date().toISOString();

  const sessionRecord: SessionTelemetry = {
    sessionId,
    ip,
    approxLocation: {
      city: body.ipApproxLocation?.city || existing?.approxLocation?.city || 'Local/Cloud Subnet',
      region: body.ipApproxLocation?.region || existing?.approxLocation?.region || '',
      country,
    },
    browser: body.browser || browser,
    os: body.os || os,
    deviceType: body.deviceType || deviceType,
    language: body.language || (typeof reqHeaders['accept-language'] === 'string' ? reqHeaders['accept-language'].split(',')[0] : 'en-US'),
    timezone: body.timezone || 'UTC',
    referrer: body.referrer || (typeof reqHeaders['referer'] === 'string' ? reqHeaders['referer'] : 'Direct / Bookmark'),
    connectionSpeed: body.connectionSpeed || 'Good (4G/Wi-Fi)',
    networkType: body.networkType || '4g',
    cookiesEnabled: body.cookiesEnabled ?? true,
    localStorageKeysCount: body.localStorageKeysCount || 0,
    firstSeen: existing?.firstSeen || now,
    lastActive: now,
    userProfile: existing?.userProfile,
    qaLogs: existing?.qaLogs || [],
  };

  sessionsMap.set(sessionId, sessionRecord);

  // Enforce memory bounds
  if (sessionsMap.size > MAX_SESSIONS) {
    const firstKey = sessionsMap.keys().next().value;
    if (firstKey) sessionsMap.delete(firstKey);
  }

  return sessionRecord;
}

/**
 * Associate analyzed user profile details with current session
 */
export function attachUserProfileToSession(
  sessionId: string,
  profileData: {
    fullName: string;
    email?: string;
    birthDate: string;
    birthTime?: string;
    birthPlace: string;
    sunSign: string;
    moonSign: string;
    lifePathNumber: number;
    analysisId: string;
  },
  reqHeaders?: Record<string, string | string[] | undefined>
): void {
  const birth = new Date(profileData.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (isNaN(age) || age < 0) age = 0;

  let session = sessionsMap.get(sessionId);
  if (!session) {
    session = recordSessionContext({ sessionId }, reqHeaders || {});
  }

  session.userProfile = {
    ...profileData,
    age,
  };
  session.lastActive = new Date().toISOString();
}

/**
 * Save Question and Answer log into session
 */
export function recordQALog(
  sessionId: string,
  question: string,
  answer: string
): void {
  let session = sessionsMap.get(sessionId);

  // If no session existed, create a fallback baseline session
  if (!session) {
    session = {
      sessionId,
      ip: '127.0.0.1',
      approxLocation: { city: 'Local Network', country: 'System' },
      browser: 'Web Client',
      os: 'Client OS',
      deviceType: 'desktop',
      language: 'en-US',
      timezone: 'UTC',
      referrer: 'In-App',
      connectionSpeed: 'High-speed',
      networkType: '4g',
      cookiesEnabled: true,
      localStorageKeysCount: 1,
      firstSeen: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      qaLogs: [],
    };
    sessionsMap.set(sessionId, session);
  }

  session.qaLogs.push({
    id: crypto.randomUUID(),
    question: question.trim(),
    answer: answer.trim(),
    timestamp: new Date().toISOString(),
  });

  // Keep max QA per session
  if (session.qaLogs.length > MAX_QA_PER_SESSION) {
    session.qaLogs.shift();
  }

  session.lastActive = new Date().toISOString();
}

/**
 * Get all active telemetry sessions
 */
export function getAllSessions(): SessionTelemetry[] {
  return Array.from(sessionsMap.values()).sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  );
}

/**
 * Get system logs
 */
export function getSystemLogs(): SystemLog[] {
  return systemLogs;
}

/**
 * Get System & Storage Footprint Metrics
 */
export function getSystemMetrics() {
  const mem = process.memoryUsage();
  return {
    uptimeSeconds: Math.floor(process.uptime()),
    sessionsCount: sessionsMap.size,
    logsCount: systemLogs.length,
    memory: {
      rssMB: (mem.rss / 1024 / 1024).toFixed(2),
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
    },
    nodeVersion: process.version,
    platform: process.platform,
  };
}

/**
 * Clear logs
 */
export function clearLogs(): void {
  systemLogs.length = 0;
  addSystemLog('info', 'SYSTEM', 'Admin cleared execution logs.');
}
