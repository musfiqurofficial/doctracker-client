'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Check, 
  Trash2, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Wifi,
  WifiOff,
  Send
} from 'lucide-react';
import { useSocket, NotificationItem } from '@/providers/SocketProvider';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { 
    isConnected, 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearNotifications,
    emitTestNotification 
  } = useSocket();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0" />;
      case 'destructive':
        return <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-info flex-shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen && unreadCount > 0) {
            markAllAsRead();
          }
        }}
        className="p-2 rounded border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all shadow-sm relative"
        aria-label="Notifications"
        title="Real-time Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded bg-primary animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded bg-primary" />
          </>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-96 bg-card border border-border rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3.5 border-b border-border bg-background/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-foreground">Notifications</span>
              
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              {notifications.length > 0 && (
                <>
                  <button
                    onClick={markAllAsRead}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={clearNotifications}
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* List of notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Bell className="w-6 h-6 text-muted-foreground/40" />
                <span>No new notifications</span>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 hover:bg-accent/40 transition-colors flex items-start gap-3 relative ${
                    !notif.isRead ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-foreground truncate">{notif.title}</h4>
                      <span className="text-[10px] text-muted-foreground font-medium flex-shrink-0">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 break-words">
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 self-center" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="p-2.5 border-t border-border bg-background/50 text-center text-[10px] text-muted-foreground font-medium">
            Doctor Tracker Real-Time Event Bus
          </div>
        </div>
      )}
    </div>
  );
}
