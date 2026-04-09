const pool = require('../config/db');

const getAllUsers = () =>
  pool.query('SELECT id, name, email, role, phone, bio, city, avatar, status, join_date, job, birthday FROM users');

const getUserById = (id) =>
  pool.query('SELECT id, name, email, role, phone, bio, city, avatar, status, join_date, job, birthday FROM users WHERE id = ?', [id]);

const getUserByEmail = (email) =>
  pool.query('SELECT * FROM users WHERE email = ?', [email]);

const createUser = (name, email, hashedPassword, role) =>
  pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);

const updateUser = (fields, values) =>
  pool.query(`UPDATE users SET ${fields} WHERE id=?`, values);

const updatePassword = (id, hashed) =>
  pool.query('UPDATE users SET password=? WHERE id=?', [hashed, id]);

const deleteUser = async (id) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM progress WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM favorites WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM enrolled_courses WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM reviews WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM comments WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM activity_log WHERE user_id = ?', [id]);
    await conn.query('DELETE FROM users WHERE id = ?', [id]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = { getAllUsers, getUserById, getUserByEmail, createUser, updateUser, updatePassword, deleteUser };
