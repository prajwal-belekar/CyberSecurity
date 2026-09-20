import { useState } from 'react';
import { AlertTriangle, BadgeCheck, Bug, ShieldCheck } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toggle } from '@/components/ui/Select';
import { validateScanAuthorization } from '@/services/webSecurityApi';

export interface ScannerFormProps {
  onStart: (target: string, token: string) => void;
  running: boolean;
  defaultTarget?: string;
}

/**
 * Authorized-scan intake. The authorization acknowledgement is a hard gate:
 * the form will not submit without it, and the frontend performs no probing of
 * any target — only the backend ever does, and only against verified scope.
 */
export function ScannerForm({ onStart, running, defaultTarget = 'https://authorized-test-site.example' }: ScannerFormProps) {
  const [target, setTarget] = useState(defaultTarget);
  const [authorization, setAuthorization] = useState('AUTHZ-DEMO-8842');
  const [acknowledged, setAcknowledged] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!acknowledged) {
      setError('Confirm that you are authorized to test this target before starting a scan.');
      return;
    }
    const result = validateScanAuthorization(target, authorization);
    if (!result.ok || !result.token || !result.target) {
      setError(result.reason ?? 'Target rejected.');
      return;
    }
    setError(null);
    onStart(result.target, result.token);
  };

  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-start gap-2 rounded-[2px] border border-medium/30 bg-medium/[0.06] px-2.5 py-2">
        <AlertTriangle className="mt-px size-3.5 shrink-0 text-medium" aria-hidden />
        <p className="mono text-[10.5px] leading-relaxed text-ink-2">
          AUTHORIZED TESTING ONLY. Run assessments exclusively against systems you own or are
          contractually permitted to test. This frontend performs no scanning itself — it submits a
          scope assertion that the backend validates against its authorization registry before any
          request is sent.
        </p>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(); }}
        className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end"
      >
        <Input
          terminal
          promptLabel="TARGET >"
          label="Target URL"
          value={target}
          onChange={(e) => { setTarget(e.target.value); if (error) setError(null); }}
          placeholder="https://authorized-test-site.example"
          spellCheck={false}
          autoComplete="off"
          disabled={running}
          className="h-9"
          hint="Reserved example domains (.example, .test) are accepted in this build."
        />

        <Input
          label="Authorization reference"
          value={authorization}
          onChange={(e) => { setAuthorization(e.target.value); if (error) setError(null); }}
          placeholder="AUTHZ-0000"
          spellCheck={false}
          disabled={running}
          className="mono h-9"
          hint="Ticket or contract reference proving scope."
        />

        <Button type="submit" variant="primary" size="md" loading={running} icon={running ? undefined : <Bug className="size-4" aria-hidden />} className="h-9">
          {running ? 'Scanning…' : 'Start Security Scan'}
        </Button>
      </form>

      <div className="mt-2.5">
        <Toggle
          checked={acknowledged}
          onChange={setAcknowledged}
          label="I confirm this target is within my authorized testing scope"
          description="Required. Scans are refused without an explicit acknowledgement, and the acknowledgement is recorded with the scan."
          disabled={running}
        />
      </div>

      {error ? (
        <div role="alert" className={cn('mt-2.5 flex items-start gap-2 rounded-[2px] border border-critical/35 bg-critical/[0.06] px-2.5 py-2')}>
          <ShieldCheck className="mt-px size-3.5 shrink-0 text-critical" aria-hidden />
          <div className="min-w-0">
            <p className="mono text-[11px] font-bold tracking-[0.02em] text-critical uppercase">SCAN REFUSED</p>
            <p className="mono mt-0.5 text-[11px] leading-relaxed text-ink-2">{error}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="label-xs">Scope presets</span>
        {[
          { label: 'Headers only', target: 'https://authorized-test-site.example', token: 'AUTHZ-HEADERS-01' },
          { label: 'Full config', target: 'https://app.corp.example.test', token: 'AUTHZ-FULL-02' },
          { label: 'Staging build', target: 'https://staging.corp.example.test', token: 'AUTHZ-STAGE-03' },
        ].map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={running}
            onClick={() => { setTarget(preset.target); setAuthorization(preset.token); setError(null); }}
            className="mono rounded-[2px] border border-line-2 px-1.5 py-[2px] text-[11px] tracking-[0.01em] text-ink-4 uppercase transition-colors hover:border-term/40 hover:text-term disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
        <span className="mono ml-auto inline-flex items-center gap-1 text-[11px] text-ink-4">
          <BadgeCheck className="size-3" aria-hidden /> Scope assertion required
        </span>
      </div>
    </div>
  );
}
