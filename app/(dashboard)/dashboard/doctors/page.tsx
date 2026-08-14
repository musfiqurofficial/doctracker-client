'use client';

import React, { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit, Trash2, Stethoscope, Mail, Phone, AlertCircle, LayoutGrid, List, User } from 'lucide-react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { DoctorModal } from '@/components/doctors/DoctorModal';
import { DeleteDoctorModal } from '@/components/doctors/DeleteDoctorModal';
import { toast } from 'sonner';
import { getDoctorsApi, createDoctorApi, updateDoctorApi, deleteDoctorApi } from '@/lib/api/doctors';
import { Doctor, DoctorInput } from '@/types/doctor';

function DoctorsPageContent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // View Mode State (Grid/Card vs Table/List)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Read initial states from URL query params
  const initialPage = Number(searchParams.get('page')) || 1;
  const initialSearch = searchParams.get('search') || '';
  const initialDepartment = searchParams.get('department') || 'all';
  const initialStatus = searchParams.get('status') || 'all';

  // Filter & Pagination State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState(initialDepartment);
  const [statusFilter, setStatusFilter] = useState(initialStatus);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  // Synchronize state with URL Query String
  const updateUrl = useCallback(
    (page: number, search: string, department: string, status: string) => {
      const params = new URLSearchParams();
      if (page > 1) params.set('page', String(page));
      if (search) params.set('search', search);
      if (department && department !== 'all') params.set('department', department);
      if (status && status !== 'all') params.set('status', status);

      const queryString = params.toString();
      const newPath = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(newPath, { scroll: false });
    },
    [pathname, router]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl(page, searchTerm, departmentFilter, statusFilter);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateUrl(1, value, departmentFilter, statusFilter);
  };

  const handleDepartmentChange = (department: string) => {
    setDepartmentFilter(department);
    setCurrentPage(1);
    updateUrl(1, searchTerm, department, statusFilter);
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
    updateUrl(1, searchTerm, departmentFilter, status);
  };

  // TanStack Query: Fetch Doctors with Server-Side Pagination & Filters
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['doctors', currentPage, 10, searchTerm, departmentFilter, statusFilter],
    queryFn: () =>
      getDoctorsApi({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        department: departmentFilter,
        status: statusFilter,
      }),
  });

  const doctors = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  // TanStack Query Mutation: Create Doctor
  const createMutation = useMutation({
    mutationFn: createDoctorApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setSelectedDoctor(null);
      toast.success(`Doctor Created Successfully`, {
        description: `Dr. ${res.data.name} has been added to the hospital directory.`,
      });
    },
    onError: (err: Error) => {
      toast.error(`Failed to Create Doctor`, {
        description: err.message || 'An error occurred while creating doctor.',
      });
    },
  });

  // TanStack Query Mutation: Update Doctor
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DoctorInput> }) => updateDoctorApi(id, input),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setSelectedDoctor(null);
      toast.success(`Doctor Profile Updated`, {
        description: `Dr. ${res.data.name}'s profile credentials have been updated.`,
      });
    },
    onError: (err: Error) => {
      toast.error(`Failed to Update Doctor`, {
        description: err.message || 'An error occurred while updating profile.',
      });
    },
  });

  // TanStack Query Mutation: Delete Doctor
  const deleteMutation = useMutation({
    mutationFn: deleteDoctorApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsDeleteModalOpen(false);
      setDoctorToDelete(null);
      toast.success(`Doctor Removed Successfully`, {
        description: `The doctor profile and assigned patient links have been removed.`,
      });
    },
    onError: (err: Error) => {
      toast.error(`Failed to Remove Doctor`, {
        description: err.message || 'An error occurred while deleting doctor.',
      });
    },
  });

  const handleOpenCreateModal = () => {
    setSelectedDoctor(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (doc: Doctor) => {
    setDoctorToDelete(doc);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = (formData: DoctorInput) => {
    if (selectedDoctor) {
      updateMutation.mutate({ id: selectedDoctor._id, input: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (doctorToDelete) {
      deleteMutation.mutate(doctorToDelete._id);
    }
  };

  const getStatusBadgeVariant = (status: Doctor['availabilityStatus']) => {
    switch (status) {
      case 'Available':
        return 'success';
      case 'On Leave':
        return 'warning';
      case 'Busy':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Doctors Directory</h1>
          <p className="text-sm text-muted-foreground">Manage doctor profiles and assigned patient workloads.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher Controls (Card / Table) */}
          <div className="bg-card border border-border p-1 rounded flex items-center gap-1 shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'grid'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all text-xs font-semibold flex items-center gap-1.5 ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>New Doctor</span>
          </button>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex-1 max-w-md">
          <SearchInput
            placeholder="Search by doctor name, specialty, email..."
            defaultValue={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto flex-wrap">
          {/* Department Filter */}
          <div className="w-44">
            <Select
              value={departmentFilter}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              options={[
                { label: 'All Departments', value: 'all' },
                { label: 'Cardiology', value: 'Cardiology' },
                { label: 'Neurology', value: 'Neurology' },
                { label: 'Pediatrics', value: 'Pediatrics' },
                { label: 'Orthopedics', value: 'Orthopedics' },
                { label: 'General Medicine', value: 'General Medicine' },
                { label: 'Dermatology', value: 'Dermatology' },
                { label: 'Gynecology', value: 'Gynecology' },
                { label: 'Ophthalmology', value: 'Ophthalmology' },
                { label: 'ENT', value: 'ENT' },
                { label: 'Psychiatry', value: 'Psychiatry' },
                { label: 'Gastroenterology', value: 'Gastroenterology' },
                { label: 'Urology', value: 'Urology' },
                { label: 'Nephrology', value: 'Nephrology' },
                { label: 'Oncology', value: 'Oncology' },
                { label: 'Pulmonology', value: 'Pulmonology' },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              options={[
                { label: 'All Statuses', value: 'all' },
                { label: 'Available', value: 'Available' },
                { label: 'On Leave', value: 'On Leave' },
                { label: 'Busy', value: 'Busy' },
              ]}
            />
          </div>

          <div className="text-xs text-muted-foreground hidden lg:block whitespace-nowrap">
            Total Records: <span className="font-bold text-foreground">{meta.total}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Switch between Grid View & Table View */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="bg-card border border-border rounded p-4 shadow-sm animate-pulse space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-muted/60 flex-shrink-0" />
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="h-4 bg-muted/60 rounded w-28" />
                      <div className="h-3 bg-muted/40 rounded w-20" />
                    </div>
                  </div>
                  <div className="h-5 bg-muted/40 rounded-full w-16" />
                </div>
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="h-3 bg-muted/40 rounded w-full" />
                  <div className="h-3 bg-muted/40 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-foreground">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-3.5 px-4">Doctor Name</th>
                    <th className="py-3.5 px-4">Specialty & Dept</th>
                    <th className="py-3.5 px-4">Contact Info</th>
                    <th className="py-3.5 px-4 text-center">Fee & Exp</th>
                    <th className="py-3.5 px-4 text-center">Patients</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {Array.from({ length: 10 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4"><div className="h-4 bg-muted/60 rounded w-36" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-28" /></td>
                      <td className="py-4 px-4"><div className="h-4 bg-muted/40 rounded w-36" /></td>
                      <td className="py-4 px-4 text-center"><div className="h-4 bg-muted/40 rounded w-16 mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><div className="h-4 bg-muted/40 rounded w-10 mx-auto" /></td>
                      <td className="py-4 px-4 text-center"><div className="h-5 bg-muted/40 rounded-full w-20 mx-auto" /></td>
                      <td className="py-4 px-4 text-right"><div className="h-4 bg-muted/40 rounded w-16 ml-auto" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : isError ? (
        <div className="bg-card border border-border rounded p-12 text-center text-destructive text-xs font-medium shadow-sm space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto" />
          <p>Error loading doctors: {(error as Error)?.message || 'Server Connection Failed'}</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="bg-card border border-border rounded p-12 text-center text-muted-foreground text-xs shadow-sm">
          No doctor records found matching your filters.
        </div>
      ) : viewMode === 'grid' ? (
        /* Minimal Sleek Doctor Cards Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-card border border-border rounded p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/doctors/${doc._id}`}
                        className="font-bold text-foreground hover:text-primary text-sm tracking-tight truncate block group-hover:text-primary transition-colors"
                      >
                        {doc.name}
                      </Link>
                      <p className="text-[11px] text-muted-foreground font-medium truncate">
                        {doc.qualification || 'MBBS'}
                      </p>
                    </div>
                  </div>

                  <Badge variant={getStatusBadgeVariant(doc.availabilityStatus)}>
                    {doc.availabilityStatus}
                  </Badge>
                </div>

                {/* Specialty Tag & Department */}
                <div className="space-y-1.5 pt-1">
                  <div className="inline-block px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary font-semibold text-xs">
                    {doc.specialty}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{doc.department} Dept</p>
                </div>

                {/* Contact Info Badges */}
                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/60">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span>{doc.phone}</span>
                  </div>
                </div>

                {/* Stat Pill Strip */}
                <div className="grid grid-cols-3 gap-1 bg-muted/40 p-2 rounded text-center text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Fee</span>
                    <span className="font-bold text-foreground">৳{doc.consultationFee || 500}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Exp</span>
                    <span className="font-bold text-foreground">{doc.experienceYears || 5} yrs</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Patients</span>
                    <span className="font-bold text-primary">{doc.patientsCount || 0}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Link
                    href={`/dashboard/doctors/${doc._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </Link>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(doc)}
                      className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      title="Edit Doctor"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(doc)}
                      className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      title="Delete Doctor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls for Card View */}
          {meta.totalPages > 1 && (
            <div className="bg-card border border-border rounded px-4 py-2 shadow-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalRecords={meta.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      ) : (
        /* Doctors Data Table View */
        <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-foreground border-collapse">
              <thead className="bg-muted/50 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-4">Doctor Name</th>
                  <th className="py-3.5 px-4">Specialty & Dept</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Fee & Exp</th>
                  <th className="py-3.5 px-4 text-center">Patients</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/60">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-accent/40 transition-colors">
                    <td className="py-4 px-4 font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/doctors/${doc._id}`}
                            className="hover:text-primary transition-colors font-bold block"
                          >
                            {doc.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {doc.qualification || 'MBBS'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-muted-foreground">
                      <div className="font-semibold text-foreground text-xs">{doc.specialty}</div>
                      <span className="text-[11px] text-muted-foreground">{doc.department}</span>
                    </td>

                    <td className="py-4 px-4 text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{doc.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{doc.phone}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center text-xs">
                      <div className="font-bold text-foreground">৳{doc.consultationFee || 500}</div>
                      <div className="text-[10px] text-muted-foreground">{doc.experienceYears || 5} yrs exp</div>
                    </td>

                    <td className="py-4 px-4 text-center text-xs font-bold text-primary">
                      {doc.patientsCount || 0}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Badge variant={getStatusBadgeVariant(doc.availabilityStatus)}>
                        {doc.availabilityStatus}
                      </Badge>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/doctors/${doc._id}`}
                          className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="View Doctor Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Edit Doctor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenDeleteModal(doc)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Server-Side Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="border-t border-border px-4">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPages}
                totalRecords={meta.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Create & Edit Doctor Modal */}
      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        doctor={selectedDoctor}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <DeleteDoctorModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        doctor={doctorToDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function DoctorsPageFallback() {
  return (
    <div className="space-y-6">
      {/* Top Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Doctors Directory</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage hospital medical staff, specialist schedules, and workload statistics.
          </p>
        </div>
        <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-primary text-primary-foreground font-semibold text-sm opacity-90">
          <span>+ Add New Doctor</span>
        </div>
      </div>

      {/* Search & Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded shadow-sm">
        <div className="flex-1 max-w-md h-9 bg-muted/40 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-40 h-9 bg-muted/40 rounded animate-pulse" />
          <div className="w-36 h-9 bg-muted/40 rounded animate-pulse" />
        </div>
      </div>

      {/* Skeleton Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="bg-card border border-border rounded p-4 shadow-sm animate-pulse space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-muted/60 flex-shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="h-4 bg-muted/60 rounded w-28" />
                  <div className="h-3 bg-muted/40 rounded w-20" />
                </div>
              </div>
              <div className="h-5 bg-muted/40 rounded-full w-16" />
            </div>
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="h-3 bg-muted/40 rounded w-full" />
              <div className="h-3 bg-muted/40 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<DoctorsPageFallback />}>
      <DoctorsPageContent />
    </Suspense>
  );
}
