// manage-lessons.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const user = JSON.parse(localStorage.getItem("currentUser"));
if (!user || user.role !== "instructor") location.href = "index.html";

const lessonTable        = document.getElementById("lessonTable");
const lessonCourseSelect = document.getElementById("lessonCourse");
const lessonChapter      = document.getElementById("lessonChapter");
const orderInChapter     = document.getElementById("orderInChapter");
const lessonTitle        = document.getElementById("lessonTitle");
const lessonDesc         = document.getElementById("lessonDesc");
const lessonVideoUrl     = document.getElementById("lessonVideoUrl");
const lessonDuration     = document.getElementById("lessonDuration");
const lessonStatus       = document.getElementById("lessonStatus");
const videoPreview       = document.getElementById("videoPreview");

let editingId  = null;
let allCourses = [];
let allLessons = [];

async function loadCourseOptions() {
  try {
    const res = await fetch(`${API}/courses`);
    allCourses = res.ok ? await res.json() : [];
    allCourses = allCourses.filter(c => String(c.instructor_id) === String(user.id));
    const opts = allCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
    lessonCourseSelect.innerHTML = `<option value="">-- Chọn khóa học --</option>` + opts;

    const urlParams = new URLSearchParams(window.location.search);
    const preselect = urlParams.get('courseId');
    if (preselect) {
      lessonCourseSelect.value = preselect;
    }

  } catch (err) {
    console.error("Lỗi load courses:", err);
  }
}

lessonCourseSelect.addEventListener("change", loadLessons);

lessonVideoUrl.addEventListener("input", () => {
  const url = lessonVideoUrl.value.trim();
  videoPreview.innerHTML = "";
  videoPreview.classList.add("hidden");
  if (!url) return;
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      videoPreview.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
      videoPreview.classList.remove("hidden");
    }
  } else if (url.endsWith(".mp4")) {
    videoPreview.innerHTML = `<video controls src="${url}"></video>`;
    videoPreview.classList.remove("hidden");
  }
});

async function loadLessons() {
  const filterCourse  = lessonCourseSelect.value || "";
  const chapterSelect = document.getElementById("filterChapter");

  try {
    const url = filterCourse
      ? `${API}/lessons?courseId=${filterCourse}`
      : `${API}/lessons`;
    const res  = await fetch(url);
    allLessons = res.ok ? await res.json() : [];

    if (!filterCourse) {
      const myCourseIds = allCourses.map(c => String(c.id));
      allLessons = allLessons.filter(l => myCourseIds.includes(String(l.course_id)));
    }

    const chapters    = [...new Set(allLessons.map(l => l.chapter).filter(Boolean))].sort();
    const prevChapter = chapterSelect.value;
    chapterSelect.innerHTML = '<option value="">-- Tất cả chương --</option>' +
      chapters.map(c => `<option value="${c}"${c === prevChapter ? ' selected' : ''}>${c}</option>`).join('');

    let lessons = [...allLessons];
    const activeChapter = chapterSelect.value;
    if (activeChapter) lessons = lessons.filter(l => l.chapter === activeChapter);

    lessons.sort((a, b) => {
      if ((a.chapter || '') < (b.chapter || '')) return -1;
      if ((a.chapter || '') > (b.chapter || '')) return 1;
      return (Number(a.order_in_chapter) || 0) - (Number(b.order_in_chapter) || 0);
    });

    const titleEl = document.getElementById("tableTitle");
    if (filterCourse) {
      const c = allCourses.find(c => String(c.id) === String(filterCourse));
      titleEl.textContent = c ? `Khóa học: ${c.title}` : "Danh sách bài giảng";
    } else {
      titleEl.textContent = "Danh sách bài giảng";
    }

    if (!lessons.length) {
      lessonTable.innerHTML = "<tr><td colspan='9' style='text-align:center;padding:30px;color:#6b7280'>Chưa có bài giảng nào</td></tr>";
      return;
    }

    lessonTable.innerHTML = lessons.map(lesson => {
      const course = allCourses.find(c => String(c.id) === String(lesson.course_id));
      const isEditing = lesson.id === editingId;
      return `
        <tr${isEditing ? ' style="background:#eff6ff;"' : ''}>
          <td class="col-course">${course ? course.title : "—"}</td>
          <td class="col-chapter">${lesson.chapter || "—"}</td>
          <td class="col-order" style="text-align:center;color:#6b7280">${lesson.order_in_chapter || "—"}</td>
          <td class="col-title lesson-title-cell"><strong>${lesson.title}</strong></td>
          <td class="col-dur">${lesson.duration || "—"}</td>
          <td class="col-status">
            <span class="badge ${lesson.status}">${lesson.status === "published" ? "Xuất bản" : "Nháp"}</span>
          </td>
          <td class="col-video" style="text-align:center">
            ${lesson.video_url
              ? `<button class="video-play-btn" onclick="openVideoModal('${lesson.video_url}')" title="Xem video"><i class="fas fa-play"></i></button>`
              : '—'}
          </td>
          <td class="col-updated">${lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString('vi-VN') : '—'}</td>
          <td class="col-action">
            <div class="action-btns">
              <button title="Sửa" onclick="editLesson(${lesson.id})"><i class="fas fa-pen"></i></button>
              <button class="del" title="Xóa" onclick="deleteLesson(${lesson.id})"><i class="fas fa-trash"></i></button>
            </div>
          </td>
        </tr>`;
    }).join('');

  } catch (err) {
    console.error("Lỗi load lessons:", err);
  }
}

