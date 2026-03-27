(() => {
  function routeByRole(role) {
    switch ((role || '').toLowerCase()) {
      case 'ceo':
        return 'ceo.html';
      case 'admin':
        return 'admin.html';
      case 'centre':
        return 'centre.html';
      default:
        return 'dashboard.html';
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value?.trim() || '';
    const password = document.getElementById('login-password')?.value || '';

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Login failed');
        return;
      }

      const role = (data.role || 'STUDENT').toLowerCase();

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(data.user || { email, role }));

      window.location.href = routeByRole(role);
    } catch (err) {
      console.error(err);
      alert('Network error during login');
    }
  }

  function init() {
    const form = document.getElementById('login-form');
    if (form) form.addEventListener('submit', onSubmit);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

