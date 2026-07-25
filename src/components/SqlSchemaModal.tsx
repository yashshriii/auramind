import React, { useState } from 'react';
import { X, Database, Copy, Check } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCRIPT = `-- Supabase Database Migration for Personal Insights Web Application
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    consent_version VARCHAR(20) NOT NULL DEFAULT 'v1',
    context JSONB DEFAULT '{}'::jsonb,
    country VARCHAR(100),
    region VARCHAR(100),
    referrer TEXT
);

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time VARCHAR(20),
    birth_time_accuracy VARCHAR(20) NOT NULL DEFAULT 'unknown',
    birth_place TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    timezone VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    astrology_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    numerology_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    behavioral_data JSONB DEFAULT '{}'::jsonb,
    report JSONB NOT NULL DEFAULT '{}'::jsonb,
    ai_model VARCHAR(100) NOT NULL DEFAULT 'gemini-3.6-flash',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analysis_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_session_id ON public.profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_profile_id ON public.analyses(profile_id);
CREATE INDEX IF NOT EXISTS idx_analysis_chats_analysis_id ON public.analysis_chats(analysis_id);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sessions" ON public.sessions FOR ALL USING (true);
CREATE POLICY "Service role full access on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Service role full access on analyses" ON public.analyses FOR ALL USING (true);
CREATE POLICY "Service role full access on analysis_chats" ON public.analysis_chats FOR ALL USING (true);`;

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl space-y-4 max-h-[85vh] flex flex-col text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-semibold text-neutral-900">Supabase SQL Migration Script</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-neutral-500 text-xs leading-relaxed">
          Copy and run this script in your Supabase project's SQL Editor to set up required tables, indexes, and Row Level Security policies.
        </p>

        <div className="relative flex-1 bg-neutral-900 text-neutral-100 rounded-xl p-4 font-mono text-xs overflow-y-auto">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-sans transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy SQL'}</span>
          </button>
          <pre className="whitespace-pre-wrap pr-16">{SQL_SCRIPT}</pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white font-medium rounded-lg text-xs hover:bg-neutral-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
