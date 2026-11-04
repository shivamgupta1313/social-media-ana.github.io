/**
 * Authentic Reach — Frontend Configuration
 * Change API_BASE_URL for local vs production Flask backend.
 */
const CONFIG = {
  // Local development Flask API
  API_BASE_URL: localStorage.getItem('ar_api_base') || 'http://10.10.78.251:5000',
  // Set to true to force demo/sample data even when API is reachable
  FORCE_DEMO_DATA: false,
  // Token storage key (never store passwords)
  AUTH_TOKEN_KEY: 'ar_auth_token',
  USER_KEY: 'ar_user',
  // Demo mode label shown in UI when using sample data
  DEMO_BANNER: true,
};

// Allow runtime override via query ?api=https://your-api.onrender.com
(function () {
  try {
    const params = new URLSearchParams(window.location.search);
    const api = params.get('api');
    if (api) {
      localStorage.setItem('ar_api_base', api);
      CONFIG.API_BASE_URL = api;
    }
  } catch (_) {}
})();
