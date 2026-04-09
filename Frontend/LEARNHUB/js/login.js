const API = 'http://localhost:3000/api';

async function logActivity(userId, action, target = '') {
  try {
    await fetch(`${API}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, target })
    });
  } catch (err) {
    console.error("Lỗi ghi log:", err);
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // Toggle tab
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.form-content').forEach(c => c.style.display = 'none');
      document.getElementById(tab.dataset.tab).style.display = 'block';
    });
  });

  // Eye toggle
  document.querySelectorAll('.eye').forEach(eye => {
    eye.addEventListener('click', () => {
      const input = eye.previousElementSibling;
      input.type = input.type === 'password' ? 'text' : 'password';
      eye.textContent = input.type === 'password' ? '👁️' : '🙈';
    });
  });

  // Toast
  function showToast(msg, type = 'error') {
    let toast = document.getElementById('loginToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'loginToast';
      toast.style.cssText = `
        position:fixed; top:20px; right:20px; z-index:9999;
        padding:14px 22px; border-radius:10px; font-size:14px;
        font-weight:500; box-shadow:0 4px 15px rgba(0,0,0,0.15);
        transition:opacity 0.3s;
      `;
      document.body.appendChild(toast);
    }
    toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
    toast.style.color = 'white';
    toast.style.opacity = '1';
    toast.textContent = msg;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
  }

  // ĐĂNG NHẬP
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async e => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPass').value;

      try {
        const res  = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || 'Đăng nhập thất bại!', 'error');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        showToast(`Đăng nhập thành công! Chào ${data.user.name}`, 'success');
        setTimeout(() => {
          window.location.href = data.user.role === 'instructor' ? 'dashboard.html' : 'index.html';
        }, 1000);

      } catch (err) {
        showToast('Không kết nối được server!', 'error');
      }
    });
  }

  // ĐĂNG KÝ
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', async e => {
      e.preventDefault();
      const name     = document.getElementById('fullName').value.trim();
      const email    = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPass').value;
      const role     = document.getElementById('role').value;

      if (!role) { showToast('Vui lòng chọn vai trò!', 'error'); return; }

      try {
        const res  = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || 'Đăng ký thất bại!', 'error');
          return;
        }

        const roleLabel = role === 'instructor' ? 'Giảng viên' : 'Học viên';
        await logActivity(
          data.user?.id || null,
          `${roleLabel} mới đăng ký: ${name}`,
          email
        );

        showToast('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        signupForm.reset();
        setTimeout(() => {
          document.querySelector('[data-tab="login"]').click();
        }, 1500);

      } catch (err) {
        showToast('Không kết nối được server!', 'error');
      }
    });
  }
});