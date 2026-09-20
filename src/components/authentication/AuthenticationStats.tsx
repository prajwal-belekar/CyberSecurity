import { CheckCircle2, KeyRound, ShieldX, UserX } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { Meter } from '@/components/ui/Meter';
import { useQuery } from '@tanstack/react-query';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';

/** Successful / failed / suspicious / locked counters for the auth monitor. */
export function AuthenticationStats() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.authSummary(),
    queryFn: () => authenticationApi.summary(),
    staleTime: 15_000,
  });

  const failureRate = data ? Math.round((data.failed / Math.max(1, data.totalToday)) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      <StatTile
        loading={isLoading}
        label="Successful Logins"
        value={data?.successful ?? 0}
        icon={<CheckCircle2 className="size-4" aria-hidden />}
        tone="term"
        description={`${data?.uniqueUsers ?? 0} distinct identities · MFA coverage ${data?.mfaCoverage ?? 0}%`}
        footer={<Meter value={data?.mfaCoverage ?? 0} tone="term" label="MFA COVERAGE" />}
      />
      <StatTile
        loading={isLoading}
        label="Failed Logins"
        value={data?.failed ?? 0}
        icon={<KeyRound className="size-4" aria-hidden />}
        tone="medium"
        trend={{ delta: 34, period: 'vs yesterday' }}
        description={`${failureRate}% failure rate across ${data?.totalToday ?? 0} attempts today`}
        footer={<Meter value={failureRate} tone="warn" showValue={false} />}
      />
      <StatTile
        loading={isLoading}
        label="Suspicious Logins"
        value={data?.suspicious ?? 0}
        icon={<ShieldX className="size-4" aria-hidden />}
        tone="high"
        footer={
          data?.topSourceIps[0] ? (
            <span className="mono truncate text-[11px] text-ink-4">TOP SOURCE {data.topSourceIps[0].ip}</span>
          ) : undefined
        }
      />
      <StatTile
        loading={isLoading}
        label="Locked Accounts"
        value={data?.lockedAccounts ?? 0}
        icon={<UserX className="size-4" aria-hidden />}
        tone="critical"
        footer={
          data?.topFailingUsers[0] ? (
            <span className="mono truncate text-[11px] text-ink-4">MOST TARGETED {data.topFailingUsers[0].user}</span>
          ) : undefined
        }
      />
    </div>
  );
}

/** Side rail: most-targeted identities and noisiest source addresses. */
export function AuthenticationHotspots() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.authSummary(),
    queryFn: () => authenticationApi.summary(),
    staleTime: 15_000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-6 animate-pulse rounded-[2px] bg-raised" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="section-rule mb-1.5"><span>Most targeted identities</span></div>
        <ul className="space-y-1">
          {data.topFailingUsers.map((entry) => {
            const pct = (entry.failures / Math.max(1, data.topFailingUsers[0]!.failures)) * 100;
            return (
              <li key={entry.user} className="flex items-center gap-2">
                <span className="mono w-28 shrink-0 truncate text-[11px] text-ink-2">{entry.user}</span>
                <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-[1px] bg-raised">
                  <span className="block h-full bg-high" style={{ width: `${pct}%` }} aria-hidden />
                </span>
                <span className="mono tnum w-7 shrink-0 text-right text-[10.5px] text-high">{entry.failures}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <div className="section-rule mb-1.5"><span>Noisiest sources</span></div>
        <ul className="space-y-1">
          {data.topSourceIps.map((entry) => (
            <li key={entry.ip} className="flex items-center gap-2 rounded-[2px] border border-line bg-base px-2 py-1">
              <span className={`size-1.5 shrink-0 rounded-full ${entry.blocked ? 'bg-critical' : 'bg-term'}`} aria-hidden />
              <span className="mono min-w-0 flex-1 truncate text-[11px] text-cyber">{entry.ip}</span>
              <span className="mono tnum shrink-0 text-[10.5px] text-ink-3">{entry.attempts}</span>
              <span className={`mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] uppercase ${entry.blocked ? 'text-critical' : 'text-term'}`}>
                {entry.blocked ? 'DENIED' : 'OPEN'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
