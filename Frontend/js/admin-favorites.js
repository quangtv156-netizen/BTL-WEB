// admin-favorites.js

let user;

document.addEventListener("DOMContentLoaded", async function() {
  user = checkAuth();
  if (user) {
    const stats = await getStats(user.id);
    loadSidebar(user, stats);
    initDropdown();
    await renderFavorites();
  }
});

async function renderFavorites() {
  const container = document.getElementById("favoriteGrid");
  try {
    const res = await fetch(`${API}/favorites?userId=${user.id}`);
    const list = res.ok ? await res.json() : [];

    if (!list.length) {
      container.innerHTML = "<p>Bạn chưa có khóa học yêu thích.</p>";
      return;
    }

    container.innerHTML = list.map(fav => `
      <div class="course-card">
        <button class="remove-btn" onclick="removeFav(${fav.course_id})">×</button>
        <img src="${fav.thumbnail || 'https://placehold.co/600x400?text=Course'}">
        <div class="course-info">
          <h3>${fav.title || ''}</h3>
          <p>GV: ${fav.instructor_name || ''}</p>
          <button class="btn" onclick="location.href='../course-detail.html?id=${fav.course_id}'">Xem khóa học →</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("Lỗi load favorites:", err);
    container.innerHTML = "<p>Lỗi tải dữ liệu.</p>";
  }
}

async function removeFav(courseId) {
  await fetch(`${API}/favorites`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id, courseId })
  });
  await renderFavorites();
  const stats = await getStats(user.id);
  loadSidebar(user, stats);
}

window.addEventListener("focus", async () => {
  const stats = await getStats(user.id);
  loadSidebar(user, stats);
  await renderFavorites();
});