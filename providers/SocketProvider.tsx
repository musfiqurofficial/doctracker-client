'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'destructive';
  timestamp: string;
  isRead?: boolean;
  link?: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  emitTestNotification: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  notifications: [],
  unreadCount: 0,
  markAllAsRead: () => {},
  clearNotifications: () => {},
  emitTestNotification: () => {},
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'init-1',
      title: 'Welcome Admin',
      message: 'Real-time notification system active.',
      type: 'info',
      timestamp: 'Just now',
      isRead: false,
    },
  ]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    // Skip WebSocket connection on Vercel serverless production unless explicit socket server URL is provided
    if (!socketUrl && !isLocalhost) {
      return;
    }

    const targetUrl = socketUrl || 'http://localhost:5000';
    let socketInstance: Socket | null = null;

    try {
      socketInstance = io(targetUrl, {
        transports: ['websocket', 'polling'],
        reconnection: false,
        timeout: 3000,
        withCredentials: true,
      });

      socketInstance.on('connect', () => {
        setIsConnected(true);
      });

      socketInstance.on('connect_error', () => {
        setIsConnected(false);
        if (socketInstance) {
          socketInstance.disconnect();
        }
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('notification:new', (newNotif: NotificationItem) => {
        setNotifications((prev) => [
          { ...newNotif, isRead: false },
          ...prev.slice(0, 49),
        ]);
      });

      setSocket(socketInstance);
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const emitTestNotification = async () => {
    setNotifications((prev) => [
      {
        id: `local-${Date.now()}`,
        title: 'System Notification',
        message: 'Doctor Tracker real-time notification alert active.',
        type: 'success',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      },
      ...prev,
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        markAllAsRead,
        clearNotifications,
        emitTestNotification,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}
