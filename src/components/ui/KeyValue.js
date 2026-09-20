import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/utils/cn';
import { CopyButton } from './CopyButton';
/**
 * Forensic metadata grid — the `SEVERITY  HIGH / SOURCE  192.168.1.42`
 * presentation used across threat, node and indicator detail views.
 */
export function KeyValueGrid({ rows, className, columns = 2 }) {
    return (_jsx("dl", { className: cn('grid gap-x-4 gap-y-0', columns === 1 && 'grid-cols-1', columns === 2 && 'grid-cols-1 sm:grid-cols-2', columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', className), children: rows.map((row) => (_jsxs("div", { className: cn('flex min-w-0 items-baseline justify-between gap-3 border-b border-line py-1.5', row.span && 'sm:col-span-2 lg:col-span-3'), children: [_jsx("dt", { className: "field-label shrink-0 pt-0.5", children: row.label }), _jsxs("dd", { className: cn('mono flex min-w-0 items-baseline gap-1.5 text-right text-[11.5px] text-ink', row.tone), children: [_jsx("span", { className: "min-w-0 break-all", children: row.value }), row.copy ? _jsx(CopyButton, { value: row.copy, className: "shrink-0" }) : null] })] }, row.label))) }));
}
/** Horizontal section divider with a small-caps label. */
export function SectionRule({ children, className, right }) {
    return (_jsxs("div", { className: cn('section-rule', className), children: [_jsx("span", { className: "shrink-0", children: children }), right ? _jsx("span", { className: "shrink-0 normal-case tracking-normal text-ink-4", children: right }) : null] }));
}
