-- Supabase Database Migration for Personal Insights Web Application
-- Run this script in the Supabase SQL Editor to set up tables, indexes, and RLS policies.

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SESSIONS TABLE
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

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    birth_time VARCHAR(20),
    birth_time_accuracy VARCHAR(20) NOT NULL DEFAULT 'unknown', -- 'exact', 'approximate', 'unknown'
    birth_place TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    timezone VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. ANALYSES TABLE
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

-- 4. ANALYSIS CHATS TABLE
CREATE TABLE IF NOT EXISTS public.analysis_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_session_id ON public.profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_profile_id ON public.analyses(profile_id);
CREATE INDEX IF NOT EXISTS idx_analysis_chats_analysis_id ON public.analysis_chats(analysis_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_chats ENABLE ROW LEVEL SECURITY;

-- POLICIES (Allow service role full access; allow public read/insert for session-based anonymous workflows)
CREATE POLICY "Service role full access on sessions" ON public.sessions FOR ALL USING (true);
CREATE POLICY "Service role full access on profiles" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Service role full access on analyses" ON public.analyses FOR ALL USING (true);
CREATE POLICY "Service role full access on analysis_chats" ON public.analysis_chats FOR ALL USING (true);
