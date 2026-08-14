import Link from 'next/link';
import { LayoutDashboard, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      {/* Frameless Content */}
      <div className="w-full max-w-lg text-center space-y-6">
        <div className="w-16 h-16 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto shadow-sm">
          <Compass className="w-8 h-8 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-7xl sm:text-8xl font-black text-primary tracking-tighter block">404</span>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Page Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded hover:bg-primary-hover transition-all duration-200 shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
