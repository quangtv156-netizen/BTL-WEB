// settings.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

let user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) location.href = "login.html";

async function calcAvgProgress(enrolled) {
  if (!enrolled.length) return 0;
  const progressRes = await fetch(`${API}/progress?userId=${user.id}`, { headers: authHeader() });
  const progressAll = progressRes.ok ? await progressRes.json() : [];

  let total = 0;
  await Promise.all(enrolled.map(async e => {
    const lessonsRes = await fetch(`${API}/lessons?courseId=${e.course_id}`);
    const lessons    = lessonsRes.ok ? await lessonsRes.json() : [];
    const done       = progressAll.filter(p => String(p.course_id) === String(e.course_id)).length;
    const pct        = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
    total += pct;
  }));
  return Math.round(total / enrolled.length);
}

async function init() {
  try {
    const [enrolledRes, favRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${user.id}`, { headers: authHeader() }),
      fetch(`${API}/favorites?userId=${user.id}`, { headers: authHeader() })
    ]);
    const enrolled  = enrolledRes.ok ? await enrolledRes.json() : [];
    const favorites = favRes.ok      ? await favRes.json()      : [];
    const avg = await calcAvgProgress(enrolled);
    loadUser(enrolled.length, favorites.length, avg);
  } catch (err) {
    console.error("Lỗi load settings:", err);
    loadUser(0, 0, 0);
  }
}

function loadUser(courseCount, favCount, avg) {
  if (user.avatar) {
    const html = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%">`;
    document.getElementById("navAvatar").innerHTML = html;
    document.getElementById("bigAvatar").innerHTML = html;
  } else {
    const f = user.name.charAt(0).toUpperCase();
    document.getElementById("navAvatar").innerText = f;
    document.getElementById("bigAvatar").innerText = f;
  }
  document.getElementById("sideName").innerText        = user.name;
  document.getElementById("dropName").innerText        = user.name;
  document.getElementById("dropEmail").innerText       = user.email;
  document.getElementById("courseCount").innerText     = courseCount;
  document.getElementById("favoriteCount").innerText   = favCount;
  document.getElementById("completePercent").innerText = avg + "%";
  document.getElementById("menuCount").innerText       = courseCount;
  document.getElementById("dropCount").innerText       = courseCount;
}

async function changePassword() {
  const oldP     = document.getElementById("oldPass").value;
  const newP     = document.getElementById("newPass").value;
  const confirmP = document.getElementById("confirmPass").value;

  if (newP.length < 6)   return alert("Mật khẩu mới tối thiểu 6 ký tự!");
  if (newP !== confirmP) return alert("Mật khẩu xác nhận không khớp!");

  try {
    const res = await fetch(`${API}/users/${user.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ oldPassword: oldP, newPassword: newP })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message || "Đổi mật khẩu thất bại!");
    alert("Đổi mật khẩu thành công!");
    document.getElementById("oldPass").value     = "";
    document.getElementById("newPass").value     = "";
    document.getElementById("confirmPass").value = "";
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

function loadSettings() {
  const darkMode = localStorage.getItem("darkMode") === "true";
  document.getElementById("darkToggle").checked = darkMode;
  document.body.classList.toggle("dark", darkMode);
}

document.getElementById("darkToggle").onchange = e => {
  localStorage.setItem("darkMode", e.target.checked);
  document.body.classList.toggle("dark", e.target.checked);
};

async function deleteAccount() {
  if (!confirm("Bạn chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!")) return;
  try {
    await fetch(`${API}/users/${user.id}`, {
      method: 'DELETE',
      headers: authHeader()
    });
    localStorage.removeItem("currentUser");
    location.href = "index.html";
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

document.querySelectorAll(".dropdown-item[data-link]").forEach(item => {
  item.addEventListener("click", () => { location.href = item.dataset.link; });
});

function toggleDropdown() { document.getElementById("dropdown").classList.toggle("show"); }

document.addEventListener("click", e => {
  const nav = document.getElementById("navAvatar");
  const dd  = document.getElementById("dropdown");
  if (!nav?.contains(e.target) && !dd?.contains(e.target)) dd?.classList.remove("show");
});

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}

window.onload = function () {
  init();
  loadSettings();
};