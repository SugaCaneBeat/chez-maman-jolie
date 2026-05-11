"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

interface ToastContextValue {
  toast: {
    success: (title: string, description?: string) => void;
    error:   (title: string, description?: string) => void;
    info:    (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be inside ToastProvider");
  return ctx.toast;
}

const ICONS: Record<ToastVariant, ReactNode> = {
  success: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>,
  error:   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>,
  info:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warning: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
};

const STYLES: Record<ToastVariant, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error:   "bg-red-50 border-red-200 text-red-800",
  info:    "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2);
    const duration = variant === "error" ? 6000 : 3500;
    setToasts((prev) => [...prev, { id, variant, title, description, duration }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const toast = {
    success: (t: string, d?: string) => push("success", t, d),
    error:   (t: string, d?: string) => push("error",   t, d),
    info:    (t: string, d?: string) => push("info",    t, d),
    warning: (t: string, d?: string) => push("warning", t, d),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && createPortal(
        <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] sm:w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-[5px] border shadow-lg p-3 flex items-start gap-3 animate-slide-in-right ${STYLES[t.variant]}`}
            >
              <div className="flex-shrink-0 mt-0.5">{ICONS[t.variant]}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{t.title}</p>
                {t.description && <p className="text-xs opacity-80 mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="opacity-50 hover:opacity-100 flex-shrink-0"
                aria-label="Fermer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
