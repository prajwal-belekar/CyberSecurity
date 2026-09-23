import { useState } from 'react';
import { Bell, Database, Eye, Gauge, RotateCcw, ServerCog, SlidersHorizontal, Terminal, Zap } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { routeMetaFor } from '@/app/router/navigation';
import { Panel } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, Toggle } from '@/components/ui/Select';
import { SectionRule, KeyValueGrid } from '@/components/ui/KeyValue';
import { Modal } from '@/components/ui/Modal';
import { useSettings, DEFAULT_SETTINGS } from '@/store/SettingsContext';
import { useLive } from '@/store/LiveContext';
import { useSystemHealth } from '@/hooks/useSystemHealth';
import { useToast } from '@/store/ToastContext';
import { useUI } from '@/store/UIContext';
import { cn } from '@/utils/cn';
import type { AppSettings } from '@/types/system';

/** Preference row: control plus the explanation of what it changes. */
function Row({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="border-b border-line py-2.5 last:border-b-0">
      <div className="mb-1"><span className="label-xs">{label}</span></div>
      {children}
    </div>
  );
}

/** Settings — appearance, data freshness, notifications, backend wiring and demo controls. */
export default function Settings() {
  const meta = routeMetaFor('/settings');
  const { settings, update, updateNotifications, updateUIMode, reset, failureInjection, setFailureInjectionEnabled } = useSettings();
  const live = useLive();
  const health = useSystemHealth();
  const toast = useToast();
  const ui = useUI();
  const [confirmReset, setConfirmReset] = useState(false);
  const [baseUrlDraft, setBaseUrlDraft] = useState(settings.api.baseUrl);

  const patch = (next: Partial<AppSettings>) => update(next);

  return (
    <div className="space-y-2.5 p-2.5 sm:p-3">
      <Breadcrumbs items={meta.segments} />
      <PageHeader
        title="Settings"
        description="Console preferences, alerting and backend configuration."
        status={
          <span className="inline-flex items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-1.5 py-[1px]">
            <SlidersHorizontal className="size-2.5 text-cyber" aria-hidden />
            <span className="text-[11px] font-semibold tracking-[0.02em] text-ink-2">
              Stored locally
            </span>
          </span>
        }
        actions={
          <Button variant="secondary" size="sm" icon={<RotateCcw className="size-3.5" aria-hidden />} onClick={() => setConfirmReset(true)}>
            Restore defaults
          </Button>
        }
      />

      <div className="grid min-w-0 gap-2.5 xl:grid-cols-2">
        <Panel title="Appearance & Motion" icon={<Eye className="size-3.5" aria-hidden />} className="min-w-0">
          <Row label="THEME">
            <Select
              aria-label="Theme"
              value={settings.theme}
              onChange={(event) => patch({ theme: event.target.value as AppSettings['theme'] })}
              options={[
                { value: 'terminal-dark', label: 'Terminal dark (default)' },
                { value: 'high-contrast', label: 'High contrast' },
              ]}
            />
            <p className="mt-1 text-[10.5px] leading-relaxed text-ink-4">
              The console is dark-only by design. High contrast raises border and text contrast for bright rooms and
              video walls without changing the palette family.
            </p>
          </Row>

          <Row label="INTERFACE DENSITY">
            <div className="flex flex-wrap gap-1.5">
              {(['compact', 'normal', 'cozy'] as const).map((density) => (
                <Button
                  key={density}
                  size="xs"
                  variant={settings.density === density ? 'primary' : 'secondary'}
                  aria-pressed={settings.density === density}
                  onClick={() => patch({ density })}
                >
                  {density}
                </Button>
              ))}
            </div>
          </Row>

          <Row label="INTERFACE MODE">
            <Toggle
              checked={settings.uiMode === 'simple'}
              onChange={(value) => updateUIMode(value ? 'simple' : 'analyst')}
              label="Use Simple Mode"
              description="Shows a focused security overview with plain-language alerts and fewer navigation options."
            />
          </Row>

          <Row label="REDUCED MOTION">
            <Toggle
              checked={settings.reduceMotion}
              onChange={(value) => patch({ reduceMotion: value })}
              label="Minimise animation"
              description="Stops the terminal caret blink, status pulses, skeleton sweeps and page transitions, and forces framer-motion into reduced mode. Follows your OS setting when off. Recommended when the console runs on a video wall all day."
            />
          </Row>

          <Row label="TERMINAL DOCK">
            <Toggle
              checked={settings.showTerminalDock}
              onChange={(value) => patch({ showTerminalDock: value })}
              label="Show the terminal dock"
              description="The collapsible log strip along the bottom edge of the console."
            />
            <Button variant="ghost" size="xs" className="mt-1.5" icon={<Terminal className="size-3" aria-hidden />} onClick={ui.toggleTerminalDock}>
              Toggle dock now
            </Button>
          </Row>

          <Row label="BOOT SEQUENCE">
            <Toggle
              checked={settings.bootSequence}
              onChange={(value) => patch({ bootSequence: value })}
              label="Play the start-up sequence"
              description="Runs once per browser session and stays under two seconds. It can always be skipped with Escape or the skip control."
            />
          </Row>
        </Panel>

        <Panel title="Data & Refresh" icon={<Database className="size-3.5" aria-hidden />} className="min-w-0">
          <Row label="DEFAULT TIME WINDOW">
            <Select
              aria-label="Default time window"
              value={settings.defaultTimeRange}
              onChange={(event) => patch({ defaultTimeRange: event.target.value })}
              options={['1H', '6H', '24H', '7D', '30D'].map((value) => ({ value, label: value }))}
            />
            <p className="mt-1 text-[10.5px] text-ink-4">Applied to every grid and chart on first load. Per-page overrides are kept for the session.</p>
          </Row>

          <Row label="AUTO REFRESH">
            <Toggle
              checked={settings.autoRefresh}
              onChange={(value) => patch({ autoRefresh: value })}
              label="Refetch data automatically"
              description="Keeps grids, charts and summaries current without a manual reload."
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="label-xs">Interval</span>
              {[5, 10, 15, 30, 60].map((seconds) => (
                <Button
                  key={seconds}
                  size="xs"
                  variant={settings.autoRefreshSeconds === seconds ? 'primary' : 'secondary'}
                  disabled={!settings.autoRefresh}
                  aria-pressed={settings.autoRefreshSeconds === seconds}
                  onClick={() => patch({ autoRefreshSeconds: seconds })}
                >
                  {seconds}s
                </Button>
              ))}
            </div>
          </Row>

          <Row label="LIVE EVENT STREAM">
            <Toggle
              checked={settings.liveEventStream}
              onChange={(value) => patch({ liveEventStream: value })}
              label="Stream simulated telemetry"
              description="Drives the live log dock, the dashboard stream and the notification centre."
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Button variant={live.paused ? 'primary' : 'secondary'} size="xs" icon={<Zap className="size-3" aria-hidden />} onClick={() => (live.paused ? live.resume() : live.pause())} disabled={!settings.liveEventStream}>
                {live.paused ? 'Resume stream' : 'Pause stream'}
              </Button>
              <Badge tone={live.connected ? 'term' : 'err'}>{live.connected ? 'CONNECTED' : 'DISCONNECTED'}</Badge>
              <span className="mono text-[11px] text-ink-4">{live.stream.length} EVENTS BUFFERED · SCENARIO {Math.round(live.scenarioProgress * 100)}%</span>
            </div>
          </Row>

          <Row label="SYSTEM HEALTH">
            {health.isLoading ? (
              <p className="mono text-[10.5px] text-ink-4">QUERYING SUBSYSTEMS…</p>
            ) : health.data ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge tone={health.data.overall === 'operational' ? 'term' : health.data.overall === 'degraded' ? 'warn' : 'err'}>
                    {health.data.overall.toUpperCase()}
                  </Badge>
                  <span className="mono text-[11px] text-ink-4">ENGINE {health.data.engineVersion} · RULESET {health.data.rulesetVersion}</span>
                </div>
                <ul className="mt-2 space-y-px">
                  {health.data.subsystems.map((subsystem) => (
                    <li key={subsystem.id} className="flex items-center gap-2">
                      <span className={cn('size-1.5 shrink-0 rounded-full', subsystem.state === 'online' || subsystem.state === 'ready' ? 'bg-term' : subsystem.state === 'degraded' ? 'bg-medium' : 'bg-critical')} aria-hidden />
                      <span className="mono min-w-0 flex-1 truncate text-[10.5px] text-ink-3">{subsystem.name}</span>
                      <span className="mono tnum shrink-0 text-[11px] text-ink-4">{subsystem.latencyMs}ms</span>
                      <span className={cn('mono shrink-0 text-[10.5px] font-bold tracking-[0.01em] uppercase', subsystem.state === 'offline' ? 'text-critical' : subsystem.state === 'degraded' ? 'text-medium' : 'text-term')}>
                        {subsystem.state}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </Row>
        </Panel>

        <Panel title="Notifications" icon={<Bell className="size-3.5" aria-hidden />} className="min-w-0">
          <Row label="SEVERITY THRESHOLDS">
            <div className="space-y-1.5">
              <Toggle
                checked={settings.notifications.criticalAlerts}
                onChange={(value) => updateNotifications({ criticalAlerts: value })}
                label="Critical alerts"
                description="Active compromise, data exfiltration and P1 escalations. Always delivered to the notification centre."
              />
              <Toggle
                checked={settings.notifications.highAlerts}
                onChange={(value) => updateNotifications({ highAlerts: value })}
                label="High alerts"
                description="Brute-force patterns, malware detections and anomalous egress."
              />
              <Toggle
                checked={settings.notifications.mediumAlerts}
                onChange={(value) => updateNotifications({ mediumAlerts: value })}
                label="Medium alerts"
                description="Policy violations and configuration drift. Noisy on busy networks."
              />
            </div>
          </Row>

          <Row label="DELIVERY">
            <div className="space-y-1.5">
              <Toggle
                checked={settings.notifications.desktopToasts}
                onChange={(value) => updateNotifications({ desktopToasts: value })}
                label="In-console toasts"
                description="Transient corner alerts. Everything is retained in the notification centre regardless of this setting."
              />
              <Toggle
                checked={settings.notifications.soundOnCritical}
                onChange={(value) => updateNotifications({ soundOnCritical: value })}
                label="Audible cue on critical"
                description="A short tone for critical alerts when the console is on a shared SOC desk."
              />
              <Toggle
                checked={settings.notifications.emailNotifications}
                onChange={(value) => updateNotifications({ emailNotifications: value })}
                label="Email digest"
                description="Requires a configured mail relay on the backend. In mock mode this preference is stored but not sent."
              />
            </div>
          </Row>

          <Row label="CURRENT STATE">
            <KeyValueGrid
              columns={2}
              rows={[
                { label: 'Unread', value: `${live.unreadNotifications}`, tone: live.unreadNotifications ? 'text-medium' : 'text-term' },
                { label: 'Last event', value: live.lastEventAt ? new Date(live.lastEventAt).toLocaleTimeString('en-GB') : '—' },
              ]}
            />
            <Button variant="ghost" size="xs" className="mt-1.5" onClick={() => ui.setNotificationsOpen(true)}>
              Open notification centre
            </Button>
          </Row>
        </Panel>

        <Panel title="Backend Integration" icon={<ServerCog className="size-3.5" aria-hidden />} className="min-w-0">
          <Row label="DATA SOURCE MODE">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge tone={settings.api.mode === 'mock' ? 'warn' : 'term'}>{settings.api.mode.toUpperCase()}</Badge>
              <span className="mono text-[11px] leading-relaxed text-ink-4">
                {settings.api.mode === 'mock'
                  ? 'Every screen is served by the in-browser mock store with simulated latency. Deterministic and offline-safe.'
                  : 'Requests are issued to the configured base URL. Set VITE_API_BASE_URL and restart the dev server.'}
              </span>
            </div>
            <p className="mono mt-1.5 text-[11px] leading-relaxed text-ink-4">
              The mode is fixed at build time by <span className="text-cyber">VITE_USE_MOCK</span>. Switch it in
              <span className="text-cyber"> .env</span> — the frontend never hardcodes credentials or keys.
            </p>
          </Row>

          <Row label="API BASE URL">
            <div className="flex flex-wrap items-end gap-1.5">
              <Input
                label="Base URL"
                value={baseUrlDraft}
                onChange={(event) => setBaseUrlDraft(event.target.value)}
                placeholder="http://localhost:8000/api"
                className="mono h-8 min-w-[220px] flex-1"
                spellCheck={false}
                hint="Read from VITE_API_BASE_URL at build time; shown here for verification."
              />
              <Button
                variant="secondary"
                size="sm"
                className="h-8"
                onClick={() => toast.info('Base URL is build-time', 'Edit VITE_API_BASE_URL in your .env file and restart the dev server to change it.')}
              >
                How to change
              </Button>
            </div>
          </Row>

          <Row label="REQUEST TIMEOUT">
            <Select
              aria-label="Request timeout"
              value={String(settings.api.timeoutMs)}
              onChange={(event) => update({ api: { ...settings.api, timeoutMs: Number(event.target.value) } })}
              options={[5000, 10000, 15000, 30000].map((value) => ({ value: String(value), label: `${value / 1000}s` }))}
            />
          </Row>

          <Row label="ENDPOINT MAP">
            <SectionRule className="mb-1.5"><span>GET</span></SectionRule>
            <ul className="mono space-y-0.5 text-[11px] text-ink-3">
              {['/api/events', '/api/threats', '/api/incidents', '/api/network/events', '/api/authentication/events', '/api/threat-intelligence', '/api/reports', '/api/system/health'].map((path) => (
                <li key={path} className="flex items-baseline gap-2">
                  <span className="shrink-0 text-term">GET</span><span className="min-w-0 truncate text-cyber">{path}</span>
                </li>
              ))}
            </ul>
            <SectionRule className="mt-2 mb-1.5"><span>POST</span></SectionRule>
            <ul className="mono space-y-0.5 text-[11px] text-ink-3">
              {['/api/phishing/analyze', '/api/web-security/scan', '/api/malware/analyze', '/api/ai/investigate'].map((path) => (
                <li key={path} className="flex items-baseline gap-2">
                  <span className="shrink-0 text-high">POST</span><span className="min-w-0 truncate text-cyber">{path}</span>
                </li>
              ))}
            </ul>
          </Row>
        </Panel>
      </div>

      <Panel title="Demo & Diagnostic Controls" icon={<Gauge className="size-3.5" aria-hidden />} className="min-w-0">
        <Row label="FAILURE INJECTION">
          <Toggle
            checked={failureInjection}
            onChange={(value) => {
              setFailureInjectionEnabled(value);
              toast[value ? 'alert' : 'success'](value ? 'medium' : 'info', value ? 'Failure injection ON' : 'Failure injection OFF', value ? 'Read requests will intermittently fail so error states can be reviewed.' : 'All read requests will succeed again.');
            }}
            label="Simulate backend failures"
            description="Makes read requests fail intermittently so every error and retry state in the console can be exercised. Diagnostic only — never enable in production."
          />
        </Row>

        <Row label="SESSION STATE">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="secondary" size="xs" onClick={() => { sessionStorage.removeItem('cybersentinel.booted'); toast.info('Boot flag cleared', 'Reload the console to replay the start-up sequence.'); }}>
              Replay boot sequence
            </Button>
            <Button variant="ghost" size="xs" onClick={() => { setConfirmReset(true); }}>
              Reset all preferences
            </Button>
            <span className="mono text-[11px] text-ink-4">
              Stored at <span className="text-cyber">localStorage:cybersentinel.settings.v1</span>
            </span>
          </div>
        </Row>

        <Row label="CURRENT PREFERENCES">
          <pre className="mono overflow-x-auto rounded-[2px] border border-line bg-void p-2 text-[11px] leading-relaxed text-ink-3">
{JSON.stringify(settings, null, 2)}
          </pre>
        </Row>
      </Panel>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Restore default settings?"
        description="Every preference stored for this browser will be reset, including notification thresholds and demo controls."
        tone="danger"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              icon={<RotateCcw className="size-3.5" aria-hidden />}
              onClick={() => {
                reset();
                setBaseUrlDraft(DEFAULT_SETTINGS.api.baseUrl);
                setConfirmReset(false);
                toast.success('Settings restored', 'All preferences are back to their defaults.');
              }}
            >
              Restore defaults
            </Button>
          </>
        }
      >
        <p className="text-[11.5px] leading-relaxed text-ink-2">
          This affects the local console only. Investigation records, incident state and generated reports are untouched.
        </p>
      </Modal>
    </div>
  );
}
