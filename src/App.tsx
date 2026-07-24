import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { DetailsForm } from './components/DetailsForm';
import { BehavioralQuestionnaire } from './components/BehavioralQuestionnaire';
import { AnalysisLoading } from './components/AnalysisLoading';
import { ReportView } from './components/ReportView';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/AdminDashboard';
import { AppStep, UserInputProfile, AnalysisRecord } from './types';
import { AlertCircle } from 'lucide-react';
import { getApiUrl } from './utils/api';

export default function App() {
  const [step, setStep] = useState<AppStep>('landing');
  const [profileData, setProfileData] = useState<UserInputProfile | null>(null);
  const [behavioralAnswers, setBehavioralAnswers] = useState<Record<string, number> | undefined>(undefined);
  const [analysisRecord, setAnalysisRecord] = useState<AnalysisRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Session context initialized
  useEffect(() => {
    fetch(getApiUrl('/api/session'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data?.sessionId) {
          sessionStorage.setItem('aurabrain_session_id', json.data.sessionId);
        }
      })
      .catch((err) => console.warn('Session initialization note:', err));
  }, []);

  // Handle Form Submission -> move to Questionnaire or direct Analysis
  const handleDetailsSubmit = (data: UserInputProfile, skipQuestionnaire = true) => {
    setProfileData(data);
    setErrorMsg(null);

    if (skipQuestionnaire) {
      setBehavioralAnswers(undefined);
      runAnalysisPipeline(data, undefined);
    } else {
      setStep('questionnaire');
    }
  };

  // Handle Questionnaire Submission -> trigger analysis
  const handleQuestionnaireSubmit = (answers: Record<string, number>) => {
    setBehavioralAnswers(answers);
    if (profileData) {
      runAnalysisPipeline(profileData, answers);
    }
  };

  const handleQuestionnaireSkip = () => {
    setBehavioralAnswers(undefined);
    if (profileData) {
      runAnalysisPipeline(profileData, undefined);
    }
  };

  // Execute Backend Analysis Pipeline
  const runAnalysisPipeline = async (
    profile: UserInputProfile,
    answers?: Record<string, number>
  ) => {
    setStep('analyzing');
    setErrorMsg(null);

    try {
      const sessionId = sessionStorage.getItem('aurabrain_session_id') || '';
      const response = await fetch(getApiUrl('/api/analyze'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          fullName: profile.fullName,
          birthDate: profile.birthDate,
          birthTime: profile.birthTime,
          birthTimeAccuracy: profile.birthTimeAccuracy,
          birthPlace: profile.birthPlace,
          behavioralAnswers: answers,
          sessionContext: { sessionId },
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', text.slice(0, 200));
        throw new Error('Received unexpected server response. Please ensure birth parameters are valid and try again.');
      }

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to complete analysis pipeline.');
      }

      setAnalysisRecord(json.data);
      setStep('report');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err?.message || 'We could not complete your analysis right now. Please try again.');
      setStep('details');
    }
  };

  // Delete Analysis Record
  const handleDeleteAnalysis = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/analysis/${id}`), { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete error:', err);
    } finally {
      setAnalysisRecord(null);
      setProfileData(null);
      setStep('landing');
    }
  };

  const handleReset = () => {
    setStep('landing');
    setProfileData(null);
    setAnalysisRecord(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-sky-500 selection:text-white flex flex-col justify-between">
      <div>
        <Navbar
          currentStep={step}
          onReset={handleReset}
        />

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="max-w-xl mx-auto mt-6 px-4">
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="font-medium underline hover:text-red-950 shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main className="pb-16">
          {step === 'landing' && (
            <LandingHero onStart={() => setStep('details')} />
          )}

          {step === 'details' && (
            <DetailsForm
              initialValues={profileData || undefined}
              onSubmit={handleDetailsSubmit}
            />
          )}

          {step === 'questionnaire' && (
            <BehavioralQuestionnaire
              onBack={() => setStep('details')}
              onSubmit={handleQuestionnaireSubmit}
              onSkip={handleQuestionnaireSkip}
            />
          )}

          {step === 'analyzing' && <AnalysisLoading />}

          {step === 'report' && analysisRecord && (
            <ReportView record={analysisRecord} onDelete={handleDeleteAnalysis} />
          )}
        </main>
      </div>

      {/* Footer & Admin Dashboard trigger */}
      <Footer onOpenDashboard={() => setIsAdminDashboardOpen(true)} />

      {/* Hidden Admin Dashboard Modal */}
      {isAdminDashboardOpen && (
        <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />
      )}
    </div>
  );
}
