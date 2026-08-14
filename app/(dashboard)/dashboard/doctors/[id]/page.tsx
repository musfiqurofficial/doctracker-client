'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Stethoscope, 
  Mail, 
  Phone, 
  Plus, 
  User, 
  AlertCircle, 
  Trash2, 
  Calendar,
  Award,
  DollarSign,
  Clock,
  Activity,
  HeartPulse,
  ShieldAlert,
  Edit
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { getDoctorByIdApi } from '@/lib/api/doctors';
import {
  getPatientsApi,
  createPatientApi,
  updatePatientApi,
  deletePatientApi,
  PatientItem,
} from '@/lib/api/patients';
import { AddEditPatientModal, PatientFormData } from '@/components/patients/AddEditPatientModal';
import { DeletePatientModal } from '@/components/patients/DeletePatientModal';

export default function DoctorDetailPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();
  const doctorId = params.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal States
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<PatientItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch Doctor Profile
  const { data: doctorData, isLoading: isDoctorLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => getDoctorByIdApi(doctorId),
  });
  const doctor = doctorData?.data;

  // Fetch Patients under this Doctor with search and status filter
  const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
    queryKey: ['patients-under-doctor', doctorId, searchTerm, selectedStatus],
    queryFn: () =>
      getPatientsApi({
        doctorId,
        search: searchTerm,
        status: selectedStatus,
        limit: 100,
      }),
  });
  const assignedPatients = patientsData?.data?.patients || [];

  // Calculate doctor patient stats
  const totalPatientsCount = assignedPatients.length;
  const stableCount = assignedPatients.filter((p) => p.status === 'stable').length;
  const recoveringCount = assignedPatients.filter((p) => p.status === 'recovering').length;
  const criticalCount = assignedPatients.filter((p) => p.status === 'critical').length;

  // Create Patient Mutation (prefilled doctorId)
  const createPatientMutation = useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients-under-doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddPatientModalOpen(false);
      showToast('Patient assigned to doctor successfully');
    },
  });

  // Update Patient Mutation
  const updatePatientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormData> }) =>
      updatePatientApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients-under-doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddPatientModalOpen(false);
      setEditingPatient(null);
      showToast('Patient record updated successfully');
    },
  });

  // Delete Patient Mutation
  const deletePatientMutation = useMutation({
    mutationFn: deletePatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients-under-doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsDeleteModalOpen(false);
      setDeletingPatient(null);
      showToast('Patient record deleted successfully');
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePatient = async (formData: PatientFormData) => {
    if (editingPatient) {
      await updatePatientMutation.mutateAsync({ id: editingPatient._id, data: formData });
    } else {
      await createPatientMutation.mutateAsync({
        ...formData,
        doctorId,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingPatient) {
      await deletePatientMutation.mutateAsync(deletingPatient._id);
    }
  };

  if (isDoctorLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-card border border-border rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-20 bg-card border border-border rounded" />
          <div className="h-20 bg-card border border-border rounded" />
          <div className="h-20 bg-card border border-border rounded" />
          <div className="h-20 bg-card border border-border rounded" />
        </div>
        <div className="h-64 bg-card border border-border rounded" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="p-12 text-center text-muted-foreground space-y-4">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Doctor Profile Not Found</h2>
        <p className="text-xs text-muted-foreground">The requested doctor profile could not be located in the database.</p>
        <Link href="/dashboard/doctors" className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground font-semibold text-xs shadow-sm">
          Return to Doctors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Doctor Profile Header Card */}
      <div className="bg-card border border-border p-6 rounded shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Avatar & Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold flex-shrink-0 shadow-sm">
              <Stethoscope className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{doctor.name}</h1>
                <Badge
                  variant={
                    doctor.availabilityStatus === 'Available'
                      ? 'success'
                      : doctor.availabilityStatus === 'On Leave'
                      ? 'warning'
                      : 'destructive'
                  }
                >
                  {doctor.availabilityStatus || 'Available'}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="text-primary font-semibold">{doctor.specialty}</span>
                <span>•</span>
                <span>{doctor.department} Department</span>
                {doctor.qualification && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-primary" />
                      {doctor.qualification}
                    </span>
                  </>
                )}
              </div>

              {/* Contact & Credentials Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{doctor.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{doctor.phone}</span>
                </div>
                {doctor.experienceYears !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{doctor.experienceYears} Years Exp</span>
                  </div>
                )}
                {doctor.consultationFee !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>৳{doctor.consultationFee} Fee</span>
                  </div>
                )}
              </div>

              {/* Bio Summary */}
              {doctor.bio && (
                <p className="text-xs text-muted-foreground/90 pt-2 italic max-w-2xl">
                  "{doctor.bio}"
                </p>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="self-start lg:self-center flex-shrink-0">
            <button
              onClick={() => {
                setEditingPatient(null);
                setIsAddPatientModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary-hover shadow-sm transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Patient</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clinical Workload KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Assigned</span>
            <User className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-extrabold text-foreground">{totalPatientsCount}</p>
        </div>

        <div className="bg-card border border-border p-4 rounded shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Stable Cases</span>
            <HeartPulse className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-extrabold text-success">{stableCount}</p>
        </div>

        <div className="bg-card border border-border p-4 rounded shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Recovering</span>
            <Activity className="w-4 h-4 text-info" />
          </div>
          <p className="text-2xl font-extrabold text-info">{recoveringCount}</p>
        </div>

        <div className="bg-card border border-border p-4 rounded shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Critical Watch</span>
            <ShieldAlert className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-extrabold text-destructive">{criticalCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar for Assigned Patients */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search patients by name or condition..."
            onChange={(value) => setSearchTerm(value)}
          />
        </div>

        <div className="flex items-center gap-3 w-44">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Stable', value: 'stable' },
              { label: 'Recovering', value: 'recovering' },
              { label: 'Critical', value: 'critical' },
            ]}
          />
        </div>
      </div>

      {/* Assigned Patients Table */}
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Assigned Patient Roster ({assignedPatients.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Medical Condition</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {isPatientsLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs font-medium">
                    Loading assigned patient records...
                  </td>
                </tr>
              ) : assignedPatients.length > 0 ? (
                assignedPatients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">{pat.name}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      {pat.age} yrs • {pat.gender}
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground">{pat.condition}</td>
                    <td className="py-4 px-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{new Date(pat.visitDate || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge
                        variant={
                          pat.status === 'stable'
                            ? 'success'
                            : pat.status === 'recovering'
                            ? 'info'
                            : 'destructive'
                        }
                      >
                        {pat.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingPatient(pat);
                            setIsAddPatientModalOpen(true);
                          }}
                          className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Edit Patient Record"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingPatient(pat);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Patient Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No patients currently assigned to {doctor.name} matching filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Patient Modal (Prefilled Doctor) */}
      <AddEditPatientModal
        isOpen={isAddPatientModalOpen}
        onClose={() => {
          setIsAddPatientModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleSavePatient}
        initialData={editingPatient}
        doctorsList={[{ _id: doctor._id, name: doctor.name, specialty: doctor.specialty }]}
        prefilledDoctorId={doctor._id}
        isSubmitting={createPatientMutation.isPending || updatePatientMutation.isPending}
      />

      {/* Delete Patient Confirmation Modal */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPatient(null);
        }}
        onConfirm={handleConfirmDelete}
        patient={deletingPatient}
        isDeleting={deletePatientMutation.isPending}
      />
    </div>
  );
}
