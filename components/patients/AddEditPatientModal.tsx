'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, UserPlus } from 'lucide-react';
import { PatientItem } from '@/lib/api/patients';
import { Doctor } from '@/types/doctor';
import { Select } from '@/components/ui/Select';

const patientSchema = z.object({
  name: z.string().min(2, { message: 'Patient name must be at least 2 characters' }),
  age: z.coerce.number().min(0, { message: 'Age cannot be negative' }).max(120, { message: 'Age cannot exceed 120' }),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  condition: z.string().min(2, { message: 'Medical condition is required' }),
  status: z.enum(['stable', 'recovering', 'critical']),
  doctorId: z.string().min(1, { message: 'Please select an assigned doctor' }),
});

export type PatientFormData = z.infer<typeof patientSchema>;

interface AddEditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PatientFormData) => Promise<void>;
  initialData?: PatientItem | null;
  doctorsList: Array<Doctor | { _id: string; name: string; specialty: string }>;
  prefilledDoctorId?: string;
  isSubmitting?: boolean;
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Other', value: 'Other' },
];

const COMMON_CONDITIONS = [
  { label: 'Essential Hypertension', value: 'Essential Hypertension' },
  { label: 'Type 2 Diabetes Mellitus', value: 'Type 2 Diabetes Mellitus' },
  { label: 'Acute Bronchial Asthma', value: 'Acute Bronchial Asthma' },
  { label: 'Coronary Artery Disease', value: 'Coronary Artery Disease' },
  { label: 'Migraine with Aura', value: 'Migraine with Aura' },
  { label: 'Osteoarthritis of Knee', value: 'Osteoarthritis of Knee' },
  { label: 'Chronic Gastritis & GERD', value: 'Chronic Gastritis & GERD' },
  { label: 'Atopic Dermatitis', value: 'Atopic Dermatitis' },
  { label: 'Community Acquired Pneumonia', value: 'Community Acquired Pneumonia' },
  { label: 'Renal Calculi (Kidney Stones)', value: 'Renal Calculi (Kidney Stones)' },
  { label: 'Generalized Anxiety Disorder', value: 'Generalized Anxiety Disorder' },
  { label: 'Hypothyroidism', value: 'Hypothyroidism' },
  { label: 'Fatty Liver Disease', value: 'Fatty Liver Disease' },
  { label: 'Iron Deficiency Anemia', value: 'Iron Deficiency Anemia' },
  { label: 'Viral Fever & Dengue', value: 'Viral Fever & Dengue' },
  { label: 'Others', value: 'Other' },
];

