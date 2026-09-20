import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Check, Layers, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { severityMeta } from '@/utils/severity';
import { CopyButton } from '@/components/ui/CopyButton';
import { EmptyState } from '@/components/ui/EmptyState';
/**
 * Indicator breakdown with per-signal weighting, so the risk score is
 * explainable rather than opaque.
 */
export function URLIndicators({ indicators, className }) {
    const detected = indicators.filter((i) => i.detected);
    const maxWeight = Math.max(1, ...indicators.map((i) => i.weight));
    if (!indicators.length) {
        return _jsx(EmptyState, { compact: true, icon: _jsx(Layers, { className: "size-4", "aria-hidden": true }), title: "No indicators evaluated" });
    }
    return (_jsxs("div", { className: cn('min-w-0', className), children: [_jsxs("div", { className: "mb-2 flex flex-wrap items-center gap-2", children: [_jsxs("span", { className: "mono rounded-[2px] border border-critical/35 bg-critical/10 px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] text-critical uppercase", children: [detected.length, " FLAGGED"] }), _jsxs("span", { className: "mono rounded-[2px] border border-term/35 bg-term/10 px-1.5 py-[1px] text-[11px] font-bold tracking-[0.01em] text-term uppercase", children: [indicators.length - detected.length, " CLEAN"] }), _jsx("span", { className: "flex-1" }), _jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 ", children: "Weight contribution" })] }), _jsx("ul", { className: "space-y-px", children: indicators.map((indicator) => {
                    const meta = severityMeta(indicator.severity);
                    return (_jsxs("li", { className: cn('flex items-start gap-2 rounded-[2px] border px-2 py-1.5 transition-colors', indicator.detected ? 'border-line-2 bg-base' : 'border-transparent bg-transparent'), children: [_jsx("span", { className: cn('mt-px flex size-4 shrink-0 items-center justify-center rounded-[2px] border', indicator.detected ? cn(meta.border, meta.soft, meta.text) : 'border-line-2 bg-raised text-ink-4'), "aria-hidden": true, children: indicator.detected ? _jsx(X, { className: "size-2.5" }) : _jsx(Check, { className: "size-2.5" }) }), _jsxs("div", { className: "min-w-0 flex-1", children: [_jsxs("div", { className: "flex flex-wrap items-baseline gap-x-2 gap-y-0.5", children: [_jsx("span", { className: cn('text-[11.5px] font-medium', indicator.detected ? 'text-ink' : 'text-ink-3'), children: indicator.label }), indicator.detected ? (_jsxs("span", { className: cn('mono text-[10.5px] font-bold tracking-[0.02em] uppercase', meta.text), children: [meta.glyph, " ", meta.label] })) : (_jsx("span", { className: "mono text-[10.5px] tracking-[0.02em] text-ink-4 uppercase", children: "PASS" })), indicator.weight > 0 ? (_jsxs("span", { className: "mono tnum text-[11px] text-ink-4", children: ["+", indicator.weight] })) : null] }), _jsx("p", { className: "mono mt-0.5 text-[10.5px] leading-relaxed break-words text-ink-4", children: indicator.detail }), indicator.weight > 0 ? (_jsx("div", { className: "mt-1 h-[3px] w-full max-w-[180px] overflow-hidden rounded-[1px] bg-raised", children: _jsx("div", { className: "h-full", style: { width: `${(indicator.weight / maxWeight) * 100}%`, background: meta.hex }, "aria-hidden": true }) })) : null] })] }, indicator.id));
                }) })] }));
}
/** URL decomposition block: protocol, domain, path, length, registration. */
export function UrlInformation({ analysis }) {
    const info = analysis.urlInfo;
    const rows = [
        ['URL', analysis.url, true],
        ['PROTOCOL', info.protocol],
        ['DOMAIN', info.domain, true],
        ['SUBDOMAIN', info.subdomain ?? '—'],
        ['TLD', info.tld],
        ['PATH', info.path || '/', true],
        ['QUERY', info.query ?? '—', true],
        ['LENGTH', `${info.length ?? 0} characters`],
        ['DOMAIN AGE', info.domainAge ?? '—'],
        ['REGISTRAR', info.registrar ?? '—'],
    ];
    return (_jsxs("dl", { className: "min-w-0", children: [rows.map(([label, value, copyable]) => (_jsxs("div", { className: "flex items-baseline justify-between gap-3 border-b border-line py-1.5 last:border-b-0", children: [_jsx("dt", { className: "label-xs shrink-0", children: label }), _jsxs("dd", { className: "mono flex min-w-0 items-baseline gap-1.5 text-right text-[11px] text-ink-2", children: [_jsx("span", { className: "min-w-0 break-all", children: value ?? '—' }), copyable && value && value !== '—' ? _jsx(CopyButton, { value: value, label: `Copy ${label.toLowerCase()}` }) : null] })] }, label))), analysis.certificate ? (_jsxs("div", { className: "mt-2 rounded-[2px] border border-line bg-base p-2", children: [_jsx("div", { className: "section-rule mb-1.5", children: _jsx("span", { children: "TLS certificate" }) }), _jsxs("div", { className: "grid gap-1 sm:grid-cols-2", children: [_jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "label-xs", children: "Issuer" }), _jsx("span", { className: "mono truncate text-[10.5px] text-ink-2", children: analysis.certificate.issuer })] }), _jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "label-xs", children: "Valid" }), _jsx("span", { className: cn('mono text-[10.5px] font-semibold', analysis.certificate.valid ? 'text-term' : 'text-critical'), children: analysis.certificate.valid ? 'YES' : 'NO' })] }), _jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "label-xs", children: "Expires" }), _jsx("span", { className: "mono text-[10.5px] text-ink-2", children: analysis.certificate.expiresAt })] }), _jsxs("div", { className: "flex items-baseline justify-between gap-2", children: [_jsx("span", { className: "label-xs", children: "Remaining" }), _jsxs("span", { className: cn('mono text-[10.5px]', analysis.certificate.daysRemaining < 30 ? 'text-medium' : 'text-ink-2'), children: [analysis.certificate.daysRemaining, "d"] })] })] })] })) : null] }));
}
