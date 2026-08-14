export interface PatientItem {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  status: 'stable' | 'recovering' | 'critical';
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
    email?: string;
  } | string;
  visitDate: string;
  createdAt?: string;
}

export interface PatientResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: {
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    patients: PatientItem[];
  };
}

export interface SinglePatientResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: PatientItem;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function getPatientsApi(params?: {
  page?: number;
  limit?: number;
  search?: string;
  condition?: string;
  status?: string;
  doctorId?: string;
}): Promise<PatientResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.condition && params.condition !== 'all') queryParams.append('condition', params.condition);
  if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params?.doctorId) queryParams.append('doctorId', params.doctorId);

  const response = await fetch(`${API_BASE_URL}/patients?${queryParams.toString()}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch patients list');
  }

  return data;
}

export async function createPatientApi(patientData: {
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  status?: 'stable' | 'recovering' | 'critical';
  doctorId: string;
  visitDate?: string;
}): Promise<SinglePatientResponse> {
  const response = await fetch(`${API_BASE_URL}/patients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(patientData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create patient record');
  }

  return data;
}

export async function updatePatientApi(
  id: string,
  patientData: Partial<{
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    condition: string;
    status: 'stable' | 'recovering' | 'critical';
    doctorId: string;
    visitDate: string;
  }>
): Promise<SinglePatientResponse> {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(patientData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update patient record');
  }

  return data;
}

export async function deletePatientApi(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/patients/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete patient record');
  }

  return data;
}
