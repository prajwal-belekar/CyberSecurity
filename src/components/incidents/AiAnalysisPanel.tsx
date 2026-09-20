import { Link } from 'react-router-dom';
import { Brain, GitBranch, Lightbulb, Scale } from 'lucide-react';
import { Meter } from '@/components/ui/Meter';
import { SectionRule } from '@/components/ui/KeyValue';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn } from '@/utils/cn';
import type { IncidentAiAnalysis } from '@/types/incident';

/**
 * AI triage summary. Rendered as an advisory panel with an explicit confidence
 * readout and a link into the investigation console — never as an authority.
 */
export function AiAnalysisPanel({ analysis, incidentId }: { analysis?: IncidentAiAnalysis; incidentId: string }) {
  if (!analysis) {
    return (
      <EmptyState
        compact
        icon={<Brain className="size-4" aria-hidden />}
        title="No AI analysis yet"
        description="Run the AI assistant against this incident to generate a narrative, probable attack chain and next steps."
        action={<Link to={`/ai-assistant?incident=${incidentId}`}><Button variant="secondary" size="xs">Open AI assistant</Button></Link>}
      />
    );
  }

  const fpPercent = Math.round(analysis.falsePositiveLikelihood * 100);

  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 rounded-[2px] border border-ai/30 bg-ai/[0.06] px-2 py-1.5">
        <Brain className="size-3.5 shrink-0 text-ai" aria-hidden />
        <span className="text-[11px] font-semibold text-ai">AI triage advisory</span>
        <span className="mono ml-auto text-[10.5px] text-ink-4">NOT AUTHORITATIVE</span>
      </div>

      <p className="text-[11.5px] leading-relaxed whitespace-pre-wrap text-ink-2">{analysis.narrative}</p>

      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        <div className="rounded-[2px] border border-line bg-base p-2">
          <div className="label-xs mb-1">Model confidence</div>
          <Meter value={analysis.confidence * 100} tone="ai" />
          <p className="mono mt-1 text-[11px] text-ink-4">{analysis.relatedEvents} CORRELATED EVENTS</p>
        </div>
        <div className="rounded-[2px] border border-line bg-base p-2">
          <div className="label-xs mb-1 flex items-center gap-1.5"><Scale className="size-2.5" aria-hidden />False positive likelihood</div>
          <Meter value={fpPercent} tone={fpPercent > 50 ? 'term' : fpPercent > 20 ? 'warn' : 'err'} />
          <p className="mono mt-1 text-[11px] text-ink-4">
            {fpPercent > 50 ? 'LIKELY BENIGN — VERIFY BEFORE ESCALATING' : fpPercent > 20 ? 'AMBIGUOUS — CONFIRM WITH EVIDENCE' : 'UNLIKELY BENIGN — TREAT AS REAL'}
          </p>
        </div>
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1"><span className="flex items-center gap-1.5"><GitBranch className="size-3" aria-hidden />Probable attack chain</span></SectionRule>
        <ol className="space-y-1">
          {analysis.probableAttackChain.map((step, index) => (
            <li key={step} className="flex items-start gap-2">
              <span className={cn('mono tnum mt-px shrink-0 rounded-[2px] border px-1 py-[1px] text-[10.5px] font-bold', index === 0 ? 'border-critical/40 bg-critical/10 text-critical' : 'border-line-2 bg-raised text-ink-3')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1 text-[11px] leading-relaxed text-ink-2">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-2.5">
        <SectionRule className="mb-1"><span className="flex items-center gap-1.5"><Lightbulb className="size-3" aria-hidden />Suggested next steps</span></SectionRule>
        <ul className="space-y-0.5">
          {analysis.suggestedNextSteps.map((step) => (
            <li key={step} className="mono flex items-start gap-2 text-[10.5px] leading-relaxed text-ink-3">
              <span className="shrink-0 text-ai">›</span>
              <span className="min-w-0">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link to={`/ai-assistant?incident=${incidentId}`} className="mt-2.5 block">
        <Button variant="secondary" size="xs" className="w-full" icon={<Brain className="size-3" aria-hidden />}>
          Continue this investigation in the AI console
        </Button>
      </Link>
    </div>
  );
}
