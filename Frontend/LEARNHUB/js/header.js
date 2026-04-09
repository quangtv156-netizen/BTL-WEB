// header.js - Xử lý header / dropdown / logout

document.addEventListener("DOMContentLoaded", function () {

  const authButtons    = document.getElementById("authButtons");
  const userMenu       = document.getElementById("userMenu");
  const userAvatar     = document.getElementById("userAvatar");
  const dropdown       = document.getElementById("profileDropdown");
  const dropdownAvatar = document.getElementById("dropdownAvatar");
  const profileName    = document.getElementById("profileName");
  const profileEmail   = document.getElementById("profileEmail");
  const logoutBtn      = document.getElementById("logoutBtn");
  const currentUser    = JSON.parse(localStorage.getItem("currentUser"));

  /* === 1. Đã đăng nhập === */
  if (currentUser) {
    if (authButtons) authButtons.style.display = "none";
    if (userMenu)    userMenu.style.display = "flex";

    const firstLetter = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U";

    if (currentUser.avatar) {
      const avatarHtml = `<img src="${currentUser.avatar}" style="width:100%;height:100%;border-radius:50%">`;
      if (userAvatar)     userAvatar.innerHTML     = avatarHtml;
      if (dropdownAvatar) dropdownAvatar.innerHTML = avatarHtml;
    } else {
      if (userAvatar)     userAvatar.textContent     = firstLetter;
      if (dropdownAvatar) dropdownAvatar.textContent = firstLetter;
    }

    if (profileName)  profileName.textContent  = currentUser.name  || "User";
    if (profileEmail) profileEmail.textContent = currentUser.email || "";
  }

  /* === 2. Highlight active nav link === */
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-menu a").forEach(link => {
    const linkPage = link.getAttribute("href")?.split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* === 3. Toggle dropdown === */
  if (userAvatar && dropdown) {
    userAvatar.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });
  }

  /* === 4. Click ngoài để đóng === */
  document.addEventListener("click", function (e) {
    if (userMenu && !userMenu.contains(e.target) && dropdown) {
      dropdown.classList.remove("show");
    }
  });

  /* === 5. Logout — tự tìm đường về html/index.html === */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      const path    = window.location.pathname;
      const htmlIdx = path.indexOf("/html/");
      window.location.href = htmlIdx !== -1
        ? path.substring(0, htmlIdx) + "/html/index.html"
        : "/";
    });
  }

});