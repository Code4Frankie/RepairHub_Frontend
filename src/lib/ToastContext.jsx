import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info') => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const toastError = useCallback((err) => toast(err?.message || 'Something went wrong', 'error'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, toastError }}>
      {children}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[448px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`mb-2 rounded-[7px] px-3.5 py-2.5 text-[13px] text-white shadow-lg ${
              t.type === 'error' ? 'bg-alert' : t.type === 'success' ? 'bg-success' : 'bg-ink'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
