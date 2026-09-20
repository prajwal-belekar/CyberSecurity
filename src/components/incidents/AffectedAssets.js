import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ServerCog, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CopyButton } from '@/components/ui/CopyButton';
const TYPE_LABEL = {
    host: 'HOST', service: 'SERVICE', account: 'ACCOUNT', database: 'DATABASE', gateway: 'GATEWAY', endpoint: 'ENDPOINT', iot: 'IOT',
};
/** Asset impact table: name, type, address, owner, criticality, compromise state. */
export function AffectedAssets({ assets }) {
    if (!assets.length) {
        return _jsx(EmptyState, { compact: true, icon: _jsx(ServerCog, { className: "size-4", "aria-hidden": true }), title: "No assets linked", description: "Affected hosts, services and accounts will be listed here." });
    }
    const compromised = assets.filter((asset) => asset.compromised);
    return (_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "mb-1.5 flex items-baseline gap-2", children: [_jsxs("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 ", children: [assets.length, " assets in scope"] }), compromised.length ? (_jsxs("span", { className: "mono inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.01em] text-critical uppercase", children: [_jsx(AlertOctagon, { className: "size-2.5", "aria-hidden": true }), compromised.length, " COMPROMISED"] })) : (_jsx("span", { className: "mono text-[11px] font-bold tracking-[0.01em] text-term uppercase", children: "NONE COMPROMISED" }))] }), _jsx("ul", { className: "space-y-px", children: assets.map((asset) => (_jsxs("li", { className: cn('relative overflow-hidden rounded-[2px] border px-2 py-1.5 transition-colors', asset.compromised ? 'border-critical/30 bg-critical/[0.04]' : 'border-line bg-base hover:border-line-2'), children: [_jsx("span", { className: cn('absolute inset-y-0 left-0 w-[2px]', asset.compromised ? 'bg-critical' : 'bg-line-2'), "aria-hidden": true }), _jsxs("div", { className: "flex flex-wrap items-center gap-x-2 gap-y-1", children: [_jsx("span", { className: "mono shrink-0 text-[10.5px] font-bold text-ink", children: asset.name }), _jsx("span", { className: "mono shrink-0 rounded-[2px] border border-line-2 bg-raised px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] text-ink-3 uppercase", children: TYPE_LABEL[asset.type] }), asset.ip ? (_jsxs("span", { className: "mono flex shrink-0 items-center gap-1 text-[11px] text-cyber", children: [asset.ip, _jsx(CopyButton, { value: asset.ip, label: `Copy ${asset.ip}` })] })) : null, _jsx("span", { className: "flex-1" }), _jsx(SeverityBadge, { severity: asset.criticality, showGlyph: false }), asset.compromised ? (_jsx("span", { className: "mono shrink-0 rounded-[2px] border border-critical/40 bg-critical/10 px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] text-critical uppercase", children: "COMPROMISED" })) : (_jsx("span", { className: "mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] text-ink-4 uppercase", children: "EXPOSED" }))] }), _jsxs("div", { className: "mono mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-ink-4", children: [_jsx("span", { children: asset.id }), asset.owner ? _jsxs("span", { children: ["OWNER ", asset.owner] }) : null] })] }, asset.id))) })] }));
}
