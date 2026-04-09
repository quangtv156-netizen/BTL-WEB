const pool = require('../config/db');

const getLessons = (courseId) => {
  if (courseId)
    return pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY chapter, order_in_chapter', [courseId]);
  return pool.query('SELECT * FROM lessons');
};

const getLessonById = (id) =>
  pool.query('SELECT * FROM lessons WHERE id = ?', [id]);

const createLesson = (course_id, title, chapter, order_in_chapter, description, video_url, duration, status) =>
  pool.query('INSERT INTO lessons (course_id, title, chapter, order_in_chapter, description, video_url, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [course_id, title, chapter, order_in_chapter, description, video_url, duration, status || 'active']);

const updateLesson = (title, chapter, order_in_chapter, description, video_url, duration, status, id) =>
  pool.query('UPDATE lessons SET title=?, chapter=?, order_in_chapter=?, description=?, video_url=?, duration=?, status=? WHERE id=?',
    [title, chapter, order_in_chapter, description, video_url, duration, status, id]);

const deleteLesson = (id) =>
  pool.query('DELETE FROM lessons WHERE id = ?', [id]);

module.exports = { getLessons, getLessonById, createLesson, updateLesson, deleteLesson };
