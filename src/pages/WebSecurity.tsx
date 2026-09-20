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
import type { ScanPhase, WebScanResult } from '@/types/websecurity';

const PHASE_ORDER: ScanPhase[] = ['initializing', 'configuration', 'headers', 'cookies', 'content', 'findings'];

/** Web Security Scanner — authorized-configuration assessment console. */
export default function WebSecurity() {
  const meta = routeMetaFor('/web-security');
  const toast = useToast();
  const timers = useRef<number[]>([]);

  const [phaseIndex, setPhaseIndex] = useState(-1);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<WebScanResult | null>(null);
  const [scanTarget, setScanTarget] = useState<string | null>(null);

  const previous = useQuery({
    queryKey: queryKeys.webScan(),
    queryFn: () => webSecurityApi.previousScan(),
  });

  useEffect(() => {
    if (!result && previous.data) setResult(previous.data);
  }, [previous.data, result]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const startScan = async (target: string, token: string) => {
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
      await new Promise<void>((resolve) => { timers.current.push(window.setTimeout(resolve, elapsed + 120)); });
      const scan = await webSecurityApi.completeScan(target, token);
      setResult(scan);
      toast.success('Scan complete', `${scan.findings.length} findings · ${scan.summary.high} high severity.`);
    } catch (err) {
      toast.error('Scan failed', (err as Error).message);
      setScanTarget(target);
    } finally {
      setRunning(false);
      setPhaseIndex(PHASE_ORDER.length);
    }
  };

  const steps = SCAN_PIPELINE.map((stage, index) => {
    const state =
      index < phaseIndex ? (result && index === 2 && result.summary.high > 0 ? 'warning' : 'ok')
        : index === phaseIndex ? 'running'
          : 'pending';
    return {
      index: index + 1,
      label: stage.label,
      state: (state === 'ok' ? 'ok' : state) as 'ok' | 'running' | 'pending' | 'warning' | 'fail',
      detail: running && index === phaseIndex ? 'in progress' : index < phaseIndex ? 'done' : undefined,
    };
  });

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Web Security Scanner"
        description="Configuration and header assessment for authorized targets."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <ShieldCheck className="size-2.5 text-term" aria-hidden />
            <span className="text-[11px] text-ink-3">Defensive assessment</span>
          </span>
        }
        actions={result && !running ? (
          <Badge tone="term">LAST SCAN {formatTimestamp(result.completedAt ?? result.startedAt)}</Badge>
        ) : undefined}
      />

      <Panel title="Scan Target" icon={<Bug className="size-3.5" aria-hidden />} className="min-w-0">
        <ScannerForm onStart={(target, token) => void startScan(target, token)} running={running} defaultTarget={result?.target} />
      </Panel>

      {(running || phaseIndex >= 0) && scanTarget ? (
        <Panel
          title="Scan Pipeline"
          icon={<TerminalSquare className="size-3.5" aria-hidden />}
          className="min-w-0"
          actions={running ? <span className="mono text-[11px] text-cyber">RUNNING…</span> : <span className="mono text-[11px] text-term">COMPLETE</span>}
        >
          <div className="grid gap-2.5 lg:grid-cols-2">
            <ScanProgress steps={steps} target={scanTarget} running={running} />
            <TerminalBlock title="SCAN OUTPUT" maxHeight={208} showCaret={running}>
              <div className="text-ink-3">&gt; scan --target {scanTarget} --profile config</div>
              <div className="my-1 h-px bg-line" aria-hidden />
              {steps.filter((s) => s.state !== 'pending').map((step) => (
                <div key={step.index} className="flex items-baseline gap-2">
                  <span className={step.state === 'warning' ? 'text-medium' : 'text-term'}>
                    [{step.state === 'warning' ? '!' : '✓'}]
                  </span>
                  <span className="text-ink-2">{step.label}</span>
                  <span className="h-px min-w-3 flex-1 bg-line" aria-hidden />
                  <span className={step.state === 'running' ? 'text-cyber' : step.state === 'warning' ? 'text-medium' : 'text-ink-4'}>
                    {step.state === 'running' ? 'WORKING' : step.state === 'warning' ? 'FINDINGS' : 'DONE'}
                  </span>
                </div>
              ))}
              {result && !running ? (
                <>
                  <div className="my-1 h-px bg-line" aria-hidden />
                  <div className="text-ink-4">
                    Findings: <span className="text-critical">{result.summary.critical} CRIT</span> ·{' '}
                    <span className="text-high">{result.summary.high} HIGH</span> ·{' '}
                    <span className="text-medium">{result.summary.medium} MED</span> ·{' '}
                    <span className="text-low">{result.summary.low} LOW</span> ·{' '}
                    <span className="text-term">{result.summary.pass} PASS</span>
                  </div>
                  <div className="text-term">[✓] Report written · authorization {result.authorizationToken} recorded</div>
                </>
              ) : null}
            </TerminalBlock>
          </div>
        </Panel>
      ) : null}

      {previous.isLoading && !result ? (
        <div className="space-y-2.5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : previous.isError && !result ? (
        <Panel className="min-w-0">
          <ErrorState
            title="Unable to load the previous scan"
            message={(previous.error as Error).message}
            hint={(previous.error as { hint?: string })?.hint}
            onRetry={() => previous.refetch()}
          />
        </Panel>
      ) : result ? (
        <>
          <Panel title="Scan Results" icon={<ShieldCheck className="size-3.5" aria-hidden />} className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="mono min-w-0 truncate text-[11.5px] text-cyber">{result.target}</span>
              <Badge tone="term">AUTHZ {result.authorizationToken}</Badge>
              <Badge tone="neutral">{result.id}</Badge>
              <span className="mono inline-flex items-center gap-1 text-[11px] text-ink-4">
                <Clock className="size-2.5" aria-hidden />
                {formatTimestamp(result.startedAt)} → {result.completedAt ? formatTimestamp(result.completedAt) : 'running'}
              </span>
            </div>
            <VulnerabilitySummary summary={result.summary} />
          </Panel>

          <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
            <Panel title="Findings" icon={<Bug className="size-3.5" aria-hidden />} className="min-w-0 xl:col-span-2">
              <VulnerabilityTable findings={result.findings} />
            </Panel>

            <div className="flex min-w-0 flex-col gap-2.5">
              <Panel title="Security Headers" className="min-w-0">
                <SecurityHeaders headers={result.headers} />
              </Panel>

              <Panel title="Transport Security" icon={<Lock className="size-3.5" aria-hidden />} className="min-w-0">
                <KeyValueGrid
                  columns={1}
                  rows={[
                    { label: 'TLS version', value: result.tls.version },
                    { label: 'Cipher', value: result.tls.cipher },
                    { label: 'Grade', value: result.tls.grade, tone: result.tls.grade.startsWith('A') ? 'text-term' : 'text-medium' },
                    { label: 'Issuer', value: result.tls.certificateIssuer },
                    { label: 'Expires', value: result.tls.expiresAt },
                    { label: 'HSTS', value: result.tls.hsts ? 'ENABLED' : 'ABSENT', tone: result.tls.hsts ? 'text-term' : 'text-critical' },
                  ]}
                />
              </Panel>

              <Panel title="Observed Stack" className="min-w-0">
                {result.technologyStack.length ? (
                  <ul className="space-y-1">
                    {result.technologyStack.map((tech) => (
                      <li key={tech.name} className="flex items-center gap-2 border-b border-line pb-1 last:border-b-0">
                        <span className="min-w-0 flex-1 truncate text-[11px] text-ink-2">{tech.name}</span>
                        <span className="mono shrink-0 text-[11px] text-ink-4">{tech.category}</span>
                        <span className="mono tnum shrink-0 text-[11px] text-cyber">{(tech.confidence * 100).toFixed(0)}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <EmptyState compact title="No stack fingerprints" />
                )}
                <SectionRule className="mt-2.5 mb-1">Scope</SectionRule>
                <ul className="space-y-0.5">
                  {result.scope.map((entry) => (
                    <li key={entry} className="mono truncate text-[10.5px] text-ink-3">· {entry}</li>
                  ))}
                </ul>
              </Panel>
            </div>
          </div>
        </>
      ) : (
        <Panel className="min-w-0">
          <EmptyState
            icon={<Bug className="size-4" aria-hidden />}
            title="No scan results"
            description="Supply an authorized target above and start a scan. Configuration, header, cookie and content-exposure checks will be reported here."
            action={<Button variant="secondary" size="sm" onClick={() => previous.refetch()}>Reload last scan</Button>}
            prompt
          />
        </Panel>
      )}
    </div>
  );
}
