/**
 * Auth page helpers (login / register)
 */
document.addEventListener('DOMContentLoaded', () => {
  // If already authenticated, go to dashboard
  if (API.isAuthenticated() && (window.location.pathname.includes('login') || window.location.pathname.includes('register'))) {
    // Allow demo re-login
  }

  // Password visibility toggles
  document.querySelectorAll('[data-toggle-password]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.getAttribute('data-toggle-password'));
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.querySelector('.material-symbols-outlined').textContent = isPass ? 'visibility_off' : 'visibility';
    });
  });

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;
      const submitBtn = loginForm.querySelector('[type="submit"]');
      if (!email || !password) {
        App.toast('Email and password are required.', 'error');
        return;
      }
      App.setLoading(submitBtn, true);
      try {
        await API.login({ email, password });
        App.toast('Logged in successfully.', 'success');
        window.location.href = 'dashboard.html';
      } catch (err) {
        // Demo fallback: accept any credentials when API is down
        if (err.message.includes('Cannot reach API') || err.message.includes('demo')) {
          API.setAuth('demo-token', { full_name: email.split('@')[0] || 'Demo User', email });
          App.toast('Demo mode: signed in locally (API offline).', 'info');
          window.location.href = 'dashboard.html';
        } else {
          App.toast(err.message || 'Login failed.', 'error');
        }
      } finally {
        App.setLoading(submitBtn, false);
      }
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const full_name = registerForm.full_name.value.trim();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;
      const confirm = registerForm.confirm_password.value;
      const submitBtn = registerForm.querySelector('[type="submit"]');

      if (!full_name || !email || !password) {
        App.toast('All fields are required.', 'error');
        return;
      }
      if (password.length < 8) {
        App.toast('Password must be at least 8 characters.', 'error');
        return;
      }
      if (password !== confirm) {
        App.toast('Passwords do not match.', 'error');
        return;
      }

      App.setLoading(submitBtn, true);
      try {
        await API.register({ full_name, email, password });
        App.toast('Account created. Please log in.', 'success');
        window.location.href = 'login.html';
      } catch (err) {
        if (err.message.includes('Cannot reach API')) {
          API.setAuth('demo-token', { full_name, email });
          App.toast('Demo mode: account created locally (API offline).', 'info');
          window.location.href = 'dashboard.html';
        } else {
          App.toast(err.message || 'Registration failed.', 'error');
        }
      } finally {
        App.setLoading(submitBtn, false);
      }
    });
  }
});
