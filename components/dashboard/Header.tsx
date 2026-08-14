'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { GlobalSearch } from '@/components/dashboard/GlobalSearch';

export function Header() {
  const pathname = usePathname();

  // Generate dynamic breadcrumbs array based on active route
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);

    // Base breadcrumb item
    const crumbs = [
      { label: 'Dashboard', href: '/dashboard', isCurrent: segments.length === 1 }
    ];

    if (segments.includes('doctors')) {
      const isDoctorDetail = segments.length > 2;
      crumbs.push({
        label: 'Doctors Directory',
        href: '/dashboard/doctors',
        isCurrent: !isDoctorDetail,
      });

      if (isDoctorDetail) {
        crumbs.push({
          label: 'Doctor Profile',
          href: pathname,
          isCurrent: true,
        });
      }
    } else if (segments.includes('patients')) {
      crumbs.push({
        label: 'Patients Directory',
        href: '/dashboard/patients',
        isCurrent: true,
      });
    } else if (segments.includes('analytics')) {
      crumbs.push({
        label: 'Analytics Dashboard',
        href: '/dashboard/analytics',
        isCurrent: true,
      });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 shrink-0 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between transition-colors shadow-sm">
      {/* Dynamic Breadcrumbs Navigation */}
      <div className="pl-10 lg:pl-0 flex items-center gap-1.5 text-xs">
        <Link
          href="/dashboard"
          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-accent transition-colors flex items-center gap-1.5"
          title="Go to Dashboard Home"
        >
          <LayoutDashboard className="w-4 h-4 text-primary" />
        </Link>

        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href + idx}>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />

            {crumb.isCurrent ? (
              <span className="font-bold text-foreground bg-accent/60 px-2 py-1 rounded text-xs">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="font-medium text-muted-foreground hover:text-foreground hover:underline transition-colors px-1 py-0.5 rounded"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-3">
        {/* Global Real-Time Search Bar */}
        <GlobalSearch />

        {/* Theme Toggle Button */}
        <ThemeToggle isInline />

        {/* Real-time WebSocket Notifications Dropdown */}
        <NotificationDropdown />

        {/* Admin User Badge */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 pl-2 border-l border-border hover:opacity-80 transition-opacity"
          title="Admin Profile Settings"
        >
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shadow-sm">
            A
          </div>
          <div className="hidden xl:flex flex-col">
            <span className="text-xs font-semibold text-foreground">Admin Portal</span>
            <span className="text-[10px] text-success font-medium">Online</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
