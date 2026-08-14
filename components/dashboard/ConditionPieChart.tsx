'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Sector
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface ConditionDataPoint {
  name: string;
  value: number;
  percentage: number;
}

interface ConditionPieChartProps {
  data: ConditionDataPoint[];
}

export const ConditionPieChart: React.FC<ConditionPieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const COLORS = ['#c2941b', '#6c5ce7', '#2e9563', '#2e7fc9', '#d14343'];

  // Custom active shape for pie chart slice focus
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percentage } = props;

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="font-extrabold text-sm">
          {payload.name}
        </text>
        <text x={cx} y={cy + 12} dy={8} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="font-medium text-xs">
          {`${value} cases (${percentage}%)`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 6}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 8}
          outerRadius={outerRadius + 12}
          fill={fill}
          opacity={0.4}
        />
      </g>
    );
  };

  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-primary" />
            <h3 className="text-base font-bold text-foreground tracking-tight">Patient Conditions & Diagnosis</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Proportional distribution of diagnosed patient conditions.
          </p>
        </div>
      </div>

      {/* Donut Chart Canvas */}
      <div className="w-full h-72 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown Legend Chips */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
        {data.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`p-2 rounded border cursor-pointer transition-all flex items-center justify-between ${
              activeIndex === idx
                ? 'bg-accent border-primary/40 shadow-sm'
                : 'bg-background/50 border-border/30 hover:bg-accent/40'
            }`}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-xs font-semibold text-foreground truncate">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-muted-foreground ml-1">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
