/**
 * Global search + command palette data source.
 * Searches across threats, incidents, events, IP addresses, domains, users,
 * indicators and reports — the categories required by the specification.
 */
import { apiRequest, USE_MOCK } from './api';
import { mockStore, simulateLatency } from './mockApi';
import { NETWORK_NODES, REPORTS, THREAT_INDICATORS } from '@/data/mock';
import { threatTypeLabel } from '@/utils/severity';
export const CATEGORY_LABELS = {
    incidents: 'INCIDENTS',
    threats: 'THREATS',
    events: 'EVENTS',
    ip_addresses: 'IP ADDRESSES',
    domains: 'DOMAINS',
    users: 'USERS',
    indicators: 'INTELLIGENCE',
    reports: 'REPORTS',
    assets: 'ASSETS',
};
const MAX_PER_CATEGORY = 4;
export const searchApi = {
    async search(rawQuery, limit = MAX_PER_CATEGORY) {
        const query = rawQuery.trim().toLowerCase();
        if (!query)
            return [];
        if (!USE_MOCK)
            return apiRequest('/search', { query: { q: query } });
        await simulateLatency(60, 170);
        const results = [];
        const push = (r) => results.push(r);
        mockStore.incidents.forEach((incident) => {
            if (`${incident.id} ${incident.title} ${incident.source} ${incident.target}`.toLowerCase().includes(query)) {
                push({
                    id: incident.id, category: 'incidents', title: incident.id,
                    subtitle: `${incident.title} · ${incident.status.replace('_', ' ').toUpperCase()}`,
                    href: `/incidents/${incident.id}`, severity: incident.severity, mono: true,
                });
            }
        });
        mockStore.threats.forEach((threat) => {
            if (`${threat.id} ${threat.title} ${threatTypeLabel(threat.type)} ${threat.source} ${threat.target}`.toLowerCase().includes(query)) {
                push({
                    id: threat.id, category: 'threats', title: threat.title,
                    subtitle: `${threat.id} · ${threatTypeLabel(threat.type)}`,
                    href: `/threats/${threat.id}`, severity: threat.severity, mono: false,
                });
            }
        });
        mockStore.events.slice(0, 220).forEach((event) => {
            if (`${event.id} ${event.type} ${event.source} ${event.target ?? ''}`.toLowerCase().includes(query)) {
                push({
                    id: event.id, category: 'events', title: event.type,
                    subtitle: `${event.id} · ${event.source} → ${event.target ?? '—'}`,
                    href: '/threats', severity: event.severity, mono: false,
                });
            }
        });
        const ipPattern = /^(\d{1,3}\.){0,3}\d{0,3}$/;
        if (ipPattern.test(query) || query.includes('.')) {
            NETWORK_NODES.filter((n) => n.ip.toLowerCase().includes(query) || n.name.toLowerCase().includes(query))
                .forEach((node) => push({
                id: node.id, category: ipPattern.test(query) ? 'ip_addresses' : 'assets',
                title: node.ip, subtitle: `${node.name} · ${node.status.toUpperCase()} · risk ${node.risk.toUpperCase()}`,
                href: '/network', severity: node.risk, mono: true,
            }));
        }
        THREAT_INDICATORS.filter((i) => i.value.toLowerCase().includes(query) || i.id.toLowerCase().includes(query))
            .forEach((indicator) => push({
            id: indicator.id,
            category: indicator.type === 'ip' ? 'ip_addresses' : indicator.type === 'domain' || indicator.type === 'url' ? 'domains' : 'indicators',
            title: indicator.value.length > 52 ? `${indicator.value.slice(0, 44)}…` : indicator.value,
            subtitle: `${indicator.id} · ${indicator.type.toUpperCase()} · ${indicator.status.replace('_', ' ').toUpperCase()}`,
            href: '/threat-intelligence', severity: indicator.risk, mono: true,
        }));
        REPORTS.filter((r) => `${r.id} ${r.title}`.toLowerCase().includes(query))
            .forEach((report) => push({
            id: report.id, category: 'reports', title: report.title,
            subtitle: `${report.id} · ${report.status.toUpperCase()} · ${report.format}`,
            href: '/reports', mono: false,
        }));
        const userQuery = query.replace(/^@/, '');
        [...new Set(mockStore.events.flatMap((e) => [e.source, e.target]).filter((v) => Boolean(v)))]
            .filter((value) => /[a-z]/.test(value) && value.toLowerCase().includes(userQuery) && !/^[\d.]+$/.test(value))
            .slice(0, 6)
            .forEach((value) => push({
            id: `user-${value}`, category: 'users', title: value,
            subtitle: 'Identity referenced in monitored activity', href: '/authentication',
        }));
        // Deduplicate, then cap per category so the palette stays scannable.
        const seen = new Set();
        const deduped = results.filter((r) => {
            const key = `${r.category}:${r.id}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
        const perCategory = new Map();
        return deduped.filter((r) => {
            const count = perCategory.get(r.category) ?? 0;
            if (count >= limit)
                return false;
            perCategory.set(r.category, count + 1);
            return true;
        });
    },
};
