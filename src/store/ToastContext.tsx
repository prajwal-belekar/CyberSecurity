import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X } from 'lucide-react';
import type { ToastMessage } from '@/types/system';
import type { Severity } from '@/types/common';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';

interface ToastContextValue {
  push: (toast: Omit<ToastMessage, 'id'>) => void;
  dismiss: (id: string) => void;
  /** Convenience helpers used by mutation handlers across the app. */
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  alert: (severity: Severity, title: string, description?: string, href?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<Severity, ReactNode> = {
  critical: <ShieldAlert className="size-4" aria-hidden />,
  high: <AlertTriangle className="size-4" aria-hidden />,
  medium: <AlertTriangle className="size-4" aria-hidden />,
  low: <Info className="size-4" aria-hidden />,
  info: <CheckCircle2 className="size-4" aria-hidden />,
};

export function ToastProvider({ children, enabled = true }: { children: ReactNode; enabled?: boolean }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    if (!enabled) return;
    counter.current += 1;
    const id = `toast-${counter.current}-${Date.now()}`;
    const next: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev.slice(-4), next]);
    const duration = toast.durationMs ?? (toast.severity === 'critical' || toast.severity === 'high' ? 7000 : 4200);
    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss, enabled]);

  const value = useMemo<ToastContextValue>(() => ({
    push,
    dismiss,
    success: (title, description) => push({ severity: 'info', title, description }),
    error: (title, description) => push({ severity: 'critical', title, description }),
    info: (title, description) => push({ severity: 'low', title, description }),
    alert: (severity, title, description, href) => push({ severity, title, description, href }),
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-3 bottom-3 z-[120] flex w-[min(360px,calc(100vw-1.5rem))] flex-col gap-1.5"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const meta = severityMeta(toast.severity);
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                role="status"
                aria-live={toast.severity === 'critical' || toast.severity === 'high' ? 'assertive' : 'polite'}
                className={cn('panel pointer-events-auto overflow-hidden border-l-2 bg-base/98 shadow-[0_14px_40px_rgba(0,0,0,0.75)]')}
                style={{ borderLeftColor: meta.hex }}
              >
                <div className="flex items-start gap-2.5 p-2.5">
                  <span className={cn('mt-px shrink-0', meta.text)}>{ICONS[toast.severity]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className={cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.02em] uppercase', meta.text)}>
                        {meta.label}
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink">{toast.title}</p>
                    </div>
                    {toast.description ? (
                      <p className="mono mt-1 text-[10.5px] leading-relaxed break-words text-ink-3">{toast.description}</p>
                    ) : null}
                    {toast.href ? (
                      <a
                        href={toast.href}
                        onClick={() => dismiss(toast.id)}
                        className="mt-1.5 inline-block text-[11px] tracking-[0.01em] text-term underline-offset-2 hover:underline"
                      >
                        Open →
                      </a>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded-[2px] p-0.5 text-ink-4 transition-colors hover:bg-raised hover:text-ink"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
