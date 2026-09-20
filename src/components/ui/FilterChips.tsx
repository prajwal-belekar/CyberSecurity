import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

/**
 * Active-filter row. Every removable filter is visible as a chip, with a single
 * "Clear all" escape hatch — no hidden state driving the result set.
 */
export function FilterChips({ chips, onClearAll, className }: { chips: FilterChip[]; onClearAll: () => void; className?: string }) {
  if (!chips.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      <span className="label-xs">Active filters</span>
      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1 rounded-[2px] border border-term/30 bg-term/8 px-1.5 py-[2px] font-mono text-[11px] text-term"
        >
          <span className="text-ink-4">{chip.label}:</span>
          <span className="max-w-40 truncate uppercase">{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label} ${chip.value}`}
            className="rounded-[1px] p-[1px] text-term/70 transition-colors hover:bg-term/20 hover:text-term"
          >
            <X className="size-2.5" aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="rounded-[2px] border border-line-2 px-1.5 py-[2px] text-[11px] text-ink-3 transition-colors hover:border-critical/40 hover:text-critical"
      >
        Clear all
      </button>
    </div>
  );
}
