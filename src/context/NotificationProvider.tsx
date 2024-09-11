import React, { createContext, useContext, useState, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (type: NotificationType, message: string) => void;
  notification: Notification | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((type: NotificationType, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, notification }}>
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
