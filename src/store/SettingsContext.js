import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL, API_MODE, API_TIMEOUT_MS } from '@/services/api';
import { setFailureInjection } from '@/services/mockApi';
const STORAGE_KEY = 'cybersentinel.settings.v1';
export const DEFAULT_SETTINGS = {
    theme: 'terminal-dark',
    density: 'normal',
    defaultTimeRange: '24H',
    autoRefresh: true,
    autoRefreshSeconds: 15,
    bootSequence: true,
    liveEventStream: true,
    reduceMotion: false,
    showTerminalDock: true,
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
const SettingsContext = createContext(null);
function load() {
    if (typeof window === 'undefined')
        return DEFAULT_SETTINGS;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw)
            return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            notifications: { ...DEFAULT_SETTINGS.notifications, ...(parsed.notifications ?? {}) },
            // API mode/base URL always come from the environment, never from storage,
            // so a stale cache can never silently point the UI at another host.
            api: DEFAULT_SETTINGS.api,
        };
    }
    catch {
        return DEFAULT_SETTINGS;
    }
}
export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(load);
    const [failureInjection, setFailureState] = useState(false);
    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
        catch { /* storage may be unavailable */ }
    }, [settings]);
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.density = settings.density;
        root.dataset.theme = settings.theme;
    }, [settings.density, settings.theme, settings.reduceMotion]);
    const update = useCallback((patch) => {
        setSettings((prev) => ({ ...prev, ...patch }));
    }, []);
    const updateNotifications = useCallback((patch) => {
        setSettings((prev) => ({ ...prev, notifications: { ...prev.notifications, ...patch } }));
    }, []);
    const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), []);
    const setFailureInjectionEnabled = useCallback((enabled) => {
        setFailureInjection(enabled);
        setFailureState(enabled);
    }, []);
    const value = useMemo(() => ({ settings, update, updateNotifications, reset, failureInjection, setFailureInjectionEnabled }), [settings, update, updateNotifications, reset, failureInjection, setFailureInjectionEnabled]);
    return _jsx(SettingsContext.Provider, { value: value, children: children });
}
export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx)
        throw new Error('useSettings must be used inside <SettingsProvider>');
    return ctx;
}
