import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Crosshair, Globe, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { URLAnalyzer } from '@/components/phishing/URLAnalyzer';
import { RiskScore, VERDICT_META } from '@/components/phishing/RiskScore';
import { URLIndicators, UrlInformation } from '@/components/phishing/URLIndicators';
import { ScanHistory } from '@/components/phishing/ScanHistory';
import { phishingApi } from '@/services/phishingApi';
import { useToast } from '@/store/ToastContext';
import { queryKeys } from '@/services/queryKeys';
import { cn } from '@/utils/cn';
/** Phishing Detector — analyze, explain, then compare against history. */
export default function Phishing() {
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const [analysis, setAnalysis] = useState(null);
    const toast = useToast();
    const meta = routeMetaFor('/phishing');
    const verdictMeta = analysis ? VERDICT_META[analysis.verdict] : null;
    const handleResult = (result) => {
        setAnalysis(result);
        queryClient.invalidateQueries({ queryKey: queryKeys.phishingHistory() });
    };
    const replayRecord = (record) => {
        setAnalysis(null);
        void phishingApi.analyze(record.url).then((res) => {
            if (res.ok && res.analysis)
                handleResult(res.analysis);
            else
                toast.error('Re-analysis failed', res.reason ?? 'That target could not be re-analyzed.');
        }).catch((err) => toast.error('Re-analysis failed', err.message));
    };
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Phishing Detector", description: "Assess a link for credential harvesting and brand impersonation.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(Globe, { className: "size-2.5 text-cyber", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Analyzer ready" })] }) }), _jsx(Panel, { title: "URL Analyzer", icon: _jsx(Crosshair, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", actions: analysis ? (_jsx(Button, { variant: "ghost", size: "xs", onClick: () => setAnalysis(null), children: "Clear result" })) : undefined, children: _jsx(URLAnalyzer, { onResult: handleResult, initialUrl: searchParams.get('url') ?? undefined }) }), analysis ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "grid min-w-0 gap-2.5 lg:grid-cols-3", children: [_jsx(Panel, { title: "Threat Assessment", icon: _jsx(ShieldAlert, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", accent: analysis.riskScore >= 60 ? 'critical' : analysis.riskScore >= 35 ? 'high' : 'term', children: _jsxs("div", { className: "flex flex-col items-center gap-3 py-1", children: [_jsx(RiskScore, { score: analysis.riskScore, verdict: analysis.verdict, confidence: analysis.confidence }), _jsxs("div", { className: "w-full", children: [_jsx(SectionRule, { className: "mb-1.5", children: "Recommendation" }), _jsx("p", { className: "mono text-[10.5px] leading-relaxed text-ink-2", children: analysis.recommendation })] }), analysis.brandImpersonated ? (_jsxs("div", { className: "w-full rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2 py-1.5", children: [_jsx("p", { className: "text-[11px] font-bold tracking-[0.02em] text-critical", children: "Brand impersonated" }), _jsx("p", { className: "mono mt-0.5 text-[11px] text-ink-2", children: analysis.brandImpersonated })] })) : null] }) }), _jsx(Panel, { title: "URL Information", className: "min-w-0", children: _jsx(UrlInformation, { analysis: {
                                        url: analysis.url,
                                        urlInfo: {
                                            protocol: analysis.urlInfo.protocol,
                                            domain: analysis.urlInfo.domain,
                                            subdomain: analysis.urlInfo.subdomain,
                                            tld: analysis.urlInfo.tld,
                                            path: analysis.urlInfo.path,
                                            query: analysis.urlInfo.query,
                                            length: String(analysis.urlInfo.length),
                                            domainAge: analysis.urlInfo.domainAge,
                                            registrar: analysis.urlInfo.registrar,
                                        },
                                        certificate: analysis.certificate,
                                    } }) }), _jsxs(Panel, { title: "Analysis Pipeline", className: "min-w-0", children: [_jsx("ol", { className: "space-y-1", children: analysis.scanSteps.map((step) => (_jsxs("li", { className: "flex items-baseline gap-2 border-b border-line pb-1 last:border-b-0", children: [_jsxs("span", { className: "mono tnum shrink-0 text-[11px] text-ink-4", children: ["[", String(step.index).padStart(2, '0'), "]"] }), _jsx("span", { className: "mono min-w-0 flex-1 truncate text-[11px] text-ink-2", children: step.label }), _jsx("span", { className: cn('mono shrink-0 text-[11px] font-bold tracking-[0.01em] uppercase', step.state === 'ok' ? 'text-term' : step.state === 'warning' ? 'text-medium' : 'text-critical'), children: step.state === 'ok' ? 'OK' : step.state === 'warning' ? 'WARNING' : 'FAIL' })] }, step.index))) }), _jsxs("div", { className: "mt-2.5", children: [_jsx(SectionRule, { className: "mb-1.5", children: "Related intelligence" }), analysis.relatedThreatIds.length ? (_jsx("div", { className: "flex flex-wrap gap-1.5", children: analysis.relatedThreatIds.map((id) => (_jsx("a", { href: `/threats/${id}`, className: "mono rounded-[2px] border border-high/35 bg-high/10 px-1.5 py-[2px] text-[11px] tracking-[0.01em] text-high uppercase transition-colors hover:bg-high/20", children: id }, id))) })) : (_jsx("p", { className: "mono text-[10.5px] text-ink-4", children: "No linked threat records." }))] }), _jsx("div", { className: "mt-2.5", children: _jsx(KeyValueGrid, { columns: 1, rows: [
                                                { label: 'Analysis ID', value: analysis.id, copy: analysis.id },
                                                { label: 'Analyzed', value: new Date(analysis.analyzedAt).toLocaleString('en-GB') },
                                            ] }) })] })] }), _jsx(Panel, { title: `Indicators — ${verdictMeta?.label ?? ''}`, icon: _jsx(ShieldAlert, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: _jsx(URLIndicators, { indicators: analysis.indicators }) })] })) : (_jsx(Panel, { className: "min-w-0", children: _jsx(EmptyState, { icon: _jsx(Crosshair, { className: "size-4", "aria-hidden": true }), title: "No analysis yet", description: "Enter a URL above and run the analyzer. Risk score, URL decomposition, indicator weights and a recommendation will appear here.", prompt: true }) })), _jsx(ScanHistory, { onSelect: replayRecord })] }));
}
