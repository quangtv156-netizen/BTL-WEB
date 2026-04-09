// manage-users.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const userAvatar      = document.getElementById("userAvatar");
const profileDropdown = document.getElementById("profileDropdown");

userAvatar?.addEventListener("click", (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle("show-dropdown");
});
document.addEventListener("click", () => profileDropdown?.classList.remove("show-dropdown"));
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  location.href = "login.html";
});

(function checkAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;
  document.getElementById("authButtons").style.display = "none";
  document.getElementById("userMenu").style.display    = "flex";
  document.getElementById("profileName").textContent   = user.name;
  document.getElementById("profileEmail").textContent  = user.email;
  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
    : user.name.charAt(0).toUpperCase();
  document.getElementById("userAvatar").innerHTML     = avatarHtml;
  document.getElementById("dropdownAvatar").innerHTML = avatarHtml;
})();

const tableBody   = document.getElementById("userTableBody");
const searchInput = document.getElementById("searchInput");
let currentRoleFilter = 'all';
let allUsers    = [];
let allEnrolled = [];

async function loadUsers() {
  try {
    const [usersRes, enrolledRes] = await Promise.all([
      fetch(`${API}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } }),
      fetch(`${API}/enrolled`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
    ]);
    allUsers    = usersRes.ok    ? await usersRes.json()    : [];
    allEnrolled = enrolledRes.ok ? await enrolledRes.json() : [];
    renderUsers(getFilteredUsers());
  } catch (err) {
    console.error("Lỗi load users:", err);
  }
}

function getFilteredUsers() {
  const keyword = searchInput?.value.toLowerCase() || '';
  let users = [...allUsers];
  if (currentRoleFilter === 'instructor') users = users.filter(u => u.role === 'instructor');
  else if (currentRoleFilter === 'student') users = users.filter(u => u.role === 'student');
  if (keyword) users = users.filter(u =>
    u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
  );
  return users;
}

function setRoleFilter(role, btn) {
  currentRoleFilter = role;
  document.querySelectorAll('.role-filter button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderUsers(getFilteredUsers());
}

function renderUsers(users) {
  if (!users.length) {
    tableBody.innerHTML = "<tr><td colspan='8' style='text-align:center;padding:20px'>Không có người dùng</td></tr>";
    return;
  }

  tableBody.innerHTML = users.map(user => {
    const roleText    = user.role === "instructor" ? "Giảng viên" : "Học viên";
    const roleClass   = user.role === "instructor" ? "role-instructor" : "role-student";
    const statusText  = user.status === "blocked" ? "Blocked" : "Active";
    const statusClass = user.status === "blocked" ? "status-blocked" : "status-active";
    const courseCount = allEnrolled.filter(e => String(e.user_id) === String(user.id)).length;
    const avatarHtml  = user.avatar
      ? `<img src="${user.avatar}" class="avatar-img">`
      : `<div class="avatar-initials">${user.name ? user.name.charAt(0).toUpperCase() : '?'}</div>`;

    return `
      <tr>
        <td>${avatarHtml}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="badge ${roleClass}">${roleText}</span></td>
        <td>${courseCount}</td>
        <td><span class="badge ${statusClass}">${statusText}</span></td>
        <td>${user.join_date ? new Date(user.join_date).toLocaleDateString('vi-VN') : '—'}</td>
        <td class="action-btns">
          <i class="fas fa-eye"   onclick="viewUser(${user.id})"   title="Xem thông tin"></i>
          <i class="fas fa-pen"   onclick="editUser(${user.id})"   title="Chỉnh sửa"></i>
          <i class="fas fa-trash" onclick="deleteUser(${user.id})" title="Xóa"></i>
        </td>
      </tr>`;
  }).join('');
}

function viewUser(id) {
  const user = allUsers.find(u => Number(u.id) === Number(id));
  if (!user) return;

  const myCourses = allEnrolled.filter(e => String(e.user_id) === String(id));

  const frame = document.getElementById("viewAvatarFrame");
  frame.innerHTML = user.avatar
    ? `<img src="${user.avatar}" class="view-avatar-large">`
    : `<div class="view-avatar-initials">${user.name.charAt(0).toUpperCase()}</div>`;

  document.getElementById("viewName").textContent        = user.name;
  document.getElementById("viewEmail").textContent       = user.email;
  document.getElementById("viewRole").textContent        = user.role === "instructor" ? "Giảng viên" : "Học viên";
  document.getElementById("viewStatus").textContent      = user.status === "blocked" ? "Blocked" : "Active";
  document.getElementById("viewCreatedAt").textContent   = user.join_date ? new Date(user.join_date).toLocaleDateString('vi-VN') : '—';
  document.getElementById("viewCourseCount").textContent = myCourses.length + ' khóa';

  document.getElementById("viewCourseList").innerHTML = myCourses.length
    ? myCourses.map(e => `<span class="course-chip">${e.title || '—'}</span>`).join('')
    : '<span style="color:#888">Chưa đăng ký</span>';

  document.getElementById("viewModal").classList.add("show");
}

function editUser(id) {
  const user = allUsers.find(u => Number(u.id) === Number(id));
  if (!user) return;
  document.getElementById("editUserId").value = user.id;
  document.getElementById("editName").value   = user.name;
  document.getElementById("editEmail").value  = user.email;
  document.getElementById("editRole").value   = user.role   || 'student';
  document.getElementById("editStatus").value = user.status || 'active';
  document.getElementById("editModal").classList.add("show");
}

async function saveEdit() {
  const id   = document.getElementById("editUserId").value;
  const body = {
    name:   document.getElementById("editName").value,
    email:  document.getElementById("editEmail").value,
    role:   document.getElementById("editRole").value,
    status: document.getElementById("editStatus").value
  };
  try {
    await fetch(`${API}/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    closeModal("editModal");
    await loadUsers();
  } catch (err) {
    alert("Lỗi kết nối server!");
  }
}

async function deleteUser(id) {
  if (!confirm("Xác nhận xóa?")) return;
  await fetch(`${API}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  await loadUsers();
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
}

searchInput?.addEventListener("input", () => renderUsers(getFilteredUsers()));
loadUsers();