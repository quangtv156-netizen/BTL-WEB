// course-detail.js
var API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

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

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

async function loadCourseDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  if (!courseId) return;

  try {
    const [courseRes, lessonsRes, reviewsRes, enrolledRes] = await Promise.all([
      fetch(`${API}/courses/${courseId}`),
      fetch(`${API}/lessons?courseId=${courseId}`),
      fetch(`${API}/reviews?courseId=${courseId}`),
      fetch(`${API}/enrolled?courseId=${courseId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);

    const course   = await courseRes.json();
    const lessons  = lessonsRes.ok  ? await lessonsRes.json()  : [];
    const reviews  = reviewsRes.ok  ? await reviewsRes.json()  : [];
    const enrolled = enrolledRes.ok ? await enrolledRes.json() : [];

    if (!course || course.message) {
      document.body.innerHTML = '<h1>Khóa học không tồn tại</h1>';
      return;
    }

    document.getElementById('courseTitle').textContent = course.title;
    document.getElementById('thumbnail').src = course.thumbnail || '';

    const courseSubEl = document.querySelector('.course-sub');
    if (courseSubEl) courseSubEl.textContent = course.short_desc || '';

    const descEl = document.getElementById('description');
    if (descEl) {
      const raw = course.description || '';
      const formatted = raw.split(/ - /).map((s, i) => i === 0 ? s : '- ' + s).join('\n');
      descEl.style.whiteSpace = 'pre-line';
      descEl.textContent = formatted;
    }

    const levelMap = {
      easy: 'Cơ bản', beginner: 'Cơ bản',
      medium: 'Trung bình', intermediate: 'Trung bình',
      hard: 'Nâng cao', advanced: 'Nâng cao',
      'cơ bản': 'Cơ bản', 'trung bình': 'Trung bình', 'nâng cao': 'Nâng cao'
    };
    const levelClassMap = {
      easy: 'easy', beginner: 'easy',
      medium: 'medium', intermediate: 'medium',
      hard: 'hard', advanced: 'hard'
    };
    const levelEl = document.getElementById('level');
    if (levelEl) {
      levelEl.textContent = levelMap[course.level?.toLowerCase()] || course.level || '';
      levelEl.className = 'badge ' + (levelClassMap[course.level?.toLowerCase()] || '');
    }

    const ratingEl = document.getElementById('rating');
    if (ratingEl) {
      if (reviews.length > 0) {
        const avg = (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1);
        ratingEl.textContent = avg;
      } else {
        ratingEl.textContent = course.rating || '';
      }
    }

    const studentCountEl = document.getElementById('studentCount');
    if (studentCountEl) studentCountEl.textContent = enrolled.length + ' học viên';

    const lessonCountEl = document.getElementById('lessonCount');
    if (lessonCountEl) lessonCountEl.textContent = lessons.length;

    const updatedAtEl = document.getElementById('updatedAt');
    if (updatedAtEl) updatedAtEl.textContent = course.updated_at ? new Date(course.updated_at).toLocaleDateString('vi-VN') : '—';

    return { course, lessons, reviews };
  } catch (err) {
    console.error('Lỗi load course detail:', err);
  }
}

async function enrollCourse(courseId, currentUser, courseTitle = '') {
  try {
    const res = await fetch(`${API}/enrolled`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ userId: currentUser.id, courseId })
    });
    const data = await res.json();
    if (res.ok || data.message?.includes('rồi')) {
      await logActivity(currentUser.id, `${currentUser.name} đăng ký khóa học: ${courseTitle}`, courseTitle);
      showToast('🎉 Đăng ký khóa học thành công!');
      setTimeout(() => window.location.href = 'learn-course.html?course=' + courseId, 1200);
    }
  } catch (err) {
    showToast('Lỗi kết nối server!');
  }
}

async function unenrollCourse(courseId, currentUser, courseTitle = '') {
  if (!confirm('Bạn có chắc muốn hủy đăng ký khóa học này không?\nTiến độ học tập sẽ bị xóa.')) return;
  try {
    await fetch(`${API}/enrolled`, {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ userId: currentUser.id, courseId })
    });
    await logActivity(currentUser.id, `${currentUser.name} hủy đăng ký khóa học: ${courseTitle}`, courseTitle);
    showToast('Đã hủy đăng ký khóa học.');
    setTimeout(() => window.location.reload(), 1200);
  } catch (err) {
    showToast('Lỗi kết nối server!');
  }
}

async function toggleFavorite(courseId, currentUser, courseTitle = '') {
  try {
    const checkRes = await fetch(`${API}/favorites?userId=${currentUser.id}&courseId=${courseId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const checkData = checkRes.ok ? await checkRes.json() : [];
    const isFavorited = checkData.length > 0;

    if (isFavorited) {
      await fetch(`${API}/favorites`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUser.id, courseId })
      });
    } else {
      await fetch(`${API}/favorites`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ userId: currentUser.id, courseId })
      });
      await logActivity(currentUser.id, `${currentUser.name} thêm yêu thích: ${courseTitle}`, courseTitle);
    }
    return !isFavorited;
  } catch (err) {
    showToast('Lỗi kết nối server!');
    return null;
  }
}

