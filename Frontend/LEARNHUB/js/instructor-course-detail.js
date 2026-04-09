// instructor-course-detail.js
const API = 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'instructor') location.href = 'index.html';

const params   = new URLSearchParams(window.location.search);
const courseId = params.get('id');
if (!courseId) location.href = 'manage-courses.html';

const levelMap = {
    easy:'Cơ bản', beginner:'Cơ bản',
    medium:'Trung bình', intermediate:'Trung bình',
    hard:'Nâng cao', advanced:'Nâng cao',
    'cơ bản':'Cơ bản', 'trung bình':'Trung bình', 'nâng cao':'Nâng cao'
};

let lessonsList = [];

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className   = `show ${type}`;
    setTimeout(() => { t.className = ''; }, 3000);
}

function calcAvgRating(reviews) {
    if (!reviews || reviews.length === 0) return null;
    const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
    return avg.toFixed(1);
}

function renderStars(avg) {
    if (!avg) return '<span style="color:#94a3b8">Chưa có đánh giá</span>';
    const rounded = Math.round(+avg);
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rounded
            ? '<i class="fas fa-star" style="color:#fbbf24"></i>'
            : '<i class="fas fa-star" style="color:#d1d5db"></i>';
    }
    return html;
}

document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.remove('hidden');
    });
});

async function init() {
    await Promise.all([loadCourse(), loadLessons()]);
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('mainContent').style.display  = 'block';
}


async function loadCourse() {
    try {
        const [courseRes, reviewsRes, enrollRes] = await Promise.all([
            fetch(`${API}/courses/${courseId}`),
            fetch(`${API}/reviews?courseId=${courseId}`),
            fetch(`${API}/enrolled?courseId=${courseId}`, { headers: authHeaders() })
        ]);

        const course  = courseRes.ok  ? await courseRes.json()  : null;
        const reviews = reviewsRes.ok ? await reviewsRes.json() : [];
        const enrolled = enrollRes.ok ? await enrollRes.json()  : [];

        if (!course) { showToast('Không tìm thấy khóa học', 'error'); return; }

        if (String(course.instructor_id) !== String(currentUser.id)) {
            location.href = 'manage-courses.html';
            return;
        }

        renderCourse(course, reviews, enrolled.length);

    } catch (err) {
        console.error(err);
        showToast('Lỗi tải thông tin khóa học', 'error');
    }
}

function renderCourse(c, reviews = [], studentCount = 0) {
    document.title = `${c.title} - LearnHub`;

    // Thumbnail
    if (c.thumbnail) {
        document.getElementById('mainThumb').innerHTML =
            `<img src="${c.thumbnail}" class="course-thumbnail" alt="thumbnail" onerror="this.style.display='none'">`;
        document.getElementById('sideThumb').innerHTML =
            `<img src="${c.thumbnail}" class="sidebar-thumb" alt="thumbnail" onerror="this.style.display='none'">`;
    }

    // Tiêu đề
    document.getElementById('courseTitle').textContent = c.title || '—';

    // Mô tả ngắn
    document.getElementById('courseShortDesc').textContent = c.short_desc || c.short_description || '';

    // Mô tả chi tiết
    document.getElementById('description').textContent =
        c.long_description || c.description || 'Chưa có mô tả chi tiết.';

    // Rating
    const avg = calcAvgRating(reviews);
    const ratingEl = document.getElementById('courseRating');
    const starEl   = ratingEl?.previousElementSibling; // span.star

    if (avg) {
        ratingEl.textContent = avg;
        const ratingRow = document.getElementById('courseRating').closest('.course-rating');
        if (ratingRow) {
            ratingRow.innerHTML = `
                <span class="star">${renderStars(avg)}</span>
                <strong id="courseRating">${avg}</strong>
                <span class="student-count" id="studentCount">${studentCount} học viên</span>
            `;
        }
    } else {
        const ratingRow = document.getElementById('courseRating')?.closest('.course-rating');
        if (ratingRow) {
            ratingRow.innerHTML = `
                <span style="color:#94a3b8;font-size:0.85rem">Chưa có đánh giá</span>
                <span class="student-count" id="studentCount">${studentCount} học viên</span>
            `;
        }
    }

    document.getElementById('statStudents').textContent = studentCount;

    const lvl = (c.level || '').toLowerCase();
    document.getElementById('infoCategory').textContent = c.category || '—';
    document.getElementById('infoLevel').textContent    = levelMap[lvl] || c.level || '—';
    document.getElementById('infoUpdated').textContent  =
        c.updated_at ? new Date(c.updated_at).toLocaleDateString('vi-VN') : '—';

    // Badges - ẩn vì đã có ở sidebar
    document.getElementById('courseBadges').innerHTML = '';

    // Buttons
    document.getElementById('btnEdit').href = `create-course.html?id=${c.id}`;
    const lessonHref = `manage-lessons.html?courseId=${c.id}`;
    document.getElementById('btnAddLesson').href     = lessonHref;
    document.getElementById('btnAddLessonSide').href = lessonHref;
}

