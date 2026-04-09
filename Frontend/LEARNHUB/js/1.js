const API = 'http://localhost:3000/api';

/* ===== LẤY DỮ LIỆU ===== */
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

let user = getCurrentUser();

if (!user) {
  alert("Vui lòng đăng nhập");
  location.href = "login.html";
}

/* ===== LOAD USER + STATS ===== */
async function loadUser() {
  try {
    // Lấy thông tin user mới nhất từ DB
    const res = await fetch(`${API}/users/${user.id}`);
    const data = await res.json();

    // Cập nhật lại localStorage
    user = { ...user, ...data };
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Avatar
    if (data.avatar) {
      document.getElementById("navAvatar").innerHTML =
        `<img src="${data.avatar}" style="width:100%;height:100%;border-radius:50%">`;
      document.getElementById("bigAvatar").innerHTML =
        `<img src="${data.avatar}" style="width:100%;height:100%;border-radius:50%">`;
    } else {
      document.getElementById("navAvatar").innerText = data.name[0];
      document.getElementById("bigAvatar").innerText = data.name[0];
    }

    document.getElementById("sideName").innerText = data.name;
    document.getElementById("dropName").innerText = data.name;
    document.getElementById("dropEmail").innerText = data.email;

    // Lấy số liệu enrolled + favorites song song
    const [enrolledRes, favRes] = await Promise.all([
      fetch(`${API}/enrolled?userId=${user.id}`),
      fetch(`${API}/favorites?userId=${user.id}`)
    ]);

    const enrolled = enrolledRes.ok ? await enrolledRes.json() : [];
    const favorites = favRes.ok ? await favRes.json() : [];

    const learnedCount = enrolled.length;
    const favoriteCount = favorites.length;

    // Tính progress trung bình
    const totalProgress = enrolled.reduce((sum, e) => sum + (Number(e.progress) || 0), 0);
    const completePercent = learnedCount > 0 ? Math.round(totalProgress / learnedCount) : 0;

    document.getElementById("courseCount").innerText = learnedCount;
    document.getElementById("favoriteCount").innerText = favoriteCount;
    document.getElementById("completePercent").innerText = completePercent + "%";
    document.getElementById("menuCount").innerText = learnedCount;
    document.getElementById("dropCount").innerText = learnedCount;

  } catch (err) {
    console.error("Lỗi load user:", err);
  }
}

loadUser();