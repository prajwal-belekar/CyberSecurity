import { Globe2, Radio, ShieldAlert } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { SeverityBadge, Badge } from '@/components/ui/Badge';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { Meter } from '@/components/ui/Meter';
import { CopyButton } from '@/components/ui/CopyButton';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { intelligenceApi } from '@/services/intelligenceApi';
import { queryKeys } from '@/services/queryKeys';
import { formatTimestamp, formatRelative } from '@/utils/dates';
import { cn } from '@/utils/cn';
import type { IndicatorStatus } from '@/types/intelligence';

const STATUS_TONE: Record<IndicatorStatus, string> = {
  active: 'border-critical/40 bg-critical/10 text-critical',
  suspicious: 'border-high/40 bg-high/10 text-high',
  under_review: 'border-medium/40 bg-medium/10 text-medium',
  whitelisted: 'border-term/40 bg-term/10 text-term',
  expired: 'border-line-3 bg-raised text-ink-4',
};

/** Full indicator record: provenance, confidence, WHOIS, references and tags. */
export function IndicatorDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.intelligence(id ?? 'none'),
    queryFn: () => intelligenceApi.byId(id!),
    enabled: Boolean(id),
  });

  return (
    <Drawer
      open={Boolean(id)}
      onClose={onClose}
      title={data ? `Indicator ${data.id}` : 'Indicator'}
      subtitle={data ? <span className="mono truncate text-[10.5px] text-cyber">{data.value}</span> : undefined}
      width="max-w-xl"
      footer={
        data ? (
          <div className="flex w-full flex-wrap items-center gap-1.5">
            <CopyButton value={data.value} label={`Copy ${data.value}`} />
            <span className="mono text-[11px] text-ink-4">Copy value</span>
            <span className="flex-1" />
            <Link to="/threat-intelligence">
              <Button variant="ghost" size="xs" icon={<Radio className="size-3" aria-hidden />}>Intel feed</Button>
            </Link>
            <Link to="/threats">
              <Button variant="secondary" size="xs" icon={<ShieldAlert className="size-3" aria-hidden />}>
                Hunt related threats
              </Button>
            </Link>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="space-y-2.5">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError ? (
        <ErrorState title="Indicator unavailable" message={(error as Error).message} onRetry={() => refetch()} />
      ) : !data ? (
        <EmptyState icon={<Globe2 className="size-4" aria-hidden />} title="No indicator selected" description="Choose a row in the intelligence feed to inspect its full record." prompt />
      ) : (
        <div className="space-y-3">
          <div className="rounded-[2px] border border-line-2 bg-base p-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <SeverityBadge severity={data.risk} />
              <span className={cn('mono rounded-[2px] border px-1.5 py-[1px] text-[10.5px] font-bold tracking-[0.01em] uppercase', STATUS_TONE[data.status])}>
                {data.status.replace(/_/g, ' ')}
              </span>
              <Badge tone="neutral">{data.type.replace(/_/g, ' ').toUpperCase()}</Badge>
              <span className="flex-1" />
              <span className="mono text-[11px] text-ink-4">LAST SEEN {formatRelative(data.lastSeen)}</span>
            </div>
            <p className="mono mt-2 flex items-start gap-1.5 text-[12px] leading-relaxed break-all text-cyber">
              <span className="min-w-0 flex-1">{data.value}</span>
              <CopyButton value={data.value} label={`Copy ${data.value}`} />
            </p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-ink-2">{data.description}</p>
          </div>

          <div>
            <SectionRule className="mb-1.5"><span>Confidence & coverage</span></SectionRule>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-[2px] border border-line bg-base p-2">
                <div className="label-xs mb-1">Source confidence</div>
                <Meter value={data.confidence * 100} tone={data.confidence > 0.75 ? 'err' : data.confidence > 0.45 ? 'warn' : 'term'} />
                <p className="mono mt-1 text-[11px] text-ink-4">{(data.confidence * 100).toFixed(0)}% · {data.source}</p>
              </div>
              <div className="rounded-[2px] border border-line bg-base p-2">
                <div className="label-xs mb-1">Internal correlation</div>
                <div className="mono tnum text-[22px] leading-none font-bold text-cyber">{data.relatedEvents}</div>
                <p className="mt-1 text-[11px] text-ink-4">Matching security events</p>
              </div>
            </div>
          </div>

          <div>
            <SectionRule className="mb-1.5"><span>Record</span></SectionRule>
            <KeyValueGrid
              columns={2}
              rows={[
                { label: 'Indicator ID', value: data.id, copy: data.id, mono: true },
                { label: 'Type', value: data.type.replace(/_/g, ' '), mono: true },
                { label: 'Feed source', value: data.source },
                { label: 'Country', value: data.country ?? '—' },
                { label: 'Threat actor', value: data.threatActor ?? 'UNATTRIBUTED' },
                { label: 'Campaign', value: data.campaign ?? '—' },
                { label: 'First seen', value: formatTimestamp(data.firstSeen), mono: true },
                { label: 'Last seen', value: formatTimestamp(data.lastSeen), mono: true },
              ]}
            />
          </div>

          {data.whois && Object.keys(data.whois).length ? (
            <div>
              <SectionRule className="mb-1.5"><span>Registration data</span></SectionRule>
              <dl className="rounded-[2px] border border-line bg-void p-2">
                {Object.entries(data.whois).map(([key, value]) => (
                  <div key={key} className="flex items-baseline justify-between gap-3 border-b border-line py-1 last:border-b-0">
                    <dt className="label-xs shrink-0">{key.toUpperCase()}</dt>
                    <dd className="mono min-w-0 truncate text-right text-[10.5px] text-ink-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}

          {data.tags.length ? (
            <div>
              <SectionRule className="mb-1.5"><span>Tags</span></SectionRule>
              <ul className="flex flex-wrap gap-1">
                {data.tags.map((tag) => (
                  <li key={tag} className="mono rounded-[2px] border border-line-2 bg-raised px-1.5 py-[1px] text-[11px] tracking-[0.01em] text-ink-3 uppercase">{tag}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {data.references?.length ? (
            <div>
              <SectionRule className="mb-1.5"><span>References</span></SectionRule>
              <ul className="space-y-0.5">
                {data.references.map((reference) => (
                  <li key={reference} className="mono flex items-start gap-2 text-[10.5px] leading-relaxed break-all text-ink-3">
                    <span className="shrink-0 text-term">›</span>
                    <span className="min-w-0">{reference}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </Drawer>
  );
}
