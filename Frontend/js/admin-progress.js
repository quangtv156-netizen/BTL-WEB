// admin-progress.js
// getToken lay tu admin-common.js

let user;

document.addEventListener("DOMContentLoaded", async function() {
  user = checkAuth();
  if (user) {
    const stats = await getStats(user.id);
    loadSidebar(user, stats);
    initDropdown();
    await renderProgress();
  }
});

async function renderProgress() {
  try {
    const [enrolledRes, progressRes] = await Promise.all([
      fetch(API + '/enrolled?userId=' + user.id, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      }),
      fetch(API + '/progress?userId=' + user.id, {
        headers: { 'Authorization': 'Bearer ' + getToken() }
      })
    ]);

    const enrolled    = enrolledRes.ok  ? await enrolledRes.json() : [];
    const progressAll = progressRes.ok  ? await progressRes.json() : [];

    let completed = 0, totalHours = 0;

    const items = await Promise.all(enrolled.map(async item => {
      const lessonsRes = await fetch(API + '/lessons?courseId=' + item.course_id);
      const lessons    = lessonsRes.ok ? await lessonsRes.json() : [];
      const done       = progressAll.filter(p => String(p.course_id) === String(item.course_id)).length;
      const progress   = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
      const isDone     = progress === 100;
      if (isDone) completed++;
      totalHours += Number(item.hours) || 0;
      return { ...item, progress, isDone };
    }));

    const html = items.map(item =>
      '<div class="course-card">' +
        '<img src="' + (item.thumbnail || 'https://placehold.co/200x200?text=Course') + '">' +
        '<div class="course-info">' +
          '<h4>' + (item.title || '') + '</h4>' +
          '<small>GV: ' + (item.instructor_name || '') + '</small>' +
          '<div class="progress-bar"><div class="progress-fill ' + (item.isDone ? 'done' : '') + '" style="width:' + item.progress + '%"></div></div>' +
        '</div>' +
        '<div class="percent ' + (item.isDone ? 'done' : '') + '">' + (item.isDone ? 'Xong' : item.progress + '%') + '</div>' +
      '</div>'
    ).join('') || '<div style="background:#fff;padding:30px;border-radius:18px;text-align:center"><h3>Chua dang ky khoa hoc nao</h3></div>';

    document.getElementById("courseList").innerHTML   = html;
    document.getElementById("sumCourses").innerText   = enrolled.length;
    document.getElementById("sumCompleted").innerText = completed;
    document.getElementById("sumHours").innerText     = totalHours + "h";
    document.getElementById("sumCert").innerText      = completed;

  } catch (err) {
    console.error("Loi load progress:", err);
  }
}