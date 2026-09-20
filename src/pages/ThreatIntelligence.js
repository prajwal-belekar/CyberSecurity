import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { IntelSummary } from '@/components/intelligence/IntelSummary';
import { IntelTable } from '@/components/intelligence/IntelTable';
import { IndicatorDrawer } from '@/components/intelligence/IndicatorDrawer';
/** Threat Intelligence — feed health, indicator grid and full record drawer. */
export default function ThreatIntelligence() {
    const meta = routeMetaFor('/threat-intelligence');
    const [selected, setSelected] = useState(null);
    const openIndicator = (indicator) => setSelected(indicator.id);
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Threat Intelligence", description: "Indicators of compromise with provenance and correlation counts.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(Globe2, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Feeds synchronized" })] }) }), _jsx(IntelSummary, {}), _jsx(IntelTable, { onSelect: openIndicator }), _jsx(IndicatorDrawer, { id: selected, onClose: () => setSelected(null) })] }));
}
