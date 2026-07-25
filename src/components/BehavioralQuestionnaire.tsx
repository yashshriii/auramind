import React, { useState } from 'react';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BehavioralQuestionnaireProps {
  onBack: () => void;
  onSubmit: (answers: Record<string, number>) => void;
  onSkip: () => void;
}

const QUESTIONS = [
  { id: 'q1', label: 'When overloaded or stressed, I default to pulling back into silent solitude rather than immediately venting.', trait: 'Emotional Isolation' },
  { id: 'q2', label: 'I feel restless or uncomfortable when key aspects of my day or long-term plan feel uncontrolled or unpredictable.', trait: 'Control Need' },
  { id: 'q3', label: 'I frequently fall down late-night research rabbit holes investigating unusual, complex, or obscure topics.', trait: 'Curiosity Depth' },
  { id: 'q4', label: 'I keep a guarded inner core that very few people—even close friends or family—are ever allowed to fully see.', trait: 'Vulnerability Armor' },
  { id: 'q5', label: 'Once I set a personal standard or goal, I hold myself to it fiercely despite slow initial progress or friction.', trait: 'Grit & Standard' },
  { id: 'q6', label: 'I would rather have a direct, candid confrontation right away than let unspoken interpersonal tension linger.', trait: 'Conflict Directness' },
  { id: 'q7', label: 'I naturally read micro-expressions, tone shifts, and hidden motives in social settings before others notice.', trait: 'Intuitive Perception' },
  { id: 'q8', label: 'I make major decisions based on my internal compass and gut feeling, rarely waiting for external validation.', trait: 'Gut Autonomy' },
  { id: 'q9', label: 'I feel a strong internal urge to cut ties cleanly and silently when someone repeatedly breaches my trust.', trait: 'Clean Boundary Cutoff' },
  { id: 'q10', label: 'I am deeply bothered by sloppy work, broken promises, or lack of attention to crucial details.', trait: 'Precision Standard' },
];

export const BehavioralQuestionnaire: React.FC<BehavioralQuestionnaireProps> = ({
  onBack,
  onSubmit,
  onSkip,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({
    q1: 4, q2: 4, q3: 5, q4: 4, q5: 4, q6: 3, q7: 4, q8: 4, q9: 4, q10: 4,
  });

  const handleSelect = (id: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [id]: score }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto px-4 py-8"
    >
      <div className="bg-white dark:bg-[#1c1c1e] border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Behavioral Patterns <span className="text-neutral-400 dark:text-neutral-500 font-normal text-xs">(Optional)</span>
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Self-reported tendencies (1 = Disagree, 5 = Agree)
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-sky-600 dark:hover:text-sky-400 underline font-medium cursor-pointer transition-colors"
          >
            Skip directly
          </button>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-neutral-800 dark:text-neutral-200 leading-snug">
                  {idx + 1}. {q.label}
                </span>
                <span className="text-[10px] uppercase font-mono text-neutral-400 dark:text-neutral-500 shrink-0">
                  {q.trait}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSelect(q.id, val)}
                    className={`py-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      answers[q.id] === val
                        ? 'bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-500 font-bold shadow-xs'
                        : 'bg-neutral-50 dark:bg-[#2c2c2e] text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 px-0.5">
                <span>Disagree</span>
                <span>Neutral</span>
                <span>Agree</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => onSubmit(answers)}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            <span>Complete Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
