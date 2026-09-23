import type { ComponentType } from 'react';
import {
  BarChart3, Bot, Bug, FileText, FolderKanban, Globe, KeyRound,
  LayoutDashboard, Network, Radar, Settings, ShieldAlert, Waypoints,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  /** Terminal-style rail label, e.g. "DASHBOARD". */
  short: string;
  icon: ComponentType<{ className?: string }>;
  /** Badge count source, resolved at render time. */
  badgeKey?: 'threats' | 'incidents' | 'notifications';
  /** Command-palette aliases. */
  aliases?: string[];
  description?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Single primary navigation used by BOTH Simple and Analyst modes.
 * The two modes share the same routes, hierarchy, labels and destinations —
 * only the page presentation differs. Keeping one list guarantees the sidebar,
 * command palette and breadcrumbs never drift between modes.
 */
export const NAVIGATION: NavGroup[] = [
  {
    id: 'main',
    label: 'MAIN',
    items: [
      { to: '/dashboard', label: 'Dashboard', short: 'DASHBOARD', icon: LayoutDashboard, aliases: ['home', 'overview', 'status', 'command center'], description: 'Your security at a glance' },
    ],
  },
  {
    id: 'security',
    label: 'SECURITY',
    items: [
      { to: '/threats', label: 'Threats', short: 'THREATS', icon: ShieldAlert, badgeKey: 'threats', aliases: ['alerts', 'detections', 'events', 'security alerts', 'security issues'], description: 'Things that may need attention' },
      { to: '/incidents', label: 'Incidents', short: 'INCIDENTS', icon: FolderKanban, badgeKey: 'incidents', aliases: ['cases', 'tickets', 'soc', 'investigations'], description: 'Security problems being investigated' },
    ],
  },
  {
    id: 'monitoring',
    label: 'MONITORING',
    items: [
      { to: '/network', label: 'Network', short: 'NETWORK', icon: Network, aliases: ['map', 'traffic', 'topology', 'hosts', 'devices', 'connections'], description: 'See unusual network activity' },
      { to: '/authentication', label: 'Authentication', short: 'AUTH', icon: KeyRound, aliases: ['login', 'logins', 'sso', 'mfa', 'accounts', 'sign-ins', 'auth'], description: 'Check suspicious sign-ins' },
    ],
  },
  {
    id: 'analysis',
    label: 'ANALYSIS',
    items: [
      { to: '/phishing', label: 'Phishing', short: 'PHISHING', icon: Globe, aliases: ['url', 'analyzer', 'link', 'recon', 'website', 'suspicious link'], description: 'Check if a link looks suspicious' },
      { to: '/malware', label: 'Malware', short: 'MALWARE', icon: Radar, aliases: ['sandbox', 'file', 'hash', 'forensics', 'suspicious file'], description: 'Check if a file may be dangerous' },
      { to: '/web-security', label: 'Web Security', short: 'WEB SCAN', icon: Bug, aliases: ['scanner', 'vulnerability', 'headers', 'pentest', 'website security'], description: 'Check website security' },
    ],
  },
  {
    id: 'intelligence',
    label: 'INTELLIGENCE',
    items: [
      { to: '/threat-intelligence', label: 'Threat Intelligence', short: 'INTEL', icon: Waypoints, aliases: ['ioc', 'indicators', 'intel', 'feeds', 'known bad', 'security intelligence'], description: 'Known suspicious activity' },
      { to: '/analytics', label: 'Analytics', short: 'ANALYTICS', icon: BarChart3, aliases: ['trends', 'metrics', 'charts'], description: 'Security trends and changes' },
    ],
  },
  {
    id: 'tools',
    label: 'TOOLS',
    items: [
      { to: '/ai-assistant', label: 'AI Assistant', short: 'AI ASSIST', icon: Bot, aliases: ['ai', 'assistant', 'chat', 'investigate', 'ask'], description: 'Ask questions about security activity' },
      { to: '/reports', label: 'Reports', short: 'REPORTS', icon: FileText, aliases: ['export', 'pdf', 'summary'], description: 'View security reports' },
    ],
  },
  {
    id: 'system',
    label: 'SYSTEM',
    items: [
      { to: '/settings', label: 'Settings', short: 'SETTINGS', icon: Settings, aliases: ['preferences', 'config', 'api'], description: 'Configure CyberSentinel' },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((g) => g.items);

export interface RouteMeta {
  title: string;
  group: string;
  description?: string;
  /** Terminal command that navigates here, shown in the command palette. */
  command: string;
}

export const ROUTE_META: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Security Command Center', group: 'Main', command: 'status', description: 'Real-time security overview' },
  '/network': { title: 'Network Monitor', group: 'Monitoring', command: 'network', description: 'Topology and traffic analysis' },
  '/authentication': { title: 'Authentication Monitor', group: 'Monitoring', command: 'auth', description: 'Logon activity and anomalies' },
  '/threats': { title: 'Threat Monitor', group: 'Security', command: 'threats', description: 'Detected threat activity' },
  '/phishing': { title: 'Phishing Detector', group: 'Analysis', command: 'analyze url', description: 'URL risk analysis' },
  '/web-security': { title: 'Web Security Scanner', group: 'Analysis', command: 'scan web', description: 'Authorized configuration assessment' },
  '/malware': { title: 'Malware Analyzer', group: 'Analysis', command: 'analyze file', description: 'Controlled sample analysis' },
  '/incidents': { title: 'Incident Management', group: 'Security', command: 'incidents', description: 'SOC incident console' },
  '/ai-assistant': { title: 'AI Assistant', group: 'Tools', command: 'investigate', description: 'AI-assisted investigation' },
  '/threat-intelligence': { title: 'Threat Intelligence', group: 'Intelligence', command: 'intelligence', description: 'Indicator database' },
  '/analytics': { title: 'Analytics', group: 'Intelligence', command: 'analytics', description: 'Trends and detection performance' },
  '/reports': { title: 'Reports', group: 'Tools', command: 'reports', description: 'Report generation and archive' },
  '/settings': { title: 'Settings', group: 'System', command: 'settings', description: 'Workspace configuration' },
};

export function routeMetaFor(pathname: string): { meta?: RouteMeta; parent?: string; segments: Array<{ label: string; to?: string }> } {
  const segments = pathname.split('/').filter(Boolean);
  const basePath = `/${segments[0] ?? ''}`;
  const meta = ROUTE_META[basePath];
  const crumbs: Array<{ label: string; to?: string }> = [
    { label: 'CYBERSENTINEL', to: '/dashboard' },
  ];
  if (meta) crumbs.push({ label: meta.group });
  if (meta) crumbs.push({ label: meta.title, to: basePath });
  if (segments.length > 1) crumbs.push({ label: segments.slice(1).join(' / ').toUpperCase() });
  return { meta, parent: basePath, segments: crumbs };
}
