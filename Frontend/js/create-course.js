// create-course.js
const API = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

async function logActivity(userId, action, target = '') {
  try {
    await fetch(`${API}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action, target })
    });
  } catch (err) {
    console.error("Lỗi ghi log:", err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (!user || user.role !== 'instructor') {
    location.href = 'index.html';
    return;
  }

  const form = document.getElementById('courseForm');
  if (!form) return;

  let publishedState = false;
  const publishedBtn = document.getElementById('publishedBtn');

  if (publishedBtn) {
    publishedBtn.addEventListener('click', () => {
      publishedState = !publishedState;
      publishedBtn.classList.toggle('active', publishedState);
    });
  }

  const fullName = user.name || user.email || 'Giảng viên';
  document.getElementById('instructorName').value = fullName;
  const avatarEl = document.getElementById('gvAvatarIcon');
  avatarEl.textContent = fullName.charAt(0).toUpperCase();
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626'];
  avatarEl.style.background = colors[fullName.charCodeAt(0) % colors.length];

  const fileInput = document.getElementById('fileInput');
  const preview   = document.getElementById('preview');
  fileInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => { preview.src = e.target.result; };
      reader.readAsDataURL(file);
    }
  });

  // ✅ Đọc id từ URL thay vì localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get('id') || localStorage.getItem('editCourseId');

  if (editId) {
    try {
      const res = await fetch(`${API}/courses/${editId}`);
      const course = await res.json();
      if (course && !course.message) {
        form.title.value       = course.title       || '';
        form.level.value       = course.level       || '';
        form.shortDesc.value   = course.short_desc  || '';
        form.description.value = course.description || '';

        publishedState = (course.published == 1 || course.published === true);
        if (publishedBtn) publishedBtn.classList.toggle('active', publishedState);

        if (course.thumbnail) preview.src = course.thumbnail;

        // ✅ Đổi tiêu đề sang "Chỉnh sửa khóa học"
        document.querySelector('h2').innerText = 'Chỉnh sửa khóa học';
        document.title = 'Chỉnh sửa khóa học - LearnHub';

        const categorySelect = document.getElementById('categorySelect');
        const existingOptions = Array.from(categorySelect.options).map(o => o.value);
        if (existingOptions.includes(course.category)) {
          categorySelect.value = course.category;
        } else if (course.category) {
          categorySelect.value = '__custom__';
          document.getElementById('customCategoryWrap').style.display = 'block';
          document.getElementById('customCategoryInput').value = course.category;
        }
      }
    } catch (err) {
      console.error('Lỗi load course:', err);
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const categorySelect = document.getElementById('categorySelect');
    let category = categorySelect.value;
    if (category === '__custom__') {
      category = document.getElementById('customCategoryInput').value.trim();
      if (!category) return alert('Vui lòng nhập tên danh mục!');
    }

    const body = {
      title:         form.title.value,
      category:      category,
      level:         form.level.value,
      short_desc:    form.shortDesc.value,
      description:   form.description.value,
      published:     publishedState ? 1 : 0,
      thumbnail:     preview.src || '',
      instructor_id: user.id
    };

    try {
      if (editId) {
        await fetch(`${API}/courses/${editId}`, {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify(body)
        });
        await logActivity(user.id, `${user.name} cập nhật khóa học: ${body.title}`, body.title);
        localStorage.removeItem('editCourseId');
        alert('Cập nhật thành công!');
      } else {
        await fetch(`${API}/courses`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(body)
        });
        await logActivity(user.id, `Khóa học mới: ${body.title}`, body.title);
        alert('Tạo khóa học thành công!');
      }
      window.location.href = 'manage-courses.html';
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
  });
});