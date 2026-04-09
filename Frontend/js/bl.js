if (typeof API === 'undefined') var API = 'http://localhost:3000/api';
if (typeof user === 'undefined') var user = JSON.parse(localStorage.getItem("currentUser"));
if (typeof courseId === 'undefined') var courseId = new URLSearchParams(window.location.search).get("id");

// getToken va authHeaders dung chung tu course-detail.js
// khong khai bao lai o day

// ==============================
// AVATAR USER
// ==============================
function setAvatar(el) {
  if (!el) return;
  if (user?.avatar) {
    el.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
  } else {
    el.textContent = user?.name ? user.name.charAt(0).toUpperCase() : "?";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setAvatar(document.getElementById("userAvatarComment"));
  setAvatar(document.getElementById("userAvatarReview"));
});

// ==============================
// BINH LUAN
// ==============================
const commentForm  = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");
const commentList  = document.getElementById("commentList");

async function renderComments() {
  if (!commentList) return;
  try {
    const res = await fetch(`${API}/comments?courseId=${courseId}`);
    const arr = res.ok ? await res.json() : [];
    const roots = arr.filter(c => !c.parent_id);

    if (roots.length === 0) {
      commentList.innerHTML = "<p style='color:#6b7280;margin-top:12px'>Chua co binh luan nao.</p>";
      return;
    }

    commentList.innerHTML = roots.map((c, idx) => {
      const isOwner = user && String(c.user_id) === String(user.id);
      const isOther = user && !isOwner;
      const replies = arr.filter(r => String(r.parent_id) === String(c.id));

      const repliesHtml = replies.map((r, rIdx) => {
        const isReplyOwner = user && String(r.user_id) === String(user.id);
        return `
        <div class="reply-item" style="display:flex;gap:12px;padding:12px 14px;margin-top:10px;background:#f0f7ff;border-radius:10px;border-left:3px solid #3b82f6;">
          <div style="width:32px;height:32px;border-radius:50%;background:#6366f1;color:#fff;font-weight:700;font-size:12px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">${r.userName ? r.userName.charAt(0).toUpperCase() : "?"}</div>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">
              <span style="font-weight:600;color:#1f2937;font-size:14px;">${r.userName || "An danh"}</span>
              <span style="color:#9ca3af;font-size:12px;">${new Date(r.created_at).toLocaleString('vi-VN')}</span>
            </div>
            <div id="rtext-${c.id}-${rIdx}" style="color:#374151;font-size:14px;line-height:1.5;">${r.text.replace(/\n/g,"<br>")}</div>
            ${isReplyOwner ? `
            <div style="margin-top:6px;display:flex;gap:6px;">
              <button onclick="editReply('${c.id}',${rIdx},${r.id})" style="font-size:12px;padding:3px 8px;border:1px solid #3b82f6;color:#3b82f6;border-radius:5px;cursor:pointer;background:#fff"><i class="fas fa-pen"></i></button>
              <button onclick="deleteReply(${r.id})" style="font-size:12px;padding:3px 8px;border:1px solid #ef4444;color:#ef4444;border-radius:5px;cursor:pointer;background:#fff"><i class="fas fa-trash"></i></button>
            </div>` : ''}
          </div>
        </div>`;
      }).join("");

      return `
      <div class="comment-item" data-id="${c.id}">
        <div class="avatar">${c.userName ? c.userName.charAt(0).toUpperCase() : "?"}</div>
        <div class="comment-content" style="flex:1">
          <div class="comment-header">
            <span class="name">${c.userName || "An danh"}</span>
            <span class="date">${new Date(c.created_at).toLocaleString('vi-VN')}</span>
          </div>
          <div class="comment-text" id="ctext-${idx}">${c.text.replace(/\n/g, "<br>")}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
            ${isOther ? `<button onclick="toggleReplyBox(${c.id})" style="font-size:13px;padding:4px 10px;border:1px solid #10b981;color:#10b981;border-radius:6px;cursor:pointer;background:#fff;display:flex;align-items:center;gap:5px;"><i class="fas fa-reply"></i> Phan hoi</button>` : ''}
            ${isOwner ? `
            <button onclick="editComment(${idx},${c.id})" style="font-size:13px;padding:4px 8px;border:1px solid #3b82f6;color:#3b82f6;border-radius:6px;cursor:pointer;background:#fff"><i class="fas fa-pen"></i></button>
            <button onclick="deleteComment(${c.id})" style="font-size:13px;padding:4px 8px;border:1px solid #ef4444;color:#ef4444;border-radius:6px;cursor:pointer;background:#fff"><i class="fas fa-trash"></i></button>` : ''}
          </div>
          ${isOther ? `
          <div id="replyBox-${c.id}" style="display:none;margin-top:12px;">
            <textarea id="replyInput-${c.id}" placeholder="Phan hoi ${c.userName}..." rows="2" style="width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;"></textarea>
            <div style="margin-top:6px;display:flex;gap:8px;">
              <button onclick="submitReply(${c.id})" style="font-size:13px;padding:5px 14px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Gui</button>
              <button onclick="toggleReplyBox(${c.id})" style="font-size:13px;padding:5px 10px;border:1px solid #9ca3af;color:#6b7280;border-radius:6px;cursor:pointer;background:#fff;">Huy</button>
            </div>
          </div>` : ''}
          <div id="replies-${c.id}">${repliesHtml}</div>
        </div>
      </div>`;
    }).join("");
  } catch (err) {
    console.error("Loi load comments:", err);
  }
}

