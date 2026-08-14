'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Stethoscope, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Doctor, DoctorInput } from '@/types/doctor';
import { Select } from '@/components/ui/Select';

const doctorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(6, 'Phone number must be at least 6 characters'),
  specialty: z.string().min(2, 'Specialty is required'),
  department: z.string().min(2, 'Department is required'),
  qualificationSelect: z.string().min(1, 'Qualification is required'),
  customQualification: z.string().optional(),
  experienceYears: z.coerce.number().min(0, 'Must be positive number').optional(),
  consultationFee: z.coerce.number().min(0, 'Must be positive number').optional(),
  availabilityStatus: z.enum(['Available', 'On Leave', 'Busy']),
  bio: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorFormSchema>;

interface DoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DoctorInput) => void;
  doctor?: Doctor | null;
  isLoading?: boolean;
}

const QUALIFICATION_OPTIONS = [
  { label: 'MBBS', value: 'MBBS' },
  { label: 'MBBS, FCPS', value: 'MBBS, FCPS' },
  { label: 'MBBS, MD', value: 'MBBS, MD' },
  { label: 'MBBS, MS', value: 'MBBS, MS' },
  { label: 'MBBS, DCH', value: 'MBBS, DCH' },
  { label: 'MBBS, FRCS', value: 'MBBS, FRCS' },
  { label: 'MBBS, MPhil', value: 'MBBS, MPhil' },
  { label: 'MBBS, D-Card', value: 'MBBS, D-Card' },
  { label: 'Others', value: 'Others' },
];

const SPECIALTY_OPTIONS = [
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Neurology', value: 'Neurology' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Orthopedics', value: 'Orthopedics' },
  { label: 'General Medicine', value: 'General Medicine' },
  { label: 'Dermatology', value: 'Dermatology' },
  { label: 'Gynecology & Obstetrics', value: 'Gynecology & Obstetrics' },
  { label: 'Ophthalmology', value: 'Ophthalmology' },
  { label: 'ENT (Ear, Nose, Throat)', value: 'ENT' },
  { label: 'Psychiatry', value: 'Psychiatry' },
  { label: 'Gastroenterology', value: 'Gastroenterology' },
  { label: 'Urology', value: 'Urology' },
  { label: 'Nephrology', value: 'Nephrology' },
  { label: 'Oncology', value: 'Oncology' },
  { label: 'Pulmonology', value: 'Pulmonology' },
  { label: 'Other Specialty', value: 'Other' },
];

const DEPARTMENT_OPTIONS = [
  { label: 'Cardiology Department', value: 'Cardiology' },
  { label: 'Neurology Department', value: 'Neurology' },
  { label: 'Pediatrics Department', value: 'Pediatrics' },
  { label: 'Orthopedics Department', value: 'Orthopedics' },
  { label: 'General Medicine Department', value: 'General Medicine' },
  { label: 'Dermatology Department', value: 'Dermatology' },
  { label: 'Gynecology Department', value: 'Gynecology' },
  { label: 'Ophthalmology Department', value: 'Ophthalmology' },
  { label: 'ENT Department', value: 'ENT' },
  { label: 'Psychiatry Department', value: 'Psychiatry' },
  { label: 'Gastroenterology Department', value: 'Gastroenterology' },
  { label: 'Urology Department', value: 'Urology' },
  { label: 'Nephrology Department', value: 'Nephrology' },
  { label: 'Oncology Department', value: 'Oncology' },
  { label: 'Pulmonology Department', value: 'Pulmonology' },
  { label: 'General Outpatient Dept', value: 'Outpatient' },
];

