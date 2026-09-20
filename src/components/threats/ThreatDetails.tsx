import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bot, Crosshair, FileText, Gavel, Layers, Siren, Target, Wrench,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Panel } from '@/components/ui/Card';
import { Badge, SeverityBadge, StatusBadge, ThreatTypeBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { KeyValueGrid, SectionRule } from '@/components/ui/KeyValue';
import { CopyButton } from '@/components/ui/CopyButton';
import { Meter } from '@/components/ui/Meter';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/store/ToastContext';
import { threatsApi } from '@/services/threatsApi';
import { incidentsApi } from '@/services/incidentsApi';
import { formatRelative, formatTimestamp } from '@/utils/dates';
import type { Threat } from '@/types/threat';
import type { EventStatus } from '@/types/common';

const STATUS_ACTIONS: Array<{ status: EventStatus; label: string }> = [
  { status: 'investigating', label: 'Investigate' },
  { status: 'contained', label: 'Contain' },
  { status: 'resolved', label: 'Resolve' },
  { status: 'false_positive', label: 'False positive' },
];

/** Full forensic breakdown of a single threat. */
export function ThreatDetails({ threat }: { threat: Threat }) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (status: EventStatus) => threatsApi.updateStatus(threat.id, status),
    onSuccess: (_data, status) => {
      queryClient.invalidateQueries({ queryKey: ['threats'] });
      queryClient.invalidateQueries({ queryKey: ['threat-summary'] });
      toast.success('Threat status updated', `${threat.id} → ${status.replace('_', ' ').toUpperCase()}`);
    },
    onError: (err: Error) => toast.error('Could not update threat', err.message),
  });

  const escalateMutation = useMutation({
    mutationFn: () => incidentsApi.escalateToIncident(threat.relatedEventIds[0] ?? ''),
    onSuccess: (result) => {
      if (result?.incidentId) {
        toast.success('Incident created', `${result.incidentId} raised from ${threat.id}.`);
        navigate(`/incidents/${result.incidentId}`);
      } else {
        toast.info('No linked event', 'This threat has no correlated event to escalate from. Open an event and create the incident there.');
      }
    },
    onError: (err: Error) => toast.error('Could not create incident', err.message),
  });

  return (
    <div className="space-y-2.5">
      {/* Header block */}
      <Panel accent={threat.severity === 'critical' ? 'critical' : threat.severity === 'high' ? 'high' : 'none'} noPadding className="min-w-0">
        <div className="border-b border-line bg-panel-2 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.01em] text-ink-4">Threat /</span>
            <span className="mono text-[13px] font-bold tracking-[0.01em] text-term">{threat.id}</span>
            <SeverityBadge severity={threat.severity} />
            <StatusBadge status={threat.status} />
            <ThreatTypeBadge type={threat.type} />
            <span className="flex-1" />
            <Badge tone={threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral'}>
              CONFIDENCE {threat.confidence.toFixed(2)}
            </Badge>
          </div>
          <h2 className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-ink sm:text-[17px]">
            {threat.title}
          </h2>
        </div>

        <div className="grid gap-x-4 px-3 py-2 lg:grid-cols-2">
          <KeyValueGrid
            columns={1}
            rows={[
              { label: 'Source', value: threat.source, copy: threat.source },
              { label: 'Target', value: threat.target, copy: threat.target },
              { label: 'First seen', value: formatTimestamp(threat.firstSeen) },
              { label: 'Last seen', value: `${formatTimestamp(threat.lastSeen)} · ${formatRelative(threat.lastSeen)}` },
            ]}
          />
          <KeyValueGrid
            columns={1}
            rows={[
              { label: 'Occurrences', value: String(threat.occurrences) },
              { label: 'Detection rule', value: threat.detectionRule, copy: threat.detectionRule },
              { label: 'MITRE', value: threat.mitre ? `${threat.mitre.id} · ${threat.mitre.technique}` : '—' },
              { label: 'Tactic', value: threat.mitre?.tactic ?? '—' },
              ...(threat.incidentId ? [{ label: 'Incident', value: threat.incidentId, copy: threat.incidentId }] : []),
            ]}
          />
        </div>
      </Panel>

      {/* Narrative + confidence */}
      <div className="grid min-w-0 gap-2.5 lg:grid-cols-3">
        <Panel title="Assessment" icon={<FileText className="size-3.5" aria-hidden />} className="min-w-0 lg:col-span-2">
          <p className="text-[12px] leading-relaxed text-ink-2">{threat.description}</p>
          {threat.mitre ? (
            <div className="mt-2.5 border-t border-line pt-2">
              <SectionRule className="mb-1.5">ATT&CK mapping</SectionRule>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="ai">{threat.mitre.id}</Badge>
                <span className="mono text-[11px] text-ink-2">{threat.mitre.technique}</span>
                <span className="mono text-[11px] text-ink-4">· {threat.mitre.tactic}</span>
              </div>
            </div>
          ) : null}
        </Panel>

        <Panel title="Detection Confidence" icon={<Crosshair className="size-3.5" aria-hidden />} className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn('mono tnum text-[30px] leading-none font-bold', threat.confidence >= 0.8 ? 'text-term' : threat.confidence >= 0.6 ? 'text-medium' : 'text-ink-2')}>
              {(threat.confidence * 100).toFixed(0)}
            </span>
            <span className="mono text-[11px] text-ink-4">/ 100</span>
          </div>
          <Meter
            value={threat.confidence * 100}
            tone={threat.confidence >= 0.8 ? 'term' : threat.confidence >= 0.6 ? 'warn' : 'neutral'}
            className="mt-2"
            showValue={false}
          />
          <dl className="mt-2.5 space-y-1">
            {[
              { k: 'Correlated events', v: String(threat.relatedEventIds.length) },
              { k: 'Indicators matched', v: String(threat.indicators.length) },
              { k: 'Observation window', v: `${Math.max(1, Math.round((+new Date(threat.lastSeen) - +new Date(threat.firstSeen)) / 60000))}m` },
              { k: 'Repeat occurrences', v: String(threat.occurrences) },
            ].map((row) => (
              <div key={row.k} className="flex items-baseline justify-between gap-2 border-b border-line pb-1 last:border-b-0">
                <dt className="label-xs">{row.k}</dt>
                <dd className="mono tnum text-[11px] text-ink">{row.v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      {/* Indicators + actions */}
      <div className="grid min-w-0 gap-2.5 lg:grid-cols-2">
        <Panel title="Indicators" icon={<Layers className="size-3.5" aria-hidden />} className="min-w-0">
          {threat.indicators.length ? (
            <ul className="space-y-1">
              {threat.indicators.map((indicator) => (
                <li key={indicator} className="flex items-center gap-2 rounded-[2px] border border-line bg-base px-2 py-1">
                  <Target className="size-3 shrink-0 text-cyber" aria-hidden />
                  <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink-2">{indicator}</span>
                  <CopyButton value={indicator} label={`Copy indicator ${indicator}`} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState compact icon={<Layers className="size-4" aria-hidden />} title="No indicators extracted" description="The detection rule fired without exporting discrete indicators." />
          )}
        </Panel>

        <Panel title="Recommended Actions" icon={<Wrench className="size-3.5" aria-hidden />} className="min-w-0">
          <ol className="space-y-1.5">
            {threat.recommendedActions.map((action, index) => (
              <li key={action} className="flex items-start gap-2">
                <span className="mono mt-px shrink-0 rounded-[2px] border border-line-2 bg-raised px-1 text-[10.5px] text-ink-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-[11.5px] leading-relaxed text-ink-2">{action}</span>
              </li>
            ))}
          </ol>

          <SectionRule className="mt-3 mb-2">Analyst actions</SectionRule>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_ACTIONS.map((action) => (
              <Button
                key={action.status}
                size="xs"
                variant={threat.status === action.status ? 'primary' : 'secondary'}
                icon={<Gavel className="size-3" aria-hidden />}
                onClick={() => statusMutation.mutate(action.status)}
                loading={statusMutation.isPending && statusMutation.variables === action.status}
                disabled={threat.status === action.status}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Button
              size="xs"
              variant="danger"
              icon={<Siren className="size-3" aria-hidden />}
              onClick={() => escalateMutation.mutate()}
              loading={escalateMutation.isPending}
              disabled={Boolean(threat.incidentId)}
            >
              {threat.incidentId ? `Linked · ${threat.incidentId}` : 'Create incident'}
            </Button>
            <Button size="xs" variant="ghost" icon={<Bot className="size-3" aria-hidden />} onClick={() => navigate(`/ai-assistant?threat=${threat.id}${threat.incidentId ? `&incident=${threat.incidentId}` : ''}`)}>
              Ask AI terminal
            </Button>
            {threat.incidentId ? (
              <Button size="xs" variant="outline" icon={<Siren className="size-3" aria-hidden />} onClick={() => navigate(`/incidents/${threat.incidentId}`)}>
                Open {threat.incidentId}
              </Button>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
