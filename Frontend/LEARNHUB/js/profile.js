// profile.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

let user = JSON.parse(localStorage.getItem("currentUser"));
if (!user) { alert("Vui lòng đăng nhập"); location.href = "login.html"; }

async function init() {
  try {
    const [enrolledRes, favRes, progressRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${user.id}`, { headers: authHeader() }),
      fetch(`${API}/favorites?userId=${user.id}`, { headers: authHeader() }),
      fetch(`${API}/progress?userId=${user.id}`, { headers: authHeader() })
    ]);
    const enrolled    = enrolledRes.ok  ? await enrolledRes.json()  : [];
    const favorites   = favRes.ok       ? await favRes.json()       : [];
    const progressAll = progressRes.ok  ? await progressRes.json()  : [];

    let totalPct = 0;
    for (const e of enrolled) {
      const lessonsRes = await fetch(`${API}/lessons?courseId=${e.course_id}`);
      const lessons    = lessonsRes.ok ? await lessonsRes.json() : [];
      const done       = progressAll.filter(p => String(p.course_id) === String(e.course_id)).length;
      totalPct += lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
    }
    const avgProgress = enrolled.length ? Math.round(totalPct / enrolled.length) : 0;
    loadUser(enrolled.length, favorites.length, avgProgress);
  } catch (err) {
    console.error("Lỗi load profile:", err);
    loadUser(0, 0, 0);
  }
}

function loadUser(learnedCount = 0, favoriteCount = 0, completePercent = 0) {
  if (user.avatar) {
    const avatarHtml = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%">`;
    document.getElementById("navAvatar").innerHTML = avatarHtml;
    document.getElementById("bigAvatar").innerHTML = avatarHtml;
  } else {
    const first = user.name?.[0] || 'U';
    document.getElementById("navAvatar").innerText = first;
    document.getElementById("bigAvatar").innerText = first;
  }

  document.getElementById("sideName").innerText        = user.name  || '';
  document.getElementById("dropName").innerText        = user.name  || '';
  document.getElementById("dropEmail").innerText       = user.email || '';
  document.getElementById("fullName").value            = user.name  || '';
  document.getElementById("email").value               = user.email || '';
  document.getElementById("phone").value               = user.phone    || '';
  document.getElementById("city").value                = user.city     || '';
  document.getElementById("job").value                 = user.job      || '';
  document.getElementById("bio").value                 = user.bio      || '';
  document.getElementById("birthday").value            = user.birthday ? user.birthday.split('T')[0] : '';
  document.getElementById("joinDate").innerText        = user.join_date
    ? new Date(user.join_date).toLocaleDateString('vi-VN') : '';
  document.getElementById("learnedCount").innerText    = learnedCount + " khóa";
  document.getElementById("courseCount").innerText     = learnedCount;
  document.getElementById("favoriteCount").innerText   = favoriteCount;
  document.getElementById("completePercent").innerText = completePercent + "%";
  document.getElementById("menuCount").innerText       = learnedCount;
  document.getElementById("dropCount").innerText       = learnedCount;
}

function changeAvatar() {
  document.getElementById("avatarInput").click();
}

document.getElementById("avatarInput").addEventListener("change", async function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (e) {
    user.avatar = e.target.result;
    try {
      await fetch(`${API}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ avatar: user.avatar })
      });
      localStorage.setItem("currentUser", JSON.stringify(user));
      init();
    } catch (err) {
      console.error("Lỗi lưu avatar:", err);
    }
  };
  reader.readAsDataURL(file);
});

async function saveProfile() {
  const body = {
    name:     document.getElementById("fullName").value.trim(),
    phone:    document.getElementById("phone").value.trim(),
    city:     document.getElementById("city").value.trim(),
    job:      document.getElementById("job").value.trim(),
    bio:      document.getElementById("bio").value.trim(),
    birthday: document.getElementById("birthday").value || null
  };

  try {
    const res = await fetch(`${API}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(body)
    });
    if (res.ok) {
      user = { ...user, ...body };
      localStorage.setItem("currentUser", JSON.stringify(user));
      await init();
      alert("Đã lưu thay đổi!");
    } else {
      const data = await res.json();
      alert(data.message || "Lưu thất bại!");
    }
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

function toggleDropdown() {
  document.getElementById("dropdown").classList.toggle("show");
}

document.addEventListener("click", function (e) {
  const avatar = document.getElementById("navAvatar");
  const drop   = document.getElementById("dropdown");
  if (!avatar?.contains(e.target) && !drop?.contains(e.target)) {
    drop?.classList.remove("show");
  }
});

function logout() {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
}

init();