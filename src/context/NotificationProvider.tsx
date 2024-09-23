import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: React.ReactNode[];
}

interface NotificationContextType {
  showNotification: (type: NotificationType, ...message: React.ReactNode[]) => void;
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
let TOTAL_ID = 0;

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const showNotification = useCallback((type: NotificationType, ...message: React.ReactNode[]) => {
    const id = TOTAL_ID.toString();
    TOTAL_ID += 1;
    setNotifications(prev => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 10000);
  }, [removeNotification]);

  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      const msg = (() => {
        if (typeof event.reason === "object" && event.reason !== null) {
          const { name, message, stack, cause } = event.reason;
          return JSON.stringify({ name, message, stack, cause });
        }
        if (typeof event.reason === "string") {
          return event.reason;
        }
        return JSON.stringify(event);
      })();
      showNotification("error", "Unknown error", msg);
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, [showNotification]);


  return (
    <NotificationContext.Provider value={{ notifications, showNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
