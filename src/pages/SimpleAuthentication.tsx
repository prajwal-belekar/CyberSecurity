import { Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { AuthenticationStats, AuthenticationHotspots } from '@/components/authentication/AuthenticationStats';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { authenticationApi } from '@/services/authenticationApi';
import { queryKeys } from '@/services/queryKeys';

/** Simple Mode Authentication Status — who is signing in, and who is failing. */
export default function SimpleAuthentication() {
  const meta = routeMetaFor('/authentication');
  const { data: summary, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.authSummary(),
    queryFn: () => authenticationApi.summary(),
    staleTime: 10_000,
    refetchInterval: 20_000,
  });

  const hasIssues = summary ? summary.failed > 0 || summary.suspicious > 0 || summary.lockedAccounts > 0 : false;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Sign-in Status"
        description="Every login, locked account and suspicious access pattern."
        status={<Badge tone={hasIssues ? 'warn' : 'term'} dot>{hasIssues ? 'Needs review' : 'All clear'}</Badge>}
      />

      <SimpleQA question="What is this showing me?">
        <p>
          This page watches how people sign in to your systems: successful logins, failed attempts,
          accounts that have been locked out, and unusual access patterns that might be someone trying
          to break in. Failures are common and often harmless — it is the pattern that matters.
        </p>
      </SimpleQA>

      {isLoading ? (
        <div className="grid gap-2.5">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError ? (
        <ErrorState title="Unable to load sign-in status" message={(error as Error)?.message ?? 'The authentication service could not be reached.'} onRetry={() => refetch()} />
      ) : (
        <>
          <SimpleQA question="Is this a problem right now?" tone={hasIssues ? 'warn' : 'positive'}>
            {summary ? (
              <ul className="space-y-1">
                <li className="text-[12px] leading-relaxed text-ink-2">
                  <span className="mono font-semibold text-ink">{summary.successful}</span> successful sign-ins today,{' '}
                  <span className="mono font-semibold text-ink">{summary.totalToday}</span> total attempts across{' '}
                  <span className="mono font-semibold text-ink">{summary.uniqueUsers}</span> accounts.
                </li>
                <li className="text-[12px] leading-relaxed text-ink-2">
                  <span className="mono font-semibold text-critical">{summary.failed}</span> failed,{' '}
                  <span className="mono font-semibold text-medium">{summary.suspicious}</span> suspicious,{' '}
                  <span className="mono font-semibold text-high">{summary.lockedAccounts}</span> locked.
                </li>
                <li className="text-[12px] leading-relaxed text-ink-2">
                  Multi-factor coverage is <span className="mono font-semibold text-ink">{Math.round(summary.mfaCoverage * 100)}%</span>.
                </li>
              </ul>
            ) : null}
            <p className="mt-2 text-[12px] text-ink-3">
              {summary && (summary.failed > 0 || summary.suspicious > 0)
                ? 'Some sign-in attempts are failing or look suspicious — worth a glance at the repeat offenders below.'
                : 'Sign-ins are behaving normally.'}
            </p>
          </SimpleQA>

          <AuthenticationStats />
          <div className="grid gap-2.5 xl:grid-cols-2">
            <AuthenticationHotspots />

            <Panel title="What should I do next?" icon={<KeyRound className="size-3.5" aria-hidden />} className="min-w-0">
              <ul className="space-y-1">
                <li className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
                  <span className="mono text-term" aria-hidden>›</span>
                  Repeated failures for one account usually mean a forgotten password, not an attack.
                </li>
                <li className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
                  <span className="mono text-term" aria-hidden>›</span>
                  A single account failing from many countries or devices at once is the sign of a brute-force attempt.
                </li>
                <li className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-2">
                  <span className="mono text-term" aria-hidden>›</span>
                  Locked accounts mean the protection worked — unlock them after verifying the legitimate owner.
                </li>
              </ul>
            </Panel>
          </div>

          <TechnicalDetails title="Advanced: authentication forensic analysis" hint="Sequences & event table" defaultOpen={false}>
            <p className="mb-2 text-[12px] leading-relaxed text-ink-2">
              The analyst view adds per-user login sequences, full event tables with filters, and heatmaps
              of time-of-day / day-of-week patterns for spotting automated credential attacks.
            </p>
            <Link to="/authentication?mode=analyst">
              <span className="mono text-[11px] tracking-[0.01em] text-term uppercase">Open Analyst View →</span>
            </Link>
          </TechnicalDetails>
        </>
      )}
    </div>
  );
}