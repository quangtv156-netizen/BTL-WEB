const pool = require('../config/db');

// ---- Comments ----
const getComments = (courseId) =>
  pool.query(`SELECT c.*, u.name as userName FROM comments c JOIN users u ON c.user_id = u.id WHERE c.course_id = ? ORDER BY c.created_at DESC`, [courseId]);

const createComment = (courseId, userId, text, parentId) =>
  pool.query(`INSERT INTO comments (course_id, user_id, text, parent_id) VALUES (?, ?, ?, ?)`, [courseId, userId, text, parentId || null]);

const updateComment = (text, id) =>
  pool.query(`UPDATE comments SET text = ? WHERE id = ?`, [text, id]);

const deleteComment = (id) =>
  pool.query(`DELETE FROM comments WHERE id = ? OR parent_id = ?`, [id, id]);

// ---- Reviews ----
const getReviews = (courseId) => {
  let q = `SELECT r.*, u.name as userName FROM reviews r JOIN users u ON r.user_id = u.id`;
  const params = [];
  if (courseId) { q += ' WHERE r.course_id = ?'; params.push(courseId); }
  q += ' ORDER BY r.created_at DESC';
  return pool.query(q, params);
};

const upsertReview = (courseId, userId, rating) =>
  pool.query(`INSERT INTO reviews (course_id, user_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?`, [courseId, userId, rating, rating]);

// ---- Enrolled ----
const getEnrolled = (userId, courseId) => {
  let q = `SELECT e.*, c.title, c.thumbnail, c.level, u.name as instructor_name, eu.name as name, eu.email as email
           FROM enrolled_courses e JOIN courses c ON e.course_id = c.id
           JOIN users u ON c.instructor_id = u.id JOIN users eu ON e.user_id = eu.id WHERE 1=1`;
  const params = [];
  if (userId)   { q += ' AND e.user_id = ?';   params.push(userId); }
  if (courseId) { q += ' AND e.course_id = ?'; params.push(courseId); }
  return pool.query(q, params);
};

const enroll = (userId, courseId) =>
  pool.query(`INSERT IGNORE INTO enrolled_courses (user_id, course_id) VALUES (?, ?)`, [userId, courseId]);

const unenroll = (userId, courseId) =>
  pool.query(`DELETE FROM enrolled_courses WHERE user_id = ? AND course_id = ?`, [userId, courseId]);

// ---- Favorites ----
const getFavorites = (userId, courseId) => {
  let q = `SELECT f.*, c.title, c.thumbnail, c.level, u.name as instructor_name
           FROM favorites f JOIN courses c ON f.course_id = c.id JOIN users u ON c.instructor_id = u.id WHERE 1=1`;
  const params = [];
  if (userId)   { q += ' AND f.user_id = ?';   params.push(userId); }
  if (courseId) { q += ' AND f.course_id = ?'; params.push(courseId); }
  return pool.query(q, params);
};

const addFavorite = (userId, courseId) =>
  pool.query(`INSERT IGNORE INTO favorites (user_id, course_id) VALUES (?, ?)`, [userId, courseId]);

const removeFavorite = (userId, courseId) =>
  pool.query(`DELETE FROM favorites WHERE user_id = ? AND course_id = ?`, [userId, courseId]);

// ---- Progress ----
const getProgress = (userId, courseId) => {
  let q = 'SELECT * FROM progress WHERE 1=1';
  const params = [];
  if (userId)   { q += ' AND user_id = ?';   params.push(userId); }
  if (courseId) { q += ' AND course_id = ?'; params.push(courseId); }
  return pool.query(q, params);
};

const saveProgress = (userId, courseId, lessonId) =>
  pool.query(`INSERT IGNORE INTO progress (user_id, course_id, lesson_id) VALUES (?, ?, ?)`, [userId, courseId, lessonId]);

// ---- Activity ----
const getActivity = () =>
  pool.query(`SELECT a.*, u.name as userName FROM activity_log a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.created_at DESC LIMIT 20`);

const logActivity = (userId, action, target) =>
  pool.query('INSERT INTO activity_log (user_id, action, target) VALUES (?, ?, ?)', [userId, action, target]);

module.exports = {
  getComments, createComment, updateComment, deleteComment,
  getReviews, upsertReview,
  getEnrolled, enroll, unenroll,
  getFavorites, addFavorite, removeFavorite,
  getProgress, saveProgress,
  getActivity, logActivity
};
