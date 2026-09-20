import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
/**
 * `root@cybersentinel:~$` — the prompt motif. Used only on genuine terminal
 * surfaces (the dock), never as decoration under page titles.
 */
export function Prompt({ className, children }) {
    return (_jsxs("div", { className: cn('term-line flex flex-wrap items-baseline gap-x-2', className), children: [_jsx("span", { className: "prompt shrink-0 select-none", children: "root@cybersentinel:~$" }), children] }));
}
export function Caret({ className }) {
    return _jsx("span", { className: cn('caret', className), "aria-hidden": true });
}
/**
 * Framed terminal output block using box-drawing characters.
 * Visual styling only — no shell is attached to the frontend.
 */
export function TerminalBlock({ title = 'TERMINAL', children, className, bodyClassName, showCaret = false, maxHeight, }) {
    const width = 58;
    const label = `─ ${title} `;
    const top = `┌${label}${'─'.repeat(Math.max(2, width - label.length))}┐`;
    const bottom = `└${'─'.repeat(width)}┘`;
    return (_jsxs("div", { className: cn('panel overflow-hidden bg-void', className), children: [_jsx("div", { className: "term-line select-none border-b border-line bg-base px-2.5 py-1 text-[10.5px] text-line-3", "aria-hidden": true, children: top }), _jsxs("div", { className: cn('term-line overflow-y-auto px-2.5 py-2 text-[11.5px]', bodyClassName), style: maxHeight ? { maxHeight } : undefined, children: [children, showCaret ? (_jsxs("div", { className: "mt-1 flex items-baseline gap-2", children: [_jsx("span", { className: "prompt select-none", children: "root@cybersentinel:~$" }), _jsx(Caret, {})] })) : null] }), _jsx("div", { className: "term-line select-none border-t border-line bg-base px-2.5 py-1 text-[10.5px] text-line-3", "aria-hidden": true, children: bottom })] }));
}
/** Single log line with a severity-tinted channel tag. */
export function LogLine({ time, channel, message, tone = 'text-ink-2', className, highlight, }) {
    return (_jsxs("div", { className: cn('term-line flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-[1px] px-1 py-[1px]', highlight && 'bg-term/[0.05]', className), children: [time ? _jsx("span", { className: "mono tnum shrink-0 text-ink-4", children: time }) : null, channel ? _jsxs("span", { className: cn('mono shrink-0 font-semibold', tone), children: ["[", channel, "]"] }) : null, _jsx("span", { className: cn('min-w-0 break-words', tone === 'text-ink-2' ? 'text-ink-2' : tone), children: message })] }));
}
/** `[ OK ]` / `[ !! ]` prefix used by boot and scan output. */
export function StepLine({ index, label, state, detail, className, }) {
    const marker = {
        pending: { text: '[..]', tone: 'text-ink-4' },
        running: { text: '[>>]', tone: 'text-cyber' },
        ok: { text: '[✓]', tone: 'text-term' },
        complete: { text: '[✓]', tone: 'text-term' },
        warning: { text: '[!]', tone: 'text-medium' },
        fail: { text: '[✗]', tone: 'text-critical' },
    }[state];
    const labelTone = {
        pending: 'text-ink-4', running: 'text-cyber', ok: 'text-ink-2', complete: 'text-ink-2',
        warning: 'text-medium', fail: 'text-critical',
    }[state];
    return (_jsxs("div", { className: cn('term-line flex flex-wrap items-baseline gap-x-2', className), children: [typeof index === 'number' ? (_jsxs("span", { className: "mono tnum shrink-0 text-ink-4", children: ["[", String(index).padStart(2, '0'), "]"] })) : null, _jsx("span", { className: cn('mono shrink-0 font-semibold', marker.tone), "aria-hidden": true, children: marker.text }), _jsx("span", { className: cn('mono', labelTone), children: label }), detail ? _jsxs("span", { className: "mono min-w-0 text-ink-4", children: ["\u2014 ", detail] }) : null, _jsxs("span", { className: "sr-only", children: [label, ": ", state] })] }));
}
