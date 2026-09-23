import { useState } from 'react';
import { Globe2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { IntelSummary } from '@/components/intelligence/IntelSummary';
import { IntelTable } from '@/components/intelligence/IntelTable';
import { IndicatorDrawer } from '@/components/intelligence/IndicatorDrawer';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';

/** Simple Mode Threat Intelligence — known-bad indicators from the shared feeds. */
export default function SimpleThreatIntelligence() {
  const meta = routeMetaFor('/threat-intelligence');
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Security Intelligence"
        description="Information about known security threats — suspicious addresses, websites and files."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <Globe2 className="size-2.5 text-cyber" aria-hidden />
            <span className="text-[11px] text-ink-3">Feeds synchronized</span>
          </span>
        }
      />

      <SimpleQA question="What is Threat Intelligence?">
        <p>
          These are <strong>indicators of compromise</strong> — IP addresses, domains and file hashes that were
          observed in real attacks elsewhere. If one of these appears in your network traffic or on your
          machines, treat it seriously: it is a known-bad signal, not a guess.
        </p>
      </SimpleQA>

      <IntelSummary />

      <SimpleQA question="How should I use it?">
        <p>
          Scan a day's data against this list to see if anything matched. A high-confidence match with
          recent activity is worth turning into a security alert; an old, low-confidence match is usually
          just background noise.
        </p>
      </SimpleQA>

      <TechnicalDetails title="View technical indicators" hint="Raw indicator list" defaultOpen={false}>
        <IntelTable onSelect={(indicator) => setSelected(indicator.id)} />
      </TechnicalDetails>

      <TechnicalDetails title="About this feed" hint="Provenance & refresh" defaultOpen={false}>
        <p className="text-[12px] leading-relaxed text-ink-2">
          The intelligence feed aggregates internal observations and external sources. Each indicator
          records its source, first and last seen dates, and how many events it correlates with — the
          same data the Analyst grid exposes, just with less scaffolding.
        </p>
      </TechnicalDetails>

      <IndicatorDrawer id={selected} onClose={() => setSelected(null)} />
    </div>
  );
}