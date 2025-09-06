// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Other configuration constants
export const APP_CONFIG = {
  API_BASE_URL,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEBOUNCE_DELAY: 500,
} as const;
