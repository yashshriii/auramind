import React, { useState, useRef } from 'react';
import { PrivacyModal } from './PrivacyModal';
import { Brain, Lock, KeyRound, AlertCircle, X } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface FooterProps {
  onOpenDashboard?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenDashboard }) => {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Admin Dashboard Password Unlock State
  const [clickCount, setClickCount] = useState(0);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopyrightClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    if (nextCount >= 3) {
      setClickCount(0);
      setIsPassModalOpen(true);
      setPinInput('');
      setPinError(false);
    } else {
      clickTimerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 2000);
    }
  };

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
      <footer className="border-t border-neutral-200 bg-white py-6 text-center text-xs text-neutral-500">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 select-none">
            <Brain className="w-4 h-4 text-neutral-900 stroke-[2.2]" />
            <span
              onClick={handleCopyrightClick}
              className="cursor-pointer hover:text-neutral-900 transition-colors font-semibold text-neutral-900 text-xs"
              title="AuraBrain"
            >
              © {new Date().getFullYear()} AuraBrain
            </span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <button
              onClick={() => setIsPrivacyOpen(true)}
              className="text-neutral-600 hover:text-sky-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setIsTermsOpen(true)}
              className="text-neutral-600 hover:text-sky-600 transition-colors cursor-pointer"
            >
              Terms & Guidelines
            </button>
          </div>
        </div>
      </footer>

      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />

      {/* Terms & Guidelines Modal */}
      {isTermsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-neutral-700 text-xs">
            <h3 className="text-base font-bold text-neutral-900">Terms & Guidelines</h3>
            <p className="text-neutral-600 leading-relaxed">
              AuraBrain provides personalized ephemeris, numerology, and psychological profile insights based on user input parameters.
            </p>
            <ul className="list-disc pl-4 space-y-1.5 text-neutral-600">
              <li>Calculations are purely based on user-provided birth dates and locations.</li>
              <li>Reports are meant for personal reflection and self-understanding.</li>
              <li>Your birth data is never sold or harvested for third-party advertising.</li>
            </ul>
            <div className="pt-2 text-right">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
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

