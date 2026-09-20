import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
  /** Destructive confirmation styling. */
  tone?: 'default' | 'danger';
}

/** Fade + scale modal for confirmations and forms. */
export function Modal({ open, onClose, title, description, children, footer, width = 'max-w-lg', tone = 'default' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="presentation">
          <motion.div
            className="absolute inset-0 bg-black/65"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Dialog'}
            className={cn(
              'panel relative flex w-full flex-col overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)]',
              width, tone === 'danger' && 'border-critical/45',
            )}
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className={cn(
              'flex items-start gap-3 border-b px-3 py-2.5',
              tone === 'danger' ? 'border-critical/25 bg-critical/5' : 'border-line bg-panel-2',
            )}>
              <div className="min-w-0 flex-1">
                <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
                {description ? <p className="mt-1 text-[11px] leading-relaxed text-ink-4">{description}</p> : null}
              </div>
              <button
                type="button" onClick={onClose} aria-label="Close dialog"
                className="shrink-0 rounded-[2px] p-1 text-ink-3 transition-colors hover:bg-raised hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
            {footer ? (
              <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-base px-3 py-2">
                {footer}
              </footer>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/** Small confirm dialog — used before irreversible mock actions. */
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', tone = 'default', loading,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: ReactNode;
  confirmLabel?: string; cancelLabel?: string; tone?: 'default' | 'danger'; loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      tone={tone}
      width="max-w-md"
      footer={
        <>
          <button
            type="button" onClick={onClose}
            className="h-7 rounded-[2px] border border-line-2 bg-raised px-2.5 font-mono text-[11px] font-semibold tracking-[0.01em] text-ink-2 uppercase transition-colors hover:border-line-3 hover:text-ink"
          >
            {cancelLabel}
          </button>
          <button
            type="button" onClick={onConfirm} disabled={loading}
            className={cn(
              'h-7 rounded-[2px] border px-2.5 font-mono text-[11px] font-semibold tracking-[0.01em] uppercase transition-colors disabled:opacity-50',
              tone === 'danger'
                ? 'border-critical/50 bg-critical/15 text-critical hover:bg-critical/25'
                : 'border-term/45 bg-term/12 text-term hover:bg-term/20',
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="text-xs leading-relaxed text-ink-2">{message}</div>
    </Modal>
  );
}
