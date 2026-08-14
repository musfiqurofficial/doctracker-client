'use client';

import React from 'react';
import { 
  Users, 
  Stethoscope, 
  Activity, 
  TrendingUp, 
  HeartPulse,
  ShieldCheck
} from 'lucide-react';

interface KpiDataProps {
  totalPatients: number;
  totalDoctors: number;
  activeConsultations: number;
  efficiencyRate: number;
  timeframeLabel: string;
}

export const AnalyticsKpiCards: React.FC<KpiDataProps> = ({
  totalPatients,
  totalDoctors,
  activeConsultations,
  efficiencyRate,
  timeframeLabel,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side: Featured Big Total Patients Card */}
      <div className="bg-card border border-border p-6 rounded shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded bg-primary/10 border border-primary/20 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Total Patients Directory
              </span>
              <span className="text-[11px] text-muted-foreground">Live MongoDB Patient Registry</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Real-time</span>
          </span>
        </div>

        {/* Big Number & Core Info */}
        <div className="my-2 space-y-1">
          <div className="text-4xl font-extrabold text-foreground tracking-tight flex items-baseline gap-3">
            <span>{totalPatients.toLocaleString()}</span>
            <span className="text-xs font-semibold text-muted-foreground">Total Registered</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Active clinical database containing registered patient records, assigned specialists, and treatment histories.
          </p>
        </div>

        {/* Sub-metrics Roster Strip */}
        <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded text-center border border-border/40">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">In Database</span>
            <span className="font-extrabold text-foreground text-sm">{totalPatients}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Active Cases</span>
            <span className="font-extrabold text-warning text-sm">{activeConsultations}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Recovery</span>
            <span className="font-extrabold text-success text-sm">{efficiencyRate}%</span>
          </div>
        </div>

        {/* Sparkline Progress Bar */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Database Synchronized</span>
          </span>
          <span className="text-[11px] font-bold text-foreground">{timeframeLabel}</span>
        </div>
      </div>

      {/* Right Side: Grid of 3 Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 flex-col justify-between">
        {/* Active Doctors */}
        <div className="bg-card border border-border p-4 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Active Doctors
            </span>
            <div className="text-xl font-extrabold text-foreground tracking-tight">
              {totalDoctors} <span className="text-xs font-semibold text-muted-foreground">Specialists</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Doctor Directory Roster</p>
          </div>
          <div className="p-3 rounded bg-secondary/10 border border-secondary/20 text-secondary flex-shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Active Patient Cases */}
        <div className="bg-card border border-border p-4 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Active Patient Cases
            </span>
            <div className="text-xl font-extrabold text-warning tracking-tight">
              {activeConsultations} <span className="text-xs font-semibold text-muted-foreground">Cases</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Recovering & Critical Patients</p>
          </div>
          <div className="p-3 rounded bg-warning/10 border border-warning/20 text-warning flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="bg-card border border-border p-4 rounded shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Recovery Rate
            </span>
            <div className="text-xl font-extrabold text-success tracking-tight">
              {efficiencyRate}% <span className="text-xs font-semibold text-muted-foreground">Success</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Patient Discharge Ratio</p>
          </div>
          <div className="p-3 rounded bg-success/10 border border-success/20 text-success flex-shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};
