import { useEffect, useRef, useState } from 'react';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import type { SuggestedPrompt } from '@/types/ai';

export interface AiComposerProps {
  onSubmit: (question: string) => void;
  disabled?: boolean;
  prompts: SuggestedPrompt[];
  placeholder?: string;
}

/** Question input with suggested prompts. Enter sends, Shift+Enter newlines. */
export function AiComposer({ onSubmit, disabled, prompts, placeholder = 'Ask about this incident, an indicator, or the wider environment…' }: AiComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // "/" focuses the composer from anywhere on the page.
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
        if (!typing) {
          event.preventDefault();
          textareaRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const send = () => {
    const question = value.trim();
    if (!question || disabled) return;
    onSubmit(question);
    setValue('');
  };

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className="label-xs">Suggested</span>
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            type="button"
            disabled={disabled}
            onClick={() => { setValue(prompt.prompt); textareaRef.current?.focus(); }}
            className={cn(
              'mono rounded-[2px] border px-1.5 py-[2px] text-[11px] tracking-[0.01em] transition-colors',
              value === prompt.prompt
                ? 'border-ai/45 bg-ai/10 text-ai'
                : 'border-line-2 text-ink-4 hover:border-ai/35 hover:text-ink-2',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <div className={cn('rounded-[2px] border bg-void transition-colors', disabled ? 'border-line opacity-60' : 'border-line-2 focus-within:border-ai/45')}>
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          rows={2}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Ask the AI security assistant"
          className="mono border-0 bg-transparent text-[11.5px] shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center gap-2 border-t border-line px-2 py-1.5">
          <span className="mono hidden text-[10.5px] tracking-[0.01em] text-ink-4 uppercase sm:inline">
            <kbd className="rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3">ENTER</kbd> SEND ·{' '}
            <kbd className="rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3">SHIFT+ENTER</kbd> NEWLINE ·{' '}
            <kbd className="rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3">/</kbd> FOCUS
          </span>
          <span className="mono ml-auto text-[10.5px] text-ink-4">{value.trim().length} CHARS</span>
          <Button type="button" variant="primary" size="xs" onClick={send} disabled={disabled || !value.trim()} icon={<CornerDownLeft className="size-3" aria-hidden />}>
            Investigate
          </Button>
        </div>
      </div>

      <p className="mono mt-1.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-4">
        <Sparkles className="mt-px size-2.5 shrink-0 text-ai" aria-hidden />
        Answers are generated from records attached to this investigation and are advisory only. Verify against the
        cited evidence before taking action.
      </p>
    </div>
  );
}
