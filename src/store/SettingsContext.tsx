import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AppSettings, UIMode } from '@/types/system';
import { API_BASE_URL, API_MODE, API_TIMEOUT_MS } from '@/services/api';
import { setFailureInjection } from '@/services/mockApi';

const STORAGE_KEY = 'cybersentinel.settings.v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'terminal-dark',
  density: 'normal',
  defaultTimeRange: '24H',
  autoRefresh: true,
  autoRefreshSeconds: 15,
  bootSequence: true,
  liveEventStream: true,
  reduceMotion: false,
  showTerminalDock: true,
  uiMode: 'analyst',
  notifications: {
    criticalAlerts: true,
    highAlerts: true,
    mediumAlerts: false,
    desktopToasts: true,
    emailNotifications: false,
    soundOnCritical: false,
  },
  api: { mode: API_MODE, baseUrl: API_BASE_URL, timeoutMs: API_TIMEOUT_MS },
};

interface SettingsContextValue {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
  updateNotifications: (patch: Partial<AppSettings['notifications']>) => void;
  updateUIMode: (mode: UIMode) => void;
  reset: () => void;
  /** Demo-only failure injection so error states are reachable on purpose. */
  failureInjection: boolean;
  setFailureInjectionEnabled: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function load(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications ?? {}) },
      // API mode/base URL always come from the environment, never from storage,
      // so a stale cache can never silently point the UI at another host.
      api: DEFAULT_SETTINGS.api,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(load);
  const [failureInjection, setFailureState] = useState(false);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch { /* storage may be unavailable */ }
  }, [settings]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.density = settings.density;
    root.dataset.theme = settings.theme;
  }, [settings.density, settings.theme, settings.reduceMotion]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateNotifications = useCallback((patch: Partial<AppSettings['notifications']>) => {
    setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, ...patch } }));
  }, []);

  const updateUIMode = useCallback((mode: UIMode) => {
    setSettings((prev) => ({ ...prev, uiMode: mode }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);

  const setFailureInjectionEnabled = useCallback((enabled: boolean) => {
    setFailureInjection(enabled);
    setFailureState(enabled);
  }, []);

  const value = useMemo(
    () => ({ settings, update, updateNotifications, updateUIMode, reset, failureInjection, setFailureInjectionEnabled }),
    [settings, update, updateNotifications, updateUIMode, reset, failureInjection, setFailureInjectionEnabled],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
