'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ShieldCheck, 
  KeyRound, 
  History, 
  User, 
  Mail, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Monitor, 
  Globe 
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { 
  getMeApi, 
  changePasswordApi, 
  updateProfileApi, 
  getAuditLogsApi, 
  AuditLogItem 
} from '@/lib/api/auth';

const profileSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch current admin profile info
  const { data: adminData, isLoading: isAdminLoading } = useQuery({
    queryKey: ['admin-me'],
    queryFn: getMeApi,
  });

  // Fetch 3-day auth audit logs
  const { data: logsData, isLoading: isLogsLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: getAuditLogsApi,
  });

  const auditLogs = logsData?.data || [];

  // Profile Update Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      email: adminData?.data?.email || 'admin@doctracker.com',
    },
  });

  // Password Change Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-me'] });
      showToast('Admin email profile updated successfully', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to update profile', 'error');
    },
  });

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      resetPasswordForm();
      showToast('Security password changed successfully', 'success');
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to change password', 'error');
    },
  });

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleProfileSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded border text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm ${
            toastMessage.type === 'success'
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Profile & Security Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage system administrator credentials, security passwords, and 3-day authentication audit records.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Admin Profile Card & Email Update */}
        <div className="lg:col-span-1 space-y-6">
          {/* Admin Identity Card */}
          <div className="bg-card border border-border p-6 rounded shadow-sm text-center space-y-4">
            <div className="w-20 h-20 rounded bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-2xl mx-auto shadow-inner">
              A
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground">System Administrator</h2>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Doctor Tracker Single-Admin Portal</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-success">Online & Authenticated</span>
            </div>
          </div>

          {/* Update Email Profile Form */}
          <div className="bg-card border border-border p-6 rounded shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Profile Credentials</h3>
            </div>

            <form onSubmit={handleSubmitProfile(handleProfileSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground block">Admin Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    {...registerProfile('email')}
                    type="email"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-[11px] text-destructive mt-1">{profileErrors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full py-2.5 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                {updateProfileMutation.isPending ? (
                  <span>Updating Email...</span>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Update Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Change Password & 3-Day Activity Audit Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Change Password Form */}
          <div className="bg-card border border-border p-6 rounded shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <KeyRound className="w-4 h-4 text-primary" />
              <div>
                <h3 className="text-sm font-bold text-foreground">Change Security Password</h3>
                <p className="text-[11px] text-muted-foreground">Verify current password before setting a new security credential.</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">Current Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      {...registerPassword('currentPassword')}
                      type="password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {passwordErrors.currentPassword && (
                    <p className="text-[11px] text-destructive mt-1">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      {...registerPassword('newPassword')}
                      type="password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {passwordErrors.newPassword && (
                    <p className="text-[11px] text-destructive mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground block">Confirm New Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      {...registerPassword('confirmPassword')}
                      type="password"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  {passwordErrors.confirmPassword && (
                    <p className="text-[11px] text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover shadow-sm flex items-center gap-2 transition-all disabled:opacity-70"
                >
                  {changePasswordMutation.isPending ? (
                    <span>Updating Password...</span>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 3-Day Login / Logout Activity Audit Log Table */}
          <div className="bg-card border border-border rounded shadow-sm overflow-hidden space-y-4">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Auth Activity Audit Logs</h3>
                  <p className="text-[11px] text-muted-foreground">Recent login and logout audit trail recorded over the last 3 days.</p>
                </div>
              </div>

              <Badge variant="info">Last 3 Days</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-foreground">
                <thead className="bg-muted/50 border-b border-border uppercase font-semibold text-muted-foreground text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Event Action</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4">User Agent / Device</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/60">
                  {isLogsLoading ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground font-medium">
                        Fetching last 3 days audit logs...
                      </td>
                    </tr>
                  ) : auditLogs.length > 0 ? (
                    auditLogs.map((log: AuditLogItem) => (
                      <tr key={log._id} className="hover:bg-accent/40 transition-colors">
                        <td className="py-3 px-4">
                          {log.action === 'LOGIN' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-success/10 border border-success/30 text-success font-bold text-[11px]">
                              <LogIn className="w-3 h-3" />
                              <span>LOGIN</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-warning/10 border border-warning/30 text-warning font-bold text-[11px]">
                              <LogOut className="w-3 h-3" />
                              <span>LOGOUT</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground font-medium">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-muted-foreground font-mono">
                          <div className="flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-muted-foreground" />
                            <span>{log.ipAddress}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-muted-foreground truncate max-w-xs">
                          <div className="flex items-center gap-1.5">
                            <Monitor className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{log.userAgent}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No login or logout activity recorded in the last 3 days.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
