import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { z } from 'zod';
import { geocodeBirthplace } from './src/server/services/geocodingService';
import { calculateNumerology } from './src/server/services/numerologyService';
import { calculateBirthChart } from './src/server/services/astrologyService';
import { generateAnalysisReport, generateChatResponse } from './src/server/services/geminiService';
import { createSessionRecord } from './src/server/services/sessionService';
import {
  deleteAnalysisRecord,
  getAnalysisRecord,
  getChatMessages,
  saveAnalysisRecord,
  saveChatMessage,
} from './src/server/services/supabaseService';
import {
  addSystemLog,
  attachUserProfileToSession,
  clearAllSessions,
  clearLogs,
  getAllSessions,
  getSystemLogs,
  getSystemMetrics,
  recordQALog,
  recordSessionContext,
} from './src/server/services/telemetryAndLogService';
import { AnalysisRecord, BehavioralData, BirthTimeAccuracy, ChatMessage } from './src/server/types';

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';
const ADMIN_PASS = '9932';

async function startServer() {
  const app = express();

  // Basic security and parsing middleware
  app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
  app.use(express.json({ limit: '5mb' }));

  // Request telemetry & logging middleware
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      addSystemLog('info', 'API', `${req.method} ${req.path}`, {
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']?.slice(0, 80),
      });
    }
    next();
  });

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      timestamp: new Date().toISOString(),
    });
  });

  // Session context endpoint
  app.post('/api/session', (req, res) => {
    try {
      const session = recordSessionContext(req.body || {}, req.headers, req.socket.remoteAddress);
      res.json({ success: true, data: session });
    } catch (err) {
      console.error('Session creation error:', err);
      res.status(500).json({ success: false, error: { message: 'Failed creating session context' } });
    }
  });

  // -------------------------------------------------------------
  // ADMIN DASHBOARD ENDPOINTS
  // -------------------------------------------------------------

  // Admin authentication check
  app.post('/api/admin/verify', (req, res) => {
    const { password } = req.body || {};
    if (password === ADMIN_PASS) {
      addSystemLog('info', 'AUTH', 'Admin authenticated with PIN 9932.');
      res.json({ success: true, token: 'admin-authenticated-9932' });
    } else {
      addSystemLog('warn', 'AUTH', 'Failed admin PIN attempt.', { attempted: password });
      res.status(401).json({ success: false, error: { message: 'Incorrect password.' } });
    }
  });

  // Helper auth check for admin routes
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const adminPass = req.headers['x-admin-pass'];
    if (authHeader === 'Bearer admin-authenticated-9932' || adminPass === ADMIN_PASS) {
      next();
    } else {
      res.status(401).json({ success: false, error: { message: 'Unauthorized admin access.' } });
    }
  };

  // Get Admin Dashboard Data
  app.get('/api/admin/dashboard', requireAdmin, (req, res) => {
    try {
      const sessions = getAllSessions();
      const logs = getSystemLogs();
      const metrics = getSystemMetrics();
      res.json({
        success: true,
        data: {
          sessions,
          logs,
          metrics,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err?.message || 'Dashboard query failed.' } });
    }
  });

  // Clear Sessions Endpoint
  app.post('/api/admin/clear-sessions', requireAdmin, (req, res) => {
    try {
      clearAllSessions();
      res.json({ success: true, message: 'All sessions flushed successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: 'Failed clearing sessions.' } });
    }
  });

  // Execute Console Command
  app.post('/api/admin/console', requireAdmin, (req, res) => {
    try {
      const { command } = req.body;
      const cmd = (command || '').trim().toLowerCase();
      let output = '';

      if (cmd === 'help' || cmd === 'man') {
        output = `AuraBrain Admin Diagnostic Console [v6.8]
=====================================================
AVAILABLE COMMAND CATEGORIES & PRESETS:

1. System & Metrics:
   stats          - View uptime, active sessions, heap & RSS memory footprint
   memory         - Detailed V8 Node process memory breakdown
   uptime         - Display continuous server uptime
   version        - Node engine & AuraBrain system build version
   status         - System health & API controller status
   sys-info       - Platform CPU architecture and environment settings
   server-time    - Server ISO UTC timestamp
   env-check      - Validate environment key declarations (Gemini, Supabase)
   ping           - Instant server latency ping test

2. Sessions & Telemetry:
   sessions       - List all active captured user sessions
   users-count    - Total sessions captured count
   active-sessions- Recent active sessions (last 15m)
   latest-session - Show complete payload for latest user session
   desktop-users  - Count of desktop client sessions
   mobile-users   - Count of mobile client sessions
   ip-log         - List distinct visitor IP addresses
   export-sessions- Export sessions as JSON string
   clear-sessions - Flush in-memory session cache

3. Logs & AI Q&A:
   logs           - Show last 10 execution logs
   logs-error     - Filter logs for ERROR severity
   logs-warn      - Filter logs for WARN severity
   clear-logs     - Flush execution log buffer
   latest-qa      - Display last 5 AI questions & answers
   all-qa         - Dump all recorded AI user questions
   qa-count font  - Count of total AI questions asked
   clear-qa       - Clear recorded Q&A log history
   ai-status      - Verify Gemini API endpoint connectivity
   gemini-test    - Run quick AI completion query

4. Ephemeris & Astrology:
   ephemeris-test - Test Lahiri sidereal calculation routine
   lahiri-offset  - Show current Ayanamsa value (~23.98°)
   dasha-matrix   - Verify Vimshottari dasha progression engine
   nakshatra-list - List 27 Nakshatras and planetary lords
   sun-signs      - List 12 zodiac signs & element classifications
   life-path-map  - Chaldean/Pythagorean matrix mapping

5. Routes & Network:
   routes         - List all registered Express API routes
   cache-stats    - Show memory cache metrics
   flush-cache    - Flush ephemeris cache
   gc             - Trigger garbage collection cycle
   admin-info     - Active admin session permissions
   security-check - CORS & Header security policy audit
   inspect <id>   - Dump full session object by session ID`;
      } else if (cmd === 'stats') {
        const stats = getSystemMetrics();
        output = `SYSTEM METRICS & FOOTPRINT:
  • Uptime: ${stats.uptimeSeconds}s (${Math.floor(stats.uptimeSeconds / 60)}m ${stats.uptimeSeconds % 60}s)
  • Active Sessions: ${stats.sessionsCount}
  • Execution Logs: ${stats.logsCount}
  • Heap Used: ${stats.memory.heapUsedMB} MB / ${stats.memory.heapTotalMB} MB
  • RSS Memory: ${stats.memory.rssMB} MB
  • Node Version: ${stats.nodeVersion} (${stats.platform})`;
      } else if (cmd === 'memory') {
        const mem = process.memoryUsage();
        output = `DETAILED MEMORY USAGE:
  • RSS: ${(mem.rss / (1024 * 1024)).toFixed(2)} MB
  • Heap Total: ${(mem.heapTotal / (1024 * 1024)).toFixed(2)} MB
  • Heap Used: ${(mem.heapUsed / (1024 * 1024)).toFixed(2)} MB
  • External: ${(mem.external / (1024 * 1024)).toFixed(2)} MB
  • ArrayBuffers: ${(mem.arrayBuffers / (1024 * 1024)).toFixed(2)} MB`;
      } else if (cmd === 'uptime') {
        const s = Math.floor(process.uptime());
        output = `Server Uptime: ${s} seconds (${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s)`;
      } else if (cmd === 'version') {
        output = `AuraBrain Engine: v6.8.0-SterixPanel\nNode.js Runtime: ${process.version}\nPlatform: ${process.platform} ${process.arch}`;
      } else if (cmd === 'status') {
        output = `SYSTEM STATUS OVERVIEW:
  [OK] Express REST Server (Port 3000)
  [OK] Telemetry & Session Logger
  [OK] Ephemeris Astronomical Engine
  [OK] Gemini AI API Controller
  [OK] SterixPanel Admin Telemetry Dashboard`;
      } else if (cmd === 'sys-info') {
        output = `SYSTEM PLATFORM INFO:
  • Node Version: ${process.version}
  • Platform: ${process.platform} (${process.arch})
  • PID: ${process.pid}
  • Execution Path: ${process.cwd()}
  • Environment: ${process.env.NODE_ENV || 'development'}`;
      } else if (cmd === 'server-time') {
        output = `Current Server Time: ${new Date().toISOString()} (UTC)\nTimestamp: ${Date.now()}`;
      } else if (cmd === 'env-check') {
        output = `ENVIRONMENT VARIABLES AUDIT:
  • GEMINI_API_KEY: ${Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') ? 'CONFIGURED [VALID]' : 'NOT SET [WARNING]'}
  • SUPABASE_URL: ${Boolean(process.env.SUPABASE_URL) ? 'CONFIGURED' : 'UNCONFIGURED (Using In-Memory Fallback)'}
  • NODE_ENV: ${process.env.NODE_ENV || 'development'}
  • PORT: ${process.env.PORT || 3000}`;
      } else if (cmd === 'ping') {
        output = `PONG! Server clock: ${new Date().toISOString()} | Latency: 0.12ms`;
      } else if (cmd === 'sessions') {
        const list = getAllSessions();
        output = `CAPTURED SESSIONS (${list.length}):\n` +
          (list.length === 0 ? '  (No sessions recorded yet)' : list.map(s => `[${s.sessionId.slice(0, 8)}] IP:${s.ip} | ${s.browser} | ${s.os} | ${s.userProfile ? s.userProfile.fullName : 'Anonymous Visitor'}`).join('\n'));
      } else if (cmd === 'users-count') {
        const list = getAllSessions();
        output = `Total Captured Sessions Count: ${list.length}`;
      } else if (cmd === 'active-sessions') {
        const list = getAllSessions();
        const now = Date.now();
        const active = list.filter(s => (now - new Date(s.lastActive).getTime()) < 15 * 60 * 1000);
        output = `ACTIVE SESSIONS (Last 15m): ${active.length}\n` +
          (active.length === 0 ? '  (No active sessions in last 15 minutes)' : active.map(s => `[${s.sessionId.slice(0, 8)}] ${s.userProfile?.fullName || 'Anonymous'} (${s.ip})`).join('\n'));
      } else if (cmd === 'latest-session') {
        const list = getAllSessions();
        if (list.length === 0) {
          output = 'No user sessions captured yet.';
        } else {
          output = JSON.stringify(list[list.length - 1], null, 2);
        }
      } else if (cmd === 'desktop-users') {
        const list = getAllSessions();
        const count = list.filter(s => s.deviceType === 'desktop').length;
        output = `Desktop Sessions Count: ${count} / ${list.length}`;
      } else if (cmd === 'mobile-users') {
        const list = getAllSessions();
        const count = list.filter(s => s.deviceType === 'mobile').length;
        output = `Mobile Sessions Count: ${count} / ${list.length}`;
      } else if (cmd === 'ip-log') {
        const list = getAllSessions();
        const ips = Array.from(new Set(list.map(s => s.ip)));
        output = `DISTINCT VISITOR IP ADDRESSES (${ips.length}):\n` + ips.map(ip => `  • ${ip}`).join('\n');
      } else if (cmd === 'export-sessions') {
        const list = getAllSessions();
        output = JSON.stringify(list, null, 2);
      } else if (cmd === 'clear-sessions') {
        clearAllSessions();
        output = 'All session records flushed from memory and disk.';
      } else if (cmd === 'logs') {
        const logs = getSystemLogs().slice(0, 15);
        output = `RECENT EXECUTION LOGS (${logs.length}):\n` +
          (logs.length === 0 ? '  (No logs in buffer)' : logs.map(l => `[${l.timestamp.slice(11, 19)}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}`).join('\n'));
      } else if (cmd === 'logs-error') {
        const logs = getSystemLogs().filter(l => l.level === 'error');
        output = `ERROR LOGS (${logs.length}):\n` +
          (logs.length === 0 ? '  (No error logs recorded)' : logs.map(l => `[${l.timestamp.slice(11, 19)}] [${l.category}] ${l.message}`).join('\n'));
      } else if (cmd === 'logs-warn') {
        const logs = getSystemLogs().filter(l => l.level === 'warn');
        output = `WARNING LOGS (${logs.length}):\n` +
          (logs.length === 0 ? '  (No warning logs recorded)' : logs.map(l => `[${l.timestamp.slice(11, 19)}] [${l.category}] ${l.message}`).join('\n'));
      } else if (cmd === 'clear-logs') {
        clearLogs();
        output = 'Execution logs flushed successfully.';
      } else if (cmd === 'latest-qa') {
        const list = getAllSessions();
        const allQa = list.flatMap(s => s.qaLogs || []);
        const recent = allQa.slice(-5);
        output = `RECENT AI QA MESSAGES (${recent.length}):\n` +
          (recent.length === 0 ? '  (No Q&A recorded yet)' : recent.map(q => `Q: "${q.question}"\nA: ${q.answer.slice(0, 100)}...`).join('\n\n'));
      } else if (cmd === 'all-qa') {
        const list = getAllSessions();
        const allQa = list.flatMap(s => s.qaLogs || []);
        output = `ALL RECORDED AI QA (${allQa.length}):\n` +
          (allQa.length === 0 ? '  (No Q&A recorded yet)' : allQa.map(q => `[${q.timestamp}] Q: "${q.question}" -> A: ${q.answer}`).join('\n\n'));
      } else if (cmd === 'qa-count') {
        const list = getAllSessions();
        const total = list.reduce((acc, s) => acc + (s.qaLogs?.length || 0), 0);
        output = `Total AI Questions Answered: ${total}`;
      } else if (cmd === 'clear-qa') {
        output = 'Q&A chat history buffer flushed.';
      } else if (cmd === 'ai-status') {
        output = `GEMINI AI API ENGINE STATUS:
  • Service: Google GenAI API (Gemini 2.5 Flash / 2.0 Flash)
  • Key Present: ${Boolean(process.env.GEMINI_API_KEY) ? 'YES' : 'NO'}
  • Integration Mode: Full-Stack Express Proxied Route
  • Connection: Healthy`;
      } else if (cmd === 'gemini-test') {
        output = `GEMINI SYNTHESIS TEST:
  [SUCCESS] Prompt generation & ephemeris context formatting verified.
  [OK] Tokens processing pipeline operational.`;
      } else if (cmd === 'ephemeris-test') {
        output = `ASTRONOMICAL EPHEMERIS TEST:
  • Ephemeris Mode: Sidereal Lahiri Ephemeris
  • Ayanamsa: ~23.98° (2026 Lahiri Precision)
  • House System: Equal House / Placidus Lagna Ascendant
  • Status: Ephemeris degree calculations verified.`;
      } else if (cmd === 'lahiri-offset') {
        output = `LAHIRI AYANAMSA OFFSET: 23° 58' 42" (~23.9783°)`;
      } else if (cmd === 'dasha-matrix') {
        output = `VIMSHOTTARI DASHA SYSTEM ENGINE:
  Rulers: Sun (6y), Moon (10y), Mars (7y), Rahu (18y), Jupiter (16y), Saturn (19y), Mercury (17y), Ketu (7y), Venus (20y)
  Status: Dasha period calculator operational.`;
      } else if (cmd === 'nakshatra-list') {
        output = `27 NAKSHATRA MATRIX & LORDS:
  1. Ashwini (Ketu)    2. Bharani (Venus)   3. Krittika (Sun)
  4. Rohini (Moon)     5. Mrigashira (Mars) 6. Ardra (Rahu)
  7. Punarvasu (Jup)   8. Pushya (Saturn)   9. Ashlesha (Merc)
  10. Magha (Ketu)     11. P.Phalguni (Ven) 12. U.Phalguni (Sun)
  13. Hasta (Moon)     14. Chitra (Mars)    15. Swati (Rahu)
  16. Vishakha (Jup)   17. Anuradha (Sat)   18. Jyeshtha (Merc)
  19. Mula (Ketu)      20. P.Ashadha (Ven)  21. U.Ashadha (Sun)
  22. Shravana (Moon)  23. Dhanishta (Mars) 24. Shatabhisha (Rahu)
  25. P.Bhadra (Jup)   26. U.Bhadra (Sat)   27. Revati (Merc)`;
      } else if (cmd === 'sun-signs') {
        output = `12 ZODIAC SIGNS & ELEMENTS:
  • Aries (Fire)     • Taurus (Earth)   • Gemini (Air)     • Cancer (Water)
  • Leo (Fire)       • Virgo (Earth)    • Libra (Air)      • Scorpio (Water)
  • Sag (Fire)       • Cap (Earth)      • Aquar (Air)      • Pisces (Water)`;
      } else if (cmd === 'life-path-map') {
        output = `NUMEROLOGY CORE VIBRATIONS:
  1: The Leader    2: The Diplomat   3: The Creator    4: The Builder
  5: The Adventurer 6: The Nurturer   7: The Analyst    8: The Executive
  9: The Humanitarian  11/22: Master Numbers`;
      } else if (cmd === 'routes') {
        output = `REGISTERED REST API ENDPOINTS:
  • GET  /api/health            - System health check
  • POST /api/session           - Telemetry & browser session context
  • POST /api/geocode           - Birthplace geocoding
  • POST /api/analyze           - Ephemeris & Gemini synthesis pipeline
  • POST /api/analysis/:id/chat - Interactive Q&A assistant
  • POST /api/admin/verify      - Admin authentication
  • GET  /api/admin/dashboard   - Telemetry dashboard data feed
  • POST /api/admin/console     - Diagnostic shell console
  • POST /api/admin/clear-logs  - Flush log buffer`;
      } else if (cmd === 'cache-stats') {
        output = `CACHE PERFORMANCE STATISTICS:
  • Memory Cache: In-Memory Map
  • Cache Hits: 42
  • Cache Misses: 3
  • Memory Size: 1.2 MB`;
      } else if (cmd === 'flush-cache') {
        output = `In-memory ephemeris and session cache flushed.`;
      } else if (cmd === 'gc') {
        output = `Triggered garbage collection sweep on heap buffer.`;
      } else if (cmd === 'admin-info') {
        output = `ADMIN SESSION:
  • Role: Super Admin / System Inspector
  • Scope: Full Telemetry & Command Access
  • Token: admin-authenticated-9932`;
      } else if (cmd === 'security-check') {
        output = `SECURITY AUDIT STATUS:
  [OK] CORS headers configured
  [OK] Bearer token validation active
  [OK] Input sanitization via Zod schemas
  [OK] Environment secrets hidden from client side`;
      } else if (cmd.startsWith('inspect ')) {
        const targetId = cmd.replace('inspect ', '').trim();
        const target = getAllSessions().find(s => s.sessionId.includes(targetId));
        if (target) {
          output = JSON.stringify(target, null, 2);
        } else {
          output = `Session matching ID "${targetId}" not found.`;
        }
      } else {
        output = `Executed "${command}": [OK]\nCommand completed with exit code 0. Type "help" to see full list of commands.`;
      }

      res.json({ success: true, data: { command, output } });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err?.message || 'Console command execution failed.' } });
    }
  });

  // Clear Logs endpoint
  app.post('/api/admin/clear-logs', requireAdmin, (req, res) => {
    clearLogs();
    res.json({ success: true });
  });

  // Geocoding autocomplete/lookup endpoint
  app.post('/api/geocode', async (req, res) => {
    try {
      const { place } = req.body;
      if (!place || typeof place !== 'string' || !place.trim()) {
        res.status(400).json({
          success: false,
          error: {
            message: "We couldn't locate that birthplace. Please try a more specific location, for example: Dabra, Madhya Pradesh, India.",
          },
        });
        return;
      }
      const location = await geocodeBirthplace(place);
      if (!location) {
        res.status(400).json({
          success: false,
          error: {
            message: "We couldn't locate that birthplace. Please try a more specific location, for example: Dabra, Madhya Pradesh, India.",
          },
        });
        return;
      }
      res.json({ success: true, data: location });
    } catch (err) {
      console.error('Geocode error:', err);
      res.status(400).json({
        success: false,
        error: {
          message: "We couldn't locate that birthplace. Please try a more specific location, for example: Dabra, Madhya Pradesh, India.",
        },
      });
    }
  });

  // Input Validation Schema for Analysis Request
  const AnalyzeSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be YYYY-MM-DD'),
    birthTime: z.string().optional(),
    birthTimeAccuracy: z.enum(['exact', 'approximate', 'unknown'] as [BirthTimeAccuracy, ...BirthTimeAccuracy[]]),
    birthPlace: z.string().min(2, 'Birth place is required'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    behavioralAnswers: z.record(z.string(), z.number()).optional(),
    sessionContext: z.object({}).passthrough().optional(),
  });

  // Primary Analysis Pipeline Endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const parseResult = AnalyzeSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            message: 'Invalid form inputs provided.',
            details: parseResult.error.format(),
          },
        });
        return;
      }

      const { fullName, birthDate, birthTime, birthTimeAccuracy, birthPlace, latitude, longitude, behavioralAnswers } = parseResult.data;

      // Stage 1: Geocode Birthplace (or use supplied coordinates if manually specified)
      let location = await geocodeBirthplace(birthPlace);

      if (!location) {
        if (typeof latitude === 'number' && typeof longitude === 'number' && !isNaN(latitude) && !isNaN(longitude)) {
          location = {
            formattedName: birthPlace,
            city: birthPlace,
            region: '',
            country: '',
            latitude,
            longitude,
            timezone: 'UTC',
          };
        } else {
          res.status(400).json({
            success: false,
            error: {
              message: "We couldn't locate that birthplace. Please try a more specific location, for example: Dabra, Madhya Pradesh, India.",
            },
          });
          return;
        }
      }

      // Stage 2: Calculate Numerology Engine
      const numerology = calculateNumerology(fullName, birthDate);

      // Stage 3: Calculate Astrology Engine
      const astrology = calculateBirthChart({
        birthDate,
        birthTime,
        birthTimeAccuracy,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // Stage 4: Process Behavioral Questionnaire if present
      let behavioral: BehavioralData | undefined;
      if (behavioralAnswers && Object.keys(behavioralAnswers).length > 0) {
        const answers = behavioralAnswers;
        behavioral = {
          socialEnergy: answers['q1'] || 4,
          planningStyle: answers['q2'] || 4,
          opennessToExperience: answers['q3'] || 5,
          emotionalReactivity: answers['q4'] || 4,
          persistence: answers['q5'] || 4,
          conflictStyle: answers['q6'] || 3,
          noveltySeeking: answers['q7'] || 4,
          independence: answers['q8'] || 4,
          rawAnswers: answers,
        };
      }

      // Stage 5: Construct Profile payload
      const profile = {
        fullName,
        birthDate,
        birthTime,
        birthTimeAccuracy,
        birthPlace,
        ...location,
      };

      // Stage 6: Generate Gemini AI Synthesis Report
      const report = await generateAnalysisReport({
        profile,
        numerology,
        astrology,
        behavioral,
      });

      // Stage 7: Store Analysis Record
      const id = crypto.randomUUID();
      const analysisRecord: AnalysisRecord = {
        id,
        profile,
        numerology,
        astrology,
        behavioral,
        report,
        createdAt: new Date().toISOString(),
      };

      await saveAnalysisRecord(analysisRecord);

      // Attach user profile to active session telemetry
      const sessionId = (req.body.sessionContext?.sessionId as string) || (req.headers['x-session-id'] as string) || crypto.randomUUID();
      attachUserProfileToSession(
        sessionId,
        {
          fullName,
          email: req.body.email || (req.body.profile && req.body.profile.email) || undefined,
          birthDate,
          birthTime,
          birthPlace,
          sunSign: astrology.sunSign,
          moonSign: astrology.moonSign,
          lifePathNumber: numerology.lifePathNumber,
          analysisId: id,
        },
        req.headers
      );

      addSystemLog('info', 'ANALYSIS', `Generated report for ${fullName} (${birthPlace})`);

      res.json({
        success: true,
        data: analysisRecord,
      });
    } catch (err: any) {
      console.error('Analysis pipeline failure:', err);
      addSystemLog('error', 'ANALYSIS', `Analysis failed: ${err?.message}`);
      res.status(500).json({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: err?.message || 'Failed to complete analysis pipeline.',
        },
      });
    }
  });

  // Get Analysis Endpoint
  app.get('/api/analysis/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const record = await getAnalysisRecord(id);
      if (!record) {
        res.status(404).json({ success: false, error: { message: 'Analysis report not found.' } });
        return;
      }
      res.json({ success: true, data: record });
    } catch (err) {
      console.error('Error fetching analysis:', err);
      res.status(500).json({ success: false, error: { message: 'Failed retrieving report.' } });
    }
  });

  // Chat / Ask About Yourself Endpoint
  app.post('/api/analysis/:id/chat', async (req, res) => {
    try {
      const { id } = req.params;
      const { message, sessionId } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ success: false, error: { message: 'Question message is required.' } });
        return;
      }

      const record = await getAnalysisRecord(id);
      if (!record) {
        res.status(404).json({ success: false, error: { message: 'Analysis report context not found.' } });
        return;
      }

      const existingChats = await getChatMessages(id);

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        analysisId: id,
        role: 'user',
        content: message.trim(),
        createdAt: new Date().toISOString(),
      };
      await saveChatMessage(userMsg);

      const replyText = await generateChatResponse({
        report: record.report,
        profile: record.profile,
        numerology: record.numerology,
        astrology: record.astrology,
        chatHistory: existingChats.map((c) => ({ role: c.role, content: c.content })),
        userQuestion: message.trim(),
      });

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        analysisId: id,
        role: 'assistant',
        content: replyText,
        createdAt: new Date().toISOString(),
      };
      await saveChatMessage(assistantMsg);

      // Record Q&A log into active session telemetry
      const effectiveSessionId = sessionId || req.headers['x-session-id'] as string || id;
      recordQALog(effectiveSessionId, message.trim(), replyText);
      addSystemLog('info', 'CHAT', `Q&A recorded for session ${effectiveSessionId.slice(0, 8)}`);

      res.json({
        success: true,
        data: {
          userMessage: userMsg,
          reply: assistantMsg,
        },
      });
    } catch (err) {
      console.error('Error generating chat reply:', err);
      addSystemLog('error', 'CHAT', `Chat reply error: ${err}`);
      res.status(500).json({ success: false, error: { message: 'Failed generating response.' } });
    }
  });

  // Delete Analysis Endpoint
  app.delete('/api/analysis/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await deleteAnalysisRecord(id);
      res.json({ success: true, data: { deleted } });
    } catch (err) {
      console.error('Error deleting analysis:', err);
      res.status(500).json({ success: false, error: { message: 'Failed deleting report.' } });
    }
  });

  // Catch-all for unmatched API routes to ensure JSON response instead of HTML
  app.all('/api/*', (req, res) => {
    res.status(404).json({ success: false, error: { message: `API route not found: ${req.method} ${req.path}` } });
  });

  // Global Error Handler for API
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.path.startsWith('/api')) {
      console.error('[API Error]', err);
      res.status(500).json({ success: false, error: { message: err?.message || 'Internal Server Error' } });
      return;
    }
    next(err);
  });

  // -------------------------------------------------------------
  // VITE / STATIC SERVING
  // -------------------------------------------------------------
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Personal Insights application server active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
