import React from 'react';
import { ArrowRight, Compass, Binary, Brain, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingHeroProps {
  onStart: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onStart }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-20 flex flex-col items-center text-center space-y-10">
      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4 max-w-2xl"
      >
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
          Uncover Your Personal <br className="hidden sm:inline" />
          <span className="text-sky-600">
            Psychological Profile & Trajectory
          </span>
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-xl mx-auto">
          An in-depth personal analysis synthesizing planetary ephemeris longitudes, Pythagorean numerical matrices, love dynamics, and psychological life stages.
        </p>
      </motion.div>

      {/* Action CTA */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md transition-all text-sm group cursor-pointer"
        >
          <span>Begin Personal Analysis</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Core Insights Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-8 border-t border-neutral-200"
      >
        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-2.5 hover:border-neutral-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Astrological Ephemeris</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Mathematical planetary longitudes and birth chart matrices computed from exact coordinates and birth date.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-2.5 hover:border-neutral-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Binary className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Pythagorean Numerology</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Life path numbers, expression cycles, and vibrational frequencies derived from full legal birth names.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-neutral-200 shadow-xs space-y-2.5 hover:border-neutral-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
            <Activity className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-900">Psychological Analysis</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Realistic, non-generic life-stage insights covering love, parent dynamics, hyper-specific past tendencies, and future turns.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