export const DoctorModal: React.FC<DoctorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  doctor,
  isLoading = false,
}) => {
  const isEditing = !!doctor;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '+880 ',
      specialty: 'Cardiology',
      department: 'Cardiology',
      qualificationSelect: 'MBBS, FCPS',
      customQualification: '',
      experienceYears: 5,
      consultationFee: 800,
      availabilityStatus: 'Available',
      bio: '',
    },
  });

  const selectedQualification = watch('qualificationSelect');
  const currentStatus = watch('availabilityStatus');
  const expYears = watch('experienceYears');

  useEffect(() => {
    if (doctor) {
      const isKnownQual = QUALIFICATION_OPTIONS.some((q) => q.value === doctor.qualification);
      reset({
        name: doctor.name || '',
        email: doctor.email || '',
        phone: doctor.phone ? (doctor.phone.startsWith('+880') ? doctor.phone : `+880 ${doctor.phone}`) : '+880 ',
        specialty: doctor.specialty || 'Cardiology',
        department: doctor.department || 'Cardiology',
        qualificationSelect: isKnownQual ? doctor.qualification : 'Others',
        customQualification: isKnownQual ? '' : doctor.qualification || '',
        experienceYears: doctor.experienceYears ?? 5,
        consultationFee: doctor.consultationFee ?? 800,
        availabilityStatus: doctor.availabilityStatus || 'Available',
        bio: doctor.bio || '',
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '+880 ',
        specialty: 'Cardiology',
        department: 'Cardiology',
        qualificationSelect: 'MBBS, FCPS',
        customQualification: '',
        experienceYears: 5,
        consultationFee: 800,
        availabilityStatus: 'Available',
        bio: '',
      });
    }
  }, [doctor, reset, isOpen]);

  const handleFormSubmit = (data: DoctorFormData) => {
    const finalQualification =
      data.qualificationSelect === 'Others'
        ? data.customQualification || 'MBBS'
        : data.qualificationSelect;

    const payload: DoctorInput = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      specialty: data.specialty,
      department: data.department,
      qualification: finalQualification,
      experienceYears: data.experienceYears,
      consultationFee: data.consultationFee,
      availabilityStatus: data.availabilityStatus,
      bio: data.bio,
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

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
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isEditing ? 'Edit Doctor' : 'New Doctor'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEditing ? 'Update medical credentials and status' : 'Add specialist to hospital directory'}
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Doctor Name */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="Dr. Sarah Khan"
                {...register('name')}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {errors.name && <p className="text-[11px] text-destructive mt-1">{errors.name.message}</p>}
            </div>

            {/* Email Address */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="sarah.khan@doctracker.com"
                {...register('email')}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
              {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone Number (Full Width with +880 default code) */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-foreground block mb-1">Phone Number *</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="+880 1711-234567"
                  {...register('phone')}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-mono"
                />
              </div>
              {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone.message}</p>}
            </div>

            {/* Specialty & Qualification (Side by Side in Same Row) */}
            <Select
              label="Specialty *"
              error={errors.specialty?.message}
              {...register('specialty')}
              options={SPECIALTY_OPTIONS}
            />

            <Select
              label="Qualification / Degree *"
              error={errors.qualificationSelect?.message}
              {...register('qualificationSelect')}
              options={QUALIFICATION_OPTIONS}
            />

            {/* Custom Qualification Input if 'Others' is selected */}
            {selectedQualification === 'Others' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground block mb-1">Specify Custom Qualification *</label>
                <input
                  type="text"
                  placeholder="e.g. MBBS, PhD (Neuroscience), Fellowship (USA)"
                  {...register('customQualification')}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            )}

            {/* Department (Full Width) */}
            <div className="sm:col-span-2">
              <Select
                label="Department *"
                error={errors.department?.message}
                {...register('department')}
                options={DEPARTMENT_OPTIONS}
              />
            </div>

            {/* Experience Years */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Experience</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="5"
                  {...register('experienceYears')}
                  className="w-full pl-3 pr-16 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
                <span className="absolute right-3 text-xs text-muted-foreground font-semibold pointer-events-none">
                  {Number(expYears) === 1 ? 'Year' : 'Years'}
                </span>
              </div>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Consultation Fee</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  placeholder="800"
                  {...register('consultationFee')}
                  className="w-full pl-3 pr-14 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all font-medium"
                />
                <span className="absolute right-3 text-xs text-muted-foreground font-semibold pointer-events-none">
                  Taka
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Doctor Bio / Clinical Notes</label>
            <textarea
              rows={3}
              placeholder="Brief summary of doctor's clinical background..."
              {...register('bio')}
              className="w-full px-3 py-2 text-xs bg-background border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none transition-all"
            />
          </div>

          {/* Minimal Availability Status Selector (Below Doctor Bio) */}
          <div className="pt-1">
            <label className="text-xs font-semibold text-foreground block mb-1.5">Availability Status *</label>

            <div className="flex flex-wrap items-center gap-2">
              {/* Available */}
              <button
                type="button"
                onClick={() => setValue('availabilityStatus', 'Available', { shouldValidate: true })}
                className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  currentStatus === 'Available'
                    ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-success"></span>
                <span>Available</span>
              </button>

              {/* On Leave */}
              <button
                type="button"
                onClick={() => setValue('availabilityStatus', 'On Leave', { shouldValidate: true })}
                className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  currentStatus === 'On Leave'
                    ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                <span>On Leave</span>
              </button>

              {/* Busy */}
              <button
                type="button"
                onClick={() => setValue('availabilityStatus', 'Busy', { shouldValidate: true })}
                className={`px-3 py-1.5 rounded border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                  currentStatus === 'Busy'
                    ? 'bg-accent border-primary text-foreground font-semibold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:bg-accent/40'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-destructive"></span>
                <span>Busy</span>
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
              disabled={isLoading}
              className="px-5 py-2 text-xs font-semibold rounded bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm transition-all disabled:opacity-70"
            >
              {isLoading ? (isEditing ? 'Updating Doctor...' : 'Creating Doctor...') : isEditing ? 'Update Doctor' : 'Create Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);
};
