"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const success = (msg: string) => addToast(msg, "success");
  const error = (msg: string) => addToast(msg, "error");
  const info = (msg: string) => addToast(msg, "info");
  const warning = (msg: string) => addToast(msg, "warning");

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none'
      }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              style={{
                pointerEvents: 'auto',
                minWidth: '300px',
                maxWidth: '450px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                borderRadius: '16px',
                padding: '1rem 1.25rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                border: `1px solid ${
                  t.type === 'success' ? '#dcfce7' : 
                  t.type === 'error' ? '#fecaca' : 
                  t.type === 'warning' ? '#fef08a' : '#e0f2fe'
                }`
              }}
            >
              <div style={{
                color: t.type === 'success' ? '#16a34a' : 
                       t.type === 'error' ? '#dc2626' : 
                       t.type === 'warning' ? '#ca8a04' : '#0284c7'
              }}>
                {t.type === 'success' && <CheckCircle2 size={24} />}
                {t.type === 'error' && <AlertCircle size={24} />}
                {t.type === 'warning' && <AlertTriangle size={24} />}
                {t.type === 'info' && <Info size={24} />}
              </div>
              
              <div style={{ flex: 1, fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.4' }}>
                {t.message}
              </div>

              <button
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                <X size={18} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
