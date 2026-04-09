// init.js

function initAppData() {
  if (!localStorage.getItem("users")) {
    const defaultUsers = [
      {
        id: 1,
        email: "gv1@learnhub.vn",
        password: "123456",
        name: "Giảng viên A",
        role: "instructor",
        enrolled: [],
        favorites: [],
        progress: {},
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        email: "hv1@learnhub.vn",
        password: "123456",
        name: "Học viên B",
        role: "student",
        enrolled: [1],
        favorites: [],
        progress: { "1": 48 },
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem("users", JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem("courses")) {
    const courses = [
      {
        id: 1,
        title: "Lập trình Web Frontend với React",
        instructor: "Giảng viên A",
        level: "medium",
        rating: 4.8,
        students: 1234
      }
    ];

    localStorage.setItem("courses", JSON.stringify(courses));
  }
}

window.addEventListener("load", initAppData);