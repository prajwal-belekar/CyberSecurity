import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Bot, Bug, CornerDownLeft, FileText, FolderKanban, Gauge, Globe, KeyRound, LayoutDashboard, Network, Radar, Search, Settings as SettingsIcon, ShieldAlert, Terminal, Waypoints, } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { useUI } from '@/store/UIContext';
import { useHotkey } from '@/hooks/useHotkey';
import { searchApi, CATEGORY_LABELS } from '@/services/searchApi';
import { queryKeys } from '@/services/queryKeys';
import { severityMeta } from '@/utils/severity';
const COMMANDS = [
    { id: 'c-dashboard', label: 'Go to Dashboard', command: 'status', to: '/dashboard', icon: _jsx(LayoutDashboard, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['home', 'overview', 'dashboard', 'status'] },
    { id: 'c-threats', label: 'Go to Threats', command: 'threats', to: '/threats', icon: _jsx(ShieldAlert, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['threats', 'alerts', 'detections'] },
    { id: 'c-network', label: 'Go to Network', command: 'network', to: '/network', icon: _jsx(Network, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['network', 'map', 'traffic'] },
    { id: 'c-auth', label: 'Go to Authentication', command: 'auth', to: '/authentication', icon: _jsx(KeyRound, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['auth', 'login', 'logins', 'accounts'] },
    { id: 'c-incidents', label: 'Go to Incidents', command: 'incidents', to: '/incidents', icon: _jsx(FolderKanban, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['incidents', 'cases', 'soc'] },
    { id: 'c-intel', label: 'Go to Threat Intelligence', command: 'intelligence', to: '/threat-intelligence', icon: _jsx(Waypoints, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['intel', 'ioc', 'indicators'] },
    { id: 'c-analytics', label: 'Go to Analytics', command: 'analytics', to: '/analytics', icon: _jsx(BarChart3, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['analytics', 'trends', 'metrics'] },
    { id: 'c-reports', label: 'View Reports', command: 'reports', to: '/reports', icon: _jsx(FileText, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['reports', 'export'] },
    { id: 'c-settings', label: 'Open Settings', command: 'settings', to: '/settings', icon: _jsx(SettingsIcon, { className: "size-3.5", "aria-hidden": true }), group: 'NAVIGATE', keywords: ['settings', 'preferences', 'config'] },
    { id: 'c-phishing', label: 'Analyze URL', command: 'analyze url', to: '/phishing', icon: _jsx(Globe, { className: "size-3.5", "aria-hidden": true }), group: 'TOOLS', keywords: ['analyze', 'url', 'phishing', 'recon'] },
    { id: 'c-scanner', label: 'Run Web Security Scan', command: 'scan web', to: '/web-security', icon: _jsx(Bug, { className: "size-3.5", "aria-hidden": true }), group: 'TOOLS', keywords: ['scan', 'scanner', 'web', 'headers'] },
    { id: 'c-malware', label: 'Analyze File', command: 'analyze file', to: '/malware', icon: _jsx(Radar, { className: "size-3.5", "aria-hidden": true }), group: 'TOOLS', keywords: ['malware', 'file', 'sandbox', 'hash'] },
    { id: 'c-ai', label: 'Open AI Terminal', command: 'investigate', to: '/ai-assistant', icon: _jsx(Bot, { className: "size-3.5", "aria-hidden": true }), group: 'TOOLS', keywords: ['ai', 'assistant', 'investigate', 'chat'] },
    { id: 'c-ai-2048', label: 'Investigate INC-2048', command: 'investigate INC-2048', to: '/ai-assistant?incident=INC-2048', icon: _jsx(Bot, { className: "size-3.5", "aria-hidden": true }), group: 'TOOLS', keywords: ['inc-2048', 'brute force', 'investigate'] },
    { id: 'c-system', label: 'Show System Status', command: 'status', to: '/dashboard', icon: _jsx(Gauge, { className: "size-3.5", "aria-hidden": true }), group: 'SYSTEM', keywords: ['system', 'health', 'status'] },
    { id: 'c-terminal', label: 'Focus Terminal Dock', command: 'terminal', to: '/dashboard', icon: _jsx(Terminal, { className: "size-3.5", "aria-hidden": true }), group: 'SYSTEM', keywords: ['terminal', 'console', 'shell', 'dock'] },
];
/**
 * Ctrl+K command interface styled as a shell prompt.
 * Merges an explicit navigation/action command list with live search results
 * grouped by category (threats, incidents, IP addresses, domains, users…).
 */
export function CommandPalette() {
    const { paletteOpen, openPalette, closePalette, terminalDockOpen, toggleTerminalDock } = useUI();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [cursor, setCursor] = useState(0);
    const inputRef = useRef(null);
    const listRef = useRef(null);
    useHotkey('ctrl+k', (e) => { e.preventDefault(); paletteOpen ? closePalette() : openPalette(); });
    useEffect(() => {
        if (paletteOpen) {
            setQuery('');
            setCursor(0);
            const id = window.setTimeout(() => inputRef.current?.focus(), 40);
            return () => window.clearTimeout(id);
        }
    }, [paletteOpen]);
    const { data: results = [], isFetching } = useQuery({
        queryKey: queryKeys.search(query),
        queryFn: () => searchApi.search(query),
        enabled: paletteOpen && query.trim().length >= 2,
        staleTime: 4_000,
    });
    const commands = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q)
            return COMMANDS.slice(0, 9);
        return COMMANDS.filter((c) => c.label.toLowerCase().includes(q) ||
            c.command.toLowerCase().includes(q) ||
            c.keywords.some((k) => k.includes(q))).slice(0, 8);
    }, [query]);
    // Flat list for keyboard navigation: commands first, then grouped results.
    const flat = useMemo(() => {
        const entries = [];
        commands.forEach((c) => entries.push({ kind: 'command', item: c }));
        results.forEach((r) => entries.push({ kind: 'result', item: r }));
        return entries;
    }, [commands, results]);
    useEffect(() => { setCursor(0); }, [query]);
    useEffect(() => {
        const node = listRef.current?.querySelector('[data-cursor="true"]');
        node?.scrollIntoView({ block: 'nearest' });
    }, [cursor]);
    const activate = (index) => {
        const entry = flat[index];
        if (!entry)
            return;
        if (entry.kind === 'command') {
            if (entry.item.id === 'c-terminal') {
                if (!terminalDockOpen)
                    toggleTerminalDock();
            }
            navigate(entry.item.to);
        }
        else if (entry.item.href) {
            navigate(entry.item.href);
        }
        closePalette();
    };
    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setCursor((c) => Math.min(flat.length - 1, c + 1));
        }
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setCursor((c) => Math.max(0, c - 1));
        }
        else if (e.key === 'Enter') {
            e.preventDefault();
            activate(cursor);
        }
        else if (e.key === 'Home') {
            e.preventDefault();
            setCursor(0);
        }
        else if (e.key === 'End') {
            e.preventDefault();
            setCursor(Math.max(0, flat.length - 1));
        }
    };
    let resultIndex = commands.length;
    const grouped = results.reduce((acc, r) => {
        (acc[r.category] ??= []).push(r);
        return acc;
    }, {});
    return (_jsx(AnimatePresence, { children: paletteOpen ? (_jsxs("div", { className: "fixed inset-0 z-[100] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]", role: "presentation", children: [_jsx(motion.div, { className: "absolute inset-0 bg-black/65", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.13 }, onClick: closePalette, "aria-hidden": true }), _jsxs(motion.div, { role: "dialog", "aria-modal": "true", "aria-label": "Command palette", className: "panel relative flex w-full max-w-2xl flex-col overflow-hidden border-line-3 bg-base shadow-[0_24px_80px_rgba(0,0,0,0.9)]", initial: { opacity: 0, scale: 0.98, y: -8 }, animate: { opacity: 1, scale: 1, y: 0 }, exit: { opacity: 0, scale: 0.98, y: -8 }, transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] }, children: [_jsxs("div", { className: "flex items-center gap-2 border-b border-line bg-base px-3 py-2", children: [_jsx(Terminal, { className: "size-3.5 shrink-0 text-term", "aria-hidden": true }), _jsx("span", { className: "prompt mono shrink-0 text-[11.5px]", children: "root@cybersentinel:~$" }), _jsx("input", { ref: inputRef, value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: onKeyDown, role: "combobox", "aria-expanded": "true", "aria-controls": "palette-listbox", "aria-autocomplete": "list", "aria-activedescendant": flat[cursor] ? `palette-opt-${cursor}` : undefined, spellCheck: false, autoComplete: "off", placeholder: "type a command or search threats, incidents, IPs, hashes\u2026", className: "mono min-w-0 flex-1 bg-transparent text-[12px] text-ink caret-term placeholder:text-ink-4 focus:outline-none" }), isFetching ? _jsx("span", { className: "mono shrink-0 text-[11px] text-cyber", children: "searching\u2026" }) : null, _jsx("kbd", { className: "mono hidden shrink-0 rounded-[2px] border border-line-3 bg-raised px-1 py-px text-[10.5px] text-ink-4 sm:block", children: "ESC" })] }), _jsxs("div", { ref: listRef, id: "palette-listbox", role: "listbox", "aria-label": "Commands and search results", className: "max-h-[52vh] min-h-[180px] overflow-y-auto py-1", children: [!flat.length ? (_jsxs("div", { className: "px-3 py-8 text-center", children: [_jsxs("p", { className: "mono text-[11px] text-ink-3", children: ["No matches for \u201C", query, "\u201D."] }), _jsx("p", { className: "mono mt-1 text-[11px] text-ink-4", children: "Try an IP (192.168.1.42), an incident (INC-2048), a hash or \u201Cbrute force\u201D." })] })) : null, commands.length ? (_jsxs(_Fragment, { children: [_jsx(PaletteGroupLabel, { children: "COMMANDS" }), commands.map((command) => {
                                            const index = flat.findIndex((f) => f.kind === 'command' && f.item.id === command.id);
                                            return (_jsx(PaletteRow, { id: `palette-opt-${index}`, active: cursor === index, onSelect: () => activate(index), onHover: () => setCursor(index), icon: command.icon, title: command.label, right: _jsxs("span", { className: "mono text-[11px] text-term", children: ["$ ", command.command] }), group: command.group }, command.id));
                                        })] })) : null, Object.entries(grouped).map(([category, items]) => (_jsxs("div", { children: [_jsx(PaletteGroupLabel, { children: CATEGORY_LABELS[category] ?? category.toUpperCase() }), items.map((result) => {
                                            const index = resultIndex;
                                            resultIndex += 1;
                                            const meta = result.severity ? severityMeta(result.severity) : null;
                                            return (_jsx(PaletteRow, { id: `palette-opt-${index}`, active: cursor === index, onSelect: () => activate(index), onHover: () => setCursor(index), icon: _jsx(Search, { className: "size-3.5 text-ink-4", "aria-hidden": true }), title: result.title, subtitle: result.subtitle, mono: result.mono, right: meta ? (_jsx("span", { className: cn('mono text-[11px] font-bold tracking-[0.01em]', meta.text), children: meta.label })) : null }, `${result.category}-${result.id}`));
                                        })] }, category)))] }), _jsxs("div", { className: "flex items-center gap-3 border-t border-line bg-base px-3 py-1.5", children: [_jsxs("span", { className: "mono flex items-center gap-1 text-[11px] text-ink-4", children: [_jsx("kbd", { className: "rounded-[2px] border border-line-3 bg-raised px-1", children: "\u2191" }), _jsx("kbd", { className: "rounded-[2px] border border-line-3 bg-raised px-1", children: "\u2193" }), " navigate"] }), _jsxs("span", { className: "mono flex items-center gap-1 text-[11px] text-ink-4", children: [_jsx(CornerDownLeft, { className: "size-3", "aria-hidden": true }), " select"] }), _jsx("span", { className: "flex-1" }), _jsxs("span", { className: "mono text-[11px] text-ink-4", children: [flat.length, " entries"] })] })] })] })) : null }));
}
function PaletteGroupLabel({ children }) {
    return (_jsxs("div", { className: "mono mt-1.5 mb-0.5 flex items-center gap-2 px-3 text-[10.5px] font-semibold tracking-[0.02em] text-ink-4 uppercase first:mt-0", children: [_jsx("span", { children: children }), _jsx("span", { className: "h-px flex-1 bg-line", "aria-hidden": true })] }));
}
function PaletteRow({ id, active, onSelect, onHover, icon, title, subtitle, right, mono, group, }) {
    return (_jsxs("button", { type: "button", id: id, role: "option", "aria-selected": active, "data-cursor": active || undefined, onClick: onSelect, onMouseMove: onHover, className: cn('flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors', active ? 'bg-term/8 shadow-[inset_2px_0_0_var(--color-term)]' : 'hover:bg-panel-2'), children: [_jsx("span", { className: cn('shrink-0', active ? 'text-term' : 'text-ink-4'), "aria-hidden": true, children: icon }), _jsxs("span", { className: "min-w-0 flex-1", children: [_jsx("span", { className: cn('block truncate text-[11.5px]', mono ? 'mono' : '', active ? 'text-ink' : 'text-ink-2'), children: title }), subtitle ? _jsx("span", { className: "mono block truncate text-[11px] text-ink-4", children: subtitle }) : null] }), group ? _jsx("span", { className: "mono hidden shrink-0 text-[10.5px] tracking-[0.02em] text-ink-4 uppercase sm:block", children: group }) : null, right ? _jsx("span", { className: "shrink-0", children: right }) : null] }));
}
