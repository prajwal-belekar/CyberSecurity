import { NavLink } from 'react-router-dom';
import { FolderKanban, LayoutDashboard, MoreHorizontal, Network, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * Bottom navigation for the compact mobile terminal. Ordered by triage
 * priority — threats, incidents, network — rather than mirroring the desktop
 * dashboard, as required for small screens.
 */
const ITEMS = [
  { to: '/threats', label: 'THREATS', icon: ShieldAlert, priority: 1 },
  { to: '/incidents', label: 'CASES', icon: FolderKanban, priority: 2 },
  { to: '/dashboard', label: 'HOME', icon: LayoutDashboard, priority: 3 },
  { to: '/network', label: 'NET', icon: Network, priority: 4 },
  { to: '/ai-assistant', label: 'AI', icon: MoreHorizontal, priority: 5 },
];

export function MobileNavigation() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="z-40 flex shrink-0 items-stretch border-t border-line bg-base lg:hidden"
    >
      {ITEMS.map((item) => {
        const Icon = item.icon;
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
                <span className="mono text-[10.5px] font-semibold tracking-[0.02em]">{item.label}</span>
                <span className={cn('h-px w-6 transition-colors', isActive ? 'bg-term' : 'bg-transparent')} aria-hidden />
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
