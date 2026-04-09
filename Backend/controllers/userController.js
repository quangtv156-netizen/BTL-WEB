const bcrypt = require('bcryptjs');
const { getAllUsers, getUserById, updateUser, updatePassword, deleteUser } = require('../models/userModel');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Quản lý người dùng
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Danh sách users
 */
const getAll = async (req, res) => {
  try {
    const [rows] = await getAllUsers();
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin 1 người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin user
 *       404:
 *         description: Không tìm thấy
 */
const getOne = async (req, res) => {
  try {
    const [rows] = await getUserById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               bio:
 *                 type: string
 *               city:
 *                 type: string
 *               avatar:
 *                 type: string
 *               role:
 *                 type: string
 *               status:
 *                 type: string
 *               job:
 *                 type: string
 *               birthday:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
const update = async (req, res) => {
  try {
    const { name, phone, bio, city, avatar, role, status, job, birthday } = req.body;
    const fields = [], values = [];
    if (name     !== undefined) { fields.push('name=?');     values.push(name); }
    if (phone    !== undefined) { fields.push('phone=?');    values.push(phone); }
    if (bio      !== undefined) { fields.push('bio=?');      values.push(bio); }
    if (city     !== undefined) { fields.push('city=?');     values.push(city); }
    if (avatar   !== undefined) { fields.push('avatar=?');   values.push(avatar); }
    if (role     !== undefined) { fields.push('role=?');     values.push(role); }
    if (status   !== undefined) { fields.push('status=?');   values.push(status); }
    if (job      !== undefined) { fields.push('job=?');      values.push(job); }
    if (birthday !== undefined) { fields.push('birthday=?'); values.push(birthday); }
    if (!fields.length) return res.json({ message: 'Không có gì để cập nhật' });
    values.push(req.params.id);
    await updateUser(fields.join(', '), values);
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/users/{id}/password:
 *   put:
 *     summary: Đổi mật khẩu
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đổi mật khẩu thành công
 *       400:
 *         description: Mật khẩu cũ không đúng
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const pool = require('../config/db');
    const [fullRows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (fullRows.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    const match = await bcrypt.compare(oldPassword, fullRows[0].password);
    if (!match) return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await updatePassword(req.params.id, hashed);
    res.json({ message: 'Đổi mật khẩu thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
const remove = async (req, res) => {
  try {
    await deleteUser(req.params.id);
    res.json({ message: 'Xóa người dùng thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAll, getOne, update, changePassword, remove };
