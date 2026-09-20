import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { IntelSummary } from '@/components/intelligence/IntelSummary';
import { IntelTable } from '@/components/intelligence/IntelTable';
import { IndicatorDrawer } from '@/components/intelligence/IndicatorDrawer';
import type { ThreatIndicator } from '@/types/intelligence';

/** Threat Intelligence — feed health, indicator grid and full record drawer. */
export default function ThreatIntelligence() {
  const meta = routeMetaFor('/threat-intelligence');
  const [selected, setSelected] = useState<string | null>(null);

  const openIndicator = (indicator: ThreatIndicator) => setSelected(indicator.id);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Threat Intelligence"
        description="Indicators of compromise with provenance and correlation counts."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <Globe2 className="size-2.5 text-cyber" aria-hidden />
            <span className="text-[11px] text-ink-3">Feeds synchronized</span>
          </span>
        }
      />

      <IntelSummary />
      <IntelTable onSelect={openIndicator} />

      <IndicatorDrawer id={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
