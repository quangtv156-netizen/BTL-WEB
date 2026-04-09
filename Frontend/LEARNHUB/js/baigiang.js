// baigiang.js

document.addEventListener("DOMContentLoaded", async function () {

  const lessonList = document.getElementById("lessonList");
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id") || params.get("course");

  // Tạo modal 1 lần
  const modal = document.createElement("div");
  modal.id = "lessonModal";
  modal.style.cssText = `
    display:none; position:fixed; inset:0; z-index:9999;
    background:rgba(0,0,0,0.5); align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#fff; border-radius:16px; max-width:540px; width:90%;
                padding:32px; position:relative; box-shadow:0 20px 60px rgba(0,0,0,0.3);">
      <button id="closeModal" style="position:absolute;top:16px;right:16px;
        background:none;border:none;font-size:1.5rem;cursor:pointer;color:#6b7280;">✕</button>

      <div id="modalThumb" style="width:100%;height:180px;border-radius:10px;
        background:#e5e7eb;margin-bottom:20px;overflow:hidden;display:flex;
        align-items:center;justify-content:center;font-size:3rem;">🎬</div>

      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <span id="modalIndex" style="background:#3b82f6;color:white;padding:3px 10px;
          border-radius:20px;font-size:0.8rem;font-weight:600;"></span>
        <h2 id="modalTitle" style="margin:0;font-size:1.2rem;color:#1f2937;"></h2>
      </div>

      <div style="display:flex;gap:16px;margin:12px 0;color:#6b7280;font-size:0.9rem;">
        <span>⏱ <span id="modalDuration"></span></span>
        <span>📖 <span id="modalChapter"></span></span>
      </div>

      <p id="modalDesc" style="color:#374151;line-height:1.6;margin:12px 0 20px;
        font-size:0.95rem;border-top:1px solid #f3f4f6;padding-top:12px;"></p>

      <div style="display:flex;gap:12px;justify-content:flex-end;">
        <button id="closeModalBtn" style="padding:10px 20px;border-radius:8px;
          border:1px solid #d1d5db;background:#fff;cursor:pointer;color:#374151;
          font-weight:500;">Đóng</button>
        <button id="watchBtn" style="padding:10px 24px;border-radius:8px;
          background:#3b82f6;color:white;border:none;cursor:pointer;
          font-weight:600;font-size:1rem;">▶ Xem video</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById("closeModal").onclick =
  document.getElementById("closeModalBtn").onclick = () => modal.style.display = "none";
  modal.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

  function openModal(lesson, index) {
    document.getElementById("modalIndex").textContent    = "Bài " + (index + 1);
    document.getElementById("modalTitle").textContent    = lesson.title || "Không có tiêu đề";
    document.getElementById("modalDuration").textContent = lesson.duration || "Chưa cập nhật";
    document.getElementById("modalChapter").textContent  = lesson.chapter || "Chưa phân chương";
    document.getElementById("modalDesc").textContent     = lesson.description || lesson.desc || "Chưa có mô tả.";

    const thumbEl = document.getElementById("modalThumb");
    if (lesson.thumbnail) {
      thumbEl.innerHTML = `<img src="${lesson.thumbnail}" style="width:100%;height:100%;object-fit:cover">`;
    } else {
      thumbEl.innerHTML = "🎬";
    }

    const watchBtn = document.getElementById("watchBtn");
    if (lesson.video_url || lesson.videoUrl) {
      watchBtn.style.display = "block";
      watchBtn.onclick = () => {
        modal.style.display = "none";
        window.location.href = `learn-course.html?course=${courseId}&lesson=${lesson.id}`;
      };
    } else {
      watchBtn.style.display = "none";
    }

    modal.style.display = "flex";
  }

  async function loadLessons() {
    if (!lessonList) return;
    try {
      const res = await fetch(`${API}/lessons?courseId=${courseId}`);
      const lessons = res.ok ? await res.json() : [];

      if (lessons.length === 0) {
        lessonList.innerHTML = "<p style='color:#6b7280'>Chưa có bài giảng nào.</p>";
        return;
      }

      lessonList.innerHTML = "";
      lessons.forEach((lesson, index) => {
        const div = document.createElement("div");
        div.className = "lesson-item";
        div.style.cssText = "cursor:pointer;transition:background 0.15s;";
        div.innerHTML = `
          <div>
            <strong>Bài ${index + 1}: ${lesson.title}</strong>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">
              ⏱ ${lesson.duration || "Chưa cập nhật"}
              ${lesson.chapter ? " &nbsp;·&nbsp; 📖 " + lesson.chapter : ""}
            </p>
          </div>
          <button class="btn-outline" style="white-space:nowrap">▶ Xem</button>
        `;
        div.querySelector("button").addEventListener("click", (e) => {
          e.stopPropagation();
          openModal(lesson, index);
        });
        div.addEventListener("click", () => openModal(lesson, index));
        lessonList.appendChild(div);
      });
    } catch (err) {
      console.error("Lỗi load bài giảng:", err);
      lessonList.innerHTML = "<p style='color:red'>Lỗi tải bài giảng.</p>";
    }
  }

  loadLessons();
});