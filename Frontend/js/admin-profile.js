// admin-profile.js
// getToken va authHeaders lay tu admin-common.js

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + getToken()
});

let user;

document.addEventListener("DOMContentLoaded", async function() {
  user = checkAuth();
  if (user) {
    const stats = await getStats(user.id);
    loadSidebar(user, stats);

    const roleLabel = user.role === 'instructor' ? 'Giang vien' : 'Hoc vien';
    if (document.getElementById("sideRole")) document.getElementById("sideRole").innerText = roleLabel;
    if (document.getElementById("roleText"))  document.getElementById("roleText").innerText  = roleLabel;

    initDropdown();
    await loadForm();

    document.getElementById("learnedCount").innerText = stats.learnedCount + " khoa";
    document.getElementById("joinDate").innerText = user.join_date
      ? new Date(user.join_date).toLocaleDateString("vi-VN") : "";
  }

  document.getElementById("avatarInput").addEventListener("change", async function() {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      user.avatar = e.target.result;
      await saveAvatarToDB(user.avatar);
      const stats = await getStats(user.id);
      loadSidebar(user, stats);
      const roleLabel = user.role === 'instructor' ? 'Giang vien' : 'Hoc vien';
      if (document.getElementById("sideRole")) document.getElementById("sideRole").innerText = roleLabel;
    };
    reader.readAsDataURL(file);
  });
});

async function loadForm() {
  try {
    const res = await fetch(API + '/users/' + user.id, {
      headers: { 'Authorization': 'Bearer ' + getToken() }
    });
    const data = await res.json();
    user = { ...user, ...data };
    localStorage.setItem("currentUser", JSON.stringify(user));

    document.getElementById("fullName").value = data.name     || "";
    document.getElementById("email").value    = data.email    || "";
    document.getElementById("phone").value    = data.phone    || "";
    document.getElementById("city").value     = data.city     || "";
    document.getElementById("job").value      = data.job      || "";
    document.getElementById("bio").value      = data.bio      || "";
    document.getElementById("birthday").value = data.birthday || "";
  } catch (err) {
    console.error("Loi load profile:", err);
  }
}

function changeAvatar() {
  document.getElementById("avatarInput").click();
}

async function saveAvatarToDB(avatar) {
  await fetch(API + '/users/' + user.id, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ avatar })
  });
}

async function saveProfile() {
  const body = {
    name:     document.getElementById("fullName").value.trim(),
    phone:    document.getElementById("phone").value.trim(),
    city:     document.getElementById("city").value.trim(),
    job:      document.getElementById("job").value.trim(),
    bio:      document.getElementById("bio").value.trim(),
    birthday: document.getElementById("birthday").value,
    avatar:   user.avatar || ""
  };

  try {
    await fetch(API + '/users/' + user.id, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    user = { ...user, ...body };
    localStorage.setItem("currentUser", JSON.stringify(user));
    const stats = await getStats(user.id);
    loadSidebar(user, stats);
    const roleLabel = user.role === 'instructor' ? 'Giang vien' : 'Hoc vien';
    if (document.getElementById("sideRole")) document.getElementById("sideRole").innerText = roleLabel;
    alert("Da luu thay doi!");
  } catch (err) {
    alert("Loi ket noi server!");
  }
}