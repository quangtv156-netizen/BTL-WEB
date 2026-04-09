const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getUserByEmail, createUser } = require('../models/userModel');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Đăng ký tài khoản mới
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyen Van A
 *               email:
 *                 type: string
 *                 example: a@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               role:
 *                 type: string
 *                 enum: [student, instructor, admin]
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email đã tồn tại hoặc thiếu thông tin
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });

    const [existing] = await getUserByEmail(email);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email đã tồn tại!' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await createUser(name, email, hashed, role);
    res.json({ message: 'Đăng ký thành công!', user: { id: result.insertId, name, email, role } });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Đăng nhập
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: a@gmail.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về JWT token
 *       400:
 *         description: Sai email hoặc mật khẩu
 *       403:
 *         description: Tài khoản bị khóa
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await getUserByEmail(email);
    if (rows.length === 0)
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });

    const user = rows[0];
    if (user.status === 'blocked')
      return res.status(403).json({ message: 'Tài khoản đã bị khóa!' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng!' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      message: 'Đăng nhập thành công!', token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server!', error: err.message });
  }
};

module.exports = { register, login };
