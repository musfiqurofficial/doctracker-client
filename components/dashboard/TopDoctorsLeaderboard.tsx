'use client';

import React from 'react';
import { Star, Award, ChevronRight, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface DoctorPerformance {
  id: string;
  name: string;
  specialty: string;
  patientsCount: number;
  rating: number;
  efficiency: number;
}

interface TopDoctorsLeaderboardProps {
  doctors: DoctorPerformance[];
}

export const TopDoctorsLeaderboard: React.FC<TopDoctorsLeaderboardProps> = ({ doctors }) => {
  return (
    <div className="bg-card border border-border p-5 rounded shadow-sm flex flex-col justify-between space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-foreground tracking-tight">Top Performing Specialists</h3>
        </div>
        <Link
          href="/dashboard/doctors"
          className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Doctor list */}
      <div className="space-y-3">
        {doctors.map((doc, idx) => (
          <div
            key={doc.id}
            className="p-3 rounded border border-border/60 bg-background/50 hover:bg-accent/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                #{idx + 1}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground hover:text-primary transition-colors">
                  <Link href={`/dashboard/doctors/${doc.id}`}>{doc.name}</Link>
                </h4>
                <p className="text-[11px] text-muted-foreground">{doc.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-auto">
              <div className="text-right">
                <span className="text-xs font-extrabold text-foreground block">{doc.patientsCount} Patients</span>
                <span className="text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  {doc.rating} / 5.0
                </span>
              </div>

              {/* Progress Bar for Load Capacity */}
              <div className="w-20 hidden md:block">
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground mb-1">
                  <span>Capacity</span>
                  <span>{doc.efficiency}%</span>
                </div>
                <div className="w-full h-1.5 bg-accent rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-sm"
                    style={{ width: `${doc.efficiency}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 text-center border-t border-border/40">
        <span className="text-xs text-muted-foreground font-medium flex items-center justify-center gap-1">
          <UserCheck className="w-3.5 h-3.5 text-success" />
          All 5 top specialists active & accepting appointments today.
        </span>
      </div>
    </div>
  );
};
