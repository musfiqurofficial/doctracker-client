'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Activity, Lock, Mail, AlertCircle, ShieldCheck, Clock, Eye, EyeOff } from 'lucide-react';
import { loginApi, ApiCustomError } from '@/lib/api/auth';
import { useQueryClient } from '@tanstack/react-query';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function SecretLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCountdown, setRetryCountdown] = useState<number>(0);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Countdown timer effect for rate limiting
  useEffect(() => {
    if (retryCountdown <= 0) return;

    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [retryCountdown]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: LoginFormData) => {
    if (retryCountdown > 0) return;

    try {
      setIsLoading(true);
      setErrorMessage(null);

      await loginApi(data);

      // Clear any stale/cached failed query states and force fresh fetch
      queryClient.clear();

      // Set client authentication flag for Next.js middleware cross-domain support
      if (typeof document !== 'undefined') {
        document.cookie = "is_authenticated=true; path=/; max-age=86400; SameSite=Lax; Secure";
      }

      // Smooth navigation to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      if (err instanceof ApiCustomError) {
        if (err.statusCode === 429 && err.retryAfterSeconds) {
          setRetryCountdown(err.retryAfterSeconds);
          setErrorMessage(`Too many failed login attempts. Please wait ${formatTime(err.retryAfterSeconds)} before retrying.`);
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevQuickLogin = () => {
    setValue('email', 'admin@doctracker.com');
    setValue('password', 'AdminSecretPassword123!');
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6 relative overflow-hidden">
      {/* Centered Glassmorphic Form Wrapper */}
      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Activity className="w-8 h-8 animate-pulse text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Doctor Tracker</h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Authorized Administrator Portal</span>
            </p>
          </div>
        </div>

        {/* Error / Rate Limit Lockout Banner */}
        {errorMessage && (
          <div
            className={`p-4 rounded border text-xs font-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
              retryCountdown > 0
                ? 'bg-warning/10 border-warning/30 text-warning'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            {retryCountdown > 0 ? (
              <Clock className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 animate-spin text-warning" />
            ) : (
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5 text-destructive" />
            )}
            <div className="space-y-1">
              <span>{errorMessage}</span>
              {retryCountdown > 0 && (
                <div className="font-mono font-bold text-sm tracking-wider mt-1 text-warning">
                  Unlock in: {formatTime(retryCountdown)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Admin Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                {...register('email')}
                type="email"
                disabled={retryCountdown > 0}
                className="w-full pl-10 pr-4 py-2.5 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 shadow-sm"
              />
            </div>
            {errors.email && (
              <span className="text-[11px] font-medium text-destructive block mt-1">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Security Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">Security Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                disabled={retryCountdown > 0}
                className="w-full pl-10 pr-10 py-2.5 rounded bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50 shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-[11px] font-medium text-destructive block mt-1">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || retryCountdown > 0}
            className="w-full mt-2 py-3 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>Logging in...</span>
            ) : retryCountdown > 0 ? (
              <span>Locked ({formatTime(retryCountdown)})</span>
            ) : (
              <span>Admin Login</span>
            )}
          </button>

          {/* Dev Mode Auto Login Trigger */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDevQuickLogin}
                disabled={isLoading || retryCountdown > 0}
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors underline cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Auto Dev Login'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
