import { BarChart3, Bot, Bug, FileText, FolderKanban, Globe, KeyRound, LayoutDashboard, Network, Radar, Settings, ShieldAlert, Waypoints, } from 'lucide-react';
export const NAVIGATION = [
    {
        id: 'overview',
        label: 'OVERVIEW',
        items: [
            { to: '/dashboard', label: 'Dashboard', short: 'DASHBOARD', icon: LayoutDashboard, aliases: ['home', 'overview', 'status', 'command center'], description: 'Real-time security overview' },
        ],
    },
    {
        id: 'monitoring',
        label: 'MONITORING',
        items: [
            { to: '/network', label: 'Network Monitor', short: 'NETWORK', icon: Network, aliases: ['map', 'traffic', 'topology', 'hosts'], description: 'Topology, flows and blocked connections' },
            { to: '/authentication', label: 'Authentication', short: 'AUTH', icon: KeyRound, aliases: ['login', 'logins', 'sso', 'mfa', 'accounts'], description: 'Logon outcomes and anomalies' },
            { to: '/threats', label: 'Threats', short: 'THREATS', icon: ShieldAlert, badgeKey: 'threats', aliases: ['alerts', 'detections', 'events'], description: 'Detected threat activity' },
        ],
    },
    {
        id: 'tools',
        label: 'SECURITY TOOLS',
        items: [
            { to: '/phishing', label: 'Phishing Detector', short: 'PHISHING', icon: Globe, aliases: ['url', 'analyzer', 'link', 'recon'], description: 'Analyze a suspicious URL' },
            { to: '/web-security', label: 'Web Security', short: 'WEB SCAN', icon: Bug, aliases: ['scanner', 'vulnerability', 'headers', 'pentest'], description: 'Authorized web assessment' },
            { to: '/malware', label: 'Malware Analyzer', short: 'MALWARE', icon: Radar, aliases: ['sandbox', 'file', 'hash', 'forensics'], description: 'Controlled sample analysis' },
        ],
    },
    {
        id: 'investigation',
        label: 'INVESTIGATE',
        items: [
            { to: '/incidents', label: 'Incidents', short: 'INCIDENTS', icon: FolderKanban, badgeKey: 'incidents', aliases: ['cases', 'tickets', 'soc'], description: 'Incident management console' },
            { to: '/ai-assistant', label: 'AI Security Terminal', short: 'AI TERM', icon: Bot, aliases: ['ai', 'assistant', 'chat', 'investigate'], description: 'Contextual AI investigation' },
            { to: '/threat-intelligence', label: 'Threat Intelligence', short: 'INTEL', icon: Waypoints, aliases: ['ioc', 'indicators', 'intel', 'feeds'], description: 'Indicator database' },
        ],
    },
    {
        id: 'analytics',
        label: 'SYSTEM',
        items: [
            { to: '/analytics', label: 'Analytics', short: 'ANALYTICS', icon: BarChart3, aliases: ['trends', 'metrics', 'charts'], description: 'Trends and detection performance' },
            { to: '/reports', label: 'Reports', short: 'REPORTS', icon: FileText, aliases: ['export', 'pdf', 'summary'], description: 'Generate and review reports' },
            { to: '/settings', label: 'Settings', short: 'SETTINGS', icon: Settings, aliases: ['preferences', 'config', 'api'], description: 'Workspace configuration' },
        ],
    },
];
export const ALL_NAV_ITEMS = NAVIGATION.flatMap((g) => g.items);
export const ROUTE_META = {
    '/dashboard': { title: 'Security Command Center', group: 'Overview', command: 'status', description: 'Real-time security overview' },
    '/network': { title: 'Network Monitor', group: 'Monitoring', command: 'network', description: 'Topology and traffic analysis' },
    '/authentication': { title: 'Authentication Monitor', group: 'Monitoring', command: 'auth', description: 'Logon activity and anomalies' },
    '/threats': { title: 'Threat Monitor', group: 'Monitoring', command: 'threats', description: 'Detected threat activity' },
    '/phishing': { title: 'Phishing Detector', group: 'Security Tools', command: 'analyze url', description: 'URL risk analysis' },
    '/web-security': { title: 'Web Security Scanner', group: 'Security Tools', command: 'scan web', description: 'Authorized configuration assessment' },
    '/malware': { title: 'Malware Analyzer', group: 'Security Tools', command: 'analyze file', description: 'Controlled sample analysis' },
    '/incidents': { title: 'Incident Management', group: 'Investigate', command: 'incidents', description: 'SOC incident console' },
    '/ai-assistant': { title: 'AI Security Terminal', group: 'Investigate', command: 'investigate', description: 'AI-assisted investigation' },
    '/threat-intelligence': { title: 'Threat Intelligence', group: 'Investigate', command: 'intelligence', description: 'Indicator database' },
    '/analytics': { title: 'Analytics', group: 'System', command: 'analytics', description: 'Trends and detection performance' },
    '/reports': { title: 'Reports', group: 'System', command: 'reports', description: 'Report generation and archive' },
    '/settings': { title: 'Settings', group: 'System', command: 'settings', description: 'Workspace configuration' },
};
export function routeMetaFor(pathname) {
    const segments = pathname.split('/').filter(Boolean);
    const basePath = `/${segments[0] ?? ''}`;
    const meta = ROUTE_META[basePath];
    const crumbs = [
        { label: 'CYBERSENTINEL', to: '/dashboard' },
    ];
    if (meta)
        crumbs.push({ label: meta.group });
    if (meta)
        crumbs.push({ label: meta.title, to: basePath });
    if (segments.length > 1)
        crumbs.push({ label: segments.slice(1).join(' / ').toUpperCase() });
    return { meta, parent: basePath, segments: crumbs };
}
