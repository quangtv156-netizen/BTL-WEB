document.addEventListener("DOMContentLoaded", function () {

  function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
  }

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
  }

  const user = getCurrentUser();

  const authButtons = document.getElementById("authButtons");
  const userMenu = document.getElementById("userMenu");
  const avatar = document.getElementById("userAvatar");
  const dropdown = document.getElementById("profileDropdown");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!authButtons || !userMenu) return; // tránh crash

  if (user) {
    authButtons.style.display = "none";
    userMenu.style.display = "flex";

    if (avatar) {
      const firstLetter = user.name.trim().charAt(0).toUpperCase();
      avatar.textContent = firstLetter;
      avatar.style.background = stringToColor(user.name);
    }

    if (document.getElementById("profileName"))
      document.getElementById("profileName").textContent = user.name;

    if (document.getElementById("profileEmail"))
      document.getElementById("profileEmail").textContent = user.email;

  } else {
    authButtons.style.display = "flex";
    userMenu.style.display = "none";
  }

  if (avatar && dropdown) {
    avatar.addEventListener("click", function () {
      dropdown.classList.toggle("active");
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

});