document.addEventListener('DOMContentLoaded', async () => {
  App.requireAuth();
  App.initSidebar('profile');

  const user = API.getUser() || { full_name: 'Demo Analyst', email: 'demo@authenticreach.app' };
  document.getElementById('profile-name').value = user.full_name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-display-name').textContent = user.full_name || 'User';
  document.getElementById('profile-display-email').textContent = user.email || '';

  const initials = (user.full_name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('profile-avatar').textContent = initials;

  document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = document.getElementById('profile-name').value.trim();
    const email = document.getElementById('profile-email').value.trim();
    if (!full_name || !email) {
      App.toast('Name and email are required.', 'error');
      return;
    }
    const btn = e.target.querySelector('[type="submit"]');
    App.setLoading(btn, true);
    try {
      await API.updateProfile({ full_name, email });
      API.setAuth(API.getToken() || 'demo-token', { ...user, full_name, email });
      App.toast('Profile updated.', 'success');
      document.getElementById('profile-display-name').textContent = full_name;
      document.getElementById('profile-display-email').textContent = email;
    } catch (err) {
      if (err.message.includes('Cannot reach API')) {
        API.setAuth(API.getToken() || 'demo-token', { ...user, full_name, email });
        App.toast('Profile updated locally (API offline).', 'info');
        document.getElementById('profile-display-name').textContent = full_name;
        document.getElementById('profile-display-email').textContent = email;
      } else {
        App.toast(err.message || 'Update failed.', 'error');
      }
    } finally {
      App.setLoading(btn, false);
    }
  });

  document.getElementById('password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = document.getElementById('current-password').value;
    const next = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-new-password').value;
    if (!current || !next) {
      App.toast('Fill all password fields.', 'error');
      return;
    }
    if (next.length < 8) {
      App.toast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (next !== confirm) {
      App.toast('New passwords do not match.', 'error');
      return;
    }
    App.toast('Password change requires backend API. Request not sent in demo mode.', 'info', 5000);
    e.target.reset();
  });
});
