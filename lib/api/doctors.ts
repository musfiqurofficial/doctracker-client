import { Doctor, DoctorInput, DoctorsQueryParams, DoctorsApiResponse, SingleDoctorApiResponse } from '@/types/doctor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function getDoctorsApi(params: DoctorsQueryParams = {}): Promise<DoctorsApiResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page.toString());
  if (params.limit) query.append('limit', params.limit.toString());
  if (params.search) query.append('search', params.search);
  if (params.specialty && params.specialty !== 'all') query.append('specialty', params.specialty);
  if (params.department && params.department !== 'all') query.append('department', params.department);
  if (params.status && params.status !== 'all') query.append('status', params.status);

  const res = await fetch(`${API_BASE_URL}/doctors?${query.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch doctors');
  }

  return data;
}

export async function getDoctorByIdApi(id: string): Promise<SingleDoctorApiResponse> {
  const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch doctor details');
  }

  return data;
}

export async function createDoctorApi(input: DoctorInput): Promise<SingleDoctorApiResponse> {
  const res = await fetch(`${API_BASE_URL}/doctors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to create doctor');
  }

  return data;
}

export async function updateDoctorApi(id: string, input: Partial<DoctorInput>): Promise<SingleDoctorApiResponse> {
  const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to update doctor');
  }

  return data;
}

export async function deleteDoctorApi(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete doctor');
  }

  return data;
}

export async function getDoctorPatientsApi(id: string, page = 1, limit = 10) {
  const res = await fetch(`${API_BASE_URL}/doctors/${id}/patients?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch assigned patients');
  }

  return data;
}
