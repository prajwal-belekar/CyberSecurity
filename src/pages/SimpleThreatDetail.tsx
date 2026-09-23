import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, Terminal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { CopyButton } from '@/components/ui/CopyButton';
import { AskAIButton, SeverityLine, SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { threatsApi } from '@/services/threatsApi';
import { queryKeys } from '@/services/queryKeys';
import { severityMeta } from '@/utils/severity';
import { formatRelative, formatTimestamp } from '@/utils/dates';

/** Simple Mode Threat Detail — a single alert, answered in plain language. */
export default function SimpleThreatDetail() {
  const { threatId } = useParams<{ threatId: string }>();
  const navigate = useNavigate();

  const { data: threat, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.threatDetail(threatId ?? 'none'),
    queryFn: () => threatsApi.byId(threatId!),
    enabled: Boolean(threatId),
  });

  if (isLoading) {
    return (
      <div className="space-y-2.5 p-2.5 sm:p-3">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-2.5 xl:grid-cols-3">
          <Skeleton className="h-52 xl:col-span-2" />
          <Skeleton className="h-52" />
        </div>
      </div>
    );
  }

  if (isError || !threat) {
    return (
      <div className="p-3">
        <Panel className="min-w-0">
          <ErrorState
            title={`Alert ${threatId ?? ''} could not be loaded`}
            message={isError ? (error as Error).message : 'This detection is no longer in the active store.'}
            onRetry={isError ? () => refetch() : undefined}
            action={<Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />} onClick={() => navigate('/threats')}>Back to alerts</Button>}
          />
        </Panel>
      </div>
    );
  }

  const severityText = useMemo(() => {
    const map: Record<string, string> = {
      critical: 'Critical — the most serious kind of signal. Treat as a likely attack until proven otherwise.',
      high: 'High — strong evidence that something is wrong. Investigate soon.',
      medium: 'Medium — unusual activity worth confirming. Probably not urgent, but do not ignore it.',
      low: 'Low — minor anomaly, usually benign, still recorded.',
      info: 'Informational — logged for context. No action needed.',
    };
    return map[threat.severity] ?? map.info;
  }, [threat.severity]);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs
        items={[
          { label: 'CYBERSENTINEL', to: '/dashboard' },
          { label: 'Security Alerts', to: '/threats' },
          { label: threat.id },
        ]}
      />

      <PageHeader
        compact
        title={`Alert / ${threat.id}`}
        description="One detection, explained: what it is, how serious, what to do."
        status={
          <span className="flex flex-wrap items-center gap-1.5">
            <SeverityLine severity={threat.severity} />
            <StatusBadge status={threat.status} />
          </span>
        }
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />} onClick={() => navigate('/threats')}>
              All alerts
            </Button>
            {threat.incidentId ? (
              <Link to={`/incidents/${threat.incidentId}`}>
                <Button variant="ghost" size="sm">Open investigation</Button>
              </Link>
            ) : null}
            <AskAIButton to={`/ai-assistant?threat=${threat.id}`} label="Ask AI" size="sm" />
          </>
        }
      />

      <SimpleQA question="What kind of alert is this?" tone={threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'warn' : 'default'}>
        <p className="font-medium text-ink">{threat.title}</p>
        <p>{threat.description}</p>
        <div className="flex flex-wrap gap-1.5">
          <SeverityLine severity={threat.severity} />
          <StatusBadge status={threat.status} />
          <span className="mono inline-flex items-center gap-1 text-[11px] text-ink-3">{threat.type.replace(/_/g, ' ')}</span>
        </div>
      </SimpleQA>

      <SimpleQA question="How serious is it?" tone={threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'warn' : 'default'}>
        <p>{severityText}</p>
        <p className="text-ink-4">
          Detected by rule <span className="mono text-ink-2">{threat.detectionRule}</span> ·{' '}
          <span className="mono text-ink-2">{threat.occurrences}</span> occurrence{threat.occurrences === 1 ? '' : 's'} ·
          Confidence <span className="mono text-ink-2">{Math.round(threat.confidence * 100)}%</span> · first seen{' '}
          <span className="mono text-ink-2">{formatRelative(threat.firstSeen)}</span>
        </p>
      </SimpleQA>

      <SimpleQA question="Where did it come from?" tone="default">
        <p>
          From <span className="mono text-ink-2">{threat.source}</span> toward{' '}
          <span className="mono text-ink-2">{threat.target}</span>. This tells you which of your systems was
          touched so you can focus your response there.
        </p>
      </SimpleQA>

      <SimpleQA question="What should I do?" tone={threat.status === 'resolved' || threat.status === 'false_positive' ? 'positive' : 'default'}>
        {threat.recommendedActions.length ? (
          <ul className="space-y-1">
            {threat.recommendedActions.map((action) => (
              <li key={action} className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
                <span className="mono text-cyber" aria-hidden>›</span>
                <span className="min-w-0 flex-1">{action}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-ink-2">No automatic response was configured for this detection. Review the evidence and decide whether to open an investigation.</p>
        )}
      </SimpleQA>

      <TechnicalDetails
        className="min-w-0"
        title="Technical details"
        hint={`MITRE ${threat.mitre?.id ?? '—'} · ${threat.indicators.length} indicators`}
      >
        <KeyValueGrid
          columns={2}
          rows={[
            { label: 'Alert ID', value: threat.id, copy: threat.id, mono: true },
            { label: 'Severity', value: severityMeta(threat.severity).label, mono: true },
            { label: 'Source', value: threat.source, copy: threat.source, mono: true },
            { label: 'Target', value: threat.target, copy: threat.target, mono: true },
            { label: 'First seen', value: formatTimestamp(threat.firstSeen), mono: true },
            { label: 'Last seen', value: formatTimestamp(threat.lastSeen), mono: true },
            { label: 'Detection rule', value: threat.detectionRule, mono: true },
            { label: 'Related incidents', value: threat.incidentId ?? '—', mono: true },
            ...(threat.mitre
              ? [{ label: 'MITRE', value: `${threat.mitre.id} · ${threat.mitre.technique}`, copy: threat.mitre.id, mono: true, span: true }]
              : []),
          ]}
        />
        <SectionRule className="mb-1 mt-2"><span>Indicators</span></SectionRule>
        <ul className="flex flex-wrap gap-1">
          {threat.indicators.map((indicator) => (
            <li key={indicator} className="mono inline-flex items-center gap-1 rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] text-cyber">
              {indicator}
              <CopyButton value={indicator} label={`Copy ${indicator}`} />
            </li>
          ))}
        </ul>
        {threat.relatedEventIds.length ? (
          <p className="mt-2 text-[11px] text-ink-3">
            <span className="label-xs mr-1 align-middle">LINKED EVENTS</span>
            {threat.relatedEventIds.slice(0, 10).join(' · ')}
            {threat.relatedEventIds.length > 10 ? ` · +${threat.relatedEventIds.length - 10}` : ''}
          </p>
        ) : null}
      </TechnicalDetails>

      <Panel title="Investigation Options" icon={<ShieldAlert className="size-3.5" aria-hidden />} className="min-w-0">
        <div className="flex flex-wrap gap-1.5">
          {threat.incidentId ? (
            <Link to={`/incidents/${threat.incidentId}?mode=analyst`}>
              <Button variant="primary" size="sm">Open the investigation file</Button>
            </Link>
          ) : (
            <Link to="/incidents">
              <Button variant="secondary" size="sm">Review current investigations</Button>
            </Link>
          )}
          <Link to={`/threats/${threat.id}?mode=analyst`}>
            <Button variant="ghost" size="sm" icon={<Terminal className="size-3" aria-hidden />}>Full analyst console</Button>
          </Link>
        </div>
      </Panel>
    </div>
  );
}