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

// Dynamically resolve Socket server URL from environment or API URL
const getSocketUrl = () => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, '').replace(/\/api\/?$/, '');
  }
  return 'http://localhost:5000';
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'init-1',
      title: 'Welcome Admin',
      message: 'Real-time notification system initialized.',
      type: 'info',
      timestamp: 'Just now',
      isRead: false,
    },
  ]);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    
    // Only attempt socket connection if URL exists
    const socketInstance = io(socketUrl, {
      transports: ['polling', 'websocket'], // Try HTTP polling first for Vercel compatibility
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 5000,
      withCredentials: true,
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('[SocketProvider] WebSocket connected to backend:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('connect_error', () => {
      // Gracefully handle socket connection timeout / fallback on serverless platforms
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('notification:new', (newNotif: NotificationItem) => {
      console.log('[SocketProvider] Live notification received:', newNotif);
      setNotifications((prev) => [
        { ...newNotif, isRead: false },
        ...prev.slice(0, 49), // Keep latest 50 notifications
      ]);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const emitTestNotification = async () => {
    try {
      const socketUrl = getSocketUrl();
      await fetch(`${socketUrl}/api/v1/notifications/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Manual System Test',
          message: 'Real-time notification alert triggered by Admin user.',
          type: 'success',
        }),
      });
    } catch (err) {
      console.error('Error emitting test notification:', err);
      // Fallback local push if server fetch fails
      setNotifications((prev) => [
        {
          id: `local-${Date.now()}`,
          title: 'Local Real-time Alert',
          message: 'Real-time WebSocket notification simulation active.',
          type: 'success',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRead: false,
        },
        ...prev,
      ]);
    }
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
