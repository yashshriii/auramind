import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AnalysisRecord, ChatMessage } from '../types';

let supabase: SupabaseClient | null = null;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Supabase] Initialized cloud persistence client.');
  } catch (err) {
    console.warn('[Supabase] Could not initialize Supabase client:', err);
  }
} else {
  console.log('[Supabase] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not configured. Using local in-memory persistence layer.');
}

// In-Memory Storage Fallback for preview & local dev
const memoryAnalyses = new Map<string, AnalysisRecord>();
const memoryChats = new Map<string, ChatMessage[]>();

export async function saveAnalysisRecord(record: AnalysisRecord): Promise<void> {
  memoryAnalyses.set(record.id, record);

  if (!supabase) return;

  try {
    const { error: profileErr } = await supabase.from('profiles').insert({
      id: record.id,
      full_name: record.profile.fullName,
      birth_date: record.profile.birthDate,
      birth_time: record.profile.birthTime || null,
      birth_time_accuracy: record.profile.birthTimeAccuracy,
      birth_place: record.profile.birthPlace,
      latitude: record.profile.latitude,
      longitude: record.profile.longitude,
      timezone: record.profile.timezone,
    });

    if (profileErr) console.warn('[Supabase] Profile insert note:', profileErr.message);

    const { error: analysisErr } = await supabase.from('analyses').insert({
      id: record.id,
      profile_id: record.id,
      astrology_data: record.astrology,
      numerology_data: record.numerology,
      behavioral_data: record.behavioral || {},
      report: record.report,
      ai_model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
    });

    if (analysisErr) console.warn('[Supabase] Analysis insert note:', analysisErr.message);
  } catch (err) {
    console.warn('[Supabase] Failed saving to cloud:', err);
  }
}

export async function getAnalysisRecord(id: string): Promise<AnalysisRecord | null> {
  if (memoryAnalyses.has(id)) {
    return memoryAnalyses.get(id)!;
  }

  if (!supabase) return null;

  try {
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (error || !analysis) return null;

    const profile = analysis.profiles;
    const record: AnalysisRecord = {
      id: analysis.id,
      profile: {
        fullName: profile.full_name,
        birthDate: profile.birth_date,
        birthTime: profile.birth_time,
        birthTimeAccuracy: profile.birth_time_accuracy,
        birthPlace: profile.birth_place,
        formattedName: profile.birth_place,
        city: profile.birth_place,
        region: '',
        country: '',
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
      },
      numerology: analysis.numerology_data,
      astrology: analysis.astrology_data,
      behavioral: analysis.behavioral_data,
      report: analysis.report,
      createdAt: analysis.created_at,
    };

    memoryAnalyses.set(id, record);
    return record;
  } catch (err) {
    console.warn('[Supabase] Error retrieving analysis:', err);
    return null;
  }
}

export async function deleteAnalysisRecord(id: string): Promise<boolean> {
  memoryAnalyses.delete(id);
  memoryChats.delete(id);

  if (!supabase) return true;

  try {
    await supabase.from('analyses').delete().eq('id', id);
    await supabase.from('profiles').delete().eq('id', id);
    return true;
  } catch (err) {
    console.warn('[Supabase] Error deleting analysis:', err);
    return false;
  }
}

export async function saveChatMessage(msg: ChatMessage): Promise<void> {
  const existing = memoryChats.get(msg.analysisId) || [];
  existing.push(msg);
  memoryChats.set(msg.analysisId, existing);

  if (!supabase) return;

  try {
    await supabase.from('analysis_chats').insert({
      id: msg.id,
      analysis_id: msg.analysisId,
      role: msg.role,
      content: msg.content,
      created_at: msg.createdAt,
    });
  } catch (err) {
    console.warn('[Supabase] Chat insert note:', err);
  }
}

export async function getChatMessages(analysisId: string): Promise<ChatMessage[]> {
  if (memoryChats.has(analysisId)) {
    return memoryChats.get(analysisId)!;
  }

  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('analysis_chats')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('created_at', { ascending: true });

    if (error || !data) return [];

    const msgs: ChatMessage[] = data.map((item) => ({
      id: item.id,
      analysisId: item.analysis_id,
      role: item.role,
      content: item.content,
      createdAt: item.created_at,
    }));

    memoryChats.set(analysisId, msgs);
    return msgs;
  } catch (err) {
    console.warn('[Supabase] Error fetching chat messages:', err);
    return [];
  }
}
