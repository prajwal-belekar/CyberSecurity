import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Tabs } from '@/components/ui/Tabs';
import { DualBarChart } from '@/components/ui/Chart';
import { SkeletonChart } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AuthenticationStats, AuthenticationHotspots } from '@/components/authentication/AuthenticationStats';
import { LoginTable } from '@/components/authentication/LoginTable';
import { LoginTimeline } from '@/components/authentication/LoginTimeline';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';
import type { TimeRange } from '@/types/common';
import { useSettings } from '@/store/SettingsContext';
import SimpleAuthentication from './SimpleAuthentication';

/** Authentication Monitor — outcomes chart, hotspots, sequences and the login grid. */
export default function Authentication() {
  const { settings } = useSettings();
  if (settings.uiMode === 'simple') return <SimpleAuthentication />;

  const [range, setRange] = useState<'24H' | '7D' | '30D'>('24H');
  const meta = routeMetaFor('/authentication');

  const series = useQuery({
    queryKey: queryKeys.authSeries(range),
    queryFn: () => authenticationApi.outcomesSeries(range),
  });

  const totals = (series.data ?? []).reduce(
    (acc, point) => ({
      successful: acc.successful + Number(point.successful ?? 0),
      failed: acc.failed + Number(point.failed ?? 0),
      suspicious: acc.suspicious + Number(point.suspicious ?? 0),
    }),
    { successful: 0, failed: 0, suspicious: 0 },
  );

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Authentication Monitor"
        description="Logon outcomes, MFA coverage and lockouts."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <KeyRound className="size-2.5 text-cyber" aria-hidden />
            <span className="text-[11px] text-ink-3">Identity feed live</span>
          </span>
        }
      />

      <AuthenticationStats />

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-3">
        <Panel
          title="Successful vs Failed Logins"
          icon={<KeyRound className="size-3.5" aria-hidden />}
          className="min-w-0 xl:col-span-2"
          noPadding
          actions={
            <Tabs
              ariaLabel="Login chart range"
              value={range}
              onChange={(value) => setRange(value as TimeRange as '24H' | '7D' | '30D')}
              items={[
                { value: '24H' as const, label: '24H' },
                { value: '7D' as const, label: '7D' },
                { value: '30D' as const, label: '30D' },
              ]}
            />
          }
        >
          <div className="p-2.5">
            {series.isLoading ? (
              <SkeletonChart height={240} />
            ) : series.isError ? (
              <ErrorState title="Unable to load login series" message={(series.error as Error).message} onRetry={() => series.refetch()} compact />
            ) : !series.data?.length ? (
              <EmptyState icon={<KeyRound className="size-4" aria-hidden />} title="No authentication data" description="No logon events recorded in this window." />
            ) : (
              <>
                <DualBarChart
                  data={series.data}
                  height={240}
                  ariaLabel={`Successful versus failed logins over the last ${range}`}
                  keys={[
                    { key: 'successful', name: 'SUCCESSFUL', color: '#3fb37f' },
                    { key: 'failed', name: 'FAILED', color: '#dd8a52' },
                    { key: 'suspicious', name: 'SUSPICIOUS', color: '#de6375' },
                  ]}
                />
                <div className="mt-1.5 grid grid-cols-3 gap-2 border-t border-line pt-2">
                  {[
                    { label: 'SUCCESSFUL', value: totals.successful, tone: 'text-term' },
                    { label: 'FAILED', value: totals.failed, tone: 'text-high' },
                    { label: 'SUSPICIOUS', value: totals.suspicious, tone: 'text-critical' },
                  ].map((cell) => (
                    <div key={cell.label} className="min-w-0">
                      <div className="label-xs truncate">{cell.label} · {range}</div>
                      <div className={`mono tnum mt-0.5 text-[16px] leading-none font-semibold ${cell.tone}`}>{cell.value.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Panel>

        <Panel title="Access Hotspots" className="min-w-0">
          <AuthenticationHotspots />
        </Panel>
      </div>

      <LoginTimeline limit={2} />
      <LoginTable />
    </div>
  );
}
