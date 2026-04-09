// filter.js
const API = 'http://localhost:3000/api';

let allCourses  = [];
let allEnrolled = [];
let allReviews  = [];

const searchInput    = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const ratingFilter   = document.getElementById("ratingFilter");
const sortFilter     = document.getElementById("sortFilter");
const applyBtn       = document.getElementById("applyFilter");
const clearBtn       = document.getElementById("clearFilter");
const courseGrid     = document.getElementById("courseGrid");
const resultText     = document.querySelector(".result-text");

function removeDiacritics(str) {
  return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getStudentCount(courseId) {
  return allEnrolled.filter(e => String(e.course_id) === String(courseId)).length;
}

function getCourseRating(courseId) {
  const reviews = allReviews.filter(r => String(r.course_id) === String(courseId));
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  return { avg: parseFloat(avg.toFixed(1)), count: reviews.length };
}

function renderStars(avg) {
  const rounded = Math.round(avg);
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += `<i class="fas fa-star" style="color:${i <= rounded ? '#fbbf24' : '#d1d5db'}"></i>`;
  }
  return html;
}

function getLevelClass(level) {
  const l = (level || '').toLowerCase();
  if (['easy','beginner','cơ bản'].includes(l)) return 'easy';
  if (['medium','intermediate','trung bình'].includes(l)) return 'medium';
  if (['hard','advanced','nâng cao'].includes(l)) return 'hard';
  return '';
}

function getLevelLabel(level) {
  const map = {
    easy:'Cơ bản', beginner:'Cơ bản',
    medium:'Trung bình', intermediate:'Trung bình',
    hard:'Nâng cao', advanced:'Nâng cao',
    'cơ bản':'Cơ bản', 'trung bình':'Trung bình', 'nâng cao':'Nâng cao'
  };
  return map[level?.toLowerCase()] || level || 'Chưa rõ';
}

function buildCategoryFilter() {
  if (!categoryFilter) return;
  const categories = [...new Set(allCourses.map(c => c.category).filter(Boolean))].sort();
  categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderCourses(list) {
  if (!courseGrid) return;
  if (list.length === 0) {
    courseGrid.innerHTML = `
      <div style="text-align:center;padding:40px;color:#6b7280">
        <div style="font-size:3rem;margin-bottom:12px"></div>
        <h3 style="margin-bottom:8px">Không tìm thấy khóa học nào!</h3>
        <p>Thử tìm với từ khóa khác nhé.</p>
      </div>`;
    updateResultCount(0);
    return;
  }
  courseGrid.innerHTML = list.map(course => {
    const studentCount = getStudentCount(course.id);
    const { avg, count } = getCourseRating(course.id);
    const stars = renderStars(avg > 0 ? avg : (course.rating || 0));
    const displayAvg = count > 0 ? avg : (course.rating || 0);
    return `
      <div class="card course-card">
        <img src="${course.thumbnail || 'https://placehold.co/300x200?text=Course'}" alt="${course.title || 'Khóa học'}">
        <div class="course-info">
          <h3>${course.title || "Chưa có tên"}</h3>
          <span class="badge ${getLevelClass(course.level)}">${getLevelLabel(course.level)}</span>
          <p style="font-size:13px;color:#64748b;margin:6px 0 2px;display:flex;align-items:center;gap:5px;">
            <i class="fa-regular fa-user" style="color:#2563eb;font-size:12px;"></i>
            ${course.instructor_name || 'Chưa cập nhật'}
          </p>
          <div class="course-rating-row">
            ${stars}
            <strong>${displayAvg}</strong>
            <span>(${studentCount} học viên)</span>
          </div>
          <a href="course-detail.html?id=${course.id}" class="btn">Xem chi tiết</a>
        </div>
      </div>
    `;
  }).join("");
  updateResultCount(list.length);
}

function updateResultCount(count) {
  const el = document.getElementById("resultCount");
  if (el) el.textContent = count;
  else if (resultText) resultText.textContent = `Kết quả: ${count} khóa học`;
}

function applyFilters() {
  const keyword       = searchInput?.value.trim() || "";
  const category      = categoryFilter?.value.toLowerCase().trim() || "";
  const ratingMin     = ratingFilter?.value || "";
  const sort          = sortFilter?.value || "";
  const checkedLevels = Array.from(
    document.querySelectorAll('.check-item input:checked')
  ).map(cb => cb.value.trim());

  let filtered = allCourses.filter(c => {
    const title           = c.title || "";
    const courseCategory  = (c.category || "").toLowerCase().trim();
    const courseLevel     = getLevelLabel(c.level);
    const { avg }         = getCourseRating(c.id);
    const effectiveRating = avg > 0 ? avg : (Number(c.rating) || 0);

    const matchKeyword  = !keyword || removeDiacritics(title).includes(removeDiacritics(keyword));
    const matchCategory = !category || courseCategory.includes(category);
    const matchLevel    = checkedLevels.length === 0 || checkedLevels.includes(courseLevel);
    const matchRating   = !ratingMin || effectiveRating >= Number(ratingMin);

    return matchKeyword && matchCategory && matchLevel && matchRating;
  });

  if (sort === "newest") {
    filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  } else if (sort === "rating") {
    filtered.sort((a, b) => (getCourseRating(b.id).avg || 0) - (getCourseRating(a.id).avg || 0));
  } else if (sort === "students") {
    filtered.sort((a, b) => getStudentCount(b.id) - getStudentCount(a.id));
  }

  renderCourses(filtered);
}

function clearFilters() {
  if (searchInput)    searchInput.value    = "";
  if (categoryFilter) categoryFilter.value = "";
  if (ratingFilter)   ratingFilter.value   = "";
  if (sortFilter)     sortFilter.value     = "newest";
  document.querySelectorAll('.check-item input').forEach(cb => cb.checked = false);
  renderCourses(allCourses);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const [coursesRes, enrolledRes, reviewsRes] = await Promise.all([
      fetch(`${API}/courses`),
      fetch(`${API}/enrolled`),
      fetch(`${API}/reviews`)
    ]);

    const courses = coursesRes.ok ? await coursesRes.json() : [];
    // ✅ Chỉ hiện khóa học đã xuất bản
    allCourses  = courses.filter(c => c.published == 1 || c.published === true);
    allEnrolled = enrolledRes.ok ? await enrolledRes.json() : [];
    allReviews  = reviewsRes.ok  ? await reviewsRes.json()  : [];

  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  }

  buildCategoryFilter();

  const urlSearch = new URLSearchParams(window.location.search).get("search");
  if (urlSearch && searchInput) searchInput.value = urlSearch;

  applyFilters();
  if (applyBtn) applyBtn.addEventListener("click", applyFilters);
  if (clearBtn) clearBtn.addEventListener("click", clearFilters);
  if (searchInput) searchInput.addEventListener("input", applyFilters);
  [categoryFilter, ratingFilter, sortFilter].forEach(el => {
    if (el) el.addEventListener("change", applyFilters);
  });
});