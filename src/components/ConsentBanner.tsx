import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

interface ConsentBannerProps {
  onOpenPrivacy: () => void;
  onConsentAccepted: () => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onOpenPrivacy,
  onConsentAccepted,
}) => {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('consent_accepted_v1');
    if (!stored) {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  const handleAccept = () => {
    localStorage.setItem('consent_accepted_v1', 'true');
    setDismissed(true);
    onConsentAccepted();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-neutral-900 text-neutral-100 p-4 rounded-xl shadow-lg border border-neutral-800 text-xs flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-medium text-neutral-200">Improve your experience</p>
          <p className="text-neutral-400 leading-relaxed">
            We use the information you provide and limited session context (language, timezone, device type) to personalize your experience. No intrusive tracking or advertising cookies.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-neutral-800">
        <button
          onClick={onOpenPrivacy}
          className="px-2.5 py-1 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          Privacy details
        </button>
        <button
          onClick={handleAccept}
          className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-900 px-3 py-1 rounded-md font-medium hover:bg-white transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Continue</span>
        </button>
      </div>
    </div>
  );
};
