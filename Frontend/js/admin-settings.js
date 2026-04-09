// admin-settings.js

let user;

document.addEventListener("DOMContentLoaded", async function() {
  user = checkAuth();
  if (user) {
    const stats = await getStats(user.id);
    loadSidebar(user, stats);
    initDropdown();
    loadSettings();
  }
});

/* ================================
   ĐỔI MẬT KHẨU
================================ */
async function changePassword() {
  const oldP     = document.getElementById("oldPass").value;
  const newP     = document.getElementById("newPass").value;
  const confirmP = document.getElementById("confirmPass").value;

  if (newP.length < 6)    return alert("Tối thiểu 6 ký tự!");
  if (newP !== confirmP)  return alert("Mật khẩu không khớp!");

  try {
    const res = await fetch(`${API}/users/${user.id}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: oldP, newPassword: newP })
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

/* ================================
   CÀI ĐẶT (giữ localStorage vì chỉ là UI preference)
================================ */
function saveSetting(key, val) {
  const s = JSON.parse(localStorage.getItem("settings") || "{}");
  s[key] = val;
  localStorage.setItem("settings", JSON.stringify(s));
}

function loadSettings() {
  const s = JSON.parse(localStorage.getItem("settings") || "{}");
  document.getElementById("darkToggle").checked = s.darkMode ?? false;
  document.body.classList.toggle("dark", s.darkMode ?? false);
}

document.getElementById("darkToggle").onchange = e => {
  saveSetting("darkMode", e.target.checked);
  document.body.classList.toggle("dark", e.target.checked);
};

/* ================================
   XÓA TÀI KHOẢN
================================ */
async function deleteAccount() {
  if (!confirm("Bạn chắc chắn muốn xóa tài khoản?")) return;
  try {
    await fetch(`${API}/users/${user.id}`, { method: 'DELETE' });
    localStorage.removeItem("currentUser");
    location.href = "../index.html";
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}