document.getElementById("filterChapter")?.addEventListener("change", loadLessons);

function getNextOrder(courseId, chapter) {
  const sameCourse = allLessons.filter(l => String(l.course_id) === String(courseId));
  if (chapter) {
    const sameChapter = sameCourse.filter(l => l.chapter === chapter);
    return sameChapter.length + 1;
  } else {
    return sameCourse.length + 1;
  }
}

async function saveLesson() {
  if (!lessonCourseSelect.value)    return alert("Chọn khóa học!");
  if (!lessonTitle.value.trim())    return alert("Nhập tiêu đề!");
  if (!lessonVideoUrl.value.trim()) return alert("Nhập link video!");

  const selectedCourseId = lessonCourseSelect.value;
  const chapterVal       = lessonChapter.value.trim();
  const orderVal = orderInChapter.value
    ? Number(orderInChapter.value)
    : getNextOrder(selectedCourseId, chapterVal);

  const body = {
    course_id:        Number(selectedCourseId),
    chapter:          chapterVal || null,
    order_in_chapter: orderVal,
    title:            lessonTitle.value.trim(),
    description:      lessonDesc.value.trim(),
    video_url:        lessonVideoUrl.value.trim(),
    duration:         lessonDuration.value.trim(),
    status:           lessonStatus.value
  };

  try {
    if (editingId) {
      await fetch(`${API}/lessons/${editingId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      alert('Cập nhật bài giảng thành công!');
    } else {
      await fetch(`${API}/lessons`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
      });
      alert('Tạo bài giảng thành công!');
    }
    clearForm();
    lessonCourseSelect.value = selectedCourseId;
    await loadLessons();
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

function editLesson(id) {
  const lesson = allLessons.find(l => l.id === id);
  if (!lesson) return;
  editingId = id;
  lessonCourseSelect.value = lesson.course_id;
  lessonChapter.value      = lesson.chapter || '';
  orderInChapter.value     = lesson.order_in_chapter || '';
  lessonTitle.value        = lesson.title || '';
  lessonDesc.value         = lesson.description || '';
  lessonVideoUrl.value     = lesson.video_url || '';
  lessonDuration.value     = lesson.duration || '';
  lessonStatus.value       = lesson.status || 'published';
  lessonVideoUrl.dispatchEvent(new Event("input"));
  // Highlight dòng đang edit trong bảng
  loadLessons();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteLesson(id) {
  if (!confirm("Xóa bài giảng này?")) return;
  await fetch(`${API}/lessons/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  if (editingId === id) clearForm();
  await loadLessons();
}

function deleteCurrent() {
  if (editingId) deleteLesson(editingId);
}

function clearForm() {
  editingId = null;
  lessonCourseSelect.value = "";
  lessonChapter.value      = "";
  orderInChapter.value     = "";
  lessonTitle.value        = "";
  lessonDesc.value         = "";
  lessonVideoUrl.value     = "";
  lessonDuration.value     = "";
  lessonStatus.value       = "published";
  videoPreview.innerHTML   = "";
  videoPreview.classList.add("hidden");
}

function getYouTubeEmbed(url) {
  if (!url) return null;
  if (url.includes("youtube.com/embed/")) return url;
  const s = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (s) return `https://www.youtube.com/embed/${s[1]}`;
  const w = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (w) return `https://www.youtube.com/embed/${w[1]}`;
  return null;
}

function openVideoModal(videoUrl) {
  const content = document.getElementById("videoModalContent");
  const embed   = getYouTubeEmbed(videoUrl);
  if (embed) {
    content.innerHTML = `<iframe src="${embed}?autoplay=1" allowfullscreen allow="autoplay"></iframe>`;
  } else if (videoUrl.endsWith(".mp4")) {
    content.innerHTML = `<video controls autoplay src="${videoUrl}"></video>`;
  } else {
    content.innerHTML = `<div style="color:#fff;display:flex;align-items:center;justify-content:center;height:100%">Không hỗ trợ định dạng này</div>`;
  }
  document.getElementById("videoModal").style.display = "flex";
}

function closeVideoModal() {
  document.getElementById("videoModal").style.display = "none";
  document.getElementById("videoModalContent").innerHTML = "";
}

document.getElementById("videoModal")?.addEventListener("click", function(e) {
  if (e.target === this) closeVideoModal();
});

async function init() {
  await loadCourseOptions();
  await loadLessons();

  // ✅ Nếu có ?lessonId= trên URL → auto-fill form bài giảng đó
  const urlParams = new URLSearchParams(window.location.search);
  const lessonId  = urlParams.get('lessonId');
  if (lessonId) {
    // Fetch bài giảng trực tiếp từ API để đảm bảo có data
    try {
      const res    = await fetch(`${API}/lessons/${lessonId}`);
      const lesson = res.ok ? await res.json() : null;
      if (lesson) {
        editingId = lesson.id;
        lessonCourseSelect.value = lesson.course_id;
        lessonChapter.value      = lesson.chapter || '';
        orderInChapter.value     = lesson.order_in_chapter || '';
        lessonTitle.value        = lesson.title || '';
        lessonDesc.value         = lesson.description || '';
        lessonVideoUrl.value     = lesson.video_url || '';
        lessonDuration.value     = lesson.duration || '';
        lessonStatus.value       = lesson.status || 'published';
        lessonVideoUrl.dispatchEvent(new Event("input"));
        // Load lại bảng với courseId đúng để highlight
        await loadLessons();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Lỗi load lesson:', err);
    }
  }
}

init();