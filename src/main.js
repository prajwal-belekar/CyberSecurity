import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import { Providers } from '@/app/providers/Providers';
import '@/styles/globals.css';
const container = document.getElementById('root');
if (!container)
    throw new Error('CyberSentinel: #root mount point not found');
createRoot(container).render(_jsx(StrictMode, { children: _jsx(Providers, { children: _jsx(App, {}) }) }));
