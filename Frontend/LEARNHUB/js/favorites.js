// favorites.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

let user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) location.href = "login.html";

async function calcAvgProgress(enrolled) {
  if (!enrolled.length) return 0;
  const progressRes = await fetch(`${API}/progress?userId=${user.id}`, { headers: authHeader() });
  const progressAll = progressRes.ok ? await progressRes.json() : [];

  let total = 0;
  await Promise.all(enrolled.map(async e => {
    const lessonsRes = await fetch(`${API}/lessons?courseId=${e.course_id}`);
    const lessons    = lessonsRes.ok ? await lessonsRes.json() : [];
    const done       = progressAll.filter(p => String(p.course_id) === String(e.course_id)).length;
    const pct        = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
    total += pct;
  }));

  return Math.round(total / enrolled.length);
}

async function loadUser() {
  try {
    const [enrolledRes, favRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${user.id}`, { headers: authHeader() }),
      fetch(`${API}/favorites?userId=${user.id}`, { headers: authHeader() })
    ]);
    const enrolled  = enrolledRes.ok ? await enrolledRes.json() : [];
    const favorites = favRes.ok      ? await favRes.json()      : [];

    const avg = await calcAvgProgress(enrolled);

    if (user.avatar) {
      const html = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
      document.getElementById("navAvatar").innerHTML = html;
      document.getElementById("bigAvatar").innerHTML = html;
    } else {
      const f = user.name.charAt(0).toUpperCase();
      document.getElementById("navAvatar").innerText = f;
      document.getElementById("bigAvatar").innerText = f;
    }

    document.getElementById("sideName").innerText        = user.name;
    document.getElementById("dropName").innerText        = user.name;
    document.getElementById("dropEmail").innerText       = user.email;
    document.getElementById("courseCount").innerText     = enrolled.length;
    document.getElementById("favoriteCount").innerText   = favorites.length;
    document.getElementById("completePercent").innerText = avg + "%";
    document.getElementById("dropCount").innerText       = enrolled.length;
    document.getElementById("menuCount").innerText       = enrolled.length;
  } catch (err) {
    console.error("Lỗi load user:", err);
  }
}

async function renderFavorites() {
  const container = document.getElementById("favoriteGrid");
  try {
    const res  = await fetch(`${API}/favorites?userId=${user.id}`, { headers: authHeader() });
    const list = res.ok ? await res.json() : [];

    if (list.length === 0) {
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
          <button class="btn" onclick="location.href='course-detail.html?id=${fav.course_id}'">Xem khóa học →</button>
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
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
    body: JSON.stringify({ userId: user.id, courseId })
  });
  await renderFavorites();
  await loadUser();
}

function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("show");
}

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}

document.addEventListener("click", function (e) {
  const avatar = document.getElementById("navAvatar");
  const drop   = document.getElementById("dropdown");
  if (!avatar?.contains(e.target) && !drop?.contains(e.target)) {
    drop?.classList.remove("show");
  }
});

document.querySelectorAll(".dropdown-item[data-link]").forEach(item => {
  item.addEventListener("click", () => { location.href = item.dataset.link; });
});

loadUser();
renderFavorites();