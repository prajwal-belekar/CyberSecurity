import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, Terminal } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { AskAIButton, SeverityLine, SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { useThreats } from '@/hooks/useThreats';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
import { severityRank } from '@/utils/severity';
import { formatRelative } from '@/utils/dates';
import type { Severity } from '@/types/common';
import type { Threat } from '@/types/threat';

/** Simple Mode Threat Monitor — plain-language security alerts. */
export default function SimpleThreats() {
  const meta = routeMetaFor('/threats');
  const [severity, setSeverity] = useState<string>('all');
  const [search, setSearch] = useState('');
  const { data: summary, isLoading: summaryLoading } = useThreatSummary();
  const { data: threats = [], isLoading, isError, error, refetch } = useThreats();

  const active = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return threats
      .filter((t) => t.status !== 'resolved' && t.status !== 'false_positive')
      .filter((t) => (severity === 'all' ? true : t.severity === severity))
      .filter((t) => {
        if (!needle) return true;
        return [t.id, t.title, t.type, t.source, t.target, t.description].join(' ').toLowerCase().includes(needle);
      })
      .sort((a, b) => (severityRank(b.severity) - severityRank(a.severity)) || +new Date(b.lastSeen) - +new Date(a.lastSeen));
  }, [threats, severity, search]);

  const resolvedCount = threats.filter((t) => t.status === 'resolved' || t.status === 'false_positive').length;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Security Alerts"
        description="Everything the detection engine has flagged, explained in plain language."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <span className="size-1.5 animate-pulse-dot rounded-full bg-term" aria-hidden />
            <span className="text-[11px] text-ink-3">Detection active</span>
          </span>
        }
      />

      <SimpleQA question="What is this showing me?">
        <p>
          This is the list of every suspicious thing CyberSentinel detected. An alert is a signal that
          something unusual happened — it does not always mean an attack. Start with the highest
          severity entries (Crit / High), read the recommendation under each one, then investigate
          only the alerts that matter.
        </p>
      </SimpleQA>

      {/* Severity counts */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {(['critical', 'high', 'medium', 'low', 'info'] as Severity[]).map((level) => (
          <StatTile
            key={level}
            loading={summaryLoading}
            label={level.toUpperCase()}
            value={summary ? summary[level] : 0}
            padded={level === 'critical' || level === 'high'}
            tone={level === 'critical' ? 'critical' : level === 'high' ? 'high' : level === 'medium' ? 'medium' : 'cyber'}
            icon={<ShieldAlert className="size-3.5" aria-hidden />}
            onClick={() => setSeverity((current) => (current === level ? 'all' : level))}
            className={severity === level ? 'border-term/45 bg-term/5' : undefined}
            description={severity === level ? 'Filter active — click to clear' : 'click to filter'}
          />
        ))}
      </div>

      <Panel
        title="Active Alerts"
        icon={<ShieldAlert className="size-3.5" aria-hidden />}
        className="min-w-0"
        actions={
          <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">
            {active.length} ACTIVE{resolvedCount ? ` · ${resolvedCount} RESOLVED` : ''}
          </span>
        }
      >
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onValueChange={setSearch}
            placeholder="Search alerts, sources or descriptions…"
            aria-label="Search alerts"
            className="h-7 max-w-xs text-[11px]"
          />
          <Select
            compact
            aria-label="Filter by severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[
              { value: 'all', label: 'All severities' },
              { value: 'critical', label: 'Critical' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
              { value: 'info', label: 'Info' },
            ]}
            className="w-auto"
          />
          <span className="flex-1" />
          <Link to="/threats?mode=analyst">
            <Button size="xs" variant="ghost" icon={<Terminal className="size-3" aria-hidden />}>Open full analyst grid</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load alerts" message={(error as Error)?.message ?? 'The threat service could not be reached.'} onRetry={() => refetch()} />
        ) : active.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-[2px] border border-term/30 bg-term/10 text-term">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <p className="text-[13px] font-medium text-ink">No active alerts</p>
            <p className="mono max-w-sm text-[11px] leading-relaxed text-ink-4">
              {severity !== 'all' || search ? 'Nothing matches the current filter.' : 'Nothing is demanding attention right now.'}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {active.map((threat) => <ThreatSimpleRow key={threat.id} threat={threat} />)}
          </ul>
        )}
      </Panel>

      <TechnicalDetails title="Advanced investigation" hint="Dense triage grid with filters" defaultOpen={false}>
        <p className="mb-2 text-[12px] leading-relaxed text-ink-2">
          The Analyst threat monitor adds per-severity filters, a sortable grid, confidence meters and
          bulk status triage. Your investigation context is shared between both modes.
        </p>
        <Link to="/threats?mode=analyst">
          <Button size="sm" variant="secondary" icon={<Terminal className="size-3" aria-hidden />}>Open Analyst View</Button>
        </Link>
      </TechnicalDetails>
    </div>
  );
}

function ThreatSimpleRow({ threat }: { threat: Threat }) {
  return (
    <li className="rounded-[2px] border border-line bg-raised p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <SeverityLine severity={threat.severity} />
        <span className="mono text-[11px] font-bold text-term">{threat.id}</span>
        <Badge tone="neutral" title="Detection status">{threat.status.replace(/_/g, ' ')}</Badge>
        <span className="flex-1" />
        <span className="mono text-[10.5px] text-ink-4">LAST {formatRelative(threat.lastSeen)}</span>
      </div>
      <p className="mt-1.5 text-[13px] font-semibold text-ink">{threat.title}</p>
      <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{threat.description}</p>
<TechnicalDetails title="Technical details" hint="Detection specifics" defaultOpen={false}>
         <p className="mono mt-1 text-[10.5px] text-ink-4">
           {threat.source} → {threat.target} · {threat.type.replace(/_/g, ' ')} · Confidence {Math.round(threat.confidence * 100)}%
         </p>
       </TechnicalDetails>
      {threat.recommendedActions.length ? (
        <p className="mt-2 rounded-[2px] border border-line bg-base px-2 py-1.5 text-[11.5px] leading-relaxed text-ink-3">
          <span className="font-semibold text-term">Recommended: </span>
          {threat.recommendedActions[0]}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Link to={`/threats/${threat.id}`}>
          <Button size="xs" variant="primary">Investigate</Button>
        </Link>
        {threat.incidentId ? (
          <Link to={`/incidents/${threat.incidentId}`}>
            <Button size="xs" variant="secondary">Open investigation</Button>
          </Link>
        ) : null}
        <Link to={`/threats/${threat.id}`}>
          <Button size="xs" variant="ghost">Details</Button>
        </Link>
        <AskAIButton to={`/ai-assistant?threat=${threat.id}`} label="Ask AI" size="xs" />
      </div>
    </li>
  );
}