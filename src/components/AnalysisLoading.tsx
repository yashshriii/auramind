import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STAGES = [
  'Resolving birthplace coordinates & timezone',
  'Calculating planetary ephemeris birth chart',
  'Computing Pythagorean numerology matrix',
  'Mapping family, love & age-adapted life stages',
  'Synthesizing psychological profile & future trajectory',
];

export const AnalysisLoading: React.FC = () => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStageIndex((prev) => {
        if (prev < STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-16 flex flex-col items-center text-center space-y-8">
      {/* Animated Brain Icon Container */}
      <div className="relative flex items-center justify-center">
        <div className="relative w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 shadow-md flex items-center justify-center text-sky-600 dark:text-sky-400">
          <Brain className="w-8 h-8 text-sky-600 dark:text-sky-400 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
          Generating Personal Report
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
          Executing mathematical ephemeris calculations and personal trajectory synthesis.
        </p>
      </div>

      {/* Progress Steps List */}
      <div className="w-full bg-white dark:bg-[#1c1c1e] border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 text-left space-y-3.5 shadow-xs text-xs">
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;

          return (
            <div
              key={stage}
              className={`flex items-center gap-3 transition-colors duration-300 ${
                isCurrent
                  ? 'text-sky-600 dark:text-sky-400 font-semibold'
                  : isDone
                  ? 'text-neutral-500 dark:text-neutral-400'
                  : 'text-neutral-400 dark:text-neutral-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <div className="w-4 h-4 rounded-full border-2 border-sky-600 dark:border-sky-400 border-t-transparent animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" />
              )}
              <span className="truncate">{stage}</span>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={currentStageIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs font-mono text-neutral-400"
        >
          Stage {currentStageIndex + 1} of {STAGES.length}
        </motion.p>
      </AnimatePresence>
    </div>
  );
};
