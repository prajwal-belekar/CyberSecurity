import { SecurityOverview } from '@/components/dashboard/SecurityOverview';
import { ThreatStats } from '@/components/dashboard/ThreatStats';
import { ThreatActivityChart } from '@/components/dashboard/ThreatActivityChart';
import { SeverityDistribution } from '@/components/dashboard/SeverityDistribution';
import { RecentEvents } from '@/components/dashboard/RecentEvents';
import { ActiveIncidents } from '@/components/dashboard/ActiveIncidents';
import { NetworkOverview } from '@/components/dashboard/NetworkOverview';
import { SystemHealth } from '@/components/dashboard/SystemHealth';
import { TerminalStatusPanel } from '@/components/dashboard/TerminalStatusPanel';
import { EventStream } from '@/components/system/EventStream';
import { Panel } from '@/components/ui/Card';
import { Radio } from 'lucide-react';
import { useUI } from '@/store/UIContext';

/**
 * Security Command Center.
 *
 * Hierarchy top-to-bottom: posture → summary counters → threat activity →
 * live events → incidents → network → authentication/system health. Decorative
 * surfaces never outrank security information.
 */
export default function Dashboard() {
  const { openEvent } = useUI();

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <SecurityOverview />
      <ThreatStats />

      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <ThreatActivityChart />
        </div>
        <div className="min-w-0">
          <SeverityDistribution />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentEvents />
        </div>
        <div className="flex min-w-0 flex-col gap-2.5">
          <Panel
            title="Live Threat Activity"
            icon={<Radio className="size-3.5" aria-hidden />}
            noPadding
            className="min-w-0"
          >
            <EventStream limit={26} maxHeight={288} showHeader={false} onSelect={openEvent} />
          </Panel>
          <ActiveIncidents limit={3} />
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-2.5 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <NetworkOverview />
        </div>
        <div className="flex min-w-0 flex-col gap-2.5">
          <SystemHealth />
          <TerminalStatusPanel />
        </div>
      </div>
    </div>
  );
}
