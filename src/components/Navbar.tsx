import React from 'react';
import { Brain } from 'lucide-react';
import { AppStep } from '../types';

interface NavbarProps {
  currentStep: AppStep;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReset }) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand with Brain Logo */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-left group transition-opacity hover:opacity-90 focus:outline-none cursor-pointer"
        >
          <Brain className="w-5 h-5 text-neutral-900 stroke-[2.2]" />
          <span className="font-bold text-neutral-900 text-base tracking-tight">
            AuraBrain
          </span>
        </button>
      </div>
    </header>
  );
};
