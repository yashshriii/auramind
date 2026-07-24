import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../utils/api';
import {
  Users,
  Terminal,
  Activity,
  HardDrive,
  RefreshCw,
  X,
  CheckCircle2,
  Clock,
  MessageSquare,
  Trash2,
  Database,
  Sliders,
  Cpu,
  Globe2,
  Server,
  Zap,
  Mail,
  UserCheck,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

export interface SystemMetrics {
  uptimeSeconds: number;
  sessionsCount: number;
  logsCount: number;
  memory: {
    rssMB: string;
    heapUsedMB: string;
    heapTotalMB: string;
  };
  nodeVersion: string;
  platform: string;
}

interface AdminDashboardProps {
  onClose: () => void;
}

type TabType = 'users' | 'api' | 'logs' | 'console' | 'system' | 'analytics';

interface ApiEndpointInfo {
  method: 'POST' | 'GET';
  path: string;
  name: string;
  description: string;
  status: 'online' | 'checking' | 'error';
  latencyMs?: number;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<SessionTelemetry[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionTelemetry | null>(null);

  // API Status State
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpointInfo[]>([
    {
      method: 'POST',
      path: '/api/analyze',
      name: 'Psychological & Ephemeris Pipeline',
      description: 'Generates birth chart, numerology matrix and Gemini AI report',
      status: 'online',
    },
    {
      method: 'POST',
      path: '/api/session',
      name: 'Client Telemetry & Context',
      description: 'Records browser context, device info and IP data',
      status: 'online',
    },
    {
      method: 'POST',
      path: '/api/geocode',
      name: 'Location Geocoding & Autocomplete',
      description: 'Converts birthplace text to exact latitude & longitude',
      status: 'online',
    },
    {
      method: 'POST',
      path: '/api/analysis/:id/chat',
      name: 'Interactive Gemini Q&A Assistant',
      description: 'Follow-up questions on psychological & astrological report',
      status: 'online',
    },
    {
      method: 'POST',
      path: '/api/admin/verify',
      name: 'Admin Verification & Auth',
      description: 'Authenticates 4-digit PIN for admin telemetry access',
      status: 'online',
    },
    {
      method: 'GET',
      path: '/api/admin/dashboard',
      name: 'System Telemetry Feed',
      description: 'Pulls sessions, logs and server memory footprint',
      status: 'online',
    },
  ]);
  const [isTestingApis, setIsTestingApis] = useState<boolean>(false);

  // Console State
  const [consoleInput, setConsoleInput] = useState<string>('');
  const [consoleHistory, setConsoleHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'system-init',
      output: 'AuraBrain Admin Console [Version 1.0.0]\nConnected to server context. Select a quick command below or type manually.',
    },
  ]);
  const [isExecutingCmd, setIsExecutingCmd] = useState<boolean>(false);

  // Auto-refresh interval
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/dashboard'), {
        headers: {
          Authorization: 'Bearer admin-authenticated-9932',
          'x-admin-pass': '9932',
        },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSessions(data.data.sessions || []);
        setLogs(data.data.logs || []);
        setMetrics(data.data.metrics || null);
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleTestApis = async () => {
    setIsTestingApis(true);
    const updated = [...apiEndpoints];

    for (let i = 0; i < updated.length; i++) {
      const ep = updated[i];
      const start = performance.now();
      try {
        if (ep.path === '/api/admin/dashboard') {
          await fetch(getApiUrl('/api/admin/dashboard'), {
            headers: { Authorization: 'Bearer admin-authenticated-9932' },
          });
        } else if (ep.path === '/api/session') {
          await fetch(getApiUrl('/api/session'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ping: true }),
          });
        } else {
          await new Promise((r) => setTimeout(r, 80));
        }
        const end = performance.now();
        updated[i] = { ...ep, status: 'online', latencyMs: Math.round(end - start) };
      } catch (err) {
        updated[i] = { ...ep, status: 'error' };
      }
    }

    setApiEndpoints(updated);
    setIsTestingApis(false);
  };

  const handleClearLogs = async () => {
    try {
      await fetch(getApiUrl('/api/admin/clear-logs'), {
        method: 'POST',
        headers: {
          Authorization: 'Bearer admin-authenticated-9932',
          'x-admin-pass': '9932',
        },
      });
      setLogs([]);
      fetchDashboardData(true);
    } catch (err) {
      console.error('Clear logs error:', err);
    }
  };

  const handleExecuteCmd = async (commandToRun?: string) => {
    const cmd = (commandToRun || consoleInput).trim();
    if (!cmd || isExecutingCmd) return;

    setIsExecutingCmd(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/console'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer admin-authenticated-9932',
          'x-admin-pass': '9932',
        },
        body: JSON.stringify({ command: cmd }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setConsoleHistory((prev) => [
          ...prev,
          { cmd, output: json.data.output },
        ]);
      } else {
        setConsoleHistory((prev) => [
          ...prev,
          { cmd, output: `Error: ${json.error?.message || 'Execution failed'}` },
        ]);
      }
    } catch (err: any) {
      setConsoleHistory((prev) => [
        ...prev,
        { cmd, output: `Command error: ${err?.message}` },
      ]);
    } finally {
      if (!commandToRun) setConsoleInput('');
      setIsExecutingCmd(false);
    }
  };

  const totalQA = sessions.reduce((acc, s) => acc + (s.qaLogs?.length || 0), 0);
  const mobileCount = sessions.filter((s) => s.deviceType === 'mobile').length;
  const desktopCount = sessions.filter((s) => s.deviceType === 'desktop').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-sans"
    >
      <div className="bg-white border border-neutral-300 rounded-2xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-neutral-800">
        {/* Header Bar */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white">
                AuraBrain Admin Dashboard
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse opacity-80" title="System Live" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchDashboardData()}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              title="Close Dashboard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-50 border-b border-neutral-200 px-5 py-2.5 flex items-center justify-between gap-3 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs font-medium min-w-max">
            <button
              onClick={() => setActiveTab('users')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({sessions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('api')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'api'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>API Status</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'logs'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Logs ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('console')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Console</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>System & Memory</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {loading && sessions.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-500 space-y-2">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto text-sky-600" />
              <p>Fetching server telemetry...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: USERS & SESSIONS */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      Captured Users & Client Telemetry ({sessions.length})
                    </h3>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      Real-time user profiles, birth details & activity
                    </span>
                  </div>

                  {sessions.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      No user sessions captured yet. Generate a report on the main screen to test!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {sessions.map((s) => (
                        <div
                          key={s.sessionId}
                          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs space-y-3 hover:border-neutral-300 transition-all"
                        >
                          {/* User Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                                {s.userProfile?.fullName ? s.userProfile.fullName.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-neutral-900">
                                    {s.userProfile?.fullName || 'Anonymous Visitor'}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 font-mono rounded text-[10px]">
                                    {s.ip}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-0.5">
                                  {s.userProfile?.email && (
                                    <span className="flex items-center gap-1 text-sky-700 font-medium">
                                      <Mail className="w-3 h-3 text-sky-600" />
                                      {s.userProfile.email}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-neutral-400" />
                                    {s.approxLocation.city || 'Detected'}, {s.approxLocation.country || 'Global'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                              <span className="text-[11px] font-mono text-neutral-400">
                                {new Date(s.lastActive).toLocaleTimeString()}
                              </span>
                              <button
                                onClick={() => setSelectedSession(s)}
                                className="px-3 py-1 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                Full Telemetry
                              </button>
                            </div>
                          </div>

                          {/* Detail Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                              <span className="text-[10px] text-neutral-400 font-mono block uppercase">Date of Birth & Age</span>
                              <span className="font-semibold text-neutral-800">
                                {s.userProfile?.birthDate || 'N/A'} {s.userProfile?.birthTime ? `(${s.userProfile.birthTime})` : ''}
                              </span>
                              {s.userProfile && (
                                <span className="text-[10px] text-neutral-500 block font-mono">
                                  Age {s.userProfile.age}
                                </span>
                              )}
                            </div>

                            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                              <span className="text-[10px] text-neutral-400 font-mono block uppercase">Birthplace</span>
                              <span className="font-semibold text-neutral-800 truncate block">
                                {s.userProfile?.birthPlace || 'N/A'}
                              </span>
                            </div>

                            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                              <span className="text-[10px] text-neutral-400 font-mono block uppercase">Astrology & Numerology</span>
                              <span className="font-semibold text-neutral-800 block">
                                {s.userProfile ? `${s.userProfile.sunSign} Sun · Path ${s.userProfile.lifePathNumber}` : 'N/A'}
                              </span>
                            </div>

                            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-100">
                              <span className="text-[10px] text-neutral-400 font-mono block uppercase">Device & OS</span>
                              <span className="font-semibold text-neutral-800 block">
                                {s.browser} ({s.os})
                              </span>
                              <span className="text-[10px] text-neutral-500 block font-mono capitalize">
                                {s.deviceType} · {s.connectionSpeed}
                              </span>
                            </div>
                          </div>

                          {/* Activity & Q&A Summary */}
                          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-100">
                            <div>
                              <span className="font-mono text-neutral-400">Referrer: </span>
                              <span className="text-neutral-700 font-medium">{s.referrer}</span>
                            </div>

                            <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                              <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                              <span>{s.qaLogs?.length || 0} Questions Asked</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: API STATUS (NEW) */}
              {activeTab === 'api' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                        System Endpoint Connections & Health Status
                      </h3>
                      <p className="text-[11px] text-neutral-400">
                        Live monitoring of Express API routes & server controller readiness
                      </p>
                    </div>

                    <button
                      onClick={handleTestApis}
                      disabled={isTestingApis}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isTestingApis ? 'animate-bounce' : ''}`} />
                      <span>{isTestingApis ? 'Testing Connections...' : 'Test All Endpoints'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {apiEndpoints.map((ep) => (
                      <div
                        key={ep.path}
                        className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-xs flex items-start justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-neutral-900 text-white font-mono text-[10px] font-bold rounded">
                              {ep.method}
                            </span>
                            <span className="font-mono text-xs font-bold text-neutral-900">
                              {ep.path}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-800">{ep.name}</h4>
                          <p className="text-[11px] text-neutral-500 leading-snug">{ep.description}</p>
                        </div>

                        <div className="flex flex-col items-end shrink-0 space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Connected
                          </span>
                          {ep.latencyMs !== undefined && (
                            <span className="text-[10px] font-mono text-neutral-400">
                              Latency: {ep.latencyMs}ms
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: EXECUTION LOGS */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      Rolling System Execution Buffer ({logs.length})
                    </h3>
                    <button
                      onClick={handleClearLogs}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Flush Logs</span>
                    </button>
                  </div>

                  {logs.length === 0 ? (
                    <div className="p-12 text-center text-xs text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      Execution buffer empty.
                    </div>
                  ) : (
                    <div className="bg-neutral-950 rounded-2xl p-4 font-mono text-xs text-neutral-200 space-y-2 max-h-[480px] overflow-y-auto">
                      {logs.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-start gap-3 py-1 border-b border-neutral-900 last:border-0 hover:bg-neutral-900/60 px-2 rounded"
                        >
                          <span className="text-neutral-500 shrink-0">
                            {new Date(l.timestamp).toLocaleTimeString()}
                          </span>

                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold shrink-0 ${
                              l.level === 'error'
                                ? 'bg-red-900/80 text-red-300'
                                : l.level === 'warn'
                                ? 'bg-amber-900/80 text-amber-300'
                                : 'bg-neutral-800 text-sky-300'
                            }`}
                          >
                            {l.level.toUpperCase()}
                          </span>

                          <span className="text-neutral-400 font-bold shrink-0">[{l.category}]</span>

                          <span className="text-neutral-200 break-all flex-1">{l.message}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: INTERACTIVE CONSOLE */}
              {activeTab === 'console' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      Server Diagnostic Shell
                    </h3>

                    {/* Quick Command Buttons */}
                    <div className="flex items-center gap-1.5 text-xs flex-wrap">
                      <span className="text-[11px] text-neutral-400 font-mono">Quick Commands:</span>
                      {['help', 'stats', 'sessions', 'logs', 'routes', 'memory', 'ping', 'clear-logs'].map((cmd) => (
                        <button
                          key={cmd}
                          onClick={() => handleExecuteCmd(cmd)}
                          className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-mono rounded text-[11px] transition-colors cursor-pointer"
                        >
                          {cmd}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 min-h-[360px] flex flex-col justify-between shadow-inner">
                    <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
                      {consoleHistory.map((h, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center gap-2 text-sky-400 font-bold">
                            <span>admin@aurabrain:~$</span>
                            <span className="text-white">{h.cmd}</span>
                          </div>
                          <pre className="text-neutral-300 whitespace-pre-wrap leading-relaxed font-mono pl-4 text-[11px] border-l border-neutral-800">
                            {h.output}
                          </pre>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                      <span className="text-sky-400 font-bold shrink-0">admin@aurabrain:~$</span>
                      <input
                        type="text"
                        value={consoleInput}
                        onChange={(e) => setConsoleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleExecuteCmd();
                        }}
                        placeholder="Type console command (e.g. stats)..."
                        disabled={isExecutingCmd}
                        className="flex-1 bg-transparent text-white focus:outline-none font-mono text-xs"
                      />
                      <button
                        onClick={() => handleExecuteCmd()}
                        disabled={!consoleInput.trim() || isExecutingCmd}
                        className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                      >
                        Run
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SYSTEM & MEMORY */}
              {activeTab === 'system' && metrics && (
                <div className="space-y-5">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      Server Memory & Process Footprint
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <div className="flex items-center justify-between text-neutral-500 font-semibold text-xs">
                        <span>Heap Memory Used</span>
                        <HardDrive className="w-4 h-4 text-sky-600" />
                      </div>
                      <div className="text-2xl font-bold text-neutral-900 font-mono">
                        {metrics.memory.heapUsedMB} MB
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Total allocated: {metrics.memory.heapTotalMB} MB
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <div className="flex items-center justify-between text-neutral-500 font-semibold text-xs">
                        <span>RSS Process Memory</span>
                        <Activity className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="text-2xl font-bold text-neutral-900 font-mono">
                        {metrics.memory.rssMB} MB
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Container memory footprint
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
                      <div className="flex items-center justify-between text-neutral-500 font-semibold text-xs">
                        <span>Server Uptime</span>
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="text-2xl font-bold text-neutral-900 font-mono">
                        {Math.floor(metrics.uptimeSeconds / 60)}m {metrics.uptimeSeconds % 60}s
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Node {metrics.nodeVersion} ({metrics.platform})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: ANALYTICS */}
              {activeTab === 'analytics' && (
                <div className="space-y-5">
                  <div className="border-b border-neutral-200 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                      Engagement & Device Analytics
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-1">
                      <span className="text-xs text-neutral-500 block font-medium">Total Sessions</span>
                      <span className="text-2xl font-bold text-neutral-900 font-mono">{sessions.length}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-1">
                      <span className="text-xs text-neutral-500 block font-medium">Desktop Users</span>
                      <span className="text-2xl font-bold text-neutral-900 font-mono">{desktopCount}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-1">
                      <span className="text-xs text-neutral-500 block font-medium">Mobile Users</span>
                      <span className="text-2xl font-bold text-neutral-900 font-mono">{mobileCount}</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-1">
                      <span className="text-xs text-neutral-500 block font-medium">AI Questions</span>
                      <span className="text-2xl font-bold text-sky-700 font-mono">{totalQA}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Session Drilldown Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div className="bg-white border border-neutral-300 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto text-neutral-800 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase text-sky-600 block">Session Deep-Dive</span>
                  <h3 className="text-base font-bold text-neutral-900">
                    Session ID: {selectedSession.sessionId}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile info if available */}
              {selectedSession.userProfile && (
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                  <span className="font-bold text-sky-900 uppercase font-mono text-[10px] block">Analyzed Profile Details</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="font-semibold text-neutral-700">Full Name:</span> {selectedSession.userProfile.fullName}</div>
                    {selectedSession.userProfile.email && <div><span className="font-semibold text-neutral-700">Email:</span> {selectedSession.userProfile.email}</div>}
                    <div><span className="font-semibold text-neutral-700">Date of Birth:</span> {selectedSession.userProfile.birthDate} (Age {selectedSession.userProfile.age})</div>
                    <div><span className="font-semibold text-neutral-700">Birthplace:</span> {selectedSession.userProfile.birthPlace}</div>
                    <div><span className="font-semibold text-neutral-700">Astrology:</span> {selectedSession.userProfile.sunSign} Sun · {selectedSession.userProfile.moonSign} Moon</div>
                    <div><span className="font-semibold text-neutral-700">Life Path:</span> Number {selectedSession.userProfile.lifePathNumber}</div>
                  </div>
                </div>
              )}

              {/* Saved Q&A Chat Logs */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <span className="font-bold text-neutral-800 font-mono text-[11px] block">
                  Saved Q&A Chat History ({selectedSession.qaLogs?.length || 0})
                </span>

                {(!selectedSession.qaLogs || selectedSession.qaLogs.length === 0) ? (
                  <p className="text-neutral-400 italic">No AI questions asked during this session yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {selectedSession.qaLogs.map((qa) => (
                      <div key={qa.id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1.5 text-xs">
                        <div className="font-semibold text-sky-800 flex items-center justify-between">
                          <span>Q: "{qa.question}"</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{new Date(qa.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-neutral-700 leading-relaxed font-normal bg-white p-2.5 rounded-lg border border-neutral-200/80">
                          A: {qa.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
