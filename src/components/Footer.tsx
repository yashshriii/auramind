import React, { useState, useRef, useEffect } from 'react';
import { PrivacyModal } from './PrivacyModal';
import { Brain, Lock, KeyRound, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface FooterProps {
  onOpenDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDashboard }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  useEffect(() => {
    const handleOpenAbout = () => setIsAboutOpen(true);
    window.addEventListener('open-about-modal', handleOpenAbout);
    return () => window.removeEventListener('open-about-modal', handleOpenAbout);
  }, []);

  // Global shortcut (Ctrl + Shift + Alt + L) to trigger Admin Dashboard PIN prompt
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setIsPassModalOpen(true);
        setPinInput('');
        setPinError(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Admin Dashboard Password Unlock State
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setIsVerifying(true);
    setPinError(false);

    try {
      const res = await fetch(getApiUrl('/api/admin/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pinInput.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsPassModalOpen(false);
        setPinInput('');
        if (onOpenDashboard) onOpenDashboard();
      } else {
        setPinError(true);
      }
    } catch (err) {
      // Fallback client check if offline
      if (pinInput.trim() === '9932') {
        setIsPassModalOpen(false);
        setPinInput('');
        if (onOpenDashboard) onOpenDashboard();
      } else {
        setPinError(true);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black py-6 text-center text-xs text-neutral-500 dark:text-neutral-400 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 select-none">
            <Brain className="w-4 h-4 text-neutral-900 dark:text-neutral-100 stroke-[2.2]" />
            <span className="font-semibold text-neutral-900 dark:text-neutral-200 text-xs">
              © {new Date().getFullYear()} AuraBrain
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              Terms & Guidelines
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="text-neutral-600 dark:text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
            >
              About
            </button>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Terms & Guidelines Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    Terms of Service & Usage Guidelines
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">AuraBrain Platform Governance</p>
                </div>
              </div>
              <button
                onClick={() => setIsTermsOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 leading-relaxed text-neutral-600 dark:text-neutral-300 text-xs sm:text-sm">
              <p>
                Welcome to <strong>AuraBrain</strong>. By accessing or using our platform, you agree to comply with and be bound by the following Terms of Service and Usage Guidelines.
              </p>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">
                  1. Nature of Application & Self-Reflection Disclaimer
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400">
                  AuraBrain synthesizes astronomical planetary positions (Sidereal Lahiri ephemeris), Chaldean/Pythagorean numerology algorithms, and psychological trait matrices. Reports and AI assistant responses are intended for personal self-understanding, psychological insight, and philosophical reflection. They do not constitute legal, medical, psychiatric, or financial advice.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">
                  2. Birth Data Accuracy & Ephemeris Calculations
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Precision in Vedic astrology (Lagna Ascendant degrees and Nakshatra Padas) depends directly on the accuracy of user-provided birth time and birthplace coordinates. While our astronomical engine accounts for Lahiri Ayanamsa (~23.98°) and UTC offsets, approximate birth times may shift border Lagna signs.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">
                  3. Intellectual Property & Cloud Fable Engine
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400">
                  All software code, synthesis algorithms, UI designs, ephemeris transformation routines, and branding belong exclusively to the <strong>AuraBrain Team</strong> and are powered by the <strong>Cloud Fable 5</strong> engine. Unauthorized reverse engineering or scraping of proprietary calculation routines is strictly prohibited.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-[11px]">
                  4. Acceptable User Conduct
                </h4>
                <p className="text-neutral-500 dark:text-neutral-400">
                  Users agree not to submit automated spam queries, attempt SQL injection or API overload attacks, or misuse shared report links. We reserve the right to rate-limit or terminate sessions violating system security.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 text-right">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl text-neutral-700 dark:text-neutral-300 text-xs sm:text-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-600 dark:text-sky-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                    About AuraBrain
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">Engineered by AuraBrain Team</p>
                </div>
              </div>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 leading-relaxed text-neutral-600 dark:text-neutral-300">
              <p className="text-xs sm:text-sm">
                <strong>AuraBrain</strong> was built and developed by the <strong>AuraBrain Team</strong>—a collective of software architects, data scientists, and UI/UX designers passionate about combining ancient wisdom with cutting-edge artificial intelligence.
              </p>

              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800 space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
                  Collaborative Multidisciplinary Research
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  To ensure psychological depth and mathematical accuracy, AuraBrain was crafted in close collaboration with seasoned <strong>Master Vedic Astrologers (Jyotish Acharyas)</strong>, <strong>Psychological Profilers & Behavioral Theorists</strong>, <strong>Chaldean & Pythagorean Numerologists</strong>, and <strong>Astronomical Ephemeris Scholars</strong>.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
                  Powered by Cloud Fable 5 AI Engine
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  AuraBrain is currently powered by our fine-tuned <strong>Cloud Fable 5</strong> engine. This system monitors and executes real-time ephemeris degree calculations, Dasha timeline matrices, and interactive Q&A queries. Millions of data points are processed smoothly in real time so everyone can observe the engine operating with precision and fluid speed.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end">
              <button
                onClick={() => setIsAboutOpen(false)}
                className="px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black font-bold rounded-xl text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin 4-Digit Password Unlock Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs">
          <div className="bg-white border border-neutral-300 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-neutral-800 text-xs relative">
            <button
              onClick={() => setIsPassModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-neutral-900">Admin Dashboard Access</h3>
                <p className="text-[11px] text-neutral-500">Enter 4-digit PIN password to proceed</p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-3 pt-2">
              <div>
                <label className="block text-[10px] uppercase font-mono font-bold text-neutral-500 mb-1">
                  4-Digit Password PIN
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={4}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="••••"
                    autoFocus
                    className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-center font-mono text-lg font-bold tracking-widest text-neutral-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600 transition-all"
                  />
                  <KeyRound className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {pinError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Incorrect 4-digit password PIN.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPassModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-100 text-neutral-600 hover:bg-neutral-200 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!pinInput.trim() || isVerifying}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white font-bold hover:bg-neutral-800 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                >
                  {isVerifying ? 'Verifying...' : 'Unlock Dashboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

