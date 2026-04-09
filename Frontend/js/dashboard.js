// dashboard.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

(function(){
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if(!user || user.role !== "instructor"){
    location.href = "index.html";
  }
})();

async function renderActivity() {
  const ul = document.querySelector(".activity");
  if (!ul) return;
  try {
    const res = await fetch(`${API}/activity`);
    const logs = res.ok ? await res.json() : [];

    if (logs.length === 0) {
      ul.innerHTML = `<li style="color:#9ca3af;font-size:14px">Chưa có hoạt động nào.</li>`;
      return;
    }

    const iconMap = {
      'enrolled':  { icon: 'fa-user-plus',   color: '#22c55e' },
      'course':    { icon: 'fa-laptop-code',  color: '#3b82f6' },
      'register':  { icon: 'fa-user',         color: '#8b5cf6' },
      'review':    { icon: 'fa-star',         color: '#f59e0b' },
      'default':   { icon: 'fa-bell',         color: '#3b82f6' }
    };

    function getIcon(action) {
      if (action.includes('đăng ký khóa') || action.includes('enrolled')) return iconMap.enrolled;
      if (action.includes('khóa học'))   return iconMap.course;
      if (action.includes('đăng ký'))    return iconMap.register;
      if (action.includes('đánh giá'))   return iconMap.review;
      return iconMap.default;
    }

    ul.innerHTML = logs.map(log => {
      const { icon, color } = getIcon(log.action || '');
      const time = new Date(log.created_at).toLocaleString("vi-VN");
      const name = log.userName ? `<strong>${log.userName}</strong> ` : '';
      return `
        <li style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #f3f4f6">
          <span class="a-icon" style="background:${color}1a;color:${color};flex-shrink:0">
            <i class="fas ${icon}"></i>
          </span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;color:#374151;line-height:1.4">${name}${log.action}</div>
            <div style="font-size:12px;color:#9ca3af;margin-top:2px">${time}</div>
          </div>
        </li>`;
    }).join("");
  } catch (err) {
    console.error("Lỗi load activity:", err);
    ul.innerHTML = `<li style="color:#9ca3af;font-size:14px">Chưa có hoạt động nào.</li>`;
  }
}

async function loadDashboard() {
  try {
    const [usersRes, coursesRes, enrolledRes, reviewsRes] = await Promise.all([
      fetch(`${API}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/courses`),
      fetch(`${API}/enrolled`),
      fetch(`${API}/reviews`)
    ]);

    const users    = usersRes.ok    ? await usersRes.json()    : [];
    const courses  = coursesRes.ok  ? await coursesRes.json()  : [];
    const enrolled = enrolledRes.ok ? await enrolledRes.json() : [];
    const reviews  = reviewsRes.ok  ? await reviewsRes.json()  : [];

    const instructors    = users.filter(u => u.role === "instructor").length;
    const students       = users.filter(u => u.role === "student").length;
    const enrolledCount = new Set(enrolled.map(e => e.user_id)).size; // tổng lượt đăng ký

    document.getElementById("courseCount").innerText     = courses.length;
    document.getElementById("studentCount").innerText    = enrolledCount; // số lượt enrolled
    document.getElementById("instructorCount").innerText = instructors;

    // Badge
    const prev = JSON.parse(localStorage.getItem("dashBadge") || "{}");

    const courseBadge = document.querySelector(".stats .stat:nth-child(1) .badge");
    if (courseBadge) {
      const diff = courses.length - (prev.courses || courses.length);
      if (diff > 0) { courseBadge.textContent = `+${diff} mới`; courseBadge.className = "badge green"; }
      else { courseBadge.textContent = `${courses.length} tổng`; courseBadge.className = "badge blue"; }
    }

    const studentBadge = document.querySelector(".stats .stat:nth-child(2) .badge");
    if (studentBadge) {
      const diff = enrolledCount - (prev.enrolled || enrolledCount);
      if (diff > 0) { studentBadge.textContent = `+${diff} mới`; studentBadge.className = "badge green"; }
      else { studentBadge.textContent = `${enrolledCount} tổng`; studentBadge.className = "badge blue"; }
    }

    const instrBadge = document.querySelector(".stats .stat:nth-child(3) .badge");
    if (instrBadge) {
      const diff = instructors - (prev.instructors || instructors);
      if (diff > 0) { instrBadge.textContent = `+${diff} mới`; instrBadge.className = "badge green"; }
      else { instrBadge.textContent = `${instructors} tổng`; instrBadge.className = "badge gray"; }
    }

    localStorage.setItem("dashBadge", JSON.stringify({
      courses: courses.length,
      enrolled: enrolledCount,
      instructors
    }));

    // Danh sách khóa học
    const list = document.getElementById("courseList");
    if (list) {
      list.innerHTML = courses.map(course => `
        <div class="course-item">
          <div class="a-icon blue"><i class="fas fa-laptop-code"></i></div>
          <div>
            <strong>${course.title}</strong><br>
            <small>${course.description || ""}</small>
          </div>
        </div>
      `).join("");
    }

    // Date
    const now = new Date();
    document.getElementById("currentDate").innerText =
      now.toLocaleDateString("vi-VN") + " · " + now.toLocaleTimeString("vi-VN");

    await renderActivity();
    renderTopCourses(courses, enrolled, reviews);

  } catch (err) {
    console.error("Lỗi load dashboard:", err);
  }
}

function renderTopCourses(courses, enrolled, reviews) {
  const ranked = courses.map(c => {
    const count = enrolled.filter(e => String(e.course_id) === String(c.id)).length;
    const revList = reviews.filter(r => String(r.course_id) === String(c.id));
    const avg = revList.length > 0
      ? (revList.reduce((s,r) => s + r.rating, 0) / revList.length).toFixed(1)
      : (c.rating || "—");
    return { ...c, studentCount: count, avg };
  }).sort((a,b) => b.studentCount - a.studentCount).slice(0, 5);

  const container = document.getElementById("topCoursesList");
  if (!container) return;

  if (ranked.length === 0) {
    container.innerHTML = '<p style="color:#9ca3af;font-size:14px">Chưa có dữ liệu.</p>';
    return;
  }

  container.innerHTML = ranked.map((c, i) => {
    const medals = ["🥇","🥈","🥉","4️⃣","5️⃣"];
    const bar = ranked[0].studentCount > 0
      ? Math.round((c.studentCount / ranked[0].studentCount) * 100) : 0;
    return `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #f3f4f6">
        <span style="font-size:1.4rem;width:28px;text-align:center">${medals[i]}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;color:#1f2937;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.title}</div>
          <div style="margin-top:5px;background:#f3f4f6;border-radius:4px;height:6px;overflow:hidden">
            <div style="width:${bar}%;height:100%;background:linear-gradient(90deg,#3b82f6,#60a5fa);border-radius:4px;transition:.4s"></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:15px;font-weight:700;color:#2563eb">${c.studentCount}</div>
          <div style="font-size:11px;color:#9ca3af">học viên</div>
        </div>
        <div style="text-align:right;flex-shrink:0;min-width:42px">
          <div style="font-size:13px;font-weight:600;color:#f59e0b">⭐ ${c.avg}</div>
        </div>
      </div>
    `;
  }).join("");
}

window.addEventListener("beforeunload", () => {
  const prev = JSON.parse(localStorage.getItem("dashBadge") || "{}");
  localStorage.setItem("dashBadge", JSON.stringify(prev));
});

loadDashboard();