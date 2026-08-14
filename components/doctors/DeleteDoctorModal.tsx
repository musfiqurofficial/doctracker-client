'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Doctor } from '@/types/doctor';

interface DeleteDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  doctor: Doctor | null;
  isLoading?: boolean;
}

export const DeleteDoctorModal: React.FC<DeleteDoctorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  doctor,
  isLoading = false,
}) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Full-screen Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-card border border-border w-full max-w-md rounded shadow-md overflow-hidden relative z-10 p-6 space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded bg-destructive/10 border border-destructive/20 text-destructive flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">Confirm Doctor Removal</h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to remove <strong className="text-foreground">{doctor.name}</strong> ({doctor.specialty})?
              </p>
              <p className="text-xs text-destructive font-medium mt-2 bg-destructive/10 p-2.5 rounded border border-destructive/20">
                ⚠️ Warning: All patients currently assigned to this doctor will also be unlinked/removed per system policy.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-accent text-foreground transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-semibold rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm transition-all disabled:opacity-50"
            >
              {isLoading ? 'Deleting...' : 'Delete Doctor'}
            </button>
          </div>
          </div>
      </div>
    </div>
  );
};
