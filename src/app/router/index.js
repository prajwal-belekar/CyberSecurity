import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { RouteFallback } from '@/components/layout/RouteFallback';
import NotFound from '@/pages/NotFound';
/**
 * Every page is lazy-loaded: the initial bundle stays small and the shell
 * renders immediately while a heavy workspace (analytics, malware, AI) loads.
 */
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Threats = lazy(() => import('@/pages/Threats'));
const ThreatDetail = lazy(() => import('@/pages/ThreatDetail'));
const Network = lazy(() => import('@/pages/Network'));
const Phishing = lazy(() => import('@/pages/Phishing'));
const WebSecurity = lazy(() => import('@/pages/WebSecurity'));
const Malware = lazy(() => import('@/pages/Malware'));
const Authentication = lazy(() => import('@/pages/Authentication'));
const Incidents = lazy(() => import('@/pages/Incidents'));
const IncidentDetail = lazy(() => import('@/pages/IncidentDetail'));
const AIAssistant = lazy(() => import('@/pages/AIAssistant'));
const ThreatIntelligence = lazy(() => import('@/pages/ThreatIntelligence'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
export function AppRouter() {
    return (_jsx(Suspense, { fallback: _jsx(RouteFallback, {}), children: _jsx(Routes, { children: _jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/threats", element: _jsx(Threats, {}) }), _jsx(Route, { path: "/threats/:threatId", element: _jsx(ThreatDetail, {}) }), _jsx(Route, { path: "/network", element: _jsx(Network, {}) }), _jsx(Route, { path: "/authentication", element: _jsx(Authentication, {}) }), _jsx(Route, { path: "/phishing", element: _jsx(Phishing, {}) }), _jsx(Route, { path: "/web-security", element: _jsx(WebSecurity, {}) }), _jsx(Route, { path: "/malware", element: _jsx(Malware, {}) }), _jsx(Route, { path: "/incidents", element: _jsx(Incidents, {}) }), _jsx(Route, { path: "/incidents/:incidentId", element: _jsx(IncidentDetail, {}) }), _jsx(Route, { path: "/ai-assistant", element: _jsx(AIAssistant, {}) }), _jsx(Route, { path: "/threat-intelligence", element: _jsx(ThreatIntelligence, {}) }), _jsx(Route, { path: "/analytics", element: _jsx(Analytics, {}) }), _jsx(Route, { path: "/reports", element: _jsx(Reports, {}) }), _jsx(Route, { path: "/settings", element: _jsx(Settings, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }) }) }));
}
