/**
 * Authentic Reach — API Service Layer
 * Communicates with Flask backend. Falls back to demo data when offline/unconfigured.
 */
const API = (() => {
  function getToken() {
    return localStorage.getItem(CONFIG.AUTH_TOKEN_KEY);
  }

  function setAuth(token, user) {
    if (token) localStorage.setItem(CONFIG.AUTH_TOKEN_KEY, token);
    else localStorage.removeItem(CONFIG.AUTH_TOKEN_KEY);
    if (user) localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CONFIG.USER_KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function isAuthenticated() {
    return !!getToken() || !!getUser(); // demo mode may set user without token
  }

  async function request(path, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { ...options, headers };
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.body = JSON.stringify(opts.body);
    }
    // FormData should not set Content-Type (browser sets boundary)
    if (opts.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    try {
      const res = await fetch(url, opts);
      if (res.status === 401) {
        setAuth(null, null);
        if (!window.location.pathname.includes('login')) {
          window.location.href = 'login.html';
        }
        throw new Error('Session expired. Please log in again.');
      }
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) {
        const msg = (data && data.message) || (data && data.error) || res.statusText || 'Request failed';
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot reach API. Using demo data or check network.');
      }
      throw err;
    }
  }

  // Auth
  async function register({ full_name, email, password }) {
    return request('/api/auth/register', {
      method: 'POST',
      body: { full_name, email, password },
    });
  }

  async function login({ email, password }) {
    const data = await request('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (data.token || data.access_token) {
      setAuth(data.token || data.access_token, data.user || { email, full_name: data.full_name });
    }
    return data;
  }

  async function logout() {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      /* offline logout still clears local */
    }
    setAuth(null, null);
  }

  // Dashboard & analytics
  async function getDashboardSummary(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/api/dashboard/summary${q ? '?' + q : ''}`);
  }

  async function getAnalytics(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/api/analytics${q ? '?' + q : ''}`);
  }

  async function getSocialData(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/api/social-data${q ? '?' + q : ''}`);
  }

  async function createSocialData(payload) {
    return request('/api/social-data', { method: 'POST', body: payload });
  }

  async function importCsv(records) {
    return request('/api/social-data/import-csv', { method: 'POST', body: { records } });
  }

  async function getReports(params = {}) {
    const q = new URLSearchParams(params).toString();
    return request(`/api/reports${q ? '?' + q : ''}`);
  }

  async function getProfile() {
    return request('/api/profile');
  }

  async function updateProfile(payload) {
    return request('/api/profile', { method: 'PUT', body: payload });
  }

  return {
    getToken,
    setAuth,
    getUser,
    isAuthenticated,
    request,
    register,
    login,
    logout,
    getDashboardSummary,
    getAnalytics,
    getSocialData,
    createSocialData,
    importCsv,
    getReports,
    getProfile,
    updateProfile,
  };
})();
