const { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse, deleteCourseWithRelated } = require('../models/courseModel');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Quản lý khóa học
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Lấy danh sách khóa học
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Danh sách khóa học
 */
const getAll = async (req, res) => {
  try {
    const [rows] = await getAllCourses();
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Lấy chi tiết 1 khóa học
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin khóa học
 *       404:
 *         description: Không tìm thấy
 */
const getOne = async (req, res) => {
  try {
    const [rows] = await getCourseById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khóa học!' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Tạo khóa học mới
 *     tags: [Courses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - code
 *               - instructor_id
 *             properties:
 *               title:
 *                 type: string
 *               code:
 *                 type: string
 *               category:
 *                 type: string
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               description:
 *                 type: string
 *               short_desc:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *               instructor_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Tạo thành công
 */
const create = async (req, res) => {
  try {
    const { title, code, category, level, description, short_desc, thumbnail, instructor_id, published } = req.body;
    const [result] = await createCourse(title, code, category, level, description, short_desc, thumbnail, instructor_id, published);
    res.json({ message: 'Tạo khóa học thành công!', id: result.insertId });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Cập nhật khóa học
 *     tags: [Courses]
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
 *               title:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
const update = async (req, res) => {
  try {
    const { title, code, category, level, description, short_desc, thumbnail, published } = req.body;
    await updateCourse(title, code, category, level, description, short_desc, thumbnail, published, req.params.id);
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Xóa khóa học
 *     tags: [Courses]
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
    await deleteCourseWithRelated(req.params.id);
    res.json({ message: 'Xóa khóa học thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAll, getOne, create, update, remove };
