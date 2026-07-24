import React, { useState } from 'react';
import { getApiUrl } from '../utils/api';
import {
  Send,
  Loader2,
  Trash2,
  Share2,
  Check,
  Compass,
  Binary,
  Brain,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Heart,
  Briefcase,
  Users,
  Eye,
  Flame,
  Star,
  Award,
  AlertTriangle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnalysisRecord, ChatMessage } from '../types';

interface ReportViewProps {
  record: AnalysisRecord;
  onDelete: (id: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ record, onDelete }) => {
  const { profile, numerology, astrology, behavioral, report } = record;

  // Chat State
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [copied, setCopied] = useState(false);

  // Accordion details toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const suggestedPrompts = [
    'How will my love life & future relationship unfold?',
    'What will my career & financial trajectory look like in the future?',
    'How are my relationships with my parents (dad/mom) and close friends?',
    'What key life turns and milestones should I prepare for?',
    'What are my biggest hidden personal strengths?',
  ];

  const handleAsk = async (textToSend?: string) => {
    const q = textToSend || question;
    if (!q.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      analysisId: record.id,
      role: 'user',
      content: q.trim(),
      createdAt: new Date().toISOString(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setQuestion('');
    setIsAsking(true);

    try {
      const sessionId = sessionStorage.getItem('aurabrain_session_id') || '';
      const res = await fetch(getApiUrl(`/api/analysis/${record.id}/chat`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q.trim(), sessionId }),
      });
      const data = await res.json();
      if (data.success && data.data?.reply) {
        setChatHistory((prev) => [...prev, data.data.reply]);
      } else {
        throw new Error(data.error?.message || 'Chat request failed');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackReply: ChatMessage = {
        id: crypto.randomUUID(),
        analysisId: record.id,
        role: 'assistant',
        content: `Regarding "${q.trim()}": Based on your Sun in ${astrology.sunSign} and Life Path ${numerology.lifePathNumber}, your path combines intuitive discernment with high self-reliance. In future milestones, maintaining clear personal boundaries while trusting long-term cycles will yield your strongest rewards.`,
        createdAt: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, fallbackReply]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finalVerdict = report.finalVerdict || {
    overallSummary: `${profile.fullName}, you possess an exceptionally resilient mind that combines strategic analytical precision with a quiet, unwavering inner drive. You are built for long-term meaningful achievements rather than short-lived shortcuts.`,
    familyAndParents: {
      fatherDynamics: `Your father figure or key parental authority imparted a strong sense of duty, practical discipline, or self-reliance. Even if methods differed, his work ethic deeply influenced your internal standards.`,
      motherDynamics: `Your mother figure provided an intuitive or protective anchor that shaped your emotional processing. Her influence encouraged you to hold deep feelings inwardly until you feel completely safe.`,
      siblingsAndFriends: `With siblings and close friends, you play the role of the reliable advisor. You keep a small, high-trust circle and fiercely defend those you care about once bond is formed.`,
    },
    pastValidation: [
      `In early school or teenage years, you often kept your deepest observations to yourself rather than seeking loud attention.`,
      `You have always felt a strong urge to fix disorganization or inefficient systems around you.`,
      `When faced with sudden changes in the past, you preferred stepping back silently to assess before taking action.`,
    ],
    futureTrajectory: `Looking into your upcoming cycles, your natural diligence and calculated approach will open key career and financial turning points. In personal relationships, learning to express subtle expectations earlier will foster deeper mutual harmony.`,
    balancedOverview: {
      coreStrengths40: `High mental endurance, objective problem-solving capacity, and unwavering focus on long-term priorities (40% Core Strengths).`,
      supportiveFortune30: `Natural knack for spotting hidden opportunities, earning trust among leaders, and steady financial building (30% Supportive Fortune).`,
      manageableShadows25: `Occasional stubbornness, reluctance to ask for help, and over-analyzing past minor errors (25% Basic Shadow Traits).`,
      criticalWarnings5: `Avoid suppressing stress for prolonged periods or putting off key health/rest breaks (5% Danger Warning Area).`,
    },
  };

  const loveProfile = report.loveProfile || {
    attractionType: `Drawn to minds that combine emotional authenticity with sharp intelligence. Superficial chatter turns you off quickly.`,
    attachmentStyle: `Secure-Observant. You take your time opening up, but once trust is established, your commitment is deep and steady.`,
    idealPartnerArchetype: `Someone who respects your need for personal space, communicates with direct honesty, and shares a deep curiosity for life.`,
    redFlagsInLove: `Excessive unpredictability, emotional manipulation, or disrespecting your personal boundaries and focus time.`,
    currentLoveTiming: `A pivotal cycle for understanding your emotional needs, setting healthy relationship boundaries, and deepening personal bonds.`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10 text-neutral-800"
    >
      {/* Main Header Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <span className="text-[11px] font-mono text-sky-600 uppercase tracking-wider block mb-1">
              Personal Psychological Profile
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              {profile.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Born {profile.birthDate} {profile.birthTime ? `at ${profile.birthTime}` : ''} · {profile.birthPlace}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 text-xs font-medium transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-neutral-500" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => onDelete(record.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-medium transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Core Calculation Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <Compass className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">Astrology</span>
              <span className="font-semibold text-neutral-800">{astrology.sunSign} Sun · {astrology.moonSign} Moon</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <Binary className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">Numerology</span>
              <span className="font-semibold text-neutral-800">Life Path {numerology.lifePathNumber}</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-3">
            <Brain className="w-4 h-4 text-sky-600 shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-mono text-neutral-400 block">Behavioral Matrix</span>
              <span className="font-semibold text-neutral-800">{behavioral ? 'Questionnaire Data' : 'Empirical Vectors'}</span>
            </div>
          </div>
        </div>

        {/* Headline & Core Summary */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg sm:text-2xl font-semibold text-sky-700 tracking-tight leading-snug">
            "{report.headline}"
          </h2>
          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed space-y-3 font-normal whitespace-pre-line">
            {report.summary}
          </div>
        </div>
      </div>

      {/* Snapshot Trait Metrics */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-xs uppercase font-mono font-semibold tracking-wider text-neutral-500">
          Personal Snapshot Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {report.snapshotScores?.map((s) => (
            <div key={s.trait} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900">{s.trait}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    s.level === 'Very High'
                      ? 'bg-neutral-900 text-white font-bold'
                      : s.level === 'High'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200 font-semibold'
                      : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {s.level}
                </span>
              </div>
              <p className="text-neutral-600 text-[11px] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Domain Cards */}
      <div className="space-y-6">
        {/* Core Personality */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
            01 — Core Personality Dynamics
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-700">
            {report.corePersonality?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-2 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* How Others See You */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-3">
          <h3 className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
            02 — How Others See You
          </h3>
          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {report.howOthersSeeYou}
          </p>
        </section>

        {/* Strongest Traits & Blind Spots */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
              03 — Strongest Traits
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-700">
              {report.strongestTraits?.map((trait, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-sky-600 mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{trait}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-semibold text-neutral-500 uppercase tracking-wider">
              04 — Blind Spots & Vulnerabilities
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-700">
              {report.blindSpots?.map((spot, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{spot}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* PROMINENT DEDICATED LOVE & RELATIONSHIPS SECTION */}
        <section className="bg-white border-2 border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-rose-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
              <Heart className="w-5 h-5 fill-rose-100 text-rose-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                Love, Romance & Relationships
              </h3>
              <p className="text-xs text-neutral-500">
                Emotional bonding style, partner compatibility, and romantic timing
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
            {report.relationships}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="font-semibold text-rose-900 block">Attraction Trigger</span>
              <p className="text-neutral-700 leading-relaxed">{loveProfile.attractionType}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="font-semibold text-rose-900 block">Attachment Style</span>
              <p className="text-neutral-700 leading-relaxed">{loveProfile.attachmentStyle}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="font-semibold text-rose-900 block">Ideal Partner Archetype</span>
              <p className="text-neutral-700 leading-relaxed">{loveProfile.idealPartnerArchetype}</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1.5">
              <span className="font-semibold text-rose-900 block">Red Flags in Romance</span>
              <p className="text-neutral-700 leading-relaxed">{loveProfile.redFlagsInLove}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-100/60 border border-rose-200 text-rose-950 text-xs leading-relaxed font-medium">
            <span className="font-bold block mb-1">Current Romantic Cycle:</span>
            {loveProfile.currentLoveTiming}
          </div>
        </section>

        {/* Domain Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2">
            <span className="text-xs font-mono font-semibold text-neutral-500 uppercase">05 — Emotional Patterns</span>
            <p className="text-neutral-700 leading-relaxed text-xs">{report.emotionalPatterns}</p>
          </section>

          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2">
            <span className="text-xs font-mono font-semibold text-neutral-500 uppercase">06 — Career, School & Work Style</span>
            <p className="text-neutral-700 leading-relaxed text-xs">{report.careerAndWork}</p>
          </section>

          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2">
            <span className="text-xs font-mono font-semibold text-neutral-500 uppercase">07 — Money & Risk Handling</span>
            <p className="text-neutral-700 leading-relaxed text-xs">{report.moneyAndRisk}</p>
          </section>

          <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-2">
            <span className="text-xs font-mono font-semibold text-neutral-500 uppercase">08 — Social Behavior</span>
            <p className="text-neutral-700 leading-relaxed text-xs">{report.socialBehavior}</p>
          </section>
        </div>

        {/* Current Life Phase */}
        <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-3 text-xs">
          <span className="font-mono font-semibold text-neutral-500 uppercase">09 — Current Life Phase & Cycles</span>
          <p className="text-neutral-700 leading-relaxed">{report.currentLifePhase}</p>
        </section>
      </div>

      {/* HIGHLIGHTED SECTION: FINAL VERDICT & FUTURE BLUEPRINT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        className="relative bg-white border-2 border-neutral-900 rounded-3xl p-6 sm:p-10 shadow-lg space-y-8 overflow-hidden"
      >
        <div className="flex items-center gap-3 border-b border-neutral-200 pb-5">
          <div className="w-10 h-10 rounded-2xl bg-neutral-900 flex items-center justify-center text-white">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Psychological Analysis & Trajectory
            </h2>
            <p className="text-xs text-neutral-500 font-mono mt-0.5">
              Comprehensive Trajectory, Family Dynamics & Trait Matrix
            </p>
          </div>
        </div>

        {/* Overall Verdict */}
        <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-2">
          <h3 className="text-xs uppercase font-mono font-semibold text-sky-700 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-sky-600" />
            <span>Core Verdict Summary</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed font-normal">
            {finalVerdict.overallSummary}
          </p>
        </div>

        {/* Family & Parent Relations */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono font-semibold text-neutral-500 flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-700" />
            <span>Family & Parent Dynamics</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-semibold text-neutral-900 block">Father Influence</span>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.familyAndParents.fatherDynamics}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-semibold text-neutral-900 block">Mother Influence</span>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.familyAndParents.motherDynamics}</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
              <span className="font-semibold text-neutral-900 block">Siblings & Friends</span>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.familyAndParents.siblingsAndFriends}</p>
            </div>
          </div>
        </div>

        {/* Past Validation Trait Nuances */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono font-semibold text-neutral-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Past Pattern Validation (Eerily Accurate Insights)</span>
          </h3>
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            {finalVerdict.pastValidation.map((pv, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span className="text-neutral-800 leading-relaxed font-medium">{pv}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Trajectory */}
        <div className="p-5 rounded-2xl bg-sky-50 border border-sky-200 space-y-2">
          <h3 className="text-xs uppercase font-mono font-semibold text-sky-800 flex items-center gap-2">
            <Star className="w-4 h-4 text-sky-600" />
            <span>Future Life Trajectory & Milestones</span>
          </h3>
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            {finalVerdict.futureTrajectory}
          </p>
        </div>

        {/* Balanced 70/30 Blueprint Grid */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs uppercase font-mono font-semibold text-neutral-500">
            Balanced Trait Distribution Matrix
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* 40% Core Strengths */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-900">Core Talents & Assets</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">40% Weight</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.balancedOverview.coreStrengths40}</p>
            </div>

            {/* 30% Supportive Fortune */}
            <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sky-900">Supportive Opportunities</span>
                <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono text-[10px] font-bold">30% Weight</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.balancedOverview.supportiveFortune30}</p>
            </div>

            {/* 25% Manageable Shadows */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-900">Manageable Shadow Habits</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[10px] font-bold">25% Weight</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.balancedOverview.manageableShadows25}</p>
            </div>

            {/* 5% Critical Warnings */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Key Warning Area</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-mono text-[10px] font-bold">5% Danger</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{finalVerdict.balancedOverview.criticalWarnings5}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technical Calculations Accordion */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 shadow-xs text-xs space-y-3">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-left font-medium text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Deterministic Planetary & Numerological Calculations</span>
          </div>
          {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTechnicalDetails && (
          <div className="pt-3 border-t border-neutral-200 space-y-4">
            <div className="space-y-2">
              <span className="font-semibold text-neutral-900 block">Calculated Planetary Positions</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                {astrology.planets?.map((p) => (
                  <div key={p.name} className="p-2 bg-neutral-50 rounded border border-neutral-200">
                    <span className="font-bold text-sky-700">{p.name}</span>: {p.sign} ({p.degreeInSign}°)
                    {p.isRetrograde ? ' ℞' : ''}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-neutral-900 block">Calculated Numerology Values</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200">Life Path: {numerology.lifePathNumber}</div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200">Expression: {numerology.expressionNumber}</div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200">Soul Urge: {numerology.soulUrgeNumber}</div>
                <div className="p-2 bg-neutral-50 rounded border border-neutral-200">Personal Year: {numerology.personalYear}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ask About Yourself Interactive Chat Section */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-600" />
            <span>Ask About Yourself</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Inquire about love, career trajectory, parents, family, or future turns.
          </p>
        </div>

        {/* Suggested Commonly Asked Questions */}
        <div className="flex flex-wrap gap-2 text-xs">
          {suggestedPrompts.map((p) => (
            <button
              key={p}
              onClick={() => handleAsk(p)}
              disabled={isAsking}
              className="px-3.5 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-800 hover:text-sky-700 transition-colors text-left font-medium cursor-pointer"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="space-y-4 pt-2">
          {chatHistory.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-neutral-900 text-white ml-8 font-semibold shadow-xs'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-800 mr-8 whitespace-pre-line'
              }`}
            >
              <span className={`block text-[10px] font-mono uppercase opacity-70 mb-1 ${m.role === 'user' ? 'text-neutral-300' : 'text-sky-700'}`}>
                {m.role === 'user' ? 'You' : 'AuraBrain Assistant'}
              </span>
              {m.content}
            </div>
          ))}

          {isAsking && (
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs flex items-center gap-2 mr-8">
              <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              <span>Analyzing profile context...</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAsk();
            }}
            placeholder="Ask something about your future, family, or love life..."
            disabled={isAsking}
            className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:border-sky-600 text-xs sm:text-sm transition-all"
          />
          <button
            onClick={() => handleAsk()}
            disabled={!question.trim() || isAsking}
            className="p-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-40 text-white font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
