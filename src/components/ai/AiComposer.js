import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
/** Question input with suggested prompts. Enter sends, Shift+Enter newlines. */
export function AiComposer({ onSubmit, disabled, prompts, placeholder = 'Ask about this incident, an indicator, or the wider environment…' }) {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);
    useEffect(() => {
        const handler = (event) => {
            // "/" focuses the composer from anywhere on the page.
            if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
                const target = event.target;
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
        if (!question || disabled)
            return;
        onSubmit(question);
        setValue('');
    };
    return (_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "mb-1.5 flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "label-xs", children: "Suggested" }), prompts.map((prompt) => (_jsx("button", { type: "button", disabled: disabled, onClick: () => { setValue(prompt.prompt); textareaRef.current?.focus(); }, className: cn('mono rounded-[2px] border px-1.5 py-[2px] text-[11px] tracking-[0.01em] transition-colors', value === prompt.prompt
                            ? 'border-ai/45 bg-ai/10 text-ai'
                            : 'border-line-2 text-ink-4 hover:border-ai/35 hover:text-ink-2', disabled && 'cursor-not-allowed opacity-50'), children: prompt.label }, prompt.id)))] }), _jsxs("div", { className: cn('rounded-[2px] border bg-void transition-colors', disabled ? 'border-line opacity-60' : 'border-line-2 focus-within:border-ai/45'), children: [_jsx(Textarea, { ref: textareaRef, value: value, onChange: (event) => setValue(event.target.value), onKeyDown: (event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                send();
                            }
                        }, rows: 2, disabled: disabled, placeholder: placeholder, "aria-label": "Ask the AI security assistant", className: "mono border-0 bg-transparent text-[11.5px] shadow-none focus-visible:ring-0" }), _jsxs("div", { className: "flex items-center gap-2 border-t border-line px-2 py-1.5", children: [_jsxs("span", { className: "mono hidden text-[10.5px] tracking-[0.01em] text-ink-4 uppercase sm:inline", children: [_jsx("kbd", { className: "rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3", children: "ENTER" }), " SEND \u00B7", ' ', _jsx("kbd", { className: "rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3", children: "SHIFT+ENTER" }), " NEWLINE \u00B7", ' ', _jsx("kbd", { className: "rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3", children: "/" }), " FOCUS"] }), _jsxs("span", { className: "mono ml-auto text-[10.5px] text-ink-4", children: [value.trim().length, " CHARS"] }), _jsx(Button, { type: "button", variant: "primary", size: "xs", onClick: send, disabled: disabled || !value.trim(), icon: _jsx(CornerDownLeft, { className: "size-3", "aria-hidden": true }), children: "Investigate" })] })] }), _jsxs("p", { className: "mono mt-1.5 flex items-start gap-1.5 text-[10.5px] leading-relaxed text-ink-4", children: [_jsx(Sparkles, { className: "mt-px size-2.5 shrink-0 text-ai", "aria-hidden": true }), "Answers are generated from records attached to this investigation and are advisory only. Verify against the cited evidence before taking action."] })] }));
}
