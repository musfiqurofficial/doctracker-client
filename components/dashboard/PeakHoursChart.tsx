'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Clock, AlertCircle } from 'lucide-react';

interface HourlyDataPoint {
  hour: string;
  consultations: number;
  avgWaitMins: number;
}

interface PeakHoursChartProps {
  data: HourlyDataPoint[];
}

export const PeakHoursChart: React.FC<PeakHoursChartProps> = ({ data }) => {
  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-info" />
            <h3 className="text-base font-bold text-foreground tracking-tight">Clinic Consultation Peak Hours</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hourly patient density (Bar) vs. average patient wait time in minutes (Line).
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="hour"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#d14343"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              unit="m"
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
            <Bar
              yAxisId="left"
              dataKey="consultations"
              name="Consultations Handled"
              fill="#2e7fc9"
              radius={[4, 4, 0, 0]}
              barSize={24}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgWaitMins"
              name="Avg Wait Time (Mins)"
              stroke="#d14343"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#d14343' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Alert / Highlight */}
      <div className="p-3 rounded bg-warning/10 border border-warning/30 flex items-center justify-between text-xs text-warning">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Peak queue congestion occurs between <strong>10:00 AM – 11:30 AM</strong>.</span>
        </div>
        <span className="font-semibold text-foreground underline cursor-pointer">View Shift Plan</span>
      </div>
    </div>
  );
};
