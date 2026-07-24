import React from 'react';
import { X, ShieldCheck, Database, Lock, EyeOff } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neutral-800" />
            <h2 className="text-base font-semibold text-neutral-900">Privacy & Data Policy</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-neutral-600 leading-relaxed">
          <div className="flex items-start gap-3">
            <Lock className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-neutral-900 mb-0.5">Minimal Data Collection</h3>
              <p>We only collect the birth name, date, time, and location you explicitly provide in the analysis form, along with basic session parameters (language, timezone, browser category).</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <EyeOff className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-neutral-900 mb-0.5">No Cross-Site Tracking</h3>
              <p>We never access third-party cookies, browsing history, private files, or external tracking identifiers. Your session is tied to a cryptographically generated local UUID.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Database className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-neutral-900 mb-0.5">AI Processing Security</h3>
              <p>Calculations (ephemeris longitudes and numerology numbers) are computed purely in server code. Only structured, non-identifying math and prompt context are passed to Gemini AI for interpretation.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white font-medium rounded-lg text-xs hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
