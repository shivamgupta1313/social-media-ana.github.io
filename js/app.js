/**
 * Authentic Reach — Shared UI utilities
 */
const App = (() => {
  function formatNumber(n) {
    if (n == null || Number.isNaN(n)) return 'N/A';
    const num = Number(n);
    if (Math.abs(num) >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (Math.abs(num) >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
    return num.toLocaleString();
  }

  function formatCurrency(n) {
    if (n == null || Number.isNaN(n)) return 'N/A';
    return '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatPercent(n, digits = 2) {
    if (n == null || Number.isNaN(n)) return 'N/A';
    return Number(n).toFixed(digits) + '%';
  }

  function toast(message, type = 'info', duration = 4000) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'alert');
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    el.innerHTML = `<span class="material-symbols-outlined text-[20px]">${icon}</span><div class="flex-1 text-sm font-medium">${escapeHtml(message)}</div><button class="opacity-60 hover:opacity-100" aria-label="Dismiss"><span class="material-symbols-outlined text-[18px]">close</span></button>`;
    el.querySelector('button').onclick = () => el.remove();
    document.body.appendChild(el);
    if (duration > 0) setTimeout(() => el.remove(), duration);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function requireAuth() {
    if (!API.isAuthenticated()) {
      // Demo convenience: auto-login as demo user if no session
      const demoUser = { full_name: 'Demo Analyst', email: 'demo@authenticreach.app', id: 'demo' };
      API.setAuth('demo-token', demoUser);
    }
  }

  function initSidebar(activePath) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');

    if (toggle) {
      toggle.addEventListener('click', () => {
        sidebar?.classList.add('open');
        overlay?.classList.remove('hidden');
      });
    }
    function close() {
      sidebar?.classList.remove('open');
      overlay?.classList.add('hidden');
    }
    closeBtn?.addEventListener('click', close);
    overlay?.addEventListener('click', close);

    // Active nav
    document.querySelectorAll('[data-nav]').forEach((link) => {
      if (link.getAttribute('data-nav') === activePath) {
        link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold', 'shadow-sm');
        link.classList.remove('text-on-surface-variant');
      }
    });

    // Logout
    document.querySelectorAll('[data-action="logout"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showLogoutModal();
      });
    });

    // User avatar initials
    const user = API.getUser();
    if (user) {
      const initials = (user.full_name || user.email || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      document.querySelectorAll('[data-user-initials]').forEach((el) => (el.textContent = initials));
      document.querySelectorAll('[data-user-name]').forEach((el) => (el.textContent = user.full_name || user.email));
    }
  }

  function showLogoutModal() {
    const existing = document.getElementById('logout-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-panel" role="dialog" aria-labelledby="logout-title">
        <h2 id="logout-title" class="text-lg font-semibold text-on-surface mb-2">Confirm Logout</h2>
        <p class="text-sm text-on-surface-variant mb-6">Are you sure you want to log out of Authentic Reach?</p>
        <div class="flex gap-3 justify-end">
          <button type="button" id="logout-cancel" class="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-low transition-colors">Cancel</button>
          <button type="button" id="logout-confirm" class="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-medium hover:opacity-90 transition-opacity">Confirm Logout</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#logout-cancel').onclick = () => modal.remove();
    modal.querySelector('#logout-confirm').onclick = async () => {
      await API.logout();
      window.location.href = 'login.html';
    };
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  function setLoading(el, loading) {
    if (!el) return;
    if (loading) {
      el.dataset.prevDisabled = el.disabled;
      el.disabled = true;
      el.classList.add('opacity-70');
      const spinner = document.createElement('span');
      spinner.className = 'spinner inline-block mr-2';
      spinner.setAttribute('data-spinner', '1');
      el.prepend(spinner);
    } else {
      el.disabled = el.dataset.prevDisabled === 'true';
      el.classList.remove('opacity-70');
      el.querySelector('[data-spinner]')?.remove();
    }
  }

  // Chart.js defaults matching design
  function chartDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = 'Inter, system-ui, sans-serif';
    Chart.defaults.color = '#434655';
    Chart.defaults.borderColor = '#e5eeff';
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
  }

  return {
    formatNumber,
    formatCurrency,
    formatPercent,
    toast,
    escapeHtml,
    requireAuth,
    initSidebar,
    showLogoutModal,
    setLoading,
    chartDefaults,
  };
})();
