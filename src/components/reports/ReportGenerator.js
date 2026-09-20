import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarRange, FileDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Select';
import { StepLine } from '@/components/ui/Terminal';
import { ScanBar } from '@/components/ui/Meter';
import { reportsApi } from '@/services/reportsApi';
import { queryKeys } from '@/services/queryKeys';
import { useToast } from '@/store/ToastContext';
const TYPES = [
    { value: 'security_summary', label: 'Security summary' },
    { value: 'incident', label: 'Incident report' },
    { value: 'threat', label: 'Threat report' },
    { value: 'network', label: 'Network report' },
    { value: 'authentication', label: 'Authentication report' },
];
const FORMATS = ['PDF', 'CSV', 'JSON'];
const CLASSIFICATIONS = ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];
const GENERATION_STEPS = [
    'Collecting telemetry', 'Correlating detections', 'Composing sections', 'Applying classification', 'Rendering document',
];
/** Report builder: type, period, format and classification, with a generation trace. */
export function ReportGenerator({ onGenerated }) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const iso = (date) => date.toISOString().slice(0, 10);
    const [type, setType] = useState('security_summary');
    const [periodStart, setPeriodStart] = useState(iso(thirtyDaysAgo));
    const [periodEnd, setPeriodEnd] = useState(iso(today));
    const [format, setFormat] = useState('PDF');
    const [classification, setClassification] = useState('CONFIDENTIAL');
    const [includeIncidents, setIncludeIncidents] = useState(true);
    const [stepIndex, setStepIndex] = useState(-1);
    const generate = useMutation({
        mutationFn: () => reportsApi.generate({
            type,
            periodStart: new Date(periodStart).toISOString(),
            periodEnd: new Date(periodEnd).toISOString(),
            format,
            classification,
            includeIncidents,
        }),
        onMutate: () => {
            setStepIndex(0);
            GENERATION_STEPS.forEach((_, index) => {
                window.setTimeout(() => setStepIndex(index + 1), 260 * (index + 1));
            });
        },
        onSuccess: (report) => {
            setStepIndex(GENERATION_STEPS.length);
            void queryClient.invalidateQueries({ queryKey: queryKeys.reports('all') });
            void queryClient.invalidateQueries({ queryKey: ['reports'] });
            toast.success('Report generated', `${report.id} · ${report.title}`);
            onGenerated?.(report);
        },
        onError: (error) => {
            setStepIndex(-1);
            toast.error('Generation failed', error.message);
        },
    });
    const invalidPeriod = new Date(periodStart) > new Date(periodEnd);
    return (_jsxs("div", { className: "min-w-0", children: [_jsxs("div", { className: "grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3", children: [_jsx(Select, { label: "Report type", value: type, onChange: (event) => setType(event.target.value), options: TYPES, disabled: generate.isPending }), _jsx(Input, { label: "Period start", type: "date", value: periodStart, max: periodEnd, onChange: (event) => setPeriodStart(event.target.value), disabled: generate.isPending, className: "mono" }), _jsx(Input, { label: "Period end", type: "date", value: periodEnd, min: periodStart, onChange: (event) => setPeriodEnd(event.target.value), disabled: generate.isPending, className: "mono", error: invalidPeriod ? 'End date precedes the start date.' : undefined }), _jsx(Select, { label: "Format", value: format, onChange: (event) => setFormat(event.target.value), options: FORMATS.map((value) => ({ value, label: value })), disabled: generate.isPending }), _jsx(Select, { label: "Classification", value: classification, onChange: (event) => setClassification(event.target.value), options: CLASSIFICATIONS.map((value) => ({ value, label: value })), disabled: generate.isPending }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { variant: "primary", size: "md", className: "h-9 w-full", loading: generate.isPending, disabled: invalidPeriod, icon: generate.isPending ? undefined : _jsx(FileDown, { className: "size-4", "aria-hidden": true }), onClick: () => generate.mutate(), children: generate.isPending ? 'Generating…' : 'Generate Report' }) })] }), _jsx("div", { className: "mt-2.5", children: _jsx(Toggle, { checked: includeIncidents, onChange: setIncludeIncidents, label: "Include incident appendix", description: "Attaches open and recently closed cases with their timelines, affected assets and AI triage summaries.", disabled: generate.isPending }) }), _jsxs("div", { className: "mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] border border-line bg-base px-2.5 py-1.5", children: [_jsxs("span", { className: "mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: [_jsx(CalendarRange, { className: "size-3", "aria-hidden": true }), periodStart, " \u2192 ", periodEnd] }), _jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: type.replace(/_/g, ' ') }), _jsx("span", { className: "mono text-[11px] tracking-[0.01em] text-ink-4 uppercase", children: format }), _jsx("span", { className: "mono text-[11px] font-semibold tracking-[0.01em] text-medium uppercase", children: classification }), _jsx("span", { className: "mono ml-auto text-[11px] text-ink-4", children: includeIncidents ? 'WITH APPENDIX' : 'NO APPENDIX' })] }), stepIndex >= 0 ? (_jsxs("div", { className: "mt-2.5 rounded-[2px] border border-line bg-void p-2.5", children: [_jsxs("div", { className: "mb-2 flex items-center gap-2", children: [generate.isPending ? _jsx(Loader2, { className: "size-3 animate-spin text-cyber", "aria-hidden": true }) : _jsx(FileDown, { className: "size-3 text-term", "aria-hidden": true }), _jsx("span", { className: "mono text-[11px] font-semibold tracking-[0.02em] text-ink-3 uppercase", children: generate.isPending ? 'RENDERING DOCUMENT' : 'DOCUMENT READY' }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono tnum text-[11px] text-ink-4", children: [Math.min(GENERATION_STEPS.length, Math.max(0, stepIndex)), "/", GENERATION_STEPS.length] })] }), _jsx("div", { className: "space-y-0.5", children: GENERATION_STEPS.map((step, index) => {
                            const state = index < stepIndex ? 'ok' : index === stepIndex ? 'running' : 'pending';
                            return (_jsx(StepLine, { index: index + 1, label: `${step}${state === 'pending' ? '..............' : '.........'}`, state: state, detail: state === 'ok' ? 'OK' : state === 'running' ? 'working' : undefined }, step));
                        }) }), _jsx("div", { className: "mt-2", children: generate.isPending ? _jsx(ScanBar, { tone: "cyber" }) : _jsx("div", { className: "h-[3px] w-full bg-term", "aria-hidden": true }) })] })) : null, generate.isError ? (_jsxs("p", { role: "alert", className: "mono mt-2 rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2.5 py-1.5 text-[10.5px] text-critical", children: ["GENERATION FAILED :: ", generate.error.message] })) : null] }));
}
