import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AlertTriangle, Crosshair, Globe, Loader2, ScanSearch } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StepLine } from '@/components/ui/Terminal';
import { phishingApi } from '@/services/phishingApi';
import { useToast } from '@/store/ToastContext';
import { parseTargetUrl } from '@/utils/urlAnalysis';
const SCAN_STEPS = [
    'Parsing URL', 'Domain analysis', 'SSL inspection', 'URL structure', 'Reputation analysis', 'Risk calculation',
];
/** Demo targets only — every one uses a reserved .example/.test domain. */
const EXAMPLES = [
    { label: 'Credential lure', url: 'https://secure-microsoft-login.example.test/auth/verify?id=8842' },
    { label: 'Invoice lure', url: 'http://invoice-payment-portal.example.test/docusign/review' },
    { label: 'Raw IP host', url: 'http://192.0.2.141/admin/login.php' },
    { label: 'Internal portal', url: 'https://corp-vpn.example.test/portal' },
    { label: 'Shortened link', url: 'https://bit.ly/3xKp9aQ' },
];
/**
 * URL analysis workflow. Animated recon stages mirror what the backend will do;
 * the frontend never contacts the submitted target itself.
 */
export function URLAnalyzer({ onResult, initialUrl }) {
    const [url, setUrl] = useState(initialUrl ?? '');
    const [error, setError] = useState(null);
    const [stepIndex, setStepIndex] = useState(-1);
    const timers = useRef([]);
    const toast = useToast();
    useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
    useEffect(() => {
        if (initialUrl && initialUrl !== url)
            setUrl(initialUrl);
        // Only react to a new deep-linked target, not to local typing.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialUrl]);
    const mutation = useMutation({
        mutationFn: (target) => phishingApi.analyze(target),
        onMutate: () => {
            setError(null);
            timers.current.forEach((t) => window.clearTimeout(t));
            timers.current = [];
            setStepIndex(0);
            SCAN_STEPS.forEach((_, index) => {
                timers.current.push(window.setTimeout(() => setStepIndex(index + 1), 190 * (index + 1)));
            });
        },
        onSuccess: (result) => {
            setStepIndex(SCAN_STEPS.length);
            if (!result.ok || !result.analysis) {
                setError(result.reason ?? 'Analysis could not be completed.');
                toast.error('Analysis rejected', result.reason ?? 'Invalid target.');
                return;
            }
            onResult(result.analysis);
            if (result.analysis.riskScore >= 60) {
                toast.alert(result.analysis.severity, `Risk ${result.analysis.riskScore}/100`, `${result.analysis.urlInfo.domain} — ${result.analysis.verdict.toUpperCase()}`, '/phishing');
            }
            else {
                toast.success('Analysis complete', `${result.analysis.urlInfo.domain} scored ${result.analysis.riskScore}/100.`);
            }
        },
        onError: (err) => {
            setStepIndex(-1);
            setError(err.message);
            toast.error('Analysis failed', err.message);
        },
    });
    const submit = () => {
        const parsed = parseTargetUrl(url);
        if (!parsed.ok) {
            setError(parsed.reason ?? 'Enter a valid URL to analyze.');
            return;
        }
        mutation.mutate(url);
    };
    const running = mutation.isPending;
    return (_jsxs("div", { className: "min-w-0", children: [_jsxs("form", { onSubmit: (e) => { e.preventDefault(); submit(); }, className: "flex flex-col gap-2 sm:flex-row sm:items-end", children: [_jsxs("div", { className: "min-w-0 flex-1", children: [_jsx(Input, { terminal: true, promptLabel: "TARGET >", label: "Analyze a website", value: url, onChange: (e) => { setUrl(e.target.value); if (error)
                                    setError(null); }, placeholder: "https://suspicious-link.example.test/login", spellCheck: false, autoComplete: "off", "aria-describedby": "url-analyzer-hint", error: error ?? undefined, className: "h-9" }), _jsx("p", { id: "url-analyzer-hint", className: "mt-1 text-[10.5px] leading-relaxed text-ink-4", children: "Passive analysis only \u2014 the URL is parsed and scored locally in mock mode. The backend analyzer will perform reputation, SSL and rendering checks. No request is sent to the submitted target from this frontend." })] }), _jsx(Button, { type: "submit", variant: "primary", size: "md", loading: running, icon: running ? undefined : _jsx(ScanSearch, { className: "size-4", "aria-hidden": true }), className: "shrink-0", children: running ? 'Analyzing…' : 'Analyze URL' })] }), _jsxs("div", { className: "mt-2 flex flex-wrap items-center gap-1.5", children: [_jsx("span", { className: "label-xs", children: "Sample targets" }), EXAMPLES.map((example) => (_jsx("button", { type: "button", disabled: running, onClick: () => { setUrl(example.url); setError(null); }, className: cn('mono rounded-[2px] border px-1.5 py-[2px] text-[11px] tracking-[0.01em] uppercase transition-colors', url === example.url
                            ? 'border-term/45 bg-term/10 text-term'
                            : 'border-line-2 text-ink-4 hover:border-line-3 hover:text-ink-2', running && 'cursor-not-allowed opacity-50'), children: example.label }, example.url)))] }), running || stepIndex >= 0 ? (_jsxs("div", { className: "mt-3 rounded-[2px] border border-line bg-void p-2.5", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [running ? _jsx(Loader2, { className: "size-3 animate-spin text-cyber", "aria-hidden": true }) : _jsx(Crosshair, { className: "size-3 text-term", "aria-hidden": true }), _jsx("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] text-ink-3 uppercase", children: running ? 'ANALYSIS PIPELINE' : 'PIPELINE COMPLETE' }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono tnum text-[11px] text-ink-4", children: [Math.min(SCAN_STEPS.length, Math.max(0, stepIndex)), "/", SCAN_STEPS.length] })] }), _jsx("div", { className: "space-y-0.5", children: SCAN_STEPS.map((step, index) => {
                            const state = index < stepIndex ? 'ok'
                                : index === stepIndex ? 'running'
                                    : 'pending';
                            return (_jsx(StepLine, { index: index + 1, label: `${step}${state === 'pending' ? '..............' : state === 'running' ? '.........' : '.........'}`, state: state === 'ok' ? 'ok' : state === 'running' ? 'running' : 'pending', detail: state === 'ok' ? 'OK' : state === 'running' ? 'working' : undefined }, step));
                        }) }), _jsx("div", { className: "mt-2 h-[3px] w-full overflow-hidden rounded-[1px] bg-raised", children: _jsx("div", { className: "h-full bg-cyber transition-[width] duration-200 ease-out", style: { width: `${(Math.max(0, stepIndex) / SCAN_STEPS.length) * 100}%` } }) })] })) : null, error && !running ? (_jsxs("div", { role: "alert", className: "mt-3 flex items-start gap-2 rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2.5 py-2", children: [_jsx(AlertTriangle, { className: "mt-px size-3.5 shrink-0 text-critical", "aria-hidden": true }), _jsxs("div", { className: "min-w-0", children: [_jsx("p", { className: "mono text-[10.5px] font-semibold tracking-[0.01em] text-critical uppercase", children: "ANALYSIS REJECTED" }), _jsx("p", { className: "mono mt-0.5 text-[11px] leading-relaxed text-ink-2", children: error })] })] })) : null, _jsxs("p", { className: "mono mt-2 flex items-center gap-1.5 text-[11px] text-ink-4", children: [_jsx(Globe, { className: "size-3", "aria-hidden": true }), "Defensive analysis for suspected phishing. Do not submit URLs you are not authorized to inspect."] })] }));
}
