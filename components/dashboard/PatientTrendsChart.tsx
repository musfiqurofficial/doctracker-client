'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface TrendDataPoint {
  date: string;
  totalVisits: number;
  newPatients: number;
  consultations: number;
}

interface PatientTrendsChartProps {
  data: TrendDataPoint[];
  timeframeLabel: string;
}

export const PatientTrendsChart: React.FC<PatientTrendsChartProps> = ({ data, timeframeLabel }) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'consultations' | 'patients'>('all');

  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-foreground tracking-tight">Patient Registration & Consultation Flow</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Comparative analysis of daily patient consultations vs newly registered patients ({timeframeLabel}).
          </p>
        </div>

        {/* Toggle switches */}
        <div className="flex items-center gap-1 bg-background border border-border p-1 rounded">
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap ${
              activeMetric === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setActiveMetric('consultations')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap ${
              activeMetric === 'consultations'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Consultations
          </button>
          <button
            onClick={() => setActiveMetric('patients')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap ${
              activeMetric === 'patients'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            New Patients
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-88 min-h-[340px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c2941b" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#c2941b" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6c5ce7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6c5ce7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                borderRadius: '4px',
                color: 'hsl(var(--foreground))',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: 'hsl(var(--foreground))' }}
              iconType="circle"
            />
            {(activeMetric === 'all' || activeMetric === 'consultations') && (
              <Area
                type="monotone"
                dataKey="consultations"
                name="Doctor Consultations"
                stroke="#c2941b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorConsultations)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
              />
            )}
            {(activeMetric === 'all' || activeMetric === 'patients') && (
              <Area
                type="monotone"
                dataKey="newPatients"
                name="Newly Registered Patients"
                stroke="#6c5ce7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPatients)"
                activeDot={{ r: 5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Insight */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40">
        <span className="flex items-center gap-1.5 font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-success" />
          Peak patient flow recorded during active clinical shifts.
        </span>
        <span className="font-semibold text-foreground">Updated in real-time</span>
      </div>
    </div>
  );
};