function toggleReplyBox(commentId) {
  const box = document.getElementById(`replyBox-${commentId}`);
  if (!box) return;
  const isHidden = box.style.display === 'none';
  box.style.display = isHidden ? 'block' : 'none';
  if (isHidden) document.getElementById(`replyInput-${commentId}`)?.focus();
}

async function submitReply(parentId) {
  if (!user) return alert("Vui long dang nhap!");
  const ta = document.getElementById(`replyInput-${parentId}`);
  const text = ta ? ta.value.trim() : "";
  if (!text) return alert("Vui long nhap noi dung!");
  await fetch(`${API}/comments`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ courseId, userId: user.id, text, parentId })
  });
  await renderComments();
}

function editComment(idx, commentId) {
  const textEl = document.getElementById(`ctext-${idx}`);
  if (!textEl) return;
  const currentText = textEl.innerText;
  textEl.innerHTML = `
    <textarea id="editInput-${idx}" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;">${currentText}</textarea>
    <div style="margin-top:8px;display:flex;gap:8px">
      <button onclick="saveEdit(${idx},${commentId})" style="font-size:12px;padding:4px 12px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer">Luu</button>
      <button onclick="renderComments()" style="font-size:12px;padding:4px 10px;border:1px solid #6b7280;color:#6b7280;border-radius:6px;cursor:pointer;background:#fff">Huy</button>
    </div>`;
}

async function saveEdit(idx, commentId) {
  const newText = document.getElementById(`editInput-${idx}`)?.value.trim();
  if (!newText) return alert("Noi dung khong duoc trong!");
  await fetch(`${API}/comments/${commentId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ text: newText })
  });
  await renderComments();
}

async function deleteComment(commentId) {
  if (!confirm("Xoa binh luan nay?")) return;
  await fetch(`${API}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  await renderComments();
}

function editReply(parentId, rIdx, replyId) {
  const textEl = document.getElementById(`rtext-${parentId}-${rIdx}`);
  if (!textEl) return;
  const currentText = textEl.innerText;
  textEl.innerHTML = `
    <textarea id="replyEditInput-${replyId}" style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;resize:vertical;box-sizing:border-box;">${currentText}</textarea>
    <div style="margin-top:6px;display:flex;gap:8px;">
      <button onclick="saveReplyEdit(${replyId})" style="font-size:12px;padding:4px 12px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;">Luu</button>
      <button onclick="renderComments()" style="font-size:12px;padding:4px 10px;border:1px solid #6b7280;color:#6b7280;border-radius:6px;cursor:pointer;background:#fff;">Huy</button>
    </div>`;
}

async function saveReplyEdit(replyId) {
  const newText = document.getElementById(`replyEditInput-${replyId}`)?.value.trim();
  if (!newText) return alert("Noi dung khong duoc trong!");
  await fetch(`${API}/comments/${replyId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ text: newText })
  });
  await renderComments();
}

async function deleteReply(replyId) {
  if (!confirm("Xoa phan hoi nay?")) return;
  await fetch(`${API}/comments/${replyId}`, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  await renderComments();
}

if (commentForm) {
  commentForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!user) return alert("Vui long dang nhap!");
    const text = commentInput.value.trim();
    if (!text) return alert("Vui long nhap noi dung!");
    await fetch(`${API}/comments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ courseId, userId: user.id, text })
    });
    commentInput.value = "";
    await renderComments();
  });
}

