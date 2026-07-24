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

  // Execute Console Command
  app.post('/api/admin/console', requireAdmin, (req, res) => {
    try {
      const { command } = req.body;
      const cmd = (command || '').trim().toLowerCase();
      let output = '';

      if (cmd === 'help') {
        output = `Available Admin Console Commands:
  • help - Display available commands
  • stats - View server memory, node uptime, and record count
  • sessions - List all captured user sessions
  • logs - Show recent system logs summary
  • routes - List active system API endpoints
  • memory - View detailed node memory footprint
  • clear-logs - Flush execution logs buffer
  • ping - Test server latency and heartbeat
  • inspect <sessionId> - Inspect detailed telemetry for a session`;
      } else if (cmd === 'stats') {
        const stats = getSystemMetrics();
        output = `SYSTEM METRICS & FOOTPRINT:
  • Uptime: ${stats.uptimeSeconds}s
  • Active Sessions: ${stats.sessionsCount}
  • Execution Logs: ${stats.logsCount}
  • Heap Used: ${stats.memory.heapUsedMB} MB / ${stats.memory.heapTotalMB} MB
  • RSS Memory: ${stats.memory.rssMB} MB
  • Node Version: ${stats.nodeVersion} (${stats.platform})`;
      } else if (cmd === 'sessions') {
        const list = getAllSessions();
        output = `CAPTURED SESSIONS (${list.length}):\n` +
          (list.length === 0 ? '  (No sessions recorded yet)' : list.slice(0, 15).map(s => `[${s.sessionId.slice(0, 8)}] IP:${s.ip} | ${s.browser} | ${s.os} | ${s.userProfile ? s.userProfile.fullName : 'Anonymous'}`).join('\n'));
      } else if (cmd === 'logs') {
        const logs = getSystemLogs().slice(0, 10);
        output = `RECENT LOGS (${logs.length}):\n` +
          (logs.length === 0 ? '  (No logs in buffer)' : logs.map(l => `[${l.timestamp.slice(11, 19)}] [${l.level.toUpperCase()}] [${l.category}] ${l.message}`).join('\n'));
      } else if (cmd === 'routes') {
        output = `ACTIVE API ENDPOINTS:
  • POST /api/analyze - Complete astrological, numerological & AI synthesis pipeline
  • POST /api/session - Real-time client session context & telemetry logger
  • POST /api/geocode - Location autocomplete & birth coordinates geocoding
  • POST /api/analysis/:id/chat - Interactive Gemini AI Q&A assistant
  • POST /api/admin/verify - Admin authentication check
  • GET /api/admin/dashboard - System metrics & session telemetry feed
  • POST /api/admin/console - Diagnostic command execution shell
  • POST /api/admin/clear-logs - Flush rolling execution logs buffer`;
      } else if (cmd === 'memory') {
        const mem = process.memoryUsage();
        output = `DETAILED MEMORY USAGE:
  • RSS: ${(mem.rss / (1024 * 1024)).toFixed(2)} MB
  • Heap Total: ${(mem.heapTotal / (1024 * 1024)).toFixed(2)} MB
  • Heap Used: ${(mem.heapUsed / (1024 * 1024)).toFixed(2)} MB
  • External: ${(mem.external / (1024 * 1024)).toFixed(2)} MB
  • ArrayBuffers: ${(mem.arrayBuffers / (1024 * 1024)).toFixed(2)} MB`;
      } else if (cmd === 'clear-logs') {
        clearLogs();
        output = 'Execution logs flushed successfully.';
      } else if (cmd === 'ping') {
        output = `PONG! Server clock: ${new Date().toISOString()}`;
      } else if (cmd.startsWith('inspect ')) {
        const targetId = cmd.replace('inspect ', '').trim();
        const target = getAllSessions().find(s => s.sessionId.includes(targetId));
        if (target) {
          output = JSON.stringify(target, null, 2);
        } else {
          output = `Session matching ID "${targetId}" not found.`;
        }
      } else {
        output = `Unknown command: "${command}". Type "help" for a list of commands.`;
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
      if (!place || typeof place !== 'string') {
        res.status(400).json({ success: false, error: { message: 'Place input is required' } });
        return;
      }
      const location = await geocodeBirthplace(place);
      res.json({ success: true, data: location });
    } catch (err) {
      console.error('Geocode error:', err);
      res.status(500).json({ success: false, error: { message: 'Geocoding failed' } });
    }
  });

  // Input Validation Schema for Analysis Request
  const AnalyzeSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be YYYY-MM-DD'),
    birthTime: z.string().optional(),
    birthTimeAccuracy: z.enum(['exact', 'approximate', 'unknown'] as [BirthTimeAccuracy, ...BirthTimeAccuracy[]]),
    birthPlace: z.string().min(2, 'Birth place is required'),
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

      const { fullName, birthDate, birthTime, birthTimeAccuracy, birthPlace, behavioralAnswers } = parseResult.data;

      // Stage 1: Geocode Birthplace
      const location = await geocodeBirthplace(birthPlace);

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
        const keys = Object.keys(answers);
        const sum = keys.reduce((acc, k) => acc + (answers[k] || 3), 0);
        const avg = sum / (keys.length || 1);

        behavioral = {
          socialEnergy: answers['q1'] || 3,
          planningStyle: answers['q2'] || 4,
          opennessToExperience: answers['q3'] || 4,
          emotionalReactivity: answers['q4'] || 2,
          persistence: answers['q5'] || 4,
          conflictStyle: answers['q6'] || 3,
          noveltySeeking: answers['q7'] || 3,
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
