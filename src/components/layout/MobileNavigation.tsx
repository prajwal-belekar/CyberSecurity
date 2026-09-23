import { NavLink } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, MoreHorizontal, Network, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useSettings } from '@/store/SettingsContext';

/**
 * Bottom navigation for the compact mobile terminal. Ordered by triage
 * priority — threats, incidents, network — rather than mirroring the desktop
 * dashboard, as required for small screens.
 */
const ITEMS = [
  { to: '/threats', label: { simple: 'ALERTS', analyst: 'THREATS' }, icon: ShieldAlert, priority: 1 },
  { to: '/incidents', label: { simple: 'CASES', analyst: 'CASES' }, icon: FolderKanban, priority: 2 },
  { to: '/dashboard', label: { simple: 'OVERVIEW', analyst: 'HOME' }, icon: LayoutDashboard, priority: 3 },
  { to: '/network', label: { simple: 'NETWORK', analyst: 'NET' }, icon: Network, priority: 4 },
  { to: '/ai-assistant', label: { simple: 'ASK', analyst: 'AI' }, icon: MoreHorizontal, priority: 5 },
];

export function MobileNavigation() {
  const { settings } = useSettings();
  const simple = settings.uiMode === 'simple';

  return (
    <nav
      aria-label="Mobile navigation"
      className="z-40 flex shrink-0 items-stretch border-t border-line bg-base lg:hidden"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const label = typeof item.label === 'string' ? item.label : (simple ? item.label.simple : item.label.analyst);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              'flex flex-1 flex-col items-center gap-0.5 py-1.5 transition-colors',
              isActive ? 'text-term' : 'text-ink-4 hover:text-ink-2',
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn('relative flex size-5 items-center justify-center', isActive && 'text-term')} aria-hidden>
                  <Icon className="size-4" />
                </span>
                <span className="mono text-[10.5px] font-semibold tracking-[0.02em]">{label}</span>
                <span className={cn('h-px w-6 transition-colors', isActive ? 'bg-term' : 'bg-transparent')} aria-hidden />
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
