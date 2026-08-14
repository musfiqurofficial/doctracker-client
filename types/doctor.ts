export interface Doctor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  availabilityStatus: 'Available' | 'On Leave' | 'Busy';
  bio?: string;
  patientsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorInput {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  department: string;
  qualification?: string;
  experienceYears?: number;
  consultationFee?: number;
  availabilityStatus?: 'Available' | 'On Leave' | 'Busy';
  bio?: string;
}

export interface DoctorsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  specialty?: string;
  department?: string;
  status?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalPage?: number;
}

export interface DoctorsApiResponse {
  success: boolean;
  message?: string;
  data: Doctor[];
  meta?: PaginationMeta;
}

export interface SingleDoctorApiResponse {
  success: boolean;
  message?: string;
  data: Doctor;
}
