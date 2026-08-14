import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && <label className="text-xs font-semibold text-foreground block">{label}</label>}
        <div className="relative w-full">
          <select
            ref={ref}
            className={cn(
              'w-full appearance-none pl-3 pr-8 py-2 text-xs font-medium bg-card border border-border rounded text-foreground hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer shadow-sm',
              error ? 'border-destructive focus:ring-destructive' : '',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-card text-foreground font-medium py-1">
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
        </div>
        {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
