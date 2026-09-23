import { Link } from 'react-router-dom';
import {
  Bell, ChevronDown, LogOut, Menu, Search, Shield, Settings as SettingsIcon,
  Terminal, User, X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useClock, useIsMobile } from '@/hooks';
import { useLive } from '@/store/LiveContext';
import { useUI } from '@/store/UIContext';
import { useSettings } from '@/store/SettingsContext';
import { useHotkey } from '@/hooks/useHotkey';
import { Dropdown } from '@/components/ui/Dropdown';
import { Tooltip } from '@/components/ui/Tooltip';
import { Meter } from '@/components/ui/Meter';
import { formatNumber } from '@/utils/formatting';

function MetricReadout({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Tooltip content={`${label}: ${value}`} label={label}>
      <span className="mono hidden items-baseline gap-1 text-[11px] whitespace-nowrap xl:inline-flex">
        <span className="text-ink-4">{label}</span>
        <span className={cn('tnum font-semibold', tone)}>{value}</span>
      </span>
    </Tooltip>
  );
}

/**
 * Operator status bar: identity, live system state, telemetry readouts and the
 * global search / notification controls. Monospace throughout for the technical
 * fields.
 */
export function TopBar() {
  const clock = useClock();
  const isMobile = useIsMobile();
  const { metrics, connected } = useLive();
  const { toggleSidebar, setMobileNavOpen, mobileNavOpen, openPalette, setNotificationsOpen, notificationsOpen, terminalDockOpen, toggleTerminalDock } = useUI();
  const { settings, updateUIMode } = useSettings();

  useHotkey('ctrl+k', (e) => { e.preventDefault(); openPalette(); });
  useHotkey('ctrl+/', (e) => { e.preventDefault(); openPalette(); });
  useHotkey('ctrl+b', (e) => { e.preventDefault(); toggleSidebar(); });

  const cpuTone = metrics.cpu > 80 ? 'text-critical' : metrics.cpu > 60 ? 'text-medium' : 'text-term';
  const memTone = metrics.mem > 85 ? 'text-critical' : metrics.mem > 70 ? 'text-medium' : 'text-cyber';
  const netTone = metrics.netMbps > 45 ? 'text-medium' : 'text-cyber';

  const currentMode = settings.uiMode;

  return (
    <header
      className={cn(
        'relative z-40 flex h-11 shrink-0 items-center gap-2 border-b border-line bg-base px-2 sm:px-3',
        'after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-line',
      )}
    >
      {/* Identity */}
      {isMobile ? (
        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileNavOpen}
          className="inline-flex size-7 items-center justify-center rounded-[2px] border border-line-2 text-ink-2 transition-colors hover:border-term/40 hover:text-term"
        >
          {mobileNavOpen ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="inline-flex size-7 items-center justify-center rounded-[2px] border border-line-2 text-ink-3 transition-colors hover:border-term/40 hover:text-term"
        >
          <Menu className="size-3.5" aria-hidden />
        </button>
      )}

      <Link
        to="/dashboard"
        className="group flex min-w-0 items-center gap-1.5 rounded-[2px] px-1 py-0.5"
        aria-label="CyberSentinel — go to dashboard"
      >
        <span className="mono shrink-0 text-[14px] leading-none text-term" aria-hidden>◈</span>
        <span className="mono truncate text-[12.5px] font-bold tracking-[0.02em] text-ink uppercase">
          Cyber<span className="text-term">Sentinel</span>
        </span>
      </Link>

      {/* System status */}
      <div className="ml-1 hidden items-center gap-1.5 rounded-[2px] border border-line-2 bg-panel px-2 py-0.5 sm:flex">
        <span
          className={cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')}
          aria-hidden
        />
        <span className="mono text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap text-ink-2 uppercase">
          SYSTEM {connected ? 'ONLINE' : 'PAUSED'}
        </span>
      </div>

      <div className="flex-1" />

      {/* Live telemetry */}
      <div className="hidden items-center gap-3 lg:flex">
        <MetricReadout label="CPU" value={`${metrics.cpu}%`} tone={cpuTone} />
        <MetricReadout label="MEM" value={`${metrics.mem}%`} tone={memTone} />
        <MetricReadout label="NET" value={`${metrics.netMbps} MB/s`} tone={netTone} />
        <MetricReadout label="EVENTS" value={formatNumber(metrics.totalEvents)} tone="text-ink" />
        <Tooltip content={`Pipeline latency ${metrics.latencyMs}ms`} label="Latency">
          <span className="hidden min-w-[54px] 2xl:block">
            <Meter value={Math.min(100, metrics.latencyMs * 1.6)} tone={metrics.latencyMs > 45 ? 'warn' : 'term'} blocks width={6} showValue={false} />
          </span>
        </Tooltip>
        <span className="mono tnum text-[10.5px] font-semibold text-term tabular-nums">{clock}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={openPalette}
          className="group flex h-7 items-center gap-2 rounded-[2px] border border-line-2 bg-panel px-2 text-left transition-colors hover:border-line-3 sm:w-52 lg:w-60"
          aria-label="Open command palette (Ctrl+K)"
        >
          <Search className="size-3.5 shrink-0 text-ink-4 group-hover:text-term" aria-hidden />
          <span className="mono hidden flex-1 truncate text-[10.5px] text-ink-4 sm:block">
            root@cybersentinel:~$ _
          </span>
          <kbd className="mono hidden shrink-0 rounded-[2px] border border-line-3 bg-raised px-1 py-px text-[10.5px] text-ink-4 sm:block">
            Ctrl K
          </kbd>
        </button>

        <Tooltip content={terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock'} label="Terminal dock">
          <button
            type="button"
            onClick={toggleTerminalDock}
            aria-label={terminalDockOpen ? 'Hide terminal dock' : 'Show terminal dock'}
            aria-pressed={terminalDockOpen}
            className={cn(
              'hidden size-7 items-center justify-center rounded-[2px] border transition-colors md:inline-flex',
              terminalDockOpen
                ? 'border-term/40 bg-term/10 text-term'
                : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink',
            )}
          >
            <Terminal className="size-3.5" aria-hidden />
          </button>
        </Tooltip>

        {/* Mode switcher — single segmented control (Simple ↔ Analyst) */}
        <div
          role="group"
          aria-label="Interface mode"
          className="inline-flex h-7 items-center gap-0.5 rounded-[2px] border border-line-2 bg-panel p-0.5"
        >
          <Tooltip content="Beginner-friendly layout with plain-language explanations" label="Simple Mode">
            <button
              type="button"
              onClick={() => updateUIMode('simple')}
              aria-pressed={currentMode === 'simple'}
              className={cn(
                'mono h-full rounded-[1px] px-1.5 text-[10px] font-semibold tracking-[0.04em] transition-colors',
                currentMode === 'simple'
                  ? 'border border-cyber/50 bg-cyber/12 text-cyber'
                  : 'border border-transparent text-ink-4 hover:text-ink-2',
              )}
            >
              SIMPLE
            </button>
          </Tooltip>
          <Tooltip content="Dense SOC analyst command center" label="Analyst Mode">
            <button
              type="button"
              onClick={() => updateUIMode('analyst')}
              aria-pressed={currentMode === 'analyst'}
              className={cn(
                'mono h-full rounded-[1px] px-1.5 text-[10px] font-semibold tracking-[0.04em] transition-colors',
                currentMode === 'analyst'
                  ? 'border border-term/50 bg-term/12 text-term'
                  : 'border border-transparent text-ink-4 hover:text-ink-2',
              )}
            >
              ANALYST
            </button>
          </Tooltip>
        </div>

        <Dropdown
          label="Notifications"
          align="right"
          width="w-56"
          trigger={({ toggle, open, ref }) => (
            <button
              ref={ref}
              type="button"
              onClick={toggle}
              aria-label="Open notifications"
              aria-expanded={open}
              aria-haspopup="true"
              className={cn(
                'relative inline-flex size-7 items-center justify-center rounded-[2px] border transition-colors',
                open || notificationsOpen
                  ? 'border-term/40 bg-term/10 text-term'
                  : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink',
              )}
            >
              <Bell className="size-3.5" aria-hidden />
              <LiveUnreadDot onOpen={() => setNotificationsOpen(true)} />
            </button>
          )}
          items={[
            { id: 'center', label: 'Open notification center', icon: <Bell className="size-3.5" aria-hidden />, onSelect: () => setNotificationsOpen(true) },
            { id: 'threats', label: 'Jump to threats', icon: <Shield className="size-3.5" aria-hidden />, onSelect: () => { window.location.assign('/threats'); } },
            { id: 'sep', label: '', separator: true },
            { id: 'settings', label: 'Notification preferences', icon: <SettingsIcon className="size-3.5" aria-hidden />, onSelect: () => { window.location.assign('/settings'); } },
          ]}
        />

        <Dropdown
          label="Account"
          align="right"
          width="w-64"
          header={
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-[2px] border border-term/35 bg-term/10 font-mono text-[11px] font-bold text-term">
                AR
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-medium text-ink">a.reyes</p>
                <p className="mono truncate text-[11px] text-ink-4">SOC analyst · Tier 2</p>
              </div>
            </div>
          }
          trigger={({ toggle, open, ref }) => (
            <button
              ref={ref}
              type="button"
              onClick={toggle}
              aria-label="Account menu"
              aria-expanded={open}
              aria-haspopup="true"
              className={cn(
                'inline-flex h-7 items-center gap-1 rounded-[2px] border px-1.5 transition-colors',
                open ? 'border-term/40 bg-term/10 text-term' : 'border-line-2 text-ink-3 hover:border-line-3 hover:text-ink',
              )}
            >
              <User className="size-3.5" aria-hidden />
              <span className="mono hidden text-[11px] tracking-[0.01em] sm:block">a.reyes</span>
              <ChevronDown className="size-3" aria-hidden />
            </button>
          )}
          items={[
            { id: 'session', label: 'Session details', hint: '4h 12m', disabled: true },
            { id: 'settings', label: 'Workspace settings', icon: <SettingsIcon className="size-3.5" aria-hidden />, onSelect: () => { window.location.assign('/settings'); } },
            { id: 'sep', label: '', separator: true },
            {
              id: 'signout',
              label: 'Sign out',
              icon: <LogOut className="size-3.5" aria-hidden />,
              danger: true,
              hint: 'SOON',
              disabled: true,
            },
          ]}
          footer={
            <p className="mono text-[10.5px] leading-relaxed text-ink-4">
              Authentication is handled by the backend session. No credentials are stored in this frontend.
            </p>
          }
        />
      </div>
    </header>
  );
}

function LiveUnreadDot({ onOpen }: { onOpen: () => void }) {
  const { unreadNotifications } = useLive();
  if (!unreadNotifications) return null;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onOpen(); }}
      aria-label={`${unreadNotifications} unread notifications`}
      className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-base bg-critical px-0.5 font-mono text-[10.5px] leading-none font-bold text-void"
    >
      {unreadNotifications > 9 ? '9+' : unreadNotifications}
    </button>
  );
}
