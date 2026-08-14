'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AnalyticsKpiCards } from '@/components/dashboard/AnalyticsKpiCards';
import { PatientTrendsChart } from '@/components/dashboard/PatientTrendsChart';
import { DepartmentBarChart } from '@/components/dashboard/DepartmentBarChart';
import { ConditionPieChart } from '@/components/dashboard/ConditionPieChart';
import { PeakHoursChart } from '@/components/dashboard/PeakHoursChart';
import { TopDoctorsLeaderboard } from '@/components/dashboard/TopDoctorsLeaderboard';
import { RecentConsultationsTable } from '@/components/dashboard/RecentConsultationsTable';
import { getDashboardStatsApi } from '@/lib/api/dashboard';

export default function DashboardPage() {
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Live Real-Time Dashboard Stats from MongoDB
  const { data: statsResponse, isError, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStatsApi,
  });

  const stats = statsResponse?.data;

  const kpi = stats?.kpi || {
    totalDoctors: 0,
    totalPatients: 0,
    activeConsultations: 0,
    efficiencyRate: 100,
  };

  const trendData = stats?.trendData || [];
  const departmentData = stats?.departmentData || [];
  const conditionData = stats?.conditionData || [];
  const hourlyData = stats?.hourlyData || [];
  const topDoctors = stats?.topDoctors || [];
  const recentConsultations = stats?.recentConsultations || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="p-3 rounded bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs text-muted-foreground hover:text-foreground font-bold px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert Banner (Only if server query fails) */}
      {isError && (
        <div className="p-4 text-xs text-destructive font-medium bg-destructive/10 border border-destructive/20 rounded shadow-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Connection Notice: {(error as Error)?.message || 'Retrying database connection...'}</span>
        </div>
      )}

      {/* KPI Performance Cards (Grid Cols 2 Layout - Always Rendered Instantly) */}
      <AnalyticsKpiCards
        totalPatients={kpi.totalPatients}
        totalDoctors={kpi.totalDoctors}
        activeConsultations={kpi.activeConsultations}
        efficiencyRate={kpi.efficiencyRate}
        timeframeLabel="Live Database Stats"
      />

      {/* Primary Visualizations Grid (Broad Flow Chart + Pie Chart - Always Rendered Instantly) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PatientTrendsChart data={trendData} timeframeLabel="Live Patient Trends" />
        </div>
        <div className="lg:col-span-1">
          <ConditionPieChart data={conditionData} />
        </div>
      </div>

      {/* Secondary Visualizations Grid (Department Bar Chart + Peak Hours Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DepartmentBarChart data={departmentData} />
        <PeakHoursChart data={hourlyData} />
      </div>

      {/* Bottom Section: Top Doctors Leaderboard + Recent Consultations Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TopDoctorsLeaderboard doctors={topDoctors} />
        </div>
        <div className="lg:col-span-2">
          <RecentConsultationsTable consultations={recentConsultations} />
        </div>
      </div>
    </div>
  );
}
