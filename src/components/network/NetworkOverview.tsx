import { Ban, Link2, Radio, ShieldAlert, Waypoints } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useNetworkSummary } from '@/hooks/useNetworkEvents';
import { formatNumber } from '@/utils/formatting';

/** Four primary connection counters required at the top of the network monitor. */
export function NetworkOverviewStats() {
  const { data, isLoading } = useNetworkSummary();

  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      <StatTile
        loading={isLoading}
        label="Connected Devices"
        value={data?.connectedDevices ?? 0}
        icon={<Waypoints className="size-4" aria-hidden />}
        tone="cyber"
        footer={<Meter value={Math.min(100, ((data?.connectedDevices ?? 0) / 200) * 100)} tone="cyber" showValue={false} />}
      />
      <StatTile
        loading={isLoading}
        label="Active Connections"
        value={data?.activeConnections ?? 0}
        icon={<Link2 className="size-4" aria-hidden />}
        tone="term"
        trend={{ delta: 4.2, period: 'vs 1h ago' }}
        description={`${data ? (data.inboundMbps + data.outboundMbps).toFixed(1) : '0'} Mbps total throughput`}
        footer={<Meter value={Math.min(100, ((data?.totalBandwidthMbps ?? 0) / 250) * 100)} tone="term" showValue={false} />}
      />
      <StatTile
        loading={isLoading}
        label="Suspicious Connections"
        value={data?.suspiciousConnections ?? 0}
        icon={<ShieldAlert className="size-4" aria-hidden />}
        tone="high"
        trend={{ delta: 18, period: 'vs 1h ago' }}
        footer={<Meter value={Math.min(100, ((data?.suspiciousConnections ?? 0) / 60) * 100)} tone="warn" showValue={false} />}
      />
      <StatTile
        loading={isLoading}
        label="Blocked Connections"
        value={data?.blockedConnections ?? 0}
        icon={<Ban className="size-4" aria-hidden />}
        tone="critical"
        description={`${data ? Math.round(((data.blockedConnections / Math.max(1, data.activeConnections + data.blockedConnections)) * 100)) : 0}% of attempted sessions denied`}
        footer={<Meter value={Math.min(100, ((data?.blockedConnections ?? 0) / 500) * 100)} tone="err" showValue={false} />}
      />
    </div>
  );
}

/** Bandwidth + protocol posture strip rendered under the topology canvas. */
export function NetworkThroughput() {
  const { data, isLoading } = useNetworkSummary();
  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel p-2.5">
            <div className="label-xs mb-1.5">Loading</div>
            <div className="mono h-4 w-16 animate-pulse rounded-[2px] bg-raised" />
          </div>
        ))}
      </div>
    );
  }
  const cells = [
    { label: 'INBOUND', value: `${data.inboundMbps} Mbps`, tone: 'text-cyber', meter: (data.inboundMbps / data.totalBandwidthMbps) * 100, mTone: 'cyber' as const },
    { label: 'OUTBOUND', value: `${data.outboundMbps} Mbps`, tone: 'text-term', meter: (data.outboundMbps / data.totalBandwidthMbps) * 100, mTone: 'term' as const },
    { label: 'TOTAL', value: `${data.totalBandwidthMbps} Mbps`, tone: 'text-ink', meter: Math.min(100, (data.totalBandwidthMbps / 250) * 100), mTone: 'neutral' as const },
    { label: 'DENY RATE', value: `${Math.round((data.blockedConnections / Math.max(1, data.blockedConnections + data.activeConnections)) * 100)}%`, tone: 'text-critical', meter: (data.blockedConnections / Math.max(1, data.blockedConnections + data.activeConnections)) * 100, mTone: 'err' as const },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {cells.map((cell) => (
        <div key={cell.label} className="panel p-2.5">
          <div className="label-xs">{cell.label}</div>
          <div className={`mono tnum mt-1 text-[16px] leading-none font-semibold ${cell.tone}`}>{cell.value}</div>
          <Meter value={cell.meter} tone={cell.mTone} className="mt-2" showValue={false} />
        </div>
      ))}
    </div>
  );
}

/** Live session indicator used in the network page header. */
export function NetworkLiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-cyber/35 bg-cyber/10 px-1.5 py-[1px]">
      <Radio className="size-2.5 text-cyber" aria-hidden />
      <span className="text-[11px] text-ink-3">Flow capture active</span>
    </span>
  );
}

export { formatNumber };
