// learn-course.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

(async function () {
  const params = new URLSearchParams(location.search);
  const courseId = params.get("course");
  let currentLessonId = params.get("lesson");

  if (!courseId) { document.body.innerHTML = "Không tìm thấy khóa học"; return; }

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userId = currentUser ? currentUser.id : null;

  const [courseRes, lessonsRes, progressRes] = await Promise.all([
    fetch(`${API}/courses/${courseId}`),
    fetch(`${API}/lessons?courseId=${courseId}`),
    userId ? fetch(`${API}/progress?userId=${userId}&courseId=${courseId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    }) : Promise.resolve(null)
  ]);

  const course  = courseRes.ok ? await courseRes.json() : null;
  if (!course || course.message) { document.body.innerHTML = "Khóa học không tồn tại"; return; }

  const lessonsRaw = lessonsRes.ok ? await lessonsRes.json() : [];
  const progressData = progressRes?.ok ? await progressRes.json() : [];
  const completed = progressData.map(p => String(p.lesson_id));

  const courseLessons = lessonsRaw.sort((a, b) => {
    if ((a.chapter || '') < (b.chapter || '')) return -1;
    if ((a.chapter || '') > (b.chapter || '')) return 1;
    return (Number(a.order_in_chapter) || 0) - (Number(b.order_in_chapter) || 0);
  });

  document.getElementById("courseTitle").textContent = course.title;
  document.getElementById("backBtn").href = `course-detail.html?id=${courseId}`;

  function getYouTubeEmbed(url) {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    return null;
  }

  function isYouTube(url) {
    return url && (url.includes("youtube.com") || url.includes("youtu.be"));
  }

  function updateProgress() {
    const percent = courseLessons.length > 0
      ? (completed.length / courseLessons.length) * 100 : 0;
    document.getElementById("progressFill").style.width = percent + "%";
    document.getElementById("progressText").textContent = `${completed.length}/${courseLessons.length} bài`;
  }

  async function saveProgress(lessonId) {
    if (completed.includes(String(lessonId))) return;
    if (!userId) return;
    try {
      await fetch(`${API}/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ userId, courseId, lessonId })
      });
      completed.push(String(lessonId));
      updateProgress();
      renderLessons();
    } catch (err) {
      console.error("Lỗi lưu progress:", err);
    }
  }

  function loadLesson(lesson) {
    currentLessonId = lesson.id;
    history.replaceState({}, "", `?course=${courseId}&lesson=${lesson.id}`);
    const url = lesson.video_url || lesson.videoUrl || "";

    if (isYouTube(url)) {
      const embedUrl = getYouTubeEmbed(url);
      document.getElementById("videoPlayer").innerHTML =
        `<iframe id="ytIframe" src="${embedUrl}?autoplay=1&rel=0&enablejsapi=1" allowfullscreen allow="autoplay"></iframe>`;
      setTimeout(() => {
        if (window.YT && window.YT.Player) {
          new YT.Player('ytIframe', {
            events: {
              'onStateChange': (e) => {
                if (e.data === YT.PlayerState.ENDED) saveProgress(lesson.id);
              }
            }
          });
        }
      }, 1000);
    } else if (url) {
      document.getElementById("videoPlayer").innerHTML =
        `<video id="videoTag" controls autoplay src="${url}"></video>`;
      const video = document.getElementById("videoTag");
      if (video) video.onended = () => saveProgress(lesson.id);
    } else {
      document.getElementById("videoPlayer").innerHTML =
        `<div style="color:#94a3b8;text-align:center">
          <i class="fas fa-video-slash" style="font-size:3rem;margin-bottom:12px;display:block"></i>
          Bài giảng này chưa có video
        </div>`;
    }

    renderLessons();
  }

  function renderLessons() {
    const container = document.getElementById("lessonList");
    container.innerHTML = "";
    const chapters = {};
    const chapterOrder = [];

    courseLessons.forEach(l => {
      const ch = l.chapter || "Chưa phân chương";
      if (!chapters[ch]) { chapters[ch] = []; chapterOrder.push(ch); }
      chapters[ch].push(l);
    });

    chapterOrder.forEach(ch => {
      const header = document.createElement("div");
      header.className = "chapter-header";
      header.textContent = ch;
      container.appendChild(header);

      chapters[ch].forEach((l, idx) => {
        const div = document.createElement("div");
        div.className = "lesson";
        if (String(l.id) === String(currentLessonId)) div.classList.add("active");
        if (completed.includes(String(l.id))) div.classList.add("completed");
        div.innerHTML = `
          <div class="lesson-info">
            <span class="lesson-title">Bài ${idx + 1}: ${l.title}</span>
            ${l.duration ? `<span class="lesson-duration">⏱ ${l.duration}</span>` : ''}
          </div>
          <i class="fas fa-check-circle" style="flex-shrink:0;margin-left:8px"></i>
        `;
        div.onclick = () => loadLesson(l);
        container.appendChild(div);
      });
    });
  }

  if (!currentLessonId && courseLessons.length > 0) currentLessonId = courseLessons[0].id;
  const first = courseLessons.find(l => String(l.id) === String(currentLessonId));
  if (first) loadLesson(first);

  updateProgress();
  renderLessons();

})();