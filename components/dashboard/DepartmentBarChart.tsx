'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Building2 } from 'lucide-react';

interface DepartmentDataPoint {
  department: string;
  patientCount: number;
  doctorCount: number;
}

interface DepartmentBarChartProps {
  data: DepartmentDataPoint[];
}

export const DepartmentBarChart: React.FC<DepartmentBarChartProps> = ({ data }) => {
  const COLORS = ['#c2941b', '#6c5ce7', '#2e9563', '#2e7fc9', '#c98a2e'];

  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-secondary" />
            <h3 className="text-base font-bold text-foreground tracking-tight">Department Workload Distribution</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Patient load and assigned specialists per department.
          </p>
        </div>
      </div>

      {/* Bar Chart Canvas */}
      <div className="w-full h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis
              dataKey="department"
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
              iconType="square"
            />
            <Bar
              dataKey="patientCount"
              name="Active Patients"
              radius={[4, 4, 0, 0]}
              barSize={28}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
            <Bar
              dataKey="doctorCount"
              name="Specialist Doctors"
              fill="hsl(var(--muted-foreground))"
              opacity={0.35}
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer statistics list */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
        <div className="p-2 rounded bg-accent/50 border border-border/30">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Top Dept</span>
          <span className="text-xs font-bold text-foreground">Cardiology</span>
        </div>
        <div className="p-2 rounded bg-accent/50 border border-border/30">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Avg per Dept</span>
          <span className="text-xs font-bold text-foreground">32 Patients</span>
        </div>
        <div className="p-2 rounded bg-accent/50 border border-border/30">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Doctor Ratio</span>
          <span className="text-xs font-bold text-foreground">1 : 7.2</span>
        </div>
      </div>
    </div>
  );
};