// ==============================
// DANH GIA
// ==============================
const reviewForm           = document.getElementById("reviewForm");
const reviewList           = document.getElementById("reviewList");
const reviewStarsContainer = document.getElementById("reviewStars");
const reviewSummary        = document.getElementById("reviewSummary");

let selectedRating = 0;

document.addEventListener("DOMContentLoaded", () => {
  if (reviewStarsContainer) {
    const stars = reviewStarsContainer.querySelectorAll("i");
    function updateReviewStars(val) {
      stars.forEach((s, i) => { s.style.color = i < val ? "#fbbf24" : "#d1d5db"; });
    }
    stars.forEach(star => {
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.value);
        updateReviewStars(selectedRating);
      });
      star.addEventListener("mouseover", () => updateReviewStars(parseInt(star.dataset.value)));
      star.addEventListener("mouseout",  () => updateReviewStars(selectedRating));
    });
    updateReviewStars(0);
  }
});

async function loadReviews() {
  try {
    const res = await fetch(`${API}/reviews?courseId=${courseId}`);
    const list = res.ok ? await res.json() : [];

    if (reviewSummary) {
      if (list.length === 0) {
        reviewSummary.innerHTML = "";
      } else {
        const avg = (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1);
        const filled = Math.round(avg);
        reviewSummary.innerHTML = `
          <div class="review-summary-box">
            <span class="review-avg">${avg}</span>
            <span style="font-size:1.6rem">
              <span style="color:#fbbf24">${"★".repeat(filled)}</span>
              <span style="color:#d1d5db">${"★".repeat(5-filled)}</span>
            </span>
            <span class="review-count">(${list.length} danh gia)</span>
          </div>`;
        const ratingEl = document.getElementById("rating");
        if (ratingEl) ratingEl.textContent = avg;
      }
    }

    if (reviewList) {
      reviewList.innerHTML = list.map(r => `
        <div class="comment-item">
          <div class="avatar" style="background:#f59e0b">${r.userName ? r.userName.charAt(0).toUpperCase() : "?"}</div>
          <div class="comment-content" style="flex:1">
            <div class="comment-header">
              <span class="name">${r.userName || "An danh"}</span>
              <span class="date">${new Date(r.created_at).toLocaleString('vi-VN')}</span>
            </div>
            <div style="margin:4px 0">
              <span style="color:#fbbf24;font-size:1.2rem">${"★".repeat(r.rating)}</span>
              <span style="color:#d1d5db;font-size:1.2rem">${"★".repeat(5-r.rating)}</span>
            </div>
          </div>
        </div>`).join("");
    }

    if (reviewForm) {
      const hasReviewed = user && list.some(r => String(r.user_id) === String(user.id));
      if (hasReviewed) {
        reviewForm.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0;color:#15803d;font-weight:500;">
            <i class="fas fa-check-circle" style="color:#22c55e;font-size:1.4rem"></i>
            <span>Ban da danh gia khoa hoc nay roi.</span>
          </div>`;
      }
    }
  } catch (err) {
    console.error("Loi load reviews:", err);
  }
}

if (reviewForm) {
  reviewForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!user) return alert("Vui long dang nhap!");
    if (selectedRating === 0) return alert("Vui long chon so sao!");
    await fetch(`${API}/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ courseId, userId: user.id, rating: selectedRating })
    });
    selectedRating = 0;
    await loadReviews();
  });
}

renderComments();
loadReviews();