async function updateFavoriteUI(currentUser, courseId) {
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (!favoriteBtn || !currentUser) return;
  try {
    const res = await fetch(`${API}/favorites?userId=${currentUser.id}&courseId=${courseId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = res.ok ? await res.json() : [];
    const isFavorited = data.length > 0;
    favoriteBtn.innerText = isFavorited ? '♥ Đã yêu thích' : 'Thêm vào yêu thích';
    favoriteBtn.style.background = isFavorited ? '#ef4444' : '';
    favoriteBtn.style.color = isFavorited ? 'white' : '';
  } catch (err) {
    console.error('Lỗi load favorite:', err);
  }
}

async function setupEnrollButton(courseId, currentUser, course, lessons) {
  const enrollBtn = document.getElementById('enrollBtn');
  if (!enrollBtn) return;

  if (!currentUser) {
    enrollBtn.innerText = 'Đăng ký học';
    enrollBtn.style.background = '#2563eb';
    enrollBtn.addEventListener('click', () => {
      showToast('Vui lòng đăng nhập!');
      setTimeout(() => window.location.href = 'login.html', 1500);
    });
    return;
  }

  const checkRes = await fetch(`${API}/enrolled?userId=${currentUser.id}&courseId=${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  const checkData = checkRes.ok ? await checkRes.json() : [];
  const isEnrolled = checkData.length > 0;

  if (!isEnrolled) {
    enrollBtn.innerText = 'Đăng ký học';
    enrollBtn.style.background = '#2563eb';
    enrollBtn.addEventListener('click', () => enrollCourse(courseId, currentUser, course.title));
  } else {
    const progressRes = await fetch(`${API}/progress?userId=${currentUser.id}&courseId=${courseId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const progressData = progressRes.ok ? await progressRes.json() : [];
    const percent = lessons.length > 0 ? Math.round((progressData.length / lessons.length) * 100) : 0;

    enrollBtn.innerText = percent === 100 ? 'Xem lại' : 'Tiếp tục học';
    enrollBtn.style.background = '#22c55e';

    if (percent > 0) {
      const p = document.createElement('p');
      p.style.cssText = 'margin-top:10px;font-weight:600;';
      p.textContent = `Tiến độ: ${percent}% hoàn thành`;
      enrollBtn.parentNode.insertBefore(p, enrollBtn.nextSibling);
    }

    const unenrollBtn = document.getElementById('unenrollBtn');
    if (unenrollBtn) {
      unenrollBtn.style.display = '';
      unenrollBtn.addEventListener('click', () => unenrollCourse(courseId, currentUser, course.title));
    } else {
      const btn = document.createElement('button');
      btn.innerText = 'Hủy đăng ký';
      btn.style.cssText = 'width:100%;margin-top:10px;padding:10px;background:#fff;color:#ef4444;border:1.5px solid #ef4444;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;';
      btn.addEventListener('click', () => unenrollCourse(courseId, currentUser, course.title));
      const sidebarCard = document.querySelector('.sidebar-card');
      if (sidebarCard) sidebarCard.appendChild(btn);
      else enrollBtn.parentNode.appendChild(btn);
    }

    enrollBtn.addEventListener('click', () => {
      window.location.href = 'learn-course.html?course=' + courseId;
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  if (!courseId) return;

  const result = await loadCourseDetail();
  const lessons = result?.lessons || [];
  const course  = result?.course  || {};
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.tab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      this.classList.add('active');
      document.getElementById(this.dataset.tab).classList.remove('hidden');
    });
  });

  await setupEnrollButton(courseId, currentUser, course, lessons);

  await updateFavoriteUI(currentUser, courseId);
  document.getElementById('favoriteBtn')?.addEventListener('click', async () => {
    if (!currentUser) { showToast('Vui lòng đăng nhập!'); return; }
    await toggleFavorite(courseId, currentUser, course.title);
    await updateFavoriteUI(currentUser, courseId);
  });
});