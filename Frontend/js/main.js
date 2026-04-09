// main.js

// ===== HELPER FUNCTIONS =====
function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser"));
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function isInstructor() {
  return getCurrentUser()?.role === "instructor";
}

function requireLogin(redirectPage = "login.html") {
  if (!isLoggedIn()) {
    alert("Vui lòng đăng nhập để tiếp tục!");
    window.location.href = redirectPage;
    return false;
  }
  return true;
}

function requireInstructor() {
  if (!requireLogin("login.html") || !isInstructor()) {
    alert("Chỉ giảng viên mới truy cập được trang này!");
    window.location.href = "courses.html";
    return false;
  }
  return true;
}

// ==========================
// NAVBAR AUTH UI
// ==========================
function initNavbar() {
  const currentUser = getCurrentUser();
  const authButtons = document.getElementById("authButtons");
  const userMenu    = document.getElementById("userMenu");
  const avatar      = document.getElementById("userAvatar");
  const dropdown    = document.getElementById("profileDropdown");
  const profileName  = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const logoutBtn   = document.getElementById("logoutBtn");

  if (!authButtons || !userMenu) return;

  if (currentUser) {
    authButtons.style.display = "none";
    userMenu.style.display    = "flex";

    if (avatar) {
      if (currentUser.avatar) {
        avatar.innerHTML = `<img src="${currentUser.avatar}" style="width:100%;height:100%;border-radius:50%">`;
      } else {
        avatar.textContent = currentUser.name?.charAt(0).toUpperCase() || "U";
      }
    }

    if (profileName)  profileName.textContent  = currentUser.name;
    if (profileEmail) profileEmail.textContent = currentUser.email;

    if (avatar && dropdown) {
      avatar.addEventListener("click", function (e) {
        e.stopPropagation();
        dropdown.classList.toggle("show");
      });
      document.addEventListener("click", function (e) {
        if (!userMenu.contains(e.target)) dropdown.classList.remove("show");
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "index.html";
      });
    }
  } else {
    authButtons.style.display = "flex";
    userMenu.style.display    = "none";
  }
}

// Chuyển trang khi click dropdown
document.querySelectorAll(".dropdown-item[data-link]").forEach(item => {
  item.addEventListener("click", () => {
    window.location.href = item.dataset.link;
  });
});

// Logout
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
});

// ==========================
// LOAD APP
// ==========================
window.addEventListener("load", function () {
  initNavbar();
});