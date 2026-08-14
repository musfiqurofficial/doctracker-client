'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      {/* Frameless Container */}
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Error Badge Icon */}
        <div className="w-16 h-16 rounded bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mx-auto shadow-sm">
          <AlertOctagon className="w-8 h-8" />
        </div>

        {/* Error Text */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Something Went Wrong</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            {error.message || 'An unexpected application exception occurred while rendering this page.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-destructive text-destructive-foreground font-semibold text-sm hover:bg-destructive/90 transition-all duration-200 shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-card border border-border text-foreground font-medium text-sm hover:bg-accent transition-all duration-200 shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
