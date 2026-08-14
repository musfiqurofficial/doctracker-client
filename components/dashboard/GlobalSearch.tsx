'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Stethoscope, User, ArrowRight, X, Loader2 } from 'lucide-react';
import { getDoctorsApi } from '@/lib/api/doctors';
import { getPatientsApi, PatientItem } from '@/lib/api/patients';
import { Doctor } from '@/types/doctor';

export function GlobalSearch() {
  const router = useRouter();
  const pathname = usePathname();

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [doctorResults, setDoctorResults] = useState<Doctor[]>([]);
  const [patientResults, setPatientResults] = useState<PatientItem[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search query effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setDoctorResults([]);
      setPatientResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const [docRes, patRes] = await Promise.all([
          getDoctorsApi({ search: query, limit: 3 }),
          getPatientsApi({ search: query, limit: 3 }),
        ]);

        setDoctorResults(docRes?.data || []);
        setPatientResults(patRes?.data?.patients || []);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false);
      if (pathname.includes('/patients')) {
        router.push(`/dashboard/patients?search=${encodeURIComponent(query.trim())}`);
      } else {
        router.push(`/dashboard/doctors?search=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSelectDoctor = (docId: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/doctors/${docId}`);
  };

  const handleSelectPatient = (patientName: string) => {
    setIsOpen(false);
    setQuery('');
    router.push(`/dashboard/patients?search=${encodeURIComponent(patientName)}`);
  };

  return (
    <div ref={dropdownRef} className="relative hidden md:block w-64 lg:w-72">
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 absolute left-3 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search doctors, patients, conditions..."
          className="w-full pl-8 pr-8 py-1.5 text-xs rounded bg-muted/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
        />
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 absolute right-2.5 text-primary animate-spin" />
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-2.5 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Floating Results Dropdown */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 w-80 sm:w-96 bg-card border border-border rounded shadow-md z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pb-1 border-b border-border">
            <span>Global Search Results</span>
            <span>Press Enter to View All</span>
          </div>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>Searching clinical database...</span>
            </div>
          ) : doctorResults.length === 0 && patientResults.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No matching doctors or patients found for "{query}".
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Doctor Matches Section */}
              {doctorResults.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" />
                    <span>Doctors ({doctorResults.length})</span>
                  </div>
                  <div className="space-y-1">
                    {doctorResults.map((doc) => (
                      <div
                        key={doc._id}
                        onClick={() => handleSelectDoctor(doc._id)}
                        className="p-2 rounded bg-muted/40 hover:bg-accent cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {doc.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {doc.specialty} • {doc.department}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Patient Matches Section */}
              {patientResults.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" />
                    <span>Patients ({patientResults.length})</span>
                  </div>
                  <div className="space-y-1">
                    {patientResults.map((pat) => (
                      <div
                        key={pat._id}
                        onClick={() => handleSelectPatient(pat.name)}
                        className="p-2 rounded bg-muted/40 hover:bg-accent cursor-pointer flex items-center justify-between transition-colors group"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            {pat.name} ({pat.age} yrs)
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {pat.condition} • {pat.status.toUpperCase()}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
