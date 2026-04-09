🎓 LearnHub — Hệ thống học trực tuyến

LearnHub là một nền tảng học trực tuyến (e-learning) cho phép học viên đăng ký, theo dõi tiến độ học tập, đánh giá khoá học; giảng viên tạo và quản lý khoá học, bài giảng; admin quản trị toàn bộ hệ thống.

📁 Cấu trúc dự án

```
learnhub/
├── Backend/     # REST API – Node.js + Express + MySql
└── Frontend/    # Frontend – HTML/CSS/JavaScript
```

---

🛠️ Tech Stack

| Phần     | Công nghệ |
|------    |-----------                                      |
| Backend  | Node.js, Express 5, MySQL 2                     |
| Frontend | HTML5, CSS3, Vanilla JavaScript                 |
| Auth     | JWT (jsonwebtoken), bcryptjs                    |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Database | MySQL                                           |

⚙️ Cài đặt & Chạy

### Yêu cầu
- Node.js >= 16
- MySQL >= 8

### Backend

```bash
cd learnhub-backend
npm install
```

Tạo file `.env` (hoặc chỉnh sửa file có sẵn):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learnhub
JWT_SECRET=your_secret_key
PORT=3000
```

Khởi động server:

```bash
node server.js
```

Server chạy tại: `http://localhost:3000`  
Swagger UI: `http://localhost:3000/api-docs`

### Frontend

Mở trực tiếp file `LEARNHUB/html/index.html` trong trình duyệt, hoặc dùng Live Server (VS Code).

> Lưu ý: Frontend kết nối tới `http://localhost:3000/api` — đảm bảo backend đang chạy trước.

🗄️ Database

Tạo database MySQL tên `learnhub`, sau đó import schema. Các bảng chính:

| Bảng               |                 Mô tả                       |
|--------------------|---------------------------------------------|
| `users`            | Tài khoản người dùng (student / instructor) |
| `courses`          | Khoá học                                    |
| `lessons`          | Bài giảng thuộc khoá học                    | 
| `enrolled_courses` | Đăng ký khoá học                            |
| `progress`         | Tiến độ học theo bài                        |
| `favorites`        | Khoá học yêu thích                          |
| `reviews`          | Đánh giá & xếp hạng                         |
| `comments`         | Bình luận bài giảng                         |
| `activity_log`     | Nhật ký hoạt động                           |

---

🔌 API Endpoints

Base URL: `http://localhost:3000/api`

| Module    | Prefix       | Mô tả              |
|--------   |--------      |-------             |
| Auth      | `/auth`      | Đăng ký, đăng nhập |
| Users     | `/users`     | Quản lý người dùng |
| Courses   | `/courses`   | Quản lý khoá học   |
| Lessons   | `/lessons`   | Quản lý bài giảng  |
| Enrolled  | `/enrolled`  | Đăng ký khoá học   |
| Progress  | `/progress`  | Theo dõi tiến độ   |
| Favorites | `/favorites` | Khoá học yêu thích |
| Reviews   | `/reviews`   | Đánh giá khoá học  |
| Comments  | `/comments`  | Bình luận          |
| Activity  | `/activity`  | Nhật ký hoạt động  |

Chi tiết đầy đủ xem tại Swagger: `http://localhost:3000/api-docs`

Xác thực

Các endpoint được bảo vệ yêu cầu header:

```
Authorization: Bearer <JWT_TOKEN>
```

Token nhận được sau khi đăng nhập thành công qua `POST /api/auth/login`.

---

👥 Phân quyền

| Role         | Quyền                                                            |
|------        |------------------------------------------------------------------|
| `student`    | Xem khoá học, đăng ký học, theo dõi tiến độ, đánh giá, bình luận |
| `instructor` | Tạo & quản lý khoá học, bài giảng của mình                       |
| `admin`      | Toàn quyền quản trị người dùng, khoá học, hệ thống               |

---

📄 Các trang Frontend

| Trang                 | Mô tả                           |
|-----------------------|---------------------------------|
| `index.html`          | Trang chủ / Dashboard           |
| `login.html`          | Đăng nhập                       |
| `courses.html`        | Danh sách khoá học              |
| `course-detail.html`  | Chi tiết khoá học               |
| `learn-course.html`   | Giao diện học bài giảng         |
| `my-courses.html`     | Khoá học của tôi                |
| `favorites.html`      | Khoá học yêu thích              |
| `progress.html`       | Tiến độ học tập                 |
| `profile.html`        | Hồ sơ cá nhân                   |
| `settings.html`       | Cài đặt tài khoản               |
| `create-course.html`  | Tạo khoá học mới (instructor)   |
| `manage-courses.html` | Quản lý khoá học (admin)        | 
| `manage-lessons.html` | Quản lý bài giảng (instructor)  |
| `manage-users.html`   | Quản lý người dùng (instructor) |
| `about.html`          | Giới thiệu                      |
| `contact.html`        | Liên hệ                         |

---

📦 Dependencies chính (Backend)

```json
{
  "express": "^5.2.1",
  "mysql2": "^3.19.1",
  "jsonwebtoken": "^9.0.3",
  "bcryptjs": "^3.0.3",
  "dotenv": "^17.3.1",
  "swagger-jsdoc": "^6.2.8",
  "swagger-ui-express": "^5.0.1",
  "cors": "^2.8.6"
}
```

---

📌 Lưu ý bảo mật

- Không commit file `.env` lên repository — thêm vào `.gitignore`
- Đổi `JWT_SECRET` thành một chuỗi ngẫu nhiên, bảo mật trước khi deploy
- Đổi mật khẩu database trước khi đưa lên môi trường production
