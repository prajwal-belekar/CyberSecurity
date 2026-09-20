import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Activity, AlertOctagon, Siren, ShieldAlert } from 'lucide-react';
import { StatTile } from '@/components/ui/StatTile';
import { useThreatSummary } from '@/hooks/useSecurityEvents';
import { useIncidentSummary } from '@/hooks/useIncidents';
import { ErrorState } from '@/components/ui/ErrorState';
/**
 * Four primary summary tiles. Order follows the information hierarchy required
 * by the spec: critical threats → high risk → active incidents → event volume.
 */
export function ThreatStats() {
    const navigate = useNavigate();
    const { data: summary, isLoading, isError, error, refetch } = useThreatSummary();
    const { data: incidents } = useIncidentSummary();
    if (isError) {
        return (_jsx("div", { className: "panel col-span-full", children: _jsx(ErrorState, { title: "Unable to load security summary", message: error?.message ?? 'The security data service could not be reached.', hint: error?.hint, onRetry: () => refetch(), retrying: false, compact: true }) }));
    }
    const activeIncidents = incidents ? incidents.open + incidents.investigating : (summary?.activeIncidents ?? 0);
    return (_jsxs("div", { className: "grid grid-cols-2 gap-2 xl:grid-cols-4", children: [_jsx(StatTile, { loading: isLoading, label: "Critical Threats", value: summary?.critical ?? 0, padded: true, icon: _jsx(AlertOctagon, { className: "size-4", "aria-hidden": true }), tone: "critical", trend: { delta: 12, period: 'from yesterday' }, onClick: () => navigate('/threats?severity=critical') }), _jsx(StatTile, { loading: isLoading, label: "High Risk Alerts", value: summary?.high ?? 0, padded: true, icon: _jsx(ShieldAlert, { className: "size-4", "aria-hidden": true }), tone: "high", trend: { delta: 8, period: 'from yesterday' }, onClick: () => navigate('/threats?severity=high') }), _jsx(StatTile, { loading: isLoading, label: "Active Incidents", value: activeIncidents, padded: true, icon: _jsx(Siren, { className: "size-4", "aria-hidden": true }), tone: "medium", trend: { delta: -14, period: 'vs last week' }, description: `${incidents?.contained ?? 0} contained · ${incidents?.resolved ?? 0} resolved today`, onClick: () => navigate('/incidents') }), _jsx(StatTile, { loading: isLoading, label: "Events Today", value: summary?.eventsToday ?? 0, icon: _jsx(Activity, { className: "size-4", "aria-hidden": true }), tone: "cyber", trend: { delta: 6, period: 'vs 7-day average' }, description: `${summary?.blockedToday ?? 0} blocked · MTTD ${summary?.meanTimeToDetectMinutes ?? 0}m`, onClick: () => navigate('/threats') })] }));
}
