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
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/threats" element={<Threats />} />
          <Route path="/threats/:threatId" element={<ThreatDetail />} />

          <Route path="/network" element={<Network />} />
          <Route path="/authentication" element={<Authentication />} />

          <Route path="/phishing" element={<Phishing />} />
          <Route path="/web-security" element={<WebSecurity />} />
          <Route path="/malware" element={<Malware />} />

          <Route path="/incidents" element={<Incidents />} />
          <Route path="/incidents/:incidentId" element={<IncidentDetail />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/threat-intelligence" element={<ThreatIntelligence />} />

          <Route path="/analytics" element={<Analytics />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
