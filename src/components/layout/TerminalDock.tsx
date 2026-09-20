import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Terminal as TerminalIcon, Trash2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLive } from '@/store/LiveContext';
import { useUI } from '@/store/UIContext';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { mockStore } from '@/services/mockApi';
import { EventStream } from '@/components/system/EventStream';
import { Caret, Prompt } from '@/components/ui/Terminal';
import { formatClock, formatDuration } from '@/utils/dates';
import { severityMeta } from '@/utils/severity';

interface DockLine {
  id: string;
  kind: 'input' | 'output' | 'error' | 'system';
  text: string;
  tone?: string;
}

/**
 * Terminal dock.
 *
 * A *simulated* console: it accepts a small, explicit allow-list of navigation
 * and inspection commands and renders their output. It never executes shell
 * input and makes no requests beyond the mock/live service layer.
 */
const ALLOWED = ['help', 'status', 'threats', 'network', 'incidents', 'intel', 'analytics', 'reports', 'settings', 'auth', 'phishing', 'scanner', 'malware', 'dashboard', 'clear', 'stream', 'investigate', 'analyze', 'metrics', 'whoami', 'version'] as const;

export function TerminalDock() {
  const { terminalDockOpen, toggleTerminalDock, openEvent } = useUI();
  const { metrics, stream, connected } = useLive();
  const { data: health } = useSystemHealth();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'terminal' | 'stream' | 'log'>('terminal');
  const [lines, setLines] = useState<DockLine[]>([
    { id: 'boot-1', kind: 'system', text: 'CyberSentinel console · simulated shell · no command execution on host', tone: 'text-ink-4' },
    { id: 'boot-2', kind: 'system', text: 'Type "help" for the list of supported commands.', tone: 'text-ink-4' },
  ]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, tab]);

  const append = useCallback((next: DockLine[]) => {
    setLines((prev) => [...prev, ...next].slice(-160));
  }, []);

  const run = useCallback((raw: string) => {
    const input = raw.trim();
    if (!input) return;
    setHistory((prev) => [input, ...prev].slice(0, 40));
    setHistoryIndex(-1);
    append([{ id: `in-${Date.now()}`, kind: 'input', text: input }]);

    const [cmd, ...args] = input.toLowerCase().split(/\s+/);
    const arg = args.join(' ');

    switch (cmd) {
      case 'help':
        append([
          { id: `h-${Date.now()}-1`, kind: 'output', text: 'SUPPORTED COMMANDS (simulated console — nothing is executed on a host)', tone: 'text-ink-3' },
          ...[
            'status ............ subsystem health and live metrics',
            'metrics ........... CPU / MEM / NET / latency readout',
            'threats [id] ...... list active threats, or open one',
            'network ........... open the network monitor',
            'incidents [id] .... list incidents, or open one',
            'investigate <id> .. open an incident in the AI terminal',
            'analyze url ....... open the phishing analyzer',
            'scanner ........... open the web security scanner',
            'malware ........... open the malware analyzer',
            'auth .............. open the authentication monitor',
            'intel ............. open threat intelligence',
            'analytics ......... open the analytics workspace',
            'reports ........... open the report archive',
            'settings .......... open workspace settings',
            'stream [next] ..... show the last 8 events, or advance the simulation',
            'clear ............. clear this console',
            'whoami ............ current session identity',
            'version ........... platform and ruleset versions',
          ].map((line, i) => ({ id: `h-${Date.now()}-${i + 2}`, kind: 'output' as const, text: line, tone: 'text-ink-2' })),
        ]);
        break;

      case 'status': {
        const subsystems = health?.subsystems ?? [];
        append([
          { id: `s-${Date.now()}-0`, kind: 'output', text: `SYSTEM STATUS  ·  ${connected ? 'LIVE FEED CONNECTED' : 'LIVE FEED PAUSED'}  ·  uptime ${formatDuration(metrics.uptimeSeconds)}`, tone: 'text-term' },
          ...(subsystems.length ? subsystems : []).map((s, i) => ({
            id: `s-${Date.now()}-${i + 1}`, kind: 'output' as const,
            text: `${s.name.padEnd(20, '.')} ${s.state.toUpperCase().padEnd(9)} ${String(s.latencyMs).padStart(4)}ms  ${s.detail}`,
            tone: s.state === 'online' ? 'text-ink-2' : s.state === 'ready' ? 'text-cyber' : 'text-medium',
          })),
        ]);
        break;
      }

      case 'metrics':
        append([{
          id: `m-${Date.now()}`, kind: 'output',
          text: `CPU ${metrics.cpu}%  ·  MEM ${metrics.mem}%  ·  NET ${metrics.netMbps} MB/s  ·  EVENTS ${metrics.totalEvents}  ·  RATE ${metrics.eventsPerSecond}/s  ·  LATENCY ${metrics.latencyMs}ms`,
          tone: 'text-cyber',
        }]);
        break;

      case 'threats': {
        if (arg) {
          const found = mockStore.threats.find((t) => t.id.toLowerCase() === arg || t.title.toLowerCase().includes(arg));
          if (found) { navigate(`/threats/${found.id}`); append([{ id: `t-${Date.now()}`, kind: 'output', text: `Opening ${found.id} — ${found.title}`, tone: 'text-term' }]); break; }
          append([{ id: `t-${Date.now()}`, kind: 'error', text: `No threat matching "${arg}".`, tone: 'text-critical' }]);
          break;
        }
        const rows = mockStore.threats.slice(0, 8);
        append([
          { id: `t-${Date.now()}-h`, kind: 'output', text: 'ID          SEV       STATUS          SOURCE                 TITLE', tone: 'text-ink-4' },
          ...rows.map((t, i) => ({
            id: `t-${Date.now()}-${i}`, kind: 'output' as const,
            text: `${t.id.padEnd(12)}${severityMeta(t.severity).label.padEnd(10)}${t.status.replace('_', ' ').toUpperCase().padEnd(16)}${t.source.slice(0, 22).padEnd(23)}${t.title}`,
            tone: severityMeta(t.severity).text,
          })),
        ]);
        break;
      }

      case 'incidents': {
        if (arg) {
          const found = mockStore.incidents.find((i) => i.id.toLowerCase() === arg);
          if (found) { navigate(`/incidents/${found.id}`); append([{ id: `i-${Date.now()}`, kind: 'output', text: `Opening ${found.id} — ${found.title}`, tone: 'text-term' }]); break; }
          append([{ id: `i-${Date.now()}`, kind: 'error', text: `No incident matching "${arg}".`, tone: 'text-critical' }]);
          break;
        }
        append([
          { id: `i-${Date.now()}-h`, kind: 'output', text: 'ID          SEV       STATUS          TITLE', tone: 'text-ink-4' },
          ...mockStore.incidents.slice(0, 8).map((inc, i) => ({
            id: `i-${Date.now()}-${i}`, kind: 'output' as const,
            text: `${inc.id.padEnd(12)}${severityMeta(inc.severity).label.padEnd(10)}${inc.status.replace('_', ' ').toUpperCase().padEnd(16)}${inc.title}`,
            tone: severityMeta(inc.severity).text,
          })),
        ]);
        break;
      }

      case 'investigate': {
        const target = arg || 'INC-2048';
        navigate(`/ai-assistant?incident=${target.toUpperCase()}`);
        append([{ id: `ai-${Date.now()}`, kind: 'output', text: `Attaching ${target.toUpperCase()} to the AI security terminal…`, tone: 'text-ai' }]);
        break;
      }

      case 'stream': {
        if (arg === 'next') {
          append([{ id: `st-${Date.now()}`, kind: 'system', text: 'Advancing the simulated scenario by one step…', tone: 'text-ink-4' }]);
          void import('@/services/liveSimulator').then(({ liveSimulator }) => liveSimulator.step());
          break;
        }
        append([
          { id: `st-${Date.now()}-h`, kind: 'output', text: 'TIME      CHANNEL    SEVERITY  EVENT', tone: 'text-ink-4' },
          ...stream.slice(0, 8).map((e, i) => ({
            id: `st-${Date.now()}-${i}`, kind: 'output' as const,
            text: `${formatClock(e.timestamp)}  ${e.channel.padEnd(10)} ${severityMeta(e.severity).label.padEnd(9)} ${e.type}`,
            tone: severityMeta(e.severity).text,
          })),
        ]);
        break;
      }

      case 'network': navigate('/network'); append([{ id: `n-${Date.now()}`, kind: 'output', text: 'Opening network monitor…', tone: 'text-term' }]); break;
      case 'auth': navigate('/authentication'); append([{ id: `a-${Date.now()}`, kind: 'output', text: 'Opening authentication monitor…', tone: 'text-term' }]); break;
      case 'intel': navigate('/threat-intelligence'); append([{ id: `it-${Date.now()}`, kind: 'output', text: 'Opening threat intelligence…', tone: 'text-term' }]); break;
      case 'analytics': navigate('/analytics'); append([{ id: `an-${Date.now()}`, kind: 'output', text: 'Opening analytics workspace…', tone: 'text-term' }]); break;
      case 'reports': navigate('/reports'); append([{ id: `r-${Date.now()}`, kind: 'output', text: 'Opening report archive…', tone: 'text-term' }]); break;
      case 'settings': navigate('/settings'); append([{ id: `se-${Date.now()}`, kind: 'output', text: 'Opening workspace settings…', tone: 'text-term' }]); break;
      case 'dashboard': navigate('/dashboard'); append([{ id: `d-${Date.now()}`, kind: 'output', text: 'Opening command center…', tone: 'text-term' }]); break;
      case 'phishing': case 'analyze':
        navigate('/phishing');
        append([{ id: `p-${Date.now()}`, kind: 'output', text: arg ? `Opening URL analyzer with target "${arg}"…` : 'Opening URL analyzer…', tone: 'text-term' }]);
        break;
      case 'scanner': navigate('/web-security'); append([{ id: `sc-${Date.now()}`, kind: 'output', text: 'Opening web security scanner…', tone: 'text-term' }]); break;
      case 'malware': navigate('/malware'); append([{ id: `ml-${Date.now()}`, kind: 'output', text: 'Opening malware analyzer…', tone: 'text-term' }]); break;

      case 'whoami':
        append([{ id: `w-${Date.now()}`, kind: 'output', text: 'a.reyes · SOC Analyst Tier 2 · session valid · no credentials stored client-side', tone: 'text-ink-2' }]);
        break;

      case 'version':
        append([{
          id: `v-${Date.now()}`, kind: 'output',
          text: `CyberSentinel frontend 1.0.0 · engine ${health?.engineVersion ?? '3.8.2'} · ruleset ${health?.rulesetVersion ?? '2026.09.4'} · API mode ${connected ? 'streaming' : 'paused'}`,
          tone: 'text-ink-2',
        }]);
        break;

      case 'clear':
        setLines([]);
        break;

      default:
        append([
          { id: `e-${Date.now()}`, kind: 'error', text: `Unrecognized command: "${cmd}"`, tone: 'text-critical' },
          { id: `e2-${Date.now()}`, kind: 'system', text: `This console is simulated — only these commands are supported: ${ALLOWED.join(', ')}.`, tone: 'text-ink-4' },
        ]);
    }
    setValue('');
  }, [append, connected, health, metrics, navigate, stream]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); run(value); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(history.length - 1, historyIndex + 1);
      if (next >= 0) { setHistoryIndex(next); setValue(history[next]!); }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setValue(next >= 0 ? history[next]! : '');
    }
  };

  const tabs = useMemo(() => ([
    { id: 'terminal' as const, label: 'TERMINAL' },
    { id: 'stream' as const, label: 'EVENT STREAM' },
    { id: 'log' as const, label: 'SYSTEM LOG' },
  ]), []);

  return (
    <AnimatePresence initial={false}>
      {terminalDockOpen ? (
        <motion.div
          key="dock"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="z-20 shrink-0 overflow-hidden border-t border-line bg-void"
        >
          <div className="flex h-7 items-center gap-1 border-b border-line bg-base px-2">
            <TerminalIcon className="size-3 text-term" aria-hidden />
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-pressed={tab === t.id}
                className={cn(
                  'mono rounded-[2px] px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] uppercase transition-colors',
                  tab === t.id ? 'bg-term/12 text-term' : 'text-ink-4 hover:text-ink-2',
                )}
              >
                {t.label}
              </button>
            ))}
            <span className="flex-1" />
            {tab === 'terminal' ? (
              <button
                type="button"
                onClick={() => setLines([])}
                aria-label="Clear console output"
                className="inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-ink"
              >
                <Trash2 className="size-3" aria-hidden />
              </button>
            ) : null}
            <button
              type="button"
              onClick={toggleTerminalDock}
              aria-label="Collapse terminal dock"
              className="inline-flex size-5 items-center justify-center rounded-[2px] text-ink-4 transition-colors hover:bg-raised hover:text-ink"
            >
              <ChevronDown className="size-3.5" aria-hidden />
            </button>
          </div>

          <div className="h-[168px] sm:h-[184px]">
            {tab === 'terminal' ? (
              <div className="flex h-full flex-col">
                <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-2.5 py-1.5">
                  {lines.map((line) => (
                    <div
                      key={line.id}
                      className={cn(
                        'term-line',
                        line.kind === 'input' && 'flex gap-2',
                        line.tone ?? 'text-ink-2',
                      )}
                    >
                      {line.kind === 'input' ? (
                        <>
                          <span className="prompt shrink-0 select-none">root@cybersentinel:~$</span>
                          <span className="text-ink">{line.text}</span>
                        </>
                      ) : (
                        line.text
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex shrink-0 items-center gap-2 border-t border-line bg-base px-2.5 py-1.5">
                  <Prompt className="text-[11px]" />
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={onKeyDown}
                    spellCheck={false}
                    autoComplete="off"
                    aria-label="Terminal command input"
                    placeholder="type a command — try: status"
                    className="mono min-w-0 flex-1 bg-transparent text-[11.5px] text-ink caret-term placeholder:text-ink-4 focus:outline-none"
                  />
                  <Caret />
                </div>
              </div>
            ) : null}

            {tab === 'stream' ? (
              <EventStream showHeader={false} limit={40} maxHeight="100%" className="h-full" onSelect={openEvent} />
            ) : null}

            {tab === 'log' ? (
              <div className="h-full overflow-y-auto px-2.5 py-1.5">
                {stream.slice(0, 26).map((event) => {
                  const meta = severityMeta(event.severity);
                  return (
                    <div key={event.id} className="term-line flex flex-wrap items-baseline gap-x-2 border-b border-panel-2 py-[2px]">
                      <span className="mono tnum shrink-0 text-[11px] text-ink-4">{formatClock(event.timestamp)}</span>
                      <span className={cn('mono shrink-0 text-[11px] font-bold', meta.text)}>{meta.label}</span>
                      <span className="mono shrink-0 text-[11px] text-cyber">{event.channel}</span>
                      <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-2">{event.type}</span>
                      <span className="mono hidden shrink-0 text-[11px] text-ink-4 md:inline">{event.source}</span>
                      {event.detectionRule ? (
                        <span className="mono hidden shrink-0 rounded-[2px] border border-line-2 px-1 text-[10.5px] text-ink-4 lg:inline">
                          {event.detectionRule}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
