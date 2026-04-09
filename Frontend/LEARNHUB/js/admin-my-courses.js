// admin-my-courses.js

let user;

document.addEventListener("DOMContentLoaded", async function() {
  user = checkAuth();
  if (user) {
    const stats = await getStats(user.id);
    loadSidebar(user, stats);
    initDropdown();
    await renderCourses();
  }
});

async function renderCourses() {
  const grid = document.getElementById("courseGrid");
  try {
    const res = await fetch(`${API}/enrolled?userId=${user.id}`);
    const enrolled = res.ok ? await res.json() : [];

    if (!enrolled.length) {
      grid.innerHTML = "<p>Bạn chưa đăng ký khóa học nào.</p>";
      return;
    }

    grid.innerHTML = enrolled.map(item => {
      const progress    = Number(item.progress) || 0;
      const isCompleted = progress === 100;
      return `
        <div class="course-card">
          <img src="${item.thumbnail || 'https://placehold.co/600x400?text=Course'}">
          <div class="course-info">
            <h3>${item.title || ''}</h3>
            <p>GV: ${item.instructor_name || ''}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${progress}%"></div>
            </div>
            <p>${progress}% hoàn thành</p>
            <div class="course-actions">
              <button class="btn ${isCompleted ? 'btn-success' : 'btn-primary'}"
                onclick="location.href='../course-detail.html?id=${item.course_id}'">
                ${isCompleted ? "Xem lại" : "Tiếp tục học"}
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error("Lỗi load my courses:", err);
    grid.innerHTML = "<p>Lỗi tải dữ liệu.</p>";
  }
}