import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { ToastMessage as ToastMessageType } from '../types'; // Renamed to avoid conflict
import Toast from '../components/Toast';

interface ToastContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastMessageType | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  );
};
