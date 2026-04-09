// manage-courses.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const currentUser    = JSON.parse(localStorage.getItem("currentUser"));
if (!currentUser || currentUser.role !== 'instructor') location.href = 'index.html';

const tableBody      = document.getElementById("courseTableBody");
const searchInput    = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const levelFilter    = document.getElementById("levelFilter");
const statusFilter   = document.getElementById("statusFilter");

let allCourses  = [];
let allEnrolled = [];

// ✅ Bỏ dấu tiếng Việt để tìm kiếm không cần gõ đúng dấu
function removeDiacritics(str) {
  return (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// ✅ Build dropdown danh mục từ khóa học thật của giảng viên
function buildCategoryFilter() {
  if (!categoryFilter) return;
  const categories = [...new Set(allCourses.map(c => c.category).filter(Boolean))].sort();
  categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>' +
    categories.map(c => `<option value="${c}">${c}</option>`).join('');
}

async function loadCourses() {
  try {
    const [coursesRes, enrolledRes] = await Promise.all([
      fetch(`${API}/courses`),
      fetch(`${API}/enrolled`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);
    const courses  = coursesRes.ok  ? await coursesRes.json()  : [];
    allEnrolled    = enrolledRes.ok ? await enrolledRes.json() : [];
    allCourses = courses.filter(c => String(c.instructor_id) === String(currentUser.id));

    buildCategoryFilter();
    applyFilters();
  } catch (err) {
    console.error("Lỗi load courses:", err);
  }
}

function getStudentCount(courseId) {
  return allEnrolled.filter(e => String(e.course_id) === String(courseId)).length;
}

function renderCourses(courses) {
  if (!courses.length) {
    tableBody.innerHTML = "<tr><td colspan='8' style='text-align:center;padding:30px'>Chưa có khóa học nào</td></tr>";
    return;
  }

  const levelMap   = { easy:'Cơ bản', beginner:'Cơ bản', medium:'Trung bình', intermediate:'Trung bình', hard:'Nâng cao', advanced:'Nâng cao', 'cơ bản':'Cơ bản', 'trung bình':'Trung bình', 'nâng cao':'Nâng cao' };
  const levelClass = { easy:'level-basic', beginner:'level-basic', medium:'level-mid', intermediate:'level-mid', hard:'level-advanced', advanced:'level-advanced', 'cơ bản':'level-basic', 'trung bình':'level-mid', 'nâng cao':'level-advanced' };

  tableBody.innerHTML = courses.map(course => {
    const lvl        = (course.level || "").toLowerCase();
    const isPublished = course.published == 1 || course.published === true;
    return `
      <tr>
        <td><img src="${course.thumbnail || 'https://placehold.co/60'}" class="thumbnail"></td>
        <td>
          <a href="instructor-course-detail.html?id=${course.id}"
             style="font-weight:600;color:#2563eb;text-decoration:none;">
            ${course.title || "Chưa có tên"}
          </a>
        </td>
        <td>${course.category || "Khác"}</td>
        <td><span class="badge ${levelClass[lvl] || ''}">${levelMap[lvl] || course.level || 'Chưa rõ'}</span></td>
        <td>${getStudentCount(course.id)}</td>
        <td><span class="badge ${isPublished ? 'status-published' : 'status-draft'}">${isPublished ? "Xuất bản" : "Nháp"}</span></td>
        <td>${course.updated_at ? new Date(course.updated_at).toLocaleDateString('vi-VN') : '-'}</td>
        <td class="action">
          <i class="fas fa-eye"   onclick="viewCourse(${course.id})"></i>
          <i class="fas fa-edit"  onclick="editCourse(${course.id})"></i>
          <i class="fas fa-trash" onclick="deleteCourse(${course.id})"></i>
        </td>
      </tr>`;
  }).join('');
}

function applyFilters() {
  const keyword  = searchInput?.value.trim() || '';
  const category = categoryFilter?.value.trim() || '';
  const level    = levelFilter?.value.trim().toLowerCase() || '';
  const status   = statusFilter?.value.trim() || '';

  const filtered = allCourses.filter(c => {
    // Tìm kiếm không phân biệt dấu
    const matchKeyword  = !keyword   ||
      removeDiacritics(c.title).includes(removeDiacritics(keyword));
    const matchCategory = !category  || (c.category || '').trim() === category;
    const matchLevel    = !level     || (c.level || '').toLowerCase() === level;
    const isPublished   = c.published == 1 || c.published === true;
    const matchStatus   = !status
      || (status === 'published' && isPublished)
      || (status === 'draft'     && !isPublished);
    return matchKeyword && matchCategory && matchLevel && matchStatus;
  });

  renderCourses(filtered);
}

searchInput?.addEventListener("input", applyFilters);
categoryFilter?.addEventListener("change", applyFilters);
levelFilter?.addEventListener("change", applyFilters);
statusFilter?.addEventListener("change", applyFilters);

async function deleteCourse(id) {
  if (!confirm("Bạn có chắc muốn xóa?")) return;
  await fetch(`${API}/courses/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  await loadCourses();
}

function editCourse(id) {
  localStorage.setItem("editCourseId", id);
  window.location.href = "create-course.html";
}

async function viewCourse(courseId) {
  const course = allCourses.find(c => Number(c.id) === Number(courseId));
  if (!course) return;

  document.getElementById("modalTitle").innerText = "Học viên đăng ký – " + course.title;

  try {
    const [enrolledRes, lessonsRes, progressRes] = await Promise.all([
      fetch(`${API}/enrolled?courseId=${courseId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/lessons?courseId=${courseId}`),
      fetch(`${API}/progress?courseId=${courseId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);
    const enrolled    = enrolledRes.ok  ? await enrolledRes.json()  : [];
    const lessons     = lessonsRes.ok   ? await lessonsRes.json()   : [];
    const progressAll = progressRes.ok  ? await progressRes.json()  : [];

    const students = enrolled.map(e => {
      const userProgress = progressAll.filter(p => String(p.user_id) === String(e.user_id));
      const percent = lessons.length > 0 ? Math.round((userProgress.length / lessons.length) * 100) : 0;
      return {
        name:         e.name || 'Không rõ',
        email:        e.email || '',
        registeredAt: e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString('vi-VN') : '-',
        progress:     percent,
        status:       e.status || 'active'
      };
    });

    renderStudents(students);
    document.getElementById("studentModal").style.display = "flex";
  } catch (err) {
    console.error("Lỗi load students:", err);
  }
}

function renderStudents(students) {
  const tbody = document.getElementById("studentTableBody");
  document.getElementById("totalStudents").innerText = students.length;

  if (!students.length) {
    tbody.innerHTML = "<tr><td colspan='5' style='text-align:center'>Chưa có học viên</td></tr>";
    return;
  }

  tbody.innerHTML = students.map((s, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><strong>${s.name}</strong><br><small>${s.email}</small></td>
      <td>${s.registeredAt}</td>
      <td>
        <div class="progress-bar"><span style="width:${s.progress}%"></span></div>
        <small>${s.progress}%</small>
      </td>
      <td><span class="${s.status === 'paused' ? 'status-paused' : 'status-active'}">${s.status === 'paused' ? 'Tạm dừng' : 'Đang học'}</span></td>
    </tr>`).join('');
}

function closeModal() {
  document.getElementById("studentModal").style.display = "none";
}

loadCourses();