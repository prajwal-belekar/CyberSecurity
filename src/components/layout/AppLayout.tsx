import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, SidebarDrawer } from './Sidebar';
import { TopBar } from './TopBar';
import { StatusBar } from './StatusBar';
import { TerminalDock } from './TerminalDock';
import { MobileNavigation } from './MobileNavigation';
import { CommandPalette } from '@/components/system/CommandPalette';
import { NotificationCenter } from '@/components/system/NotificationCenter';
import { EventDetailDrawer } from '@/components/threats/EventDetailDrawer';
import { BootSequence } from '@/components/system/BootSequence';
import { useSettings } from '@/store/SettingsContext';
import { useUI } from '@/store/UIContext';

/**
 * Persistent application shell:
 *   top bar · sidebar rail · scrolling workspace · terminal dock · status bar
 * plus the global surfaces (boot sequence, command palette, notifications,
 * event drawer) that sit above every route.
 */
export function AppLayout() {
  const location = useLocation();
  const { settings } = useSettings();
  const { setMobileNavOpen, activeEvent } = useUI();

  // Close transient surfaces whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname, setMobileNavOpen]);

  useEffect(() => {
    const reduce = settings.reduceMotion;
    document.documentElement.dataset.motion = reduce ? 'reduced' : 'full';
  }, [settings.reduceMotion]);

  return (
    <div className="workspace-grid relative z-10 flex h-full min-h-0 flex-col overflow-hidden bg-void">
      <TopBar />

      <div className="flex min-h-0 flex-1">
        <Sidebar />

        <main className="flex min-w-0 flex-1 flex-col" id="main-workspace">
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain" tabIndex={-1}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: settings.reduceMotion ? 0 : 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: settings.reduceMotion ? 0 : -4 }}
                transition={{ duration: settings.reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
                className="min-h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>

          <TerminalDock />
          <StatusBar />
        </main>
      </div>

      <MobileNavigation />
      <SidebarDrawer />
      <CommandPalette />
      <NotificationCenter />
      <EventDetailDrawer key={activeEvent?.id ?? 'none'} />
      <BootSequence />
    </div>
  );
}
