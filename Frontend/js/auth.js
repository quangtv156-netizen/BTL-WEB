// auth.js - Xử lý đăng nhập / đăng xuất / header

document.addEventListener("DOMContentLoaded", function () {

  const currentUser    = JSON.parse(localStorage.getItem("currentUser"));
  const authButtons    = document.getElementById("authButtons");
  const userMenu       = document.getElementById("userMenu");
  const userAvatar     = document.getElementById("userAvatar");
  const dropdown       = document.getElementById("profileDropdown");
  const dropdownAvatar = document.getElementById("dropdownAvatar");
  const profileName    = document.getElementById("profileName");
  const profileEmail   = document.getElementById("profileEmail");
  const logoutBtn      = document.getElementById("logoutBtn");

  /* ================================
     HIỂN THỊ THÔNG TIN USER
  ================================ */
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

  /* ================================
     HIGHLIGHT ACTIVE NAV LINK
  ================================ */
  const currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-menu a").forEach(link => {
    const linkPage = link.getAttribute("href")?.split("/").pop();
    if (linkPage === currentPage) link.classList.add("active");
  });

  /* ================================
     TOGGLE DROPDOWN
  ================================ */
  if (userAvatar && dropdown) {
    userAvatar.addEventListener("click", function (e) {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });
  }

  document.addEventListener("click", function (e) {
    if (userMenu && !userMenu.contains(e.target) && dropdown) {
      dropdown.classList.remove("show");
    }
  });

  /* ================================
     LOGOUT
     Tìm thư mục gốc chứa "html/"
     trong URL hiện tại để redirect đúng
     dù đang ở html/ hay html/admin/
  ================================ */
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");

      // Lấy toàn bộ path, cắt tới trước segment "html"
      // VD: /123456789/LEARNHUB/html/admin/page.html
      //  => /123456789/LEARNHUB/html/index.html
      const path    = window.location.pathname;
      const htmlIdx = path.indexOf("/html/");

      if (htmlIdx !== -1) {
        window.location.href = path.substring(0, htmlIdx) + "/html/index.html";
      } else {
        // fallback nếu không tìm thấy /html/
        window.location.href = "/";
      }
    });
  }

});