import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Bot, CircleAlert, ExternalLink, Sparkles, Terminal } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Meter } from '@/components/ui/Meter';
import { SkeletonText } from '@/components/ui/Skeleton';
import { formatClockShort } from '@/utils/dates';
/** Terminal-flavoured output block inside an assistant answer. */
function OutputBlock({ block }) {
    if (block.kind === 'metrics') {
        const entries = block.rows;
        return (_jsx("dl", { className: "mt-1.5 grid gap-x-3 gap-y-0.5 rounded-[2px] border border-line bg-void p-2 sm:grid-cols-2", children: Object.entries(entries).map(([key, value]) => (_jsxs("div", { className: "flex items-baseline justify-between gap-2 border-b border-line pb-0.5 last:border-b-0", children: [_jsx("dt", { className: "label-xs shrink-0", children: key }), _jsx("dd", { className: "mono tnum min-w-0 truncate text-[10.5px] text-cyber", children: value })] }, key))) }));
    }
    const rows = block.rows;
    if (block.kind === 'table') {
        const [head, ...body] = rows;
        return (_jsx("div", { className: "mt-1.5 overflow-x-auto rounded-[2px] border border-line bg-void", children: _jsxs("table", { className: "mono w-full border-collapse text-[11px]", children: [head ? (_jsx("thead", { children: _jsx("tr", { className: "border-b border-line-2", children: head.map((cell) => (_jsx("th", { scope: "col", className: "px-2 py-1 text-left font-bold tracking-[0.01em] text-ink-4 uppercase", children: cell }, cell))) }) })) : null, _jsx("tbody", { children: body.map((row, index) => (_jsx("tr", { className: "border-b border-line last:border-b-0", children: row.map((cell, cellIndex) => (_jsx("td", { className: cn('max-w-[240px] truncate px-2 py-1', cellIndex === 0 ? 'text-ink-2' : 'text-ink-3'), children: cell }, cellIndex))) }, index))) })] }) }));
    }
    // timeline
    return (_jsx("ol", { className: "mt-1.5 space-y-px rounded-[2px] border border-line bg-void p-2", children: rows.map((row, index) => (_jsxs("li", { className: "mono flex items-baseline gap-2 text-[11px]", children: [_jsx("span", { className: "tnum w-12 shrink-0 text-ink-4", children: row[0] }), _jsx("span", { className: "shrink-0 text-term", "aria-hidden": true, children: "\u203A" }), _jsx("span", { className: "min-w-0 flex-1 break-words text-ink-2", children: row.slice(1).join(' · ') })] }, index))) }));
}
/** Single message row: system note, analyst prompt, or assistant answer. */
function MessageRow({ message }) {
    if (message.role === 'system') {
        return (_jsxs("div", { className: "mono flex items-start gap-2 rounded-[2px] border border-line bg-base px-2 py-1.5 text-[11px] leading-relaxed text-ink-4", children: [_jsx(Terminal, { className: "mt-px size-3 shrink-0 text-ink-4", "aria-hidden": true }), _jsx("span", { className: "min-w-0 break-words", children: message.content })] }));
    }
    if (message.role === 'user') {
        return (_jsx("div", { className: "flex justify-end", children: _jsxs("div", { className: "mono max-w-[85%] rounded-[2px] border border-volt/30 bg-volt/[0.07] px-2.5 py-1.5", children: [_jsx("p", { className: "text-[11.5px] leading-relaxed break-words text-ink", children: message.content }), _jsx("p", { className: "mt-0.5 text-right text-[10.5px] text-ink-4", children: formatClockShort(message.timestamp) })] }) }));
    }
    return (_jsxs("article", { className: "min-w-0 rounded-[2px] border border-ai/25 bg-ai/[0.04] p-2.5", children: [_jsxs("header", { className: "mb-1.5 flex flex-wrap items-center gap-2", children: [_jsx("span", { className: "flex size-4 items-center justify-center rounded-[2px] border border-ai/40 bg-ai/10", children: _jsx(Sparkles, { className: "size-2.5 text-ai", "aria-hidden": true }) }), _jsx("span", { className: "mono text-[11px] font-bold tracking-[0.02em] text-ai ", children: "AI analysis" }), typeof message.confidence === 'number' ? (_jsxs("span", { className: "ml-auto flex items-center gap-1.5", children: [_jsx("span", { className: "mono text-[10.5px] tracking-[0.01em] text-ink-4 uppercase", children: "CONF" }), _jsx("span", { className: "w-14", children: _jsx(Meter, { value: message.confidence * 100, tone: "ai", showValue: false }) }), _jsxs("span", { className: "mono tnum text-[11px] text-ai", children: [Math.round(message.confidence * 100), "%"] })] })) : null, _jsx("span", { className: "mono text-[10.5px] text-ink-4", children: formatClockShort(message.timestamp) })] }), _jsx("div", { className: "space-y-1.5", children: message.content.split('\n').filter(Boolean).map((paragraph, index) => (_jsx("p", { className: "text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2", children: paragraph }, index))) }), message.blocks?.map((block, index) => _jsx(OutputBlock, { block: block }, index)), message.citations?.length ? (_jsxs("div", { className: "mt-2 border-t border-line pt-1.5", children: [_jsx("p", { className: "label-xs mb-1", children: "Sources" }), _jsx("ul", { className: "flex flex-wrap gap-1", children: message.citations.map((citation) => (_jsx("li", { children: citation.href ? (_jsxs(Link, { to: citation.href, className: "mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-3 transition-colors hover:border-ai/40 hover:text-ai", children: [citation.label, _jsx(ExternalLink, { className: "size-2", "aria-hidden": true })] })) : (_jsx("span", { className: "mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-ink-4", children: citation.label })) }, citation.id))) })] })) : null, message.status === 'error' || message.error ? (_jsxs("p", { className: "mono mt-2 flex items-center gap-1.5 rounded-[2px] border border-critical/30 bg-critical/[0.06] px-2 py-1 text-[11px] text-critical", children: [_jsx(CircleAlert, { className: "size-3", "aria-hidden": true }), message.error ?? 'Analysis failed.'] })) : null] }));
}
/** Scrolling conversation transcript with an auto-scroll anchor. */
export function AiMessages({ messages, thinking }) {
    const endRef = useRef(null);
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages.length, thinking]);
    return (_jsxs("div", { className: "min-w-0 space-y-2", children: [messages.map((message) => _jsx(MessageRow, { message: message }, message.id)), thinking ? (_jsxs("div", { className: "rounded-[2px] border border-ai/25 bg-ai/[0.04] p-2.5", children: [_jsxs("header", { className: "mb-1.5 flex items-center gap-2", children: [_jsx("span", { className: "flex size-4 items-center justify-center rounded-[2px] border border-ai/40 bg-ai/10", children: _jsx(Bot, { className: "size-2.5 animate-pulse text-ai", "aria-hidden": true }) }), _jsx("span", { className: "mono text-[11px] font-bold tracking-[0.02em] text-ai ", children: "Correlating evidence\u2026" })] }), _jsx(SkeletonText, { lines: 3 })] })) : null, _jsx("div", { ref: endRef, "aria-hidden": true })] }));
}
