import { useNotification } from '@/context/NotificationProvider';
import React from 'react';

const Notification: React.FC = () => {
  const { notification } = useNotification();

  if (!notification) return null;

  const { type, message } = notification;

  const bgColors = {
    success: 'bg-green-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
    warning: 'bg-yellow-100',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${bgColors[type]} ${textColors[type]} flex items-center space-x-2`}>
      <span className="font-bold">{icons[type]}</span>
      <p>{message}</p>
    </div>
  );
};

export default Notification;
