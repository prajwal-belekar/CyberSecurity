import { useState } from 'react';
import { Ban, CheckCircle2, Fingerprint, KeyRound, Lock, ShieldAlert, TriangleAlert } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { SeverityBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { AuthenticationFilters } from './AuthenticationFilters';
import { CopyButton } from '@/components/ui/CopyButton';
import { useQuery } from '@tanstack/react-query';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import { formatClockShort, formatRelative } from '@/utils/dates';
import { severityRank } from '@/utils/severity';
import { cn } from '@/utils/cn';
import type { AuthQuery } from '@/services/authenticationApi';
import type { AuthenticationEvent, AuthStatus } from '@/types/authentication';
import type { ReactNode } from 'react';

const PAGE_SIZE = 12;
const EMPTY_QUERY: AuthQuery = { page: 1, pageSize: PAGE_SIZE };

const STATUS_META: Record<AuthStatus, { label: string; icon: ReactNode; className: string }> = {
  success: { label: 'SUCCESS', icon: <CheckCircle2 className="size-3" aria-hidden />, className: 'border-term/35 bg-term/10 text-term' },
  failed: { label: 'FAILED', icon: <KeyRound className="size-3" aria-hidden />, className: 'border-high/35 bg-high/10 text-high' },
  locked: { label: 'LOCKED', icon: <Lock className="size-3" aria-hidden />, className: 'border-critical/35 bg-critical/10 text-critical' },
  mfa_challenge: { label: 'MFA CHALLENGE', icon: <Fingerprint className="size-3" aria-hidden />, className: 'border-cyber/35 bg-cyber/10 text-cyber' },
  mfa_failed: { label: 'MFA FAILED', icon: <TriangleAlert className="size-3" aria-hidden />, className: 'border-critical/35 bg-critical/10 text-critical' },
  suspicious: { label: 'SUSPICIOUS', icon: <ShieldAlert className="size-3" aria-hidden />, className: 'border-medium/35 bg-medium/10 text-medium' },
  blocked: { label: 'BLOCKED', icon: <Ban className="size-3" aria-hidden />, className: 'border-critical/35 bg-critical/10 text-critical' },
};

/** Login event grid: user, IP, location, time, outcome and risk. */
export function LoginTable() {
  const [query, setQuery] = useState<AuthQuery>(EMPTY_QUERY);
  const [sortKey, setSortKey] = useState<string>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.authEvents(query),
    queryFn: () => authenticationApi.events(query),
    placeholderData: (previous) => previous,
  });

  const columns: Column<AuthenticationEvent>[] = [
    { key: 'timestamp', header: 'Time', sortValue: (row) => +new Date(row.timestamp), width: '116px', render: (row) => (
      <div className="min-w-0">
        <div className="mono tnum text-[10.5px] text-ink-3">{formatClockShort(row.timestamp)}</div>
        <div className="mono text-[10.5px] text-ink-4">{formatRelative(row.timestamp)}</div>
      </div>
    ) },
    { key: 'user', header: 'User', sortValue: (row) => row.user, render: (row) => (
      <div className="min-w-0">
        <div className="truncate text-[11.5px] font-medium text-ink">{row.user}</div>
        <div className="mono truncate text-[10.5px] text-ink-4">{row.userId} · {row.device}</div>
      </div>
    ) },
    { key: 'ip', header: 'IP', sortValue: (row) => row.ip, width: '150px', render: (row) => (
      <span className="mono flex items-center gap-1 text-[10.5px] text-cyber">
        <span className="truncate">{row.ip}</span>
        <CopyButton value={row.ip} label={`Copy ${row.ip}`} />
      </span>
    ) },
    { key: 'location', header: 'Location', sortValue: (row) => row.location, hideBelow: 'md', render: (row) => (
      <span className="mono truncate text-[10.5px] text-ink-3">
        <span className="mr-1 text-ink-4">{row.countryCode}</span>{row.location}
      </span>
    ) },
    { key: 'method', header: 'Method', sortValue: (row) => row.method, width: '80px', hideBelow: 'lg', render: (row) => (
      <span className="mono text-[11px] tracking-[0.01em] text-ink-4 uppercase">{row.method.replace('_', ' ')}</span>
    ) },
    { key: 'status', header: 'Status', sortValue: (row) => row.status, width: '132px', render: (row) => {
      const meta = STATUS_META[row.status];
      return (
        <span className={cn('inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-[1px] font-mono text-[10.5px] font-semibold tracking-[0.01em] uppercase', meta.className)}>
          {meta.icon}{meta.label}
        </span>
      );
    } },
    { key: 'risk', header: 'Risk', sortValue: (row) => severityRank(row.risk), width: '96px', render: (row) => <SeverityBadge severity={row.risk} showGlyph={false} /> },
    { key: 'reason', header: 'Detail', sortValue: (row) => row.failureReason ?? '', hideBelow: 'xl', render: (row) => (
      <span className="mono truncate text-[11px] text-ink-4">{row.failureReason ?? (row.attemptNumber ? `attempt ${row.attemptNumber}` : '—')}</span>
    ) },
  ];

  const onSort = (key: string) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  return (
    <Panel
      title="Authentication Log"
      icon={<KeyRound className="size-3.5" aria-hidden />}
      noPadding
      className="min-w-0"
      actions={isFetching && !isLoading ? <span className="mono text-[11px] text-cyber">SYNC…</span> : undefined}
    >
      <div className="border-b border-line bg-base px-2.5 py-2">
        <AuthenticationFilters query={query} onChange={setQuery} onReset={() => setQuery(EMPTY_QUERY)} resultCount={data?.total} />
      </div>
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(row) => row.id}
        loading={isLoading}
        error={isError ? ((error as Error)?.message ?? 'Unable to load authentication events.') : null}
        onRetry={() => refetch()}
        sortBy={sortKey}
        sortDir={sortDir}
        onSortChange={onSort}
        rowAccent={(row) =>
          row.risk === 'critical' ? 'var(--color-critical)'
            : row.risk === 'high' ? 'var(--color-high)'
              : row.risk === 'medium' ? 'var(--color-medium)' : undefined}
        emptyTitle="No authentication records"
        emptyDescription="No logon events match the current filters."
        emptyIcon={<KeyRound className="size-4" aria-hidden />}
        caption="Authentication events"
        footer={<Pagination page={query.page ?? 1} pageSize={PAGE_SIZE} total={data?.total ?? 0} onChange={(page) => setQuery((q) => ({ ...q, page }))} label="logins" />}
      />
    </Panel>
  );
}