export function AddEditPatientModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  doctorsList,
  prefilledDoctorId,
  isSubmitting = false,
}: AddEditPatientModalProps) {
  const isEditing = Boolean(initialData);

  const [conditionOption, setConditionOption] = useState<string>('Essential Hypertension');
  const [customCondition, setCustomCondition] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      age: 30,
      gender: 'Male',
      condition: 'Essential Hypertension',
      status: 'stable',
      doctorId: prefilledDoctorId || '',
    },
  });

  const currentStatus = watch('status');

  useEffect(() => {
    if (initialData) {
      const isPreset = COMMON_CONDITIONS.some((item) => item.value === initialData.condition);
      if (isPreset) {
        setConditionOption(initialData.condition);
        setCustomCondition('');
        reset({
          name: initialData.name,
          age: initialData.age,
          gender: initialData.gender,
          condition: initialData.condition,
          status: initialData.status,
          doctorId: typeof initialData.doctorId === 'object' ? initialData.doctorId._id : initialData.doctorId,
        });
      } else {
        setConditionOption('Other');
        setCustomCondition(initialData.condition);
        reset({
          name: initialData.name,
          age: initialData.age,
          gender: initialData.gender,
          condition: initialData.condition,
          status: initialData.status,
          doctorId: typeof initialData.doctorId === 'object' ? initialData.doctorId._id : initialData.doctorId,
        });
      }
    } else {
      setConditionOption('Essential Hypertension');
      setCustomCondition('');
      reset({
        name: '',
        age: 30,
        gender: 'Male',
        condition: 'Essential Hypertension',
        status: 'stable',
        doctorId: prefilledDoctorId || (doctorsList.length > 0 ? doctorsList[0]._id : ''),
      });
    }
  }, [initialData, prefilledDoctorId, doctorsList, reset, isOpen]);

  if (!isOpen) return null;

  const doctorOptions =
    doctorsList.length > 0
      ? doctorsList.map((doc) => ({
          label: `${doc.name} (${doc.specialty})`,
          value: doc._id,
        }))
      : [{ label: 'No doctors available - Please add a doctor first', value: '' }];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Full-screen Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-card border border-border w-full max-w-xl rounded shadow-md overflow-hidden relative z-10 my-8 animate-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-primary/10 border border-primary/20 text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {isEditing ? 'Edit Patient' : 'New Patient'}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isEditing ? 'Update medical credentials and assigned doctor' : 'Add patient to clinical records'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Patient Full Name */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  placeholder="Rahim Uddin"
                  {...register('name')}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
                {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>}
              </div>

              {/* Age (Years) */}
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">Age (Years) *</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="45"
                  {...register('age')}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
                {errors.age && <p className="text-[11px] text-destructive mt-1">{errors.age.message}</p>}
              </div>

              {/* Gender Dropdown */}
              <Select
                label="Gender *"
                error={errors.gender?.message}
                {...register('gender')}
                options={GENDER_OPTIONS}
              />

              {/* Medical Condition / Diagnosis Dropdown with Others */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Medical Condition / Diagnosis *
                </label>

                <Select
                  value={conditionOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConditionOption(val);
                    if (val !== 'Other') {
                      setValue('condition', val, { shouldValidate: true });
                    } else {
                      setValue('condition', customCondition, { shouldValidate: true });
                    }
                  }}
                  options={COMMON_CONDITIONS}
                />

                {conditionOption === 'Other' && (
                  <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                    <input
                      type="text"
                      placeholder="Specify medical condition / diagnosis..."
                      value={customCondition}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomCondition(val);
                        setValue('condition', val, { shouldValidate: true });
                      }}
                      className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                  </div>
                )}

                {errors.condition && (
                  <p className="text-[11px] text-destructive mt-1">{errors.condition.message}</p>
                )}
              </div>

              {/* Assigned Doctor Dropdown (Full Width) */}
              <div className="sm:col-span-2">
                <Select
                  label="Assigned Doctor *"
                  error={errors.doctorId?.message}
                  disabled={Boolean(prefilledDoctorId)}
                  {...register('doctorId')}
                  options={doctorOptions}
                />
              </div>
            </div>

            {/* Condition Status Selector */}
            <div className="pt-1">
              <label className="text-xs font-semibold text-foreground block mb-1.5">Condition Status *</label>

              <div className="flex flex-wrap items-center gap-2">
                {/* Stable */}
                <button
                  type="button"
                  onClick={() => setValue('status', 'stable', { shouldValidate: true })}
                  className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    currentStatus === 'stable'
                      ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                      : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-success"></span>
                  <span>Stable</span>
                </button>

                {/* Recovering */}
                <button
                  type="button"
                  onClick={() => setValue('status', 'recovering', { shouldValidate: true })}
                  className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    currentStatus === 'recovering'
                      ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                      : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-info"></span>
                  <span>Recovering</span>
                </button>

                {/* Critical */}
                <button
                  type="button"
                  onClick={() => setValue('status', 'critical', { shouldValidate: true })}
                  className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                    currentStatus === 'critical'
                      ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                      : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  <span>Critical</span>
                </button>
              </div>
            </div>

            {/* Submit Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded border border-border bg-background hover:bg-accent text-foreground transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-all disabled:opacity-70"
              >
                {isSubmitting ? (isEditing ? 'Updating Patient...' : 'Creating Patient...') : isEditing ? 'Update Patient' : 'Create Patient'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
