// ============================================================
//  src/config.ts
//  Central configuration — sourced from .env at build time.
//  Add new environment variables here as your backend grows.
// ============================================================

export const config = {
  /** Base URL of the backend REST API */
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string ?? 'http://localhost:5000/api',

  /**
   * App mode:
   *   "mock" → uses local mock data (AppContext / MOCK_USERS)
   *   "live" → all calls go through src/services/* to the real backend
   */
  appMode: (import.meta.env.VITE_APP_MODE as 'mock' | 'live') ?? 'mock',

  /** Google OAuth Client ID for production OAuth 2.0 */
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string ?? '',

  appName:    import.meta.env.VITE_APP_NAME    as string ?? 'FX OD System',
  appVersion: import.meta.env.VITE_APP_VERSION as string ?? '2.0.0',
} as const;

export const IS_MOCK = config.appMode === 'mock';
