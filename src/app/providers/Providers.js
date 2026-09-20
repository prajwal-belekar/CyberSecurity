import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
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
                    if (error?.status === 503)
                        return false;
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
function MotionGate({ children }) {
    const { settings } = useSettings();
    return (_jsx(MotionConfig, { reducedMotion: settings.reduceMotion ? 'always' : 'user', children: children }));
}
/** Order matters: settings → toasts → live feed → shell UI → router. */
function InnerProviders({ children }) {
    const { settings } = useSettings();
    return (_jsx(ToastProvider, { enabled: settings.notifications.desktopToasts, children: _jsx(LiveProvider, { children: _jsx(UIProvider, { children: children }) }) }));
}
export function Providers({ children }) {
    const [queryClient] = useState(makeQueryClient);
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(SettingsProvider, { children: _jsx(MotionGate, { children: _jsx(BrowserRouter, { children: _jsx(InnerProviders, { children: children }) }) }) }) }));
}
