import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode, Ref } from 'react';
import { cn } from '@/utils/cn';

export interface DropdownItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  hint?: string;
}

export interface DropdownProps {
  trigger: (props: { open: boolean; toggle: () => void; ref: Ref<HTMLButtonElement> }) => ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: string;
  header?: ReactNode;
  footer?: ReactNode;
  label: string;
}

/** Keyboard-accessible menu (Arrow keys, Enter, Escape, Home/End). */
export function Dropdown({ trigger, items, align = 'right', width = 'w-56', header, footer, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nodes = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not([disabled])') ?? []);
        if (!nodes.length) return;
        const current = nodes.indexOf(document.activeElement as HTMLButtonElement);
        const next = e.key === 'ArrowDown'
          ? (current + 1) % nodes.length
          : (current - 1 + nodes.length) % nodes.length;
        nodes[next]?.focus();
      }
      if (e.key === 'Home') { e.preventDefault(); containerRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus(); }
      if (e.key === 'End') {
        e.preventDefault();
        const nodes = containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
        nodes?.[nodes.length - 1]?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((v) => !v), ref: buttonRef })}
      {open ? (
        <div
          role="menu"
          id={listId}
          aria-label={label}
          className={cn(
            'panel absolute top-full z-[70] mt-1 overflow-hidden bg-base shadow-[0_16px_44px_rgba(0,0,0,0.8)]',
            align === 'right' ? 'right-0' : 'left-0', width,
          )}
        >
          {header ? <div className="border-b border-line px-2.5 py-1.5">{header}</div> : null}
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {items.map((item) =>
              item.separator ? (
                <div key={item.id} className="my-1 h-px bg-line" role="separator" />
              ) : (
                <button
                  key={item.id}
                  role="menuitem"
                  type="button"
                  disabled={item.disabled}
                  onClick={() => { item.onSelect?.(); setOpen(false); }}
                  className={cn(
                    'flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11.5px] transition-colors',
                    'focus:bg-raised focus:outline-none disabled:cursor-not-allowed disabled:opacity-40',
                    item.danger ? 'text-critical hover:bg-critical/10' : 'text-ink-2 hover:bg-raised hover:text-ink',
                  )}
                >
                  {item.icon ? <span className="shrink-0 text-ink-4" aria-hidden>{item.icon}</span> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.hint ? <span className="mono shrink-0 text-[11px] text-ink-4">{item.hint}</span> : null}
                </button>
              ),
            )}
          </div>
          {footer ? <div className="border-t border-line px-2.5 py-1.5">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
