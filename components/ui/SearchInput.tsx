'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  value: controlledValue,
  defaultValue = '',
  onChange,
  debounceMs = 300,
  className,
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(controlledValue !== undefined ? controlledValue : defaultValue);
  const isFirstRender = useRef(true);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchTerm(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (onChangeRef.current) {
        onChangeRef.current(searchTerm);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [searchTerm, debounceMs]);

  return (
    <div className={cn('relative flex items-center w-full max-w-sm', className)}>
      <Search className="w-4 h-4 absolute left-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 rounded bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-3 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
