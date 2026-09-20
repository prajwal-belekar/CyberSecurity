/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_MODE?: 'mock' | 'live';
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_LIVE_TICK_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
