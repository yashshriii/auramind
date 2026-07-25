import React from 'react';
import { X, ShieldCheck, Database, Lock, EyeOff, Server, UserCheck, FileText } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/50 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#18181b] border border-neutral-200 dark:border-neutral-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Privacy & Data Security Policy
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                AuraBrain • Last updated: 2026 Edition
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Introduction */}
        <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 leading-relaxed text-xs">
          At <strong>AuraBrain</strong>, we treat your birth parameters and personal reflection queries with bank-grade privacy standards. We do not sell, rent, or trade your personal data to advertisers or data brokers.
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-5 text-neutral-700 dark:text-neutral-300 leading-relaxed">
          
          {/* Section 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
              <span>1. Data Minimalisation & Collection Scope</span>
            </div>
            <p className="pl-6 text-xs text-neutral-600 dark:text-neutral-400">
              We strictly collect only the parameters required to calculate astronomical planetary positions and numerology metrics:
            </p>
            <ul className="pl-10 list-disc space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
              <li>Full Birth Name (for Chaldean & Pythagorean numerology matrix)</li>
              <li>Birth Date & Birth Time (for Sidereal ephemeris degree alignment)</li>
              <li>Birthplace city & geographic coordinates (for Lagna & house calculations)</li>
              <li>Optional behavioral questionnaire responses (for psychological trait synthesis)</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>2. Server-Side Ephemeris & AI Processing</span>
            </div>
            <p className="pl-6 text-xs text-neutral-600 dark:text-neutral-400">
              All astronomical calculations (Swiss-ephemeris style Lahiri degrees, Nakshatra Padas, and Vimshottari Dashas) are executed directly on secured backend servers. When generating AI synthesis reports via Gemini, context is formatted in structured prompts without attaching personal tracking IDs or sensitive credentials.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <EyeOff className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
              <span>3. Zero Cross-Site Tracking & No Data Selling</span>
            </div>
            <p className="pl-6 text-xs text-neutral-600 dark:text-neutral-400">
              AuraBrain operates without third-party tracking cookies or ad pixels. We never store credit card numbers, social security IDs, or location tracking history. Your active session is linked to a cryptographically generated local UUID stored in temporary session storage.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <Server className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>4. Report Sharing & Unique Link Integrity</span>
            </div>
            <p className="pl-6 text-xs text-neutral-600 dark:text-neutral-400">
              When you choose to share your report using the <strong>Share Report</strong> button, a clean direct link containing your report ID is generated. Anyone with this exact link can view your generated Kundali and synthesis report. You can delete or clear your report at any time from the app interface.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>5. User Rights & Immediate Data Deletion</span>
            </div>
            <p className="pl-6 text-xs text-neutral-600 dark:text-neutral-400">
              You maintain full ownership of your data. You may delete your active report at any time by clicking "Close Report" or clearing your browser session storage. Deleting a report removes its reference from active session state.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Compliant with modern data security standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 text-white dark:bg-white dark:text-black font-bold rounded-xl text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Understood & Close
          </button>
        </div>

      </div>
    </div>
  );
};
