import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none'
        }}
        aria-live="polite"
        aria-label="Notifications"
        role="status"
      >
        {toasts.map(toast => {
          let bg = '#10B981';
          let icon = <CheckCircle2 size={18} color="#FFFFFF" />;
          if (toast.type === 'error') {
            bg = '#EF4444';
            icon = <AlertCircle size={18} color="#FFFFFF" />;
          } else if (toast.type === 'info') {
            bg = '#7541C8';
            icon = <Info size={18} color="#FFFFFF" />;
          }

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: '#FFFFFF',
                borderRadius: 14,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
                border: '1px solid #E5E7EB',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                minWidth: 280,
                maxWidth: 420,
                animation: 'slideUp 0.25s ease-out'
              }}
            >
              <div
                style={{
                  background: bg,
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: '#1F2937' }}>
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                style={{ color: '#9CA3AF', padding: 4, display: 'flex' }}
                aria-label="Dismiss notification"
                type="button"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
