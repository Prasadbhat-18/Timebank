import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProps } from '../components/Notifications/Toast';

interface ToastContextType {
  showToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => void;
  showBookingNotification: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const showToast = useCallback((props: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const newToast = { ...props, id, onClose: removeToast };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const showBookingNotification = useCallback((title: string, message?: string) => {
    showToast({ type: 'booking', title, message, duration: 8000 });
  }, [showToast]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showBookingNotification }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
