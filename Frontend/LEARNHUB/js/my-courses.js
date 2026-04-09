// my-courses.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

let user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) { alert("Vui lòng đăng nhập"); window.location.replace("login.html"); }

async function init() {
  try {
    const [enrolledRes, favRes, progressRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${user.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/favorites?userId=${user.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/progress?userId=${user.id}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);
    const myCourses   = enrolledRes.ok  ? await enrolledRes.json()  : [];
    const favorites   = favRes.ok       ? await favRes.json()       : [];
    const progressAll = progressRes.ok  ? await progressRes.json()  : [];

    let totalProgress = 0;
    const coursesWithProgress = await Promise.all(myCourses.map(async e => {
      const lessonsRes = await fetch(`${API}/lessons?courseId=${e.course_id}`);
      const lessons    = lessonsRes.ok ? await lessonsRes.json() : [];
      const done       = progressAll.filter(p => String(p.course_id) === String(e.course_id)).length;
      const pct        = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
      totalProgress += pct;
      return { ...e, _progress: pct };
    }));

    const avgProgress = coursesWithProgress.length
      ? Math.round(totalProgress / coursesWithProgress.length) : 0;

    loadUserInfo(coursesWithProgress.length, favorites.length, avgProgress);
    renderCourses(coursesWithProgress);
  } catch (err) {
    console.error("Lỗi load my-courses:", err);
  }
}

function loadUserInfo(courseCount, favCount, avgProgress) {
  if (user.avatar) {
    const avatarHtml = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%">`;
    document.getElementById("navAvatar").innerHTML = avatarHtml;
    document.getElementById("bigAvatar").innerHTML = avatarHtml;
  } else {
    const first = user.name ? user.name.charAt(0).toUpperCase() : "U";
    document.getElementById("navAvatar").innerText = first;
    document.getElementById("bigAvatar").innerText = first;
  }
  document.getElementById("sideName").innerText        = user.name  || "";
  document.getElementById("dropName").innerText        = user.name  || "";
  document.getElementById("dropEmail").innerText       = user.email || "";
  document.getElementById("courseCount").innerText     = courseCount;
  document.getElementById("favoriteCount").innerText   = favCount;
  document.getElementById("completePercent").innerText = avgProgress + "%";
  document.getElementById("menuCount").innerText       = courseCount;
  document.getElementById("dropCount").innerText       = courseCount;
}

function renderCourses(courses) {
  const grid = document.getElementById("courseGrid");
  if (!courses.length) {
    grid.innerHTML = "<p>Bạn chưa đăng ký khóa học nào.</p>";
    return;
  }
  grid.innerHTML = courses.map(e => {
    const progress    = e._progress;
    const isCompleted = progress === 100;
    return `
      <div class="course-card">
        <img src="${e.thumbnail || 'https://placehold.co/600x400?text=Course'}">
        <div class="course-info">
          <h3>${e.title || ''}</h3>
          <p>GV: ${e.instructor_name || ''}</p>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${progress}%"></div>
          </div>
          <p>${progress}% hoàn thành</p>
          <div class="course-actions">
            <button class="btn ${isCompleted ? 'btn-success' : 'btn-primary'}"
              onclick="location.href='course-detail.html?id=${e.course_id}'">
              ${isCompleted ? "Xem lại" : "Tiếp tục học"}
            </button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("show");
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.replace("login.html");
}

window.addEventListener("click", e => {
  if (!e.target.closest(".user-avatar"))
    document.getElementById("dropdown")?.classList.remove("show");
});

document.querySelectorAll(".dropdown-item[data-link]").forEach(item => {
  item.addEventListener("click", () => location.href = item.dataset.link);
});

init();