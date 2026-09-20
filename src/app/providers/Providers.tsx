import { useState } from 'react';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider, useSettings } from '@/store/SettingsContext';
import { ToastProvider } from '@/store/ToastContext';
import { LiveProvider } from '@/store/LiveContext';
import { UIProvider } from '@/store/UIContext';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Mock transport is local; keep the cache warm so navigation is instant
        // while still refreshing when the simulated feed advances.
        staleTime: 10_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // Surface genuine failures fast so the ErrorState is visible.
          if ((error as { status?: number })?.status === 503) return false;
          return failureCount < 1;
        },
      },
      mutations: { retry: false },
    },
  });
}

/**
 * Bridges the Settings → "Reduce motion" toggle into framer-motion.
 * `reducedMotion="user"` follows the OS preference; `"always"` forces it on
 * when the operator opts in inside the app. Must sit *inside* SettingsProvider.
 */
function MotionGate({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return (
    <MotionConfig reducedMotion={settings.reduceMotion ? 'always' : 'user'}>
      {children}
    </MotionConfig>
  );
}

/** Order matters: settings → toasts → live feed → shell UI → router. */
function InnerProviders({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  return (
    <ToastProvider enabled={settings.notifications.desktopToasts}>
      <LiveProvider>
        <UIProvider>{children}</UIProvider>
      </LiveProvider>
    </ToastProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <MotionGate>
          <BrowserRouter>
            <InnerProviders>{children}</InnerProviders>
          </BrowserRouter>
        </MotionGate>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
