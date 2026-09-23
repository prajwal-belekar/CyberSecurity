import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Crosshair, Globe, ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { URLAnalyzer } from '@/components/phishing/URLAnalyzer';
import { RiskScore, VERDICT_META } from '@/components/phishing/RiskScore';
import { URLIndicators, UrlInformation } from '@/components/phishing/URLIndicators';
import { ScanHistory } from '@/components/phishing/ScanHistory';
import { SimpleQA, TechnicalDetails } from '@/components/simple/SimpleParts';
import { phishingApi } from '@/services/phishingApi';
import { useToast } from '@/store/ToastContext';
import { queryKeys } from '@/services/queryKeys';
import { cn } from '@/utils/cn';
import type { PhishingAnalysis, PhishingScanRecord, PhishingVerdict } from '@/types/phishing';

const PLAIN_TEXT: Record<PhishingVerdict, string> = {
  safe: 'No sign of phishing — this link appears to be what it claims to be.',
  suspicious: 'Several warning signs are present. Not proven hostile, but treat this link with care.',
  phishing: 'Strong evidence this page imitates a trusted brand to steal credentials.',
  malicious: 'Confirmed hostile — this link is actively being used in phishing operations.',
  unreachable: 'The site could not be reached, so no conclusion was possible.',
};

/** Simple Mode Phishing Check — is this link safe to click, explained plainly. */
export default function SimplePhishing() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const toast = useToast();
  const meta = routeMetaFor('/phishing');
  const [analysis, setAnalysis] = useState<PhishingAnalysis | null>(null);

  const handleResult = (result: PhishingAnalysis) => {
    setAnalysis(result);
    queryClient.invalidateQueries({ queryKey: queryKeys.phishingHistory() });
  };

  const replayRecord = (record: PhishingScanRecord) => {
    setAnalysis(null);
    void phishingApi.analyze(record.url).then((res) => {
      if (res.ok && res.analysis) handleResult(res.analysis);
      else toast.error('Re-analysis failed', res.reason ?? 'That target could not be re-analyzed.');
    }).catch((err: Error) => toast.error('Re-analysis failed', err.message));
  };

  const plain = analysis ? PLAIN_TEXT[analysis.verdict] : null;
  const verdictMeta = analysis ? VERDICT_META[analysis.verdict] : null;

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Is This Link Safe?"
        description="Paste a link and get a plain-language verdict before you click."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <Globe className="size-2.5 text-cyber" aria-hidden />
            <span className="text-[11px] text-ink-3">Analyzer ready</span>
          </span>
        }
      />

      <SimpleQA question="What does this tool do?">
        <p>
          It inspects a website address the way a careful analyst would: how old the domain is, where it
          points, whether it imitates a known brand, and whether the page behaves like a credential
          harvester. Type or paste the link below and press analyze.
        </p>
      </SimpleQA>

      <Panel
        title="URL Analyzer"
        icon={<Crosshair className="size-3.5" aria-hidden />}
        className="min-w-0"
        actions={
          analysis ? (
            <Button variant="ghost" size="xs" onClick={() => setAnalysis(null)}>Clear result</Button>
          ) : undefined
        }
      >
        <URLAnalyzer onResult={handleResult} initialUrl={searchParams.get('url') ?? undefined} />
      </Panel>

      {analysis && plain ? (
        <>
          <div className="grid min-w-0 gap-2.5 xl:grid-cols-[260px_minmax(0,1fr)]">
            <Panel title="Risk Score" icon={<ShieldAlert className="size-3.5" aria-hidden />} className="min-w-0">
              <div className="flex flex-col items-center gap-3 py-1">
                <RiskScore score={analysis.riskScore} verdict={analysis.verdict} confidence={analysis.confidence} />
                <div className="w-full">
                  <SectionRule className="mb-1.5">Recommendation</SectionRule>
                  <p className="text-[11.5px] leading-relaxed text-ink-2">{analysis.recommendation}</p>
                </div>
              </div>
            </Panel>

            <div className="flex min-w-0 flex-col gap-2.5">
              <SimpleQA question="What is the verdict?" tone={analysis.riskScore >= 60 ? 'critical' : analysis.riskScore >= 35 ? 'warn' : 'positive'}>
                <p className="font-medium text-ink">{verdictMeta?.label ?? analysis.verdict}</p>
                <p>{plain}</p>
                {analysis.brandImpersonated ? (
                  <p className="rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2 py-1.5 text-[12px] text-ink-2">
                    <span className="font-bold text-critical">Spoofing: </span>this page imitates{' '}
                    <span className="mono text-ink-2">{analysis.brandImpersonated}</span>.
                  </p>
                ) : null}
              </SimpleQA>

              <Panel title="What looks wrong" icon={<ShieldAlert className="size-3.5" aria-hidden />} className="min-w-0">
                <URLIndicators indicators={analysis.indicators} />
              </Panel>
            </div>
          </div>

          <TechnicalDetails className="min-w-0" title="Technical details" hint={`${analysis.scanSteps.length} checks · ${analysis.relatedThreatIds.length} linked`}>
            <div className="grid gap-2.5 lg:grid-cols-2">
              <UrlInformation
                analysis={{
                  url: analysis.url,
                  urlInfo: {
                    protocol: analysis.urlInfo.protocol,
                    domain: analysis.urlInfo.domain,
                    subdomain: analysis.urlInfo.subdomain,
                    tld: analysis.urlInfo.tld,
                    path: analysis.urlInfo.path,
                    query: analysis.urlInfo.query,
                    length: String(analysis.urlInfo.length),
                    domainAge: analysis.urlInfo.domainAge,
                    registrar: analysis.urlInfo.registrar,
                  },
                  certificate: analysis.certificate,
                }}
              />
              <div>
                <SectionRule className="mb-1.5"><span>Check pipeline</span></SectionRule>
                <ol className="space-y-1">
                  {analysis.scanSteps.map((step) => (
                    <li key={step.index} className="flex items-baseline gap-2 border-b border-line pb-1 last:border-b-0">
                      <span className="mono tnum shrink-0 text-[11px] text-ink-4">[{String(step.index).padStart(2, '0')}]</span>
                      <span className="mono min-w-0 flex-1 truncate text-[11px] text-ink-2">{step.label}</span>
                      <span
                        className={cn(
                          'mono shrink-0 text-[11px] font-bold tracking-[0.01em] uppercase',
                          step.state === 'ok' ? 'text-term' : step.state === 'warning' ? 'text-medium' : 'text-critical',
                        )}
                      >
                        {step.state === 'ok' ? 'OK' : step.state === 'warning' ? 'WARNING' : 'FAIL'}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-2">
                  <KeyValueGrid
                    columns={1}
                    rows={[
                      { label: 'Analysis ID', value: analysis.id, copy: analysis.id },
                      { label: 'Analyzed', value: new Date(analysis.analyzedAt).toLocaleString('en-GB') },
                    ]}
                  />
                </div>
              </div>
            </div>
          </TechnicalDetails>
        </>
      ) : (
        <Panel className="min-w-0">
          <EmptyState
            icon={<Crosshair className="size-4" aria-hidden />}
            title="No analysis yet"
            description="Enter a URL above and run the analyzer. A plain-language verdict with the reasons behind it will appear here."
            prompt
          />
        </Panel>
      )}

      <ScanHistory onSelect={replayRecord} />
    </div>
  );
}