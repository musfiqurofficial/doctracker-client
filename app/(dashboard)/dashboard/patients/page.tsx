'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, User, Calendar, Stethoscope, AlertCircle } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import {
  getPatientsApi,
  createPatientApi,
  updatePatientApi,
  deletePatientApi,
  PatientItem,
} from '@/lib/api/patients';
import { getDoctorsApi } from '@/lib/api/doctors';
import { AddEditPatientModal, PatientFormData } from '@/components/patients/AddEditPatientModal';
import { DeletePatientModal } from '@/components/patients/DeletePatientModal';

function PatientsPageContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial states from URL query params
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSearch = searchParams.get('search') || '';
  const initialCondition = searchParams.get('condition') || 'all';
  const initialStatus = searchParams.get('status') || 'all';

  // Filter & Pagination State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCondition, setSelectedCondition] = useState<string>(initialCondition);
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<PatientItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState<PatientItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize state with URL Query String
  const updateUrl = useCallback(
    (page: number, search: string, condition: string, status: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', String(page));
      if (search) params.set('search', search);
      if (condition && condition !== 'all') params.set('condition', condition);
      if (status && status !== 'all') params.set('status', status);

      const queryString = params.toString();
      const newPath = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newPath, { scroll: false });
    },
    [pathname, router]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page, searchTerm, selectedCondition, selectedStatus);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateUrl(1, value, selectedCondition, selectedStatus);
  };

  const handleConditionChange = (condition: string) => {
    setSelectedCondition(condition);
    setCurrentPage(1);
    updateUrl(1, searchTerm, condition, selectedStatus);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1);
    updateUrl(1, searchTerm, selectedCondition, status);
  };

  // Fetch Doctors list for assigned doctor dropdown
  const { data: doctorsData } = useQuery({
    queryKey: ['doctors-list-dropdown'],
    queryFn: () => getDoctorsApi({ limit: 100 }),
  });
  const doctorsList = doctorsData?.data || [];

  // Fetch Patients query with pagination, search, and filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['patients', currentPage, 10, searchTerm, selectedCondition, selectedStatus],
    queryFn: () =>
      getPatientsApi({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        condition: selectedCondition,
        status: selectedStatus,
      }),
  });

  const patients = data?.data?.patients || [];
  const meta = data?.data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // Create Patient Mutation
  const createMutation = useMutation({
    mutationFn: createPatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddEditModalOpen(false);
      showToast('Patient record created successfully');
    },
  });

  // Update Patient Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PatientFormData> }) =>
      updatePatientApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsAddEditModalOpen(false);
      setEditingPatient(null);
      showToast('Patient record updated successfully');
    },
  });

  // Delete Patient Mutation
  const deleteMutation = useMutation({
    mutationFn: deletePatientApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsDeleteModalOpen(false);
      setDeletingPatient(null);
      showToast('Patient record deleted successfully');
    },
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (patient: PatientItem) => {
    setEditingPatient(patient);
    setIsAddEditModalOpen(true);
  };

  const handleOpenDeleteModal = (patient: PatientItem) => {
    setDeletingPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const handleSavePatient = async (formData: PatientFormData) => {
    if (editingPatient) {
      await updateMutation.mutateAsync({ id: editingPatient._id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingPatient) {
      await deleteMutation.mutateAsync(deletingPatient._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Patients Directory</h1>
          <p className="text-sm text-muted-foreground">Manage patient medical records, status tracking, and doctor assignments.</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>New Patient</span>
        </button>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search by patient name or condition..."
            defaultValue={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          {/* Condition Filter */}
          <div className="w-48">
            <Select
              value={selectedCondition}
              onChange={(e) => handleConditionChange(e.target.value)}
              options={[
                { label: 'All Conditions', value: 'all' },
                { label: 'Essential Hypertension', value: 'Essential Hypertension' },
                { label: 'Type 2 Diabetes Mellitus', value: 'Type 2 Diabetes Mellitus' },
                { label: 'Acute Bronchial Asthma', value: 'Acute Bronchial Asthma' },
                { label: 'Coronary Artery Disease', value: 'Coronary Artery Disease' },
                { label: 'Migraine with Aura', value: 'Migraine with Aura' },
                { label: 'Osteoarthritis of Knee', value: 'Osteoarthritis of Knee' },
                { label: 'Chronic Gastritis & GERD', value: 'Chronic Gastritis & GERD' },
                { label: 'Atopic Dermatitis', value: 'Atopic Dermatitis' },
                { label: 'Pneumonia', value: 'Community Acquired Pneumonia' },
                { label: 'Kidney Stones', value: 'Renal Calculi (Kidney Stones)' },
                { label: 'Anxiety Disorder', value: 'Generalized Anxiety Disorder' },
                { label: 'Hypothyroidism', value: 'Hypothyroidism' },
                { label: 'Fatty Liver Disease', value: 'Fatty Liver Disease' },
                { label: 'Anemia', value: 'Iron Deficiency Anemia' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Stable', value: 'stable' },
                { label: 'Recovering', value: 'recovering' },
                { label: 'Critical', value: 'critical' },
              ]}
            />
          </div>

          <div className="text-xs text-muted-foreground hidden lg:block whitespace-nowrap">
            Total Records: <span className="font-bold text-foreground">{meta.total}</span>
          </div>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground">
            <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="py-3.5 px-4">Patient Name</th>
                <th className="py-3.5 px-4">Age / Gender</th>
                <th className="py-3.5 px-4">Medical Condition</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                Array.from({ length: 10 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-36" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-20" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-44" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-24" /></td>
                    <td className="py-4 px-4 text-center"><div className="h-5 bg-muted/40 rounded-full w-20 mx-auto" /></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-muted/40 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-destructive">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-6 h-6" />
                      <span>{(error as Error)?.message || 'Failed to load patients data.'}</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length > 0 ? (
                patients.map((pat) => {
                  const doctorObj = typeof pat.doctorId === 'object' ? pat.doctorId : null;
                  return (
                    <tr key={pat._id} className="hover:bg-accent/40 transition-colors">
                      <td className="py-4 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary font-bold text-sm">
                            <User className="w-4 h-4" />
                          </div>
                          <span>{pat.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-muted-foreground">
                        {pat.age} yrs • {pat.gender}
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">{pat.condition}</td>
                      <td className="py-4 px-4 text-xs font-medium text-primary">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-primary" />
                          <span>{doctorObj ? doctorObj.name : 'Assigned Doctor'}</span>
                        </div>
                      </td>
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
                            onClick={() => handleOpenEditModal(pat)}
                            className="p-2 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            title="Edit Patient"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(pat)}
                            className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Delete Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No patients found matching your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border px-4">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            totalRecords={meta.total}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Add / Edit Patient Modal */}
      <AddEditPatientModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingPatient(null);
        }}
        onSubmit={handleSavePatient}
        initialData={editingPatient}
        doctorsList={doctorsList}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPatient(null);
        }}
        onConfirm={handleConfirmDelete}
        patient={deletingPatient}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground font-medium bg-card border border-border rounded shadow-sm">Loading patients roster...</div>}>
      <PatientsPageContent />
    </Suspense>
  );
}
