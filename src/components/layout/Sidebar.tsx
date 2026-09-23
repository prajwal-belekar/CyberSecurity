import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { ALL_NAV_ITEMS, NAVIGATION } from '@/app/router/navigation';
import { useUI } from '@/store/UIContext';
import { useLive } from '@/store/LiveContext';
import { useSettings } from '@/store/SettingsContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { useIncidentSummary } from '@/hooks/useIncidents';
import { useThreatSummary } from '@/hooks/useSecurityEvents';

function NavBadge({ count, tone = 'critical' }: { count: number; tone?: 'critical' | 'high' }) {
  if (!count) return null;
  return (
    <span
      className={cn(
        'mono tnum shrink-0 rounded-[2px] border px-1 text-[10.5px] font-bold',
        tone === 'critical' ? 'border-critical/40 bg-critical/15 text-critical' : 'border-high/40 bg-high/15 text-high',
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

/** Simple Mode bottom-of-rail switch — mirrors the TopBar segmented control. */
function ModeSwitch({ simple }: { simple: boolean }) {
  const { updateUIMode } = useSettings();
  return (
    <div
      role="group"
      aria-label="Interface mode"
      className="mb-2 flex h-6 items-center gap-0.5 rounded-[2px] border border-line-2 bg-panel p-0.5"
    >
      <button
        type="button"
        onClick={() => updateUIMode('simple')}
        aria-pressed={simple}
        className={cn(
          'mono h-full rounded-[1px] px-1.5 text-[10px] font-semibold tracking-[0.04em] transition-colors',
          simple ? 'border border-cyber/50 bg-cyber/12 text-cyber' : 'border border-transparent text-ink-4 hover:text-ink-2',
        )}
      >
        SIMPLE
      </button>
      <button
        type="button"
        onClick={() => updateUIMode('analyst')}
        aria-pressed={!simple}
        className={cn(
          'mono h-full rounded-[1px] px-1.5 text-[10px] font-semibold tracking-[0.04em] transition-colors',
          !simple ? 'border border-term/50 bg-term/12 text-term' : 'border border-transparent text-ink-4 hover:text-ink-2',
        )}
      >
        ANALYST
      </button>
    </div>
  );
}

/**
 * Command rail. Expanded shows the terminal-prefixed label; collapsed shows the
 * icon plus a tooltip. Group labels become hairline rules when collapsed.
 */
export function Sidebar() {
  const { sidebarCollapsed } = useUI();
  const { connected } = useLive();
  const { settings } = useSettings();
  const { data: threatSummary } = useThreatSummary();
  const { data: incidentSummary } = useIncidentSummary();

  const simple = settings.uiMode === 'simple';
  const activeNav = NAVIGATION;

  const badges: Record<string, number> = {
    threats: (threatSummary?.critical ?? 0) + (threatSummary?.high ?? 0),
    incidents: (incidentSummary?.open ?? 0) + (incidentSummary?.investigating ?? 0),
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 52 : 196 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-30 hidden shrink-0 flex-col border-r border-line bg-base lg:flex"
      aria-label="Primary navigation"
    >
      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-2 no-scrollbar">
        {activeNav.map((group) => (
          <div key={group.id} className="mb-1.5">
            {sidebarCollapsed ? (
              <div className="mx-2.5 my-2 h-px bg-line" role="separator" aria-label={group.label} />
            ) : (
              <div className="mono mb-1 flex items-center gap-1.5 px-3 text-[10.5px] font-semibold tracking-[0.02em] text-ink-4 uppercase">
                <span aria-hidden>──</span>
                <span className="truncate">{group.label}</span>
                <span className="h-px flex-1 bg-line" aria-hidden />
              </div>
            )}

            <ul className="space-y-px">
              {group.items.map((item) => {
                const Icon = item.icon;
                const badge = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0;

                const link = (
                  <NavLink
                    to={item.to}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) => cn(
                      'group relative flex items-center gap-2 border-l-2 py-[5px] transition-colors duration-150',
                      sidebarCollapsed ? 'justify-center border-l-2 pl-0' : 'pr-2 pl-2.5',
                      isActive
                        ? 'border-term bg-term/8 text-term'
                        : 'border-transparent text-ink-3 hover:border-line-3 hover:bg-panel-2 hover:text-ink',
                    )}
                  >
                    {({ isActive }) => (
                      <>
                        {!sidebarCollapsed ? (
                          <span className={cn('mono w-2.5 shrink-0 text-[11px]', isActive ? 'text-term' : 'text-ink-4 group-hover:text-term/70')} aria-hidden>
                            {isActive ? '>>' : '>'}
                          </span>
                        ) : null}
                        <Icon className="size-3.5 shrink-0" aria-hidden />
                        {!sidebarCollapsed && simple ? (
                          <span className="min-w-0 flex-1">
                            <span className={cn('block truncate text-[12px] leading-tight font-medium', isActive ? 'text-term' : 'text-ink-2')}>
                              {item.label}
                            </span>
                            <span className="block truncate text-[10px] leading-tight text-ink-4">{item.description}</span>
                          </span>
                        ) : null}
                        {!sidebarCollapsed && !simple ? (
                          <span className="mono min-w-0 flex-1 truncate text-[10.5px] font-semibold tracking-[0.02em] uppercase">
                            {item.short}
                          </span>
                        ) : null}
                        {!sidebarCollapsed && badge ? <NavBadge count={badge} tone={item.badgeKey === 'incidents' ? 'high' : 'critical'} /> : null}
                        {sidebarCollapsed && badge ? (
                          <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-critical" aria-hidden />
                        ) : null}
                        {isActive ? (
                          <motion.span
                            layoutId="nav-active-glow"
                            className="absolute inset-y-0 right-0 w-px bg-term/60"
                            transition={{ duration: 0.2 }}
                            aria-hidden
                          />
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );

                return (
                  <li key={item.to}>
                    {sidebarCollapsed ? (
                      <Tooltip content={item.label} side="right" label={item.label} className="w-full">
                        <span className="block w-full">{link}</span>
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* System status footer */}
      <div className="shrink-0 border-t border-line bg-base px-2.5 py-2">
        {!sidebarCollapsed && simple ? <ModeSwitch simple /> : null}
        {sidebarCollapsed ? (
          <Tooltip content={connected ? 'All subsystems operational' : 'Live feed paused'} side="right" label="System status">
            <span className="flex w-full items-center justify-center">
              <span className={cn('size-2 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')} aria-hidden />
            </span>
          </Tooltip>
        ) : (
          <div className="min-w-0">
            <div className="label-xs mb-1">System status</div>
            <div className="flex items-center gap-1.5">
              <span className={cn('size-1.5 shrink-0 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')} aria-hidden />
              <span className={cn('mono truncate text-[11px] font-semibold tracking-[0.01em] uppercase', connected ? 'text-term' : 'text-ink-3')}>
                {connected ? 'Operational' : 'Paused'}
              </span>
            </div>
            <AnimatePresence>
              {connected ? (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mono mt-1 truncate text-[10.5px] text-ink-4"
                >
                  stream connected
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

/** Slide-out drawer variant for tablet/mobile widths. */
export function SidebarDrawer() {
  const { mobileNavOpen, setMobileNavOpen } = useUI();
  const { connected } = useLive();
  const { settings } = useSettings();
  const { data: threatSummary } = useThreatSummary();
  const { data: incidentSummary } = useIncidentSummary();
  const simple = settings.uiMode === 'simple';
  const activeNav = NAVIGATION;
  const badges: Record<string, number> = {
    threats: (threatSummary?.critical ?? 0) + (threatSummary?.high ?? 0),
    incidents: (incidentSummary?.open ?? 0) + (incidentSummary?.investigating ?? 0),
  };

  return (
    <AnimatePresence>
      {mobileNavOpen ? (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/75"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setMobileNavOpen(false)}
            aria-hidden
          />
          <motion.nav
            aria-label="Primary navigation"
            className="absolute inset-y-0 left-0 flex w-[248px] flex-col border-r border-line-2 bg-base"
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="mono text-[12px] leading-none text-term" aria-hidden>◈</span>
                <span className="mono truncate text-[11px] font-bold tracking-[0.02em] text-ink uppercase">
                  Cyber<span className="text-term">Sentinel</span>
                </span>
              </span>
              <span className="flex-1" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation"
                className="rounded-[2px] border border-line-2 p-1 text-ink-3"
              >
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {activeNav.map((group) => (
                <div key={group.id} className="mb-2">
                  <div className="mono mb-1 flex items-center gap-1.5 px-3 text-[10.5px] font-semibold tracking-[0.02em] text-ink-4 uppercase">
                    <span aria-hidden>──</span><span>{group.label}</span>
                    <span className="h-px flex-1 bg-line" aria-hidden />
                  </div>
                  <ul className="space-y-px">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const badge = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0;
                      return (
                        <li key={item.to}>
                          <NavLink
                            to={item.to}
                            onClick={() => setMobileNavOpen(false)}
                            className={({ isActive }) => cn(
                              'flex items-center gap-2 border-l-2 py-2 pr-3 pl-2.5 transition-colors',
                              isActive ? 'border-term bg-term/8 text-term' : 'border-transparent text-ink-3 hover:bg-panel-2 hover:text-ink',
                            )}
                          >
                            {({ isActive }) => (
                              <>
                                <span className="mono w-3 text-[11px] text-ink-4" aria-hidden>&gt;</span>
                                <Icon className="size-4 shrink-0" aria-hidden />
                                {simple ? (
                                  <span className="min-w-0 flex-1">
                                    <span className={cn('block truncate text-[12px] leading-tight font-medium', isActive ? 'text-term' : 'text-ink-2')}>
                                      {item.label}
                                    </span>
                                    <span className="block truncate text-[10.5px] leading-tight text-ink-4">{item.description}</span>
                                  </span>
                                ) : (
                                  <span className="mono min-w-0 flex-1 truncate text-[11px] font-semibold tracking-[0.01em] uppercase">{item.short}</span>
                                )}
                                {badge ? <NavBadge count={badge} /> : null}
                              </>
                            )}
                          </NavLink>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>

            <div className="shrink-0 border-t border-line px-3 py-2">
              {simple ? <ModeSwitch simple /> : null}
              <div className="flex items-center gap-1.5">
                <span className={cn('size-1.5 rounded-full', connected ? 'bg-term text-term' : 'bg-ink-4 text-ink-4')} aria-hidden />
                <span className="mono text-[11px] font-semibold tracking-[0.01em] text-ink-2 uppercase">
                  SYSTEM {connected ? 'ONLINE' : 'PAUSED'}
                </span>
              </div>
            </div>
          </motion.nav>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export const NAV_ITEM_COUNT = ALL_NAV_ITEMS.length;
