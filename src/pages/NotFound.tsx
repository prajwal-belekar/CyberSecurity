import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, Terminal } from 'lucide-react';
import { Panel } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NAVIGATION } from '@/app/router/navigation';
import { TerminalBlock } from '@/components/ui/Terminal';

/** 404 — terminal-flavoured dead end with real routes to recover from. */
export default function NotFound() {
  const { pathname } = useLocation();
  const links = NAVIGATION.flatMap((group) => group.items);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-2.5 p-3 sm:p-6">
      <Panel className="min-w-0" accent="critical">
        <div className="flex items-start gap-3">
          <span className="mono flex size-10 shrink-0 items-center justify-center rounded-[2px] border border-critical/40 bg-critical/10 text-[13px] font-bold text-critical">
            404
          </span>
          <div className="min-w-0">
            <h1 className="text-[16px] font-semibold text-ink">Route not found</h1>
            <p className="mono mt-1 text-[11.5px] leading-relaxed break-all text-ink-3">
              No view is registered at <span className="text-critical">{pathname}</span>.
            </p>
          </div>
        </div>

        <div className="mt-3">
          <TerminalBlock title="ROUTER" maxHeight={132}>
            <div className="text-ink-3">&gt; resolve --path {pathname}</div>
            <div className="text-critical">[✗] no route matches this path</div>
            <div className="text-ink-4">[i] checking the navigation manifest…</div>
            <div className="text-term">[✓] {links.length} registered routes available</div>
          </TerminalBlock>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Link to="/dashboard">
            <Button variant="primary" size="sm" icon={<ArrowLeft className="size-3.5" aria-hidden />}>Return to dashboard</Button>
          </Link>
          <Link to="/incidents">
            <Button variant="secondary" size="sm" icon={<Compass className="size-3.5" aria-hidden />}>Incident queue</Button>
          </Link>
        </div>
      </Panel>

      <Panel title="Available Routes" icon={<Terminal className="size-3.5" aria-hidden />} className="min-w-0">
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className="group flex items-center gap-2 rounded-[2px] border border-line bg-base px-2 py-1.5 transition-colors hover:border-term/40 hover:bg-term/[0.04]"
              >
                <span className="mono text-[11px] text-term">{link.to}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-ink-3 transition-colors group-hover:text-ink">{link.label}</span>
                <span className="mono shrink-0 text-ink-4 transition-colors group-hover:text-term" aria-hidden>→</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mono mt-2.5 text-[11px] text-ink-4">
          Press <kbd className="rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3">Ctrl</kbd>+
          <kbd className="rounded-[1px] border border-line-3 bg-raised px-1 text-ink-3">K</kbd> anywhere in the console to jump to a route or run a command.
        </p>
      </Panel>
    </div>
  );
}
