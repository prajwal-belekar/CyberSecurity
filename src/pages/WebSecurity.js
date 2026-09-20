import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bug, Clock, Lock, ShieldCheck, TerminalSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { TerminalBlock } from '@/components/ui/Terminal';
import { ScannerForm } from '@/components/web-security/ScannerForm';
import { ScanProgress } from '@/components/web-security/ScanProgress';
import { VulnerabilitySummary } from '@/components/web-security/VulnerabilitySummary';
import { VulnerabilityTable } from '@/components/web-security/VulnerabilityTable';
import { SecurityHeaders } from '@/components/web-security/SecurityHeaders';
import { webSecurityApi, SCAN_PIPELINE } from '@/services/webSecurityApi';
import { queryKeys } from '@/services/queryKeys';
import { useToast } from '@/store/ToastContext';
import { formatTimestamp } from '@/utils/dates';
const PHASE_ORDER = ['initializing', 'configuration', 'headers', 'cookies', 'content', 'findings'];
/** Web Security Scanner — authorized-configuration assessment console. */
export default function WebSecurity() {
    const meta = routeMetaFor('/web-security');
    const toast = useToast();
    const timers = useRef([]);
    const [phaseIndex, setPhaseIndex] = useState(-1);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [scanTarget, setScanTarget] = useState(null);
    const previous = useQuery({
        queryKey: queryKeys.webScan(),
        queryFn: () => webSecurityApi.previousScan(),
    });
    useEffect(() => {
        if (!result && previous.data)
            setResult(previous.data);
    }, [previous.data, result]);
    useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
    const startScan = async (target, token) => {
        timers.current.forEach((t) => window.clearTimeout(t));
        timers.current = [];
        setRunning(true);
        setScanTarget(target);
        setResult(null);
        setPhaseIndex(0);
        let elapsed = 0;
        SCAN_PIPELINE.forEach((stage, index) => {
            elapsed += stage.durationMs;
            timers.current.push(window.setTimeout(() => setPhaseIndex(index + 1), elapsed));
        });
        try {
            // Total animation time, then the service call resolves the report.
            await new Promise((resolve) => { timers.current.push(window.setTimeout(resolve, elapsed + 120)); });
            const scan = await webSecurityApi.completeScan(target, token);
            setResult(scan);
            toast.success('Scan complete', `${scan.findings.length} findings · ${scan.summary.high} high severity.`);
        }
        catch (err) {
            toast.error('Scan failed', err.message);
            setScanTarget(target);
        }
        finally {
            setRunning(false);
            setPhaseIndex(PHASE_ORDER.length);
        }
    };
    const steps = SCAN_PIPELINE.map((stage, index) => {
        const state = index < phaseIndex ? (result && index === 2 && result.summary.high > 0 ? 'warning' : 'ok')
            : index === phaseIndex ? 'running'
                : 'pending';
        return {
            index: index + 1,
            label: stage.label,
            state: (state === 'ok' ? 'ok' : state),
            detail: running && index === phaseIndex ? 'in progress' : index < phaseIndex ? 'done' : undefined,
        };
    });
    return (_jsxs("div", { className: "space-y-2.5 p-2.5 sm:p-3", children: [_jsx(Breadcrumbs, { items: meta.segments }), _jsx(PageHeader, { title: "Web Security Scanner", description: "Configuration and header assessment for authorized targets.", status: _jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]", children: [_jsx(ShieldCheck, { className: "size-2.5 text-term", "aria-hidden": true }), _jsx("span", { className: "text-[11px] text-ink-3", children: "Defensive assessment" })] }), actions: result && !running ? (_jsxs(Badge, { tone: "term", children: ["LAST SCAN ", formatTimestamp(result.completedAt ?? result.startedAt)] })) : undefined }), _jsx(Panel, { title: "Scan Target", icon: _jsx(Bug, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: _jsx(ScannerForm, { onStart: (target, token) => void startScan(target, token), running: running, defaultTarget: result?.target }) }), (running || phaseIndex >= 0) && scanTarget ? (_jsx(Panel, { title: "Scan Pipeline", icon: _jsx(TerminalSquare, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", actions: running ? _jsx("span", { className: "mono text-[11px] text-cyber", children: "RUNNING\u2026" }) : _jsx("span", { className: "mono text-[11px] text-term", children: "COMPLETE" }), children: _jsxs("div", { className: "grid gap-2.5 lg:grid-cols-2", children: [_jsx(ScanProgress, { steps: steps, target: scanTarget, running: running }), _jsxs(TerminalBlock, { title: "SCAN OUTPUT", maxHeight: 208, showCaret: running, children: [_jsxs("div", { className: "text-ink-3", children: ["> scan --target ", scanTarget, " --profile config"] }), _jsx("div", { className: "my-1 h-px bg-line", "aria-hidden": true }), steps.filter((s) => s.state !== 'pending').map((step) => (_jsxs("div", { className: "flex items-baseline gap-2", children: [_jsxs("span", { className: step.state === 'warning' ? 'text-medium' : 'text-term', children: ["[", step.state === 'warning' ? '!' : '✓', "]"] }), _jsx("span", { className: "text-ink-2", children: step.label }), _jsx("span", { className: "h-px min-w-3 flex-1 bg-line", "aria-hidden": true }), _jsx("span", { className: step.state === 'running' ? 'text-cyber' : step.state === 'warning' ? 'text-medium' : 'text-ink-4', children: step.state === 'running' ? 'WORKING' : step.state === 'warning' ? 'FINDINGS' : 'DONE' })] }, step.index))), result && !running ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "my-1 h-px bg-line", "aria-hidden": true }), _jsxs("div", { className: "text-ink-4", children: ["Findings: ", _jsxs("span", { className: "text-critical", children: [result.summary.critical, " CRIT"] }), " \u00B7", ' ', _jsxs("span", { className: "text-high", children: [result.summary.high, " HIGH"] }), " \u00B7", ' ', _jsxs("span", { className: "text-medium", children: [result.summary.medium, " MED"] }), " \u00B7", ' ', _jsxs("span", { className: "text-low", children: [result.summary.low, " LOW"] }), " \u00B7", ' ', _jsxs("span", { className: "text-term", children: [result.summary.pass, " PASS"] })] }), _jsxs("div", { className: "text-term", children: ["[\u2713] Report written \u00B7 authorization ", result.authorizationToken, " recorded"] })] })) : null] })] }) })) : null, previous.isLoading && !result ? (_jsxs("div", { className: "space-y-2.5", children: [_jsx(Skeleton, { className: "h-24 w-full" }), _jsx(Skeleton, { className: "h-64 w-full" })] })) : previous.isError && !result ? (_jsx(Panel, { className: "min-w-0", children: _jsx(ErrorState, { title: "Unable to load the previous scan", message: previous.error.message, hint: previous.error?.hint, onRetry: () => previous.refetch() }) })) : result ? (_jsxs(_Fragment, { children: [_jsxs(Panel, { title: "Scan Results", icon: _jsx(ShieldCheck, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: [_jsxs("div", { className: "mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5", children: [_jsx("span", { className: "mono min-w-0 truncate text-[11.5px] text-cyber", children: result.target }), _jsxs(Badge, { tone: "term", children: ["AUTHZ ", result.authorizationToken] }), _jsx(Badge, { tone: "neutral", children: result.id }), _jsxs("span", { className: "mono inline-flex items-center gap-1 text-[11px] text-ink-4", children: [_jsx(Clock, { className: "size-2.5", "aria-hidden": true }), formatTimestamp(result.startedAt), " \u2192 ", result.completedAt ? formatTimestamp(result.completedAt) : 'running'] })] }), _jsx(VulnerabilitySummary, { summary: result.summary })] }), _jsxs("div", { className: "grid min-w-0 gap-2.5 xl:grid-cols-3", children: [_jsx(Panel, { title: "Findings", icon: _jsx(Bug, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0 xl:col-span-2", children: _jsx(VulnerabilityTable, { findings: result.findings }) }), _jsxs("div", { className: "flex min-w-0 flex-col gap-2.5", children: [_jsx(Panel, { title: "Security Headers", className: "min-w-0", children: _jsx(SecurityHeaders, { headers: result.headers }) }), _jsx(Panel, { title: "Transport Security", icon: _jsx(Lock, { className: "size-3.5", "aria-hidden": true }), className: "min-w-0", children: _jsx(KeyValueGrid, { columns: 1, rows: [
                                                { label: 'TLS version', value: result.tls.version },
                                                { label: 'Cipher', value: result.tls.cipher },
                                                { label: 'Grade', value: result.tls.grade, tone: result.tls.grade.startsWith('A') ? 'text-term' : 'text-medium' },
                                                { label: 'Issuer', value: result.tls.certificateIssuer },
                                                { label: 'Expires', value: result.tls.expiresAt },
                                                { label: 'HSTS', value: result.tls.hsts ? 'ENABLED' : 'ABSENT', tone: result.tls.hsts ? 'text-term' : 'text-critical' },
                                            ] }) }), _jsxs(Panel, { title: "Observed Stack", className: "min-w-0", children: [result.technologyStack.length ? (_jsx("ul", { className: "space-y-1", children: result.technologyStack.map((tech) => (_jsxs("li", { className: "flex items-center gap-2 border-b border-line pb-1 last:border-b-0", children: [_jsx("span", { className: "min-w-0 flex-1 truncate text-[11px] text-ink-2", children: tech.name }), _jsx("span", { className: "mono shrink-0 text-[11px] text-ink-4", children: tech.category }), _jsxs("span", { className: "mono tnum shrink-0 text-[11px] text-cyber", children: [(tech.confidence * 100).toFixed(0), "%"] })] }, tech.name))) })) : (_jsx(EmptyState, { compact: true, title: "No stack fingerprints" })), _jsx(SectionRule, { className: "mt-2.5 mb-1", children: "Scope" }), _jsx("ul", { className: "space-y-0.5", children: result.scope.map((entry) => (_jsxs("li", { className: "mono truncate text-[10.5px] text-ink-3", children: ["\u00B7 ", entry] }, entry))) })] })] })] })] })) : (_jsx(Panel, { className: "min-w-0", children: _jsx(EmptyState, { icon: _jsx(Bug, { className: "size-4", "aria-hidden": true }), title: "No scan results", description: "Supply an authorized target above and start a scan. Configuration, header, cookie and content-exposure checks will be reported here.", action: _jsx(Button, { variant: "secondary", size: "sm", onClick: () => previous.refetch(), children: "Reload last scan" }), prompt: true }) }))] }));
}
