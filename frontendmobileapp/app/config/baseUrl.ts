// Shared API base URL used by UI and networking code.
// Keeping this outside app/index.tsx avoids import cycles through App.
const envBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || '').trim();

export const BASE_URL = (envBaseUrl || 'http://localhost:5000').replace(/\/+$/, '');

