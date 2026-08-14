export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: {
    email: string;
  };
  retryAfterSeconds?: number;
  error?: any;
}

export interface AuditLogItem {
  _id: string;
  action: 'LOGIN' | 'LOGOUT';
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: AuditLogItem[];
}

export class ApiCustomError extends Error {
  statusCode: number;
  retryAfterSeconds?: number;

  constructor(message: string, statusCode: number, retryAfterSeconds?: number) {
    super(message);
    this.statusCode = statusCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function loginApi(credentials: LoginInput): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new ApiCustomError(
      data.message || 'Login failed. Please check your credentials.',
      response.status,
      data.retryAfterSeconds
    );
  }

  return data;
}

export async function logoutApi(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Logout failed.');
  }

  return data;
}

export async function getMeApi(): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Unauthorized');
  }

  return data;
}

export async function changePasswordApi(passwords: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(passwords),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to change password');
  }

  return data;
}

export async function updateProfileApi(profileData: { email: string }): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profileData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }

  return data;
}

export async function getAuditLogsApi(): Promise<AuditLogsResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/logs`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch audit logs');
  }

  return data;
}
