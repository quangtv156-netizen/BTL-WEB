CREATE DATABASE IF NOT EXISTS learnhub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE learnhub;

--  1. USERS
CREATE TABLE IF NOT EXISTS users (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100)  NOT NULL,
  email     VARCHAR(100)  UNIQUE NOT NULL,
  password  VARCHAR(255)  NOT NULL,
  role      ENUM('student','instructor') DEFAULT 'student',
  phone     VARCHAR(20),
  bio       TEXT,
  city      VARCHAR(100),
  job       VARCHAR(100),
  birthday  DATE,
  avatar    TEXT,
  status    VARCHAR(20)   DEFAULT 'active',
  join_date DATETIME      DEFAULT CURRENT_TIMESTAMP
);

--  2. COURSES
CREATE TABLE IF NOT EXISTS courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  code          VARCHAR(50),
  category      VARCHAR(100),
  level         VARCHAR(50),
  description   TEXT,
  short_desc    TEXT,
  thumbnail     LONGTEXT,
  instructor_id INT,
  published     BOOLEAN  DEFAULT FALSE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
);

--  3. LESSONS
CREATE TABLE IF NOT EXISTS lessons (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  course_id        INT          NOT NULL,
  title            VARCHAR(255) NOT NULL,
  chapter          VARCHAR(100),
  order_in_chapter INT          DEFAULT 1,
  description      TEXT,
  video_url        TEXT,
  duration         VARCHAR(20),
  status           VARCHAR(20)  DEFAULT 'active',
  updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

--  4. ENROLLED COURSES
CREATE TABLE IF NOT EXISTS enrolled_courses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  course_id   INT NOT NULL,
  enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enroll (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

--  5. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  user_id   INT NOT NULL,
  course_id INT NOT NULL,
  UNIQUE KEY unique_fav (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

--  6. PROGRESS
CREATE TABLE IF NOT EXISTS progress (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  course_id    INT NOT NULL,
  lesson_id    INT NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_progress (user_id, lesson_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

--  7. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  course_id  INT NOT NULL,
  rating     INT CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (user_id, course_id),
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

--  8. COMMENTS
CREATE TABLE IF NOT EXISTS comments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  course_id  INT  NOT NULL,
  user_id    INT  NOT NULL,
  text       TEXT NOT NULL,
  parent_id  INT  DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

--  9. ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  action     VARCHAR(255) NOT NULL,
  target     VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);