async function loadLessons() {
    try {
        const res   = await fetch(`${API}/lessons?courseId=${courseId}`);
        lessonsList = res.ok ? await res.json() : [];
        renderLessons();
    } catch (err) {
        console.error(err);
        document.getElementById('lessonList').innerHTML =
            `<div class="empty-lessons"><i class="fas fa-exclamation-circle"></i><p>Lỗi tải bài giảng</p></div>`;
    }
}

function renderLessons() {
    document.getElementById('statLessons').textContent = lessonsList.length;
    const container = document.getElementById('lessonList');

    if (!lessonsList.length) {
        container.innerHTML = `
            <div class="empty-lessons">
                <i class="fas fa-film"></i>
                <p>Chưa có bài giảng nào.<br>Nhấn <strong>Thêm bài giảng</strong> để bắt đầu!</p>
            </div>`;
        return;
    }

    container.innerHTML = lessonsList.map((lesson, i) => `
        <div class="lesson-item">
            <div class="lesson-num">${i + 1}</div>
            <div class="lesson-info">
                <div class="l-title">${lesson.title || 'Bài ' + (i + 1)}</div>
            </div>
            <div class="lesson-actions">
                <a href="${lesson.video_url || lesson.url || '#'}" target="_blank"
                   class="btn-icon bi-play" title="Xem video">
                    <i class="fas fa-play"></i>
                </a>
                <a href="manage-lessons.html?lessonId=${lesson.id}&courseId=${courseId}"
                   class="btn-icon bi-edit" title="Chỉnh sửa">
                    <i class="fas fa-edit"></i>
                </a>
                <button class="btn-icon bi-del" onclick="deleteLesson(${lesson.id})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// ── Delete ──
async function deleteLesson(id) {
    if (!confirm('Bạn có chắc muốn xóa bài giảng này?')) return;
    try {
        const res = await fetch(`${API}/lessons/${id}`, { method: 'DELETE', headers: authHeaders() });
        if (res.ok) { await loadLessons(); showToast('Đã xóa bài giảng'); }
        else showToast('Xóa thất bại', 'error');
    } catch { showToast('Lỗi kết nối', 'error'); }
}

// ── Edit modal ──
function openEditModal(id) {
    const lesson = lessonsList.find(l => l.id === id);
    if (!lesson) return;
    document.getElementById('editLessonId').value = id;
    document.getElementById('editTitle').value     = lesson.title || '';
    document.getElementById('editUrl').value       = lesson.video_url || lesson.url || '';
    document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
}

async function saveEditLesson() {
    const id    = document.getElementById('editLessonId').value;
    const title = document.getElementById('editTitle').value.trim();
    const url   = document.getElementById('editUrl').value.trim();

    if (!title) { showToast('Vui lòng nhập tiêu đề', 'error'); return; }
    if (!url)   { showToast('Vui lòng nhập link video', 'error'); return; }

    try {
        const res = await fetch(`${API}/lessons/${id}`, {
            method: 'PUT', headers: authHeaders(),
            body: JSON.stringify({ title, video_url: url })
        });
        if (res.ok) {
            closeEditModal();
            await loadLessons();
            showToast('Đã cập nhật bài giảng!');
        } else showToast('Cập nhật thất bại', 'error');
    } catch { showToast('Lỗi kết nối', 'error'); }
}

document.getElementById('editModal').addEventListener('click', function(e) {
    if (e.target === this) closeEditModal();
});

init();