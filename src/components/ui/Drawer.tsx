import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from './Button';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  side?: 'right' | 'left';
  width?: string;
  badge?: ReactNode;
}

/**
 * Slide-in investigation panel. Focus is trapped to the drawer while open and
 * restored on close; Escape dismisses it.
 */
export function Drawer({
  open, onClose, title, subtitle, footer, children, side = 'right', width = 'max-w-[560px]', badge,
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab') {
        const nodes = document.querySelectorAll<HTMLElement>('[data-drawer-root] a, [data-drawer-root] button, [data-drawer-root] input, [data-drawer-root] select, [data-drawer-root] textarea, [data-drawer-root] [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0]!;
        const last = nodes[nodes.length - 1]!;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[80]" data-drawer-root>
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={typeof title === 'string' ? title : 'Detail panel'}
            className={cn(
              'absolute inset-y-0 flex w-full flex-col border-line-2 bg-panel shadow-[-8px_0_24px_rgba(0,0,0,0.45)]',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              width,
            )}
            initial={{ x: side === 'right' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: side === 'right' ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="flex shrink-0 items-start gap-3 border-b border-line bg-panel-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-[13px] font-semibold text-ink">{title}</h2>
                  {badge}
                </div>
                {subtitle ? <div className="mt-0.5 truncate text-[11px] text-ink-4">{subtitle}</div> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="shrink-0 rounded-[2px] border border-transparent p-1 text-ink-3 transition-colors hover:border-line-2 hover:bg-raised hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

            {footer ? (
              <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-base px-3 py-2">
                {footer}
              </footer>
            ) : null}
          </motion.aside>
          <div className="sr-only">
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
