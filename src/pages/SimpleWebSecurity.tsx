import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bug, ShieldCheck, TerminalSquare } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid } from '@/components/ui/KeyValue';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScannerForm } from '@/components/web-security/ScannerForm';
import { ScanProgress } from '@/components/web-security/ScanProgress';
import { VulnerabilitySummary } from '@/components/web-security/VulnerabilitySummary';
import { VulnerabilityTable } from '@/components/web-security/VulnerabilityTable';
import { SecurityHeaders } from '@/components/web-security/SecurityHeaders';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { webSecurityApi, SCAN_PIPELINE } from '@/services/webSecurityApi';
import { queryKeys } from '@/services/queryKeys';
import { useToast } from '@/store/ToastContext';
import { formatTimestamp } from '@/utils/dates';
import type { ScanPhase, WebScanResult } from '@/types/websecurity';

const PHASE_ORDER: ScanPhase[] = ['initializing', 'configuration', 'headers', 'cookies', 'content', 'findings'];

/** Simple Mode Web Security Check — is this website configured safely, explained plainly. */
export default function SimpleWebSecurity() {
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
        title="Is This Website Secure?"
        description="A defensive configuration check for sites you own or manage."
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

      <SimpleQA question="What does this tool do?">
        <p>
          It checks a website's security settings the way a consultant would: whether it forces secure
          connections (TLS/HSTS), sends the right security headers, and misconfigures anything that
          would let an attacker read or redirect traffic. Only scan sites you are authorized to test.
        </p>
      </SimpleQA>

      <Panel title="Scan Target" icon={<Bug className="size-3.5" aria-hidden />} className="min-w-0">
        <ScannerForm onStart={(target, token) => void startScan(target, token)} running={running} defaultTarget={result?.target} />
      </Panel>

      {(running || phaseIndex >= 0) && scanTarget ? (
        <Panel
          title="Scan in Progress"
          icon={<TerminalSquare className="size-3.5" aria-hidden />}
          className="min-w-0"
          actions={running ? <span className="mono text-[11px] text-cyber">RUNNING…</span> : <span className="mono text-[11px] text-term">COMPLETE</span>}
        >
          <ScanProgress steps={steps} target={scanTarget} running={running} />
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
          <SimpleQA question="Is the site set up safely?" tone={result.summary.high > 0 || result.summary.critical > 0 ? 'warn' : 'positive'}>
            <p>
              Scan of <span className="mono text-ink-2">{result.target}</span> found{' '}
              <span className="mono text-critical">{result.summary.critical}</span> critical,{' '}
              <span className="mono text-high">{result.summary.high}</span> high,{' '}
              <span className="mono text-medium">{result.summary.medium}</span> medium and{' '}
              <span className="mono text-ink-2">{result.summary.low}</span> low issues, plus{' '}
              <span className="mono text-term">{result.summary.pass}</span> passing checks.
            </p>
            <p className="text-ink-4">
              {result.summary.high > 0 || result.summary.critical > 0
                ? 'High-priority issues found — review the details below before launch or release.'
                : 'No high-priority issues — just routine hardening suggestions.'}
            </p>
          </SimpleQA>

          <Panel title="Scan Results" icon={<ShieldCheck className="size-3.5" aria-hidden />} className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <span className="mono min-w-0 truncate text-[11.5px] text-cyber">{result.target}</span>
              <Badge tone="term">AUTHZ {result.authorizationToken}</Badge>
              <Badge tone="neutral">{result.id}</Badge>
            </div>
            <VulnerabilitySummary summary={result.summary} />
          </Panel>

          <TechnicalDetails className="min-w-0" title="Technical details" hint={`${result.findings.length} findings`} defaultOpen={false}>
            <div className="grid gap-2.5 xl:grid-cols-3">
              <div className="min-w-0 xl:col-span-2">
                <SectionRuleLabel>The findings</SectionRuleLabel>
                <VulnerabilityTable findings={result.findings} />
              </div>
              <div className="flex min-w-0 flex-col gap-2.5">
                <div>
                  <SectionRuleLabel>Security headers</SectionRuleLabel>
                  <SecurityHeaders headers={result.headers} />
                </div>
                <div>
                  <SectionRuleLabel>Transport security</SectionRuleLabel>
                  <KeyValueGrid
                    columns={1}
                    rows={[
                      { label: 'TLS version', value: result.tls.version },
                      { label: 'Cipher', value: result.tls.cipher },
                      { label: 'Grade', value: result.tls.grade, tone: result.tls.grade.startsWith('A') ? 'text-term' : 'text-high' },
                      { label: 'Issuer', value: result.tls.certificateIssuer, mono: true },
                      { label: 'Expires', value: result.tls.expiresAt },
                      { label: 'HSTS', value: result.tls.hsts ? 'ENABLED' : 'ABSENT', tone: result.tls.hsts ? 'text-term' : 'text-critical' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </TechnicalDetails>
        </>
      ) : (
        <Panel className="min-w-0">
          <EmptyState
            icon={<Bug className="size-4" aria-hidden />}
            title="No scan results"
            description="Power an authorized target above and start a scan. Configuration, header, cookie and content-exposure checks will be reported here."
            action={<Button variant="secondary" size="sm" onClick={() => previous.refetch()}>Reload last scan</Button>}
            prompt
          />
        </Panel>
      )}
    </div>
  );
}

/** Small labelled divider used inside the collapsible — mirrors SectionRule prose. */
function SectionRuleLabel({ children }: { children: string }) {
  return <p className="label-xs mb-1">{children}</p>;
}