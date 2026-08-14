'use client';

import React from 'react';
import { 
  Calendar, 
  Filter, 
  RefreshCw, 
  Download, 
  Search, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export interface FilterState {
  timeframe: string;
  department: string;
  status: string;
  searchQuery: string;
}

interface AnalyticsFilterBarProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  onReset: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isRefreshing: boolean;
}

export const AnalyticsFilterBar: React.FC<AnalyticsFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
  onRefresh,
  onExport,
  isRefreshing,
}) => {
  return (
    <div className="bg-card border border-border p-4 rounded shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Filter Title & Quick Search */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <Filter className="w-4 h-4 text-primary" />
            <span>Filter Analytics</span>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search doctor, condition..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange('searchQuery', e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Right Side: Action Buttons (Refresh & Export) */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-background border border-border text-muted-foreground hover:text-foreground text-xs font-medium hover:bg-accent transition-all shadow-sm"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-card border border-border text-foreground hover:bg-accent text-xs font-medium transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-border/50">
        {/* Timeframe Filter */}
        <div className="flex items-center gap-2 bg-background/60 border border-border rounded px-2.5 py-1">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Timeframe:</span>
          <select
            value={filters.timeframe}
            onChange={(e) => onFilterChange('timeframe', e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none w-full cursor-pointer"
          >
            <option value="7d" className="bg-card text-foreground">Last 7 Days</option>
            <option value="30d" className="bg-card text-foreground">Last 30 Days</option>
            <option value="90d" className="bg-card text-foreground">Last 90 Days</option>
            <option value="1y" className="bg-card text-foreground">This Year (2026)</option>
          </select>
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-2 bg-background/60 border border-border rounded px-2.5 py-1">
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Department:</span>
          <select
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-card text-foreground">All Departments</option>
            <option value="Cardiology" className="bg-card text-foreground">Cardiology</option>
            <option value="Neurology" className="bg-card text-foreground">Neurology</option>
            <option value="Pediatrics" className="bg-card text-foreground">Pediatrics</option>
            <option value="Orthopedics" className="bg-card text-foreground">Orthopedics</option>
            <option value="General Medicine" className="bg-card text-foreground">General Medicine</option>
          </select>
        </div>

        {/* Patient Status Filter */}
        <div className="flex items-center gap-2 bg-background/60 border border-border rounded px-2.5 py-1">
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground font-medium flex-shrink-0">Status:</span>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-card text-foreground">All Statuses</option>
            <option value="Active" className="bg-card text-foreground">Active / In Treatment</option>
            <option value="Discharged" className="bg-card text-foreground">Discharged</option>
            <option value="Critical" className="bg-card text-foreground">Critical Attention</option>
            <option value="Scheduled" className="bg-card text-foreground">Scheduled Consultation</option>
          </select>
        </div>
      </div>
    </div>
  );
};
