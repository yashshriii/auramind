import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`p-2 rounded-full text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Moon className="w-5 h-5 text-sky-400 stroke-[2]" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Sun className="w-5 h-5 text-amber-500 stroke-[2]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </button>
  );
};
