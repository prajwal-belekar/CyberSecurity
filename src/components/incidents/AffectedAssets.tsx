import { ServerCog, AlertOctagon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SeverityBadge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CopyButton } from '@/components/ui/CopyButton';
import type { AffectedAsset } from '@/types/incident';

const TYPE_LABEL: Record<AffectedAsset['type'], string> = {
  host: 'HOST', service: 'SERVICE', account: 'ACCOUNT', database: 'DATABASE', gateway: 'GATEWAY', endpoint: 'ENDPOINT', iot: 'IOT',
};

/** Asset impact table: name, type, address, owner, criticality, compromise state. */
export function AffectedAssets({ assets }: { assets: AffectedAsset[] }) {
  if (!assets.length) {
    return <EmptyState compact icon={<ServerCog className="size-4" aria-hidden />} title="No assets linked" description="Affected hosts, services and accounts will be listed here." />;
  }

  const compromised = assets.filter((asset) => asset.compromised);

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="mono text-[11px] tracking-[0.01em] text-ink-4 ">{assets.length} assets in scope</span>
        {compromised.length ? (
          <span className="mono inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.01em] text-critical uppercase">
            <AlertOctagon className="size-2.5" aria-hidden />{compromised.length} COMPROMISED
          </span>
        ) : (
          <span className="mono text-[11px] font-bold tracking-[0.01em] text-term uppercase">NONE COMPROMISED</span>
        )}
      </div>

      <ul className="space-y-px">
        {assets.map((asset) => (
          <li
            key={asset.id}
            className={cn(
              'relative overflow-hidden rounded-[2px] border px-2 py-1.5 transition-colors',
              asset.compromised ? 'border-critical/30 bg-critical/[0.04]' : 'border-line bg-base hover:border-line-2',
            )}
          >
            <span className={cn('absolute inset-y-0 left-0 w-[2px]', asset.compromised ? 'bg-critical' : 'bg-line-2')} aria-hidden />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="mono shrink-0 text-[10.5px] font-bold text-ink">{asset.name}</span>
              <span className="mono shrink-0 rounded-[2px] border border-line-2 bg-raised px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] text-ink-3 uppercase">
                {TYPE_LABEL[asset.type]}
              </span>
              {asset.ip ? (
                <span className="mono flex shrink-0 items-center gap-1 text-[11px] text-cyber">
                  {asset.ip}<CopyButton value={asset.ip} label={`Copy ${asset.ip}`} />
                </span>
              ) : null}
              <span className="flex-1" />
              <SeverityBadge severity={asset.criticality} showGlyph={false} />
              {asset.compromised ? (
                <span className="mono shrink-0 rounded-[2px] border border-critical/40 bg-critical/10 px-1 py-[1px] text-[10.5px] font-bold tracking-[0.01em] text-critical uppercase">
                  COMPROMISED
                </span>
              ) : (
                <span className="mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] text-ink-4 uppercase">EXPOSED</span>
              )}
            </div>
            <div className="mono mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-ink-4">
              <span>{asset.id}</span>
              {asset.owner ? <span>OWNER {asset.owner}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
