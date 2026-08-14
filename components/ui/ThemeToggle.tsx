'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isInline?: boolean;
  className?: string;
}

export function ThemeToggle({ isInline = false, className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          isInline
            ? 'p-2 rounded border border-border bg-card shadow-sm w-8.5 h-8.5 flex items-center justify-center'
            : 'fixed bottom-6 right-6 z-50 p-3 rounded-full bg-card/80 backdrop-blur-lg border border-border shadow-xl',
          className
        )}
      >
        <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const buttonClasses = isInline
    ? cn(
        'p-2 rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all shadow-sm relative flex items-center justify-center',
        className
      )
    : cn(
        'fixed bottom-6 right-6 z-50 flex items-center justify-center p-3 rounded-full bg-card/90 backdrop-blur-md border border-border text-foreground shadow-md hover:border-primary/50 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring group',
        className
      );

  const iconSize = isInline ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme mode"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={buttonClasses}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-primary"
          >
            <Moon className={iconSize} />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center text-amber-500"
          >
            <Sun className={iconSize} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
