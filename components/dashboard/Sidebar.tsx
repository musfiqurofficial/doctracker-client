'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  ChevronLeft,
  ChevronRight,
  Activity,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutApi } from '@/lib/api/auth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Doctors',
    href: '/dashboard/doctors',
    icon: Stethoscope,
  },
  {
    name: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
  },
  {
    name: 'Admin Profile',
    href: '/dashboard/profile',
    icon: ShieldCheck,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleMobile = () => setIsMobileOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.push('/secretlogin');
      router.refresh();
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={toggleMobile}
          className="p-2.5 rounded bg-card border border-border text-foreground shadow-sm hover:bg-accent transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed lg:static top-0 left-0 z-40 h-screen bg-card border-r border-border flex flex-col justify-between transition-all duration-300 ease-in-out shadow-sm lg:shadow-none relative group',
          // Desktop Width
          isCollapsed ? 'lg:w-20' : 'lg:w-64',
          // Mobile Sliding Drawer
          isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0'
        )}
      >
        {/* Floating Minimize/Maximize Button on Sidebar Right Border */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent shadow-sm items-center justify-center transition-transform hover:scale-110 focus:outline-none"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Top Header & Logo */}
        <div>
          <div className="h-16 flex items-center px-4 border-b border-border">
            <Link href="/dashboard" className="flex items-center overflow-hidden">
              {!isCollapsed || isMobileOpen ? (
                <div className="flex flex-col min-w-0">
                  <span className="font-extrabold text-xl tracking-tight whitespace-nowrap flex items-center">
                    <span className="text-primary">Doc</span>
                    <span className="text-foreground">Tracker</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest whitespace-nowrap -mt-0.5">
                    Admin Portal
                  </span>
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <span className="font-black text-xl text-primary tracking-tighter">DT</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-3 rounded font-medium text-sm transition-all duration-200 group relative',
                    isCollapsed && !isMobileOpen ? 'justify-center px-0' : '',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110')} />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="whitespace-nowrap truncate">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-3 border-t border-border">
          {isCollapsed && !isMobileOpen ? (
            /* Minimized State: Only Logout Icon Button Centered */
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-all duration-200"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            /* Expanded State: Admin Info on Left + Logout Icon on Right */
            <div className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border/50 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 shadow-sm">
                  A
                </div>
                <div className="flex flex-col min-w-0 overflow-hidden">
                  <span className="text-xs font-semibold text-foreground truncate">System Admin</span>
                  <span className="text-[10px] text-muted-foreground truncate">admin@doctracker.com</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 flex-shrink-0"
                aria-label="Logout"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
