// home.js
const API = 'http://localhost:3000/api';

document.addEventListener("DOMContentLoaded", async function () {
  const grid = document.getElementById("featuredGrid");

  function getLevelLabel(level) {
    const map = { easy:'Cơ bản', beginner:'Cơ bản', medium:'Trung bình', intermediate:'Trung bình', hard:'Nâng cao', advanced:'Nâng cao', 'cơ bản':'Cơ bản', 'trung bình':'Trung bình', 'nâng cao':'Nâng cao' };
    return map[level?.toLowerCase()] || level || '';
  }

  function getLevelClass(level) {
    const l = level?.toLowerCase();
    if (['easy','beginner','cơ bản'].includes(l)) return 'easy';
    if (['medium','intermediate','trung bình'].includes(l)) return 'medium';
    if (['hard','advanced','nâng cao'].includes(l)) return 'hard';
    return '';
  }

  function renderStars(avg) {
    const rounded = Math.round(avg);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<i class="fas fa-star" style="color:${i <= rounded ? '#fbbf24' : '#d1d5db'};font-size:12px"></i>`;
    }
    return html;
  }

  if (grid) {
    try {
      const [coursesRes, enrolledRes, reviewsRes] = await Promise.all([
        fetch(`${API}/courses`),
        fetch(`${API}/enrolled`),
        fetch(`${API}/reviews`)
      ]);
      const courses  = coursesRes.ok  ? await coursesRes.json()  : [];
      const enrolled = enrolledRes.ok ? await enrolledRes.json() : [];
      const reviews  = reviewsRes.ok  ? await reviewsRes.json()  : [];

      if (courses.length === 0) {
        grid.innerHTML = "<p>Chưa có khóa học nào.</p>";
      } else {
        const featured = courses.filter(course => {
          const courseReviews = reviews.filter(r => String(r.course_id) === String(course.id));
          const avg = courseReviews.length > 0
            ? courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length
            : (course.rating || 0);
          return avg >= 4;
        }).slice(0, 6);

        if (featured.length === 0) {
          grid.innerHTML = "<p>Chưa có khóa học nổi bật nào.</p>";
        } else {
          grid.innerHTML = featured.map(course => {
            const courseReviews = reviews.filter(r => String(r.course_id) === String(course.id));
            const avg = courseReviews.length > 0
              ? parseFloat((courseReviews.reduce((s, r) => s + r.rating, 0) / courseReviews.length).toFixed(1))
              : (course.rating || 0);
            const students = enrolled.filter(e => String(e.course_id) === String(course.id)).length;
            const stars = renderStars(avg);

            return `
              <div class="card course-card">
                <img src="${course.thumbnail || 'https://placehold.co/300x200?text=Course'}" alt="${course.title}">
                <div class="course-info">
                  <h3>${course.title}</h3>
                  <span class="badge ${getLevelClass(course.level)}">${getLevelLabel(course.level)}</span>
                  <p style="font-size:13px;color:#64748b;margin:6px 0 2px;display:flex;align-items:center;gap:5px;">
                    <i class="fa-regular fa-user" style="color:#2563eb;font-size:12px;"></i>
                    ${course.instructor_name || 'Chưa cập nhật'}
                  </p>
                  <div style="display:flex;align-items:center;gap:5px;margin:8px 0;font-size:13px;color:#6b7280">
                    ${stars}
                    <strong style="color:#1f2937">${avg}</strong>
                    <span>(${students} học viên)</span>
                  </div>
                  <a href="course-detail.html?id=${course.id}" class="btn">Xem chi tiết</a>
                </div>
              </div>`;
          }).join("");
        }
      }
    } catch (err) {
      console.error("Lỗi tải khóa học:", err);
      grid.innerHTML = "<p>Lỗi tải dữ liệu.</p>";
    }
  }

  // Search
  const searchBtn   = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  function doSearch() {
    const q = searchInput?.value.trim();
    if (q) window.location.href = 'courses.html?search=' + encodeURIComponent(q);
  }
  if (searchBtn)   searchBtn.addEventListener('click', doSearch);
  if (searchInput) searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
});