const pool = require('../config/db');

const getAllCourses = () =>
  pool.query(`SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id ORDER BY c.created_at DESC`);

const getCourseById = (id) =>
  pool.query(`SELECT c.*, u.name as instructor_name FROM courses c LEFT JOIN users u ON c.instructor_id = u.id WHERE c.id = ?`, [id]);

const createCourse = (title, code, category, level, description, short_desc, thumbnail, instructor_id, published) =>
  pool.query('INSERT INTO courses (title, code, category, level, description, short_desc, thumbnail, instructor_id, published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, code, category, level, description, short_desc, thumbnail, instructor_id, published]);

const updateCourse = (title, code, category, level, description, short_desc, thumbnail, published, id) =>
  pool.query('UPDATE courses SET title=?, code=?, category=?, level=?, description=?, short_desc=?, thumbnail=?, published=? WHERE id=?',
    [title, code, category, level, description, short_desc, thumbnail, published, id]);

const deleteCourse = (id) =>
  pool.query('DELETE FROM courses WHERE id = ?', [id]);

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };

const deleteCourseWithRelated = async (id) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM progress WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM favorites WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM enrolled_courses WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM reviews WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM comments WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM lessons WHERE course_id = ?', [id]);
    await conn.query('DELETE FROM courses WHERE id = ?', [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { ...module.exports, deleteCourseWithRelated };
