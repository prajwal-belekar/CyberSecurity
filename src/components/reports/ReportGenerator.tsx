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
import type { Report, ReportGenerationRequest, ReportType } from '@/types/report';

const TYPES: Array<{ value: ReportType; label: string }> = [
  { value: 'security_summary', label: 'Security summary' },
  { value: 'incident', label: 'Incident report' },
  { value: 'threat', label: 'Threat report' },
  { value: 'network', label: 'Network report' },
  { value: 'authentication', label: 'Authentication report' },
];

const FORMATS: Array<ReportGenerationRequest['format']> = ['PDF', 'CSV', 'JSON'];
const CLASSIFICATIONS: Array<ReportGenerationRequest['classification']> = ['INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'];

const GENERATION_STEPS = [
  'Collecting telemetry', 'Correlating detections', 'Composing sections', 'Applying classification', 'Rendering document',
];

/** Report builder: type, period, format and classification, with a generation trace. */
export function ReportGenerator({ onGenerated }: { onGenerated?: (report: Report) => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  const iso = (date: Date) => date.toISOString().slice(0, 10);

  const [type, setType] = useState<ReportType>('security_summary');
  const [periodStart, setPeriodStart] = useState(iso(thirtyDaysAgo));
  const [periodEnd, setPeriodEnd] = useState(iso(today));
  const [format, setFormat] = useState<ReportGenerationRequest['format']>('PDF');
  const [classification, setClassification] = useState<ReportGenerationRequest['classification']>('CONFIDENTIAL');
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
    onError: (error: Error) => {
      setStepIndex(-1);
      toast.error('Generation failed', error.message);
    },
  });

  const invalidPeriod = new Date(periodStart) > new Date(periodEnd);

  return (
    <div className="min-w-0">
      <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-3">
        <Select
          label="Report type"
          value={type}
          onChange={(event) => setType(event.target.value as ReportType)}
          options={TYPES}
          disabled={generate.isPending}
        />
        <Input
          label="Period start"
          type="date"
          value={periodStart}
          max={periodEnd}
          onChange={(event) => setPeriodStart(event.target.value)}
          disabled={generate.isPending}
          className="mono"
        />
        <Input
          label="Period end"
          type="date"
          value={periodEnd}
          min={periodStart}
          onChange={(event) => setPeriodEnd(event.target.value)}
          disabled={generate.isPending}
          className="mono"
          error={invalidPeriod ? 'End date precedes the start date.' : undefined}
        />
        <Select
          label="Format"
          value={format}
          onChange={(event) => setFormat(event.target.value as ReportGenerationRequest['format'])}
          options={FORMATS.map((value) => ({ value, label: value }))}
          disabled={generate.isPending}
        />
        <Select
          label="Classification"
          value={classification}
          onChange={(event) => setClassification(event.target.value as ReportGenerationRequest['classification'])}
          options={CLASSIFICATIONS.map((value) => ({ value, label: value }))}
          disabled={generate.isPending}
        />
        <div className="flex items-end">
          <Button
            variant="primary"
            size="md"
            className="h-9 w-full"
            loading={generate.isPending}
            disabled={invalidPeriod}
            icon={generate.isPending ? undefined : <FileDown className="size-4" aria-hidden />}
            onClick={() => generate.mutate()}
          >
            {generate.isPending ? 'Generating…' : 'Generate Report'}
          </Button>
        </div>
      </div>

      <div className="mt-2.5">
        <Toggle
          checked={includeIncidents}
          onChange={setIncludeIncidents}
          label="Include incident appendix"
          description="Attaches open and recently closed cases with their timelines, affected assets and AI triage summaries."
          disabled={generate.isPending}
        />
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] border border-line bg-base px-2.5 py-1.5">
        <span className="mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.01em] text-ink-4 uppercase">
          <CalendarRange className="size-3" aria-hidden />
          {periodStart} → {periodEnd}
        </span>
        <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">{type.replace(/_/g, ' ')}</span>
        <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">{format}</span>
        <span className="mono text-[11px] font-semibold tracking-[0.01em] text-medium uppercase">{classification}</span>
        <span className="mono ml-auto text-[11px] text-ink-4">{includeIncidents ? 'WITH APPENDIX' : 'NO APPENDIX'}</span>
      </div>

      {stepIndex >= 0 ? (
        <div className="mt-2.5 rounded-[2px] border border-line bg-void p-2.5">
          <div className="mb-2 flex items-center gap-2">
            {generate.isPending ? <Loader2 className="size-3 animate-spin text-cyber" aria-hidden /> : <FileDown className="size-3 text-term" aria-hidden />}
            <span className="mono text-[11px] font-semibold tracking-[0.02em] text-ink-3 uppercase">
              {generate.isPending ? 'RENDERING DOCUMENT' : 'DOCUMENT READY'}
            </span>
            <span className="flex-1" />
            <span className="mono tnum text-[11px] text-ink-4">
              {Math.min(GENERATION_STEPS.length, Math.max(0, stepIndex))}/{GENERATION_STEPS.length}
            </span>
          </div>
          <div className="space-y-0.5">
            {GENERATION_STEPS.map((step, index) => {
              const state = index < stepIndex ? 'ok' : index === stepIndex ? 'running' : 'pending';
              return (
                <StepLine
                  key={step}
                  index={index + 1}
                  label={`${step}${state === 'pending' ? '..............' : '.........'}`}
                  state={state}
                  detail={state === 'ok' ? 'OK' : state === 'running' ? 'working' : undefined}
                />
              );
            })}
          </div>
          <div className="mt-2">{generate.isPending ? <ScanBar tone="cyber" /> : <div className="h-[3px] w-full bg-term" aria-hidden />}</div>
        </div>
      ) : null}

      {generate.isError ? (
        <p role="alert" className="mono mt-2 rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2.5 py-1.5 text-[10.5px] text-critical">
          GENERATION FAILED :: {(generate.error as Error).message}
        </p>
      ) : null}
    </div>
  );
}
