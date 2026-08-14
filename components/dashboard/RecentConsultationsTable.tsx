'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Activity, ExternalLink, Calendar, User } from 'lucide-react';
import Link from 'next/link';

export interface ConsultationItem {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  doctorName: string;
  specialty: string;
  condition: string;
  status: 'Active' | 'Discharged' | 'Critical' | 'Scheduled';
  date: string;
}

interface RecentConsultationsTableProps {
  consultations: ConsultationItem[];
}

export const RecentConsultationsTable: React.FC<RecentConsultationsTableProps> = ({
  consultations,
}) => {
  const getBadgeVariant = (status: ConsultationItem['status']) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Discharged':
        return 'default';
      case 'Critical':
        return 'destructive';
      case 'Scheduled':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-success" />
          <h3 className="text-base font-bold text-foreground tracking-tight">Recent Patient Consultations</h3>
        </div>
        <Link
          href="/dashboard/patients"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5"
        >
          <span>View All Patients</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table / List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-background/50">
              <th className="py-2.5 px-3">Patient Name</th>
              <th className="py-2.5 px-3">Condition</th>
              <th className="py-2.5 px-3">Assigned Doctor</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {consultations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                  No consultations match the selected filters.
                </td>
              </tr>
            ) : (
              consultations.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span>{item.patientName}</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({item.age}y, {item.gender})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-foreground">{item.condition}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-foreground">{item.doctorName}</div>
                    <div className="text-[10px] text-muted-foreground">{item.specialty}</div>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={getBadgeVariant(item.status)}>{item.status}</Badge>
                  </td>
                  <td className="py-3 px-3 text-right text-muted-foreground font-medium">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
