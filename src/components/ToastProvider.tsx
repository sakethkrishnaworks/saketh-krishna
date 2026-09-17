'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ConfirmRequest {
  message: string;
  resolve: (ok: boolean) => void;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  confirm: (message: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Non-fatal fallback so components can't crash if rendered outside the
    // provider during tests or isolated mounting.
    return {
      toast: (message: string) => console.info(message),
      confirm: async () => false,
    };
  }
  return ctx;
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100',
  error: 'border-red-500/30 bg-red-950/95 text-red-100',
  info: 'border-white/15 bg-[#1a1a1a]/95 text-white',
  warning: 'border-amber-500/30 bg-amber-950/95 text-amber-100',
};

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  }, []);

  const confirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setConfirmRequest({ message, resolve });
    });
  }, []);

  const resolveConfirm = useCallback(
    (ok: boolean) => {
      confirmRequest?.resolve(ok);
      setConfirmRequest(null);
    },
    [confirmRequest]
  );

  return (
    <ToastContext.Provider value={{ toast, confirm }}>
      {children}

      {/* Toast stack */}
      <div className="fixed top-16 left-4 right-4 z-[300] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-sans shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300 ${TOAST_STYLES[t.type]}`}
              role="status"
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="leading-relaxed">{t.message}</span>
            </div>
          );
        })}
      </div>

      {/* Confirm dialog */}
      {confirmRequest && (
        <div className="fixed inset-0 z-[310] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#161615] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-5">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="font-sans text-sm text-white leading-relaxed">{confirmRequest.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => resolveConfirm(false)}
                className="flex-1 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-sans text-[10px] font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveConfirm(true)}
                className="flex-1 py-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 font-sans text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/30 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
