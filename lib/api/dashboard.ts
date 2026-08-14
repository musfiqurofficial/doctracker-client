const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface DashboardStatsResponse {
  success: boolean;
  statusCode: number;
  message?: string;
  data?: {
    kpi: {
      totalDoctors: number;
      totalPatients: number;
      activeConsultations: number;
      efficiencyRate: number;
    };
    departmentData: Array<{
      department: string;
      patientCount: number;
      doctorCount: number;
    }>;
    conditionData: Array<{
      name: string;
      value: number;
      percentage: number;
    }>;
    topDoctors: Array<{
      id: string;
      name: string;
      specialty: string;
      patientsCount: number;
      rating: number;
      efficiency: number;
    }>;
    recentConsultations: Array<{
      id: string;
      patientName: string;
      age: number;
      gender: string;
      doctorName: string;
      specialty: string;
      condition: string;
      status: 'Active' | 'Discharged' | 'Critical' | 'Scheduled';
      date: string;
    }>;
    trendData: Array<{
      date: string;
      totalVisits: number;
      newPatients: number;
      consultations: number;
    }>;
    hourlyData: Array<{
      hour: string;
      consultations: number;
      avgWaitMins: number;
    }>;
  };
}

export async function getDashboardStatsApi(): Promise<DashboardStatsResponse> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch dashboard analytics');
  }

  return data;
}
