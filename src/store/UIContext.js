import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
const UIContext = createContext(null);
const SIDEBAR_KEY = 'cybersentinel.sidebar.collapsed';
const DOCK_KEY = 'cybersentinel.terminal.dock';
const BOOT_KEY = 'cybersentinel.booted';
/** Shell-level UI state. Deliberately tiny — data lives in TanStack Query. */
export function UIProvider({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        try {
            return window.localStorage.getItem(SIDEBAR_KEY) === '1';
        }
        catch {
            return false;
        }
    });
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [terminalDockOpen, setTerminalDockOpen] = useState(() => {
        try {
            return window.localStorage.getItem(DOCK_KEY) !== '0';
        }
        catch {
            return true;
        }
    });
    const [activeEvent, setActiveEvent] = useState(null);
    const [booted, setBooted] = useState(() => {
        try {
            return window.sessionStorage.getItem(BOOT_KEY) === '1';
        }
        catch {
            return false;
        }
    });
    const persist = (key, value, storage) => {
        try {
            if (storage === 'session')
                window.sessionStorage.setItem(key, value);
            else
                window.localStorage.setItem(key, value);
        }
        catch { /* private mode / sandboxed storage */ }
    };
    useEffect(() => { persist(SIDEBAR_KEY, sidebarCollapsed ? '1' : '0', 'local'); }, [sidebarCollapsed]);
    useEffect(() => { persist(DOCK_KEY, terminalDockOpen ? '1' : '0', 'local'); }, [terminalDockOpen]);
    // Close transient surfaces on route-level navigation triggers.
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setPaletteOpen(false);
                setNotificationsOpen(false);
                setMobileNavOpen(false);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    const completeBoot = useCallback(() => {
        setBooted(true);
        persist(BOOT_KEY, '1', 'session');
    }, []);
    const value = useMemo(() => ({
        sidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((v) => !v),
        setSidebarCollapsed,
        mobileNavOpen,
        setMobileNavOpen,
        paletteOpen,
        openPalette: () => setPaletteOpen(true),
        closePalette: () => setPaletteOpen(false),
        notificationsOpen,
        setNotificationsOpen,
        terminalDockOpen,
        toggleTerminalDock: () => setTerminalDockOpen((v) => !v),
        activeEvent,
        openEvent: setActiveEvent,
        closeEvent: () => setActiveEvent(null),
        booted,
        completeBoot,
        skipBoot: completeBoot,
    }), [sidebarCollapsed, mobileNavOpen, paletteOpen, notificationsOpen, terminalDockOpen, activeEvent, booted, completeBoot]);
    return _jsx(UIContext.Provider, { value: value, children: children });
}
export function useUI() {
    const ctx = useContext(UIContext);
    if (!ctx)
        throw new Error('useUI must be used inside <UIProvider>');
    return ctx;
}
