import React, { useState } from 'react';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface BehavioralQuestionnaireProps {
  onBack: () => void;
  onSubmit: (answers: Record<string, number>) => void;
  onSkip: () => void;
}

const QUESTIONS = [
  { id: 'q1', label: 'I feel energized after prolonged, unstructured social gatherings.', trait: 'Social Energy' },
  { id: 'q2', label: 'I prefer to map out clear plans and schedules before beginning major projects.', trait: 'Planning Style' },
  { id: 'q3', label: 'I actively seek out novel ideas, perspectives, and unfamiliar concepts.', trait: 'Openness' },
  { id: 'q4', label: 'Under unexpected stress, my immediate internal reactions feel intense.', trait: 'Emotional Reactivity' },
  { id: 'q5', label: 'I comfortably stay committed to long-term goals despite slow initial progress.', trait: 'Persistence' },
  { id: 'q6', label: 'I prefer direct, immediate confrontation when interpersonal tension arises.', trait: 'Conflict Style' },
  { id: 'q7', label: 'I thrive on spontaneous shifts in routine and changing environments.', trait: 'Novelty Seeking' },
  { id: 'q8', label: 'I prefer forming my own decisions without needing external validation.', trait: 'Autonomy' },
];

export const BehavioralQuestionnaire: React.FC<BehavioralQuestionnaireProps> = ({
  onBack,
  onSubmit,
  onSkip,
}) => {
  const [answers, setAnswers] = useState<Record<string, number>>({
    q1: 3, q2: 4, q3: 4, q4: 2, q5: 4, q6: 3, q7: 3, q8: 4,
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
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                Behavioral Patterns <span className="text-neutral-400 font-normal text-xs">(Optional)</span>
              </h2>
              <p className="text-xs text-neutral-500">
                Self-reported tendencies (1 = Disagree, 5 = Agree)
              </p>
            </div>
          </div>

          <button
            onClick={onSkip}
            className="text-xs text-neutral-500 hover:text-sky-600 underline font-medium cursor-pointer transition-colors"
          >
            Skip directly
          </button>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.id} className="space-y-2 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-neutral-800 leading-snug">
                  {idx + 1}. {q.label}
                </span>
                <span className="text-[10px] uppercase font-mono text-neutral-400 shrink-0">
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
                        ? 'bg-sky-600 text-white border-sky-600 font-bold shadow-xs'
                        : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-neutral-400 px-0.5">
                <span>Disagree</span>
                <span>Neutral</span>
                <span>Agree</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={() => onSubmit(answers)}
            className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
          >
            <span>Complete Analysis</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
