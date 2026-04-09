// admin-common.js - Dung chung cho html/admin/
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

function checkAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) { location.href = "../login.html"; return null; }
  return user;
}

async function getStats(userId) {
  try {
    const [enrolledRes, favRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${userId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/favorites?userId=${userId}`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);
    const enrolled  = enrolledRes.ok ? await enrolledRes.json() : [];
    const favorites = favRes.ok ? await favRes.json() : [];

    return {
      learnedCount:    enrolled.length,
      favoriteCount:   favorites.length,
      completePercent: 0,
    };
  } catch (err) {
    console.error("Lỗi getStats:", err);
    return { learnedCount: 0, favoriteCount: 0, completePercent: 0 };
  }
}

function loadSidebar(user, stats) {
  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`
    : user.name.charAt(0).toUpperCase();

  document.getElementById("navAvatar").innerHTML = avatarHtml;
  if (document.getElementById("bigAvatar"))
    document.getElementById("bigAvatar").innerHTML = avatarHtml;

  document.getElementById("sideName").innerText        = user.name;
  document.getElementById("dropName").innerText        = user.name;
  document.getElementById("dropEmail").innerText       = user.email;
  document.getElementById("courseCount").innerText     = stats.learnedCount;
  document.getElementById("favoriteCount").innerText   = stats.favoriteCount;
  document.getElementById("completePercent").innerText = stats.completePercent + "%";
  document.getElementById("menuCount").innerText       = stats.learnedCount;
  document.getElementById("dropCount").innerText       = stats.learnedCount;

  // Set role đúng - Giang vien hay Hoc vien
  const roleEl = document.getElementById("sideRole");
  if (roleEl) roleEl.innerText = user.role === 'instructor' ? 'Giảng viên' : 'Học viên';
}

function initDropdown() {
  const navAvatar = document.getElementById("navAvatar");
  const dropdown  = document.getElementById("dropdown");

  navAvatar.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", e => {
    if (!navAvatar.contains(e.target) && !dropdown.contains(e.target))
      dropdown.classList.remove("show");
  });

  document.querySelectorAll(".dropdown-item[data-link]").forEach(item => {
    item.addEventListener("click", () => location.href = item.dataset.link);
  });
}

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "../login.html";
}

function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("show");
}