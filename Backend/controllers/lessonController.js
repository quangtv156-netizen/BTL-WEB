const { getLessons, getLessonById, createLesson, updateLesson, deleteLesson } = require('../models/lessonModel');

/**
 * @swagger
 * tags:
 *   name: Lessons
 *   description: Quản lý bài giảng
 */

/**
 * @swagger
 * /api/lessons:
 *   get:
 *     summary: Lấy danh sách bài giảng
 *     tags: [Lessons]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách bài giảng
 */
const getAll = async (req, res) => {
  try {
    const [rows] = await getLessons(req.query.courseId);
    res.json(rows);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/lessons/{id}:
 *   get:
 *     summary: Lấy chi tiết 1 bài giảng
 *     tags: [Lessons]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Thông tin bài giảng
 *       404:
 *         description: Không tìm thấy
 */
const getOne = async (req, res) => {
  try {
    const [rows] = await getLessonById(req.params.id);
    if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy bài giảng!' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Tạo bài giảng mới
 *     tags: [Lessons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - course_id
 *               - title
 *             properties:
 *               course_id:
 *                 type: integer
 *               title:
 *                 type: string
 *               chapter:
 *                 type: string
 *               order_in_chapter:
 *                 type: integer
 *               description:
 *                 type: string
 *               video_url:
 *                 type: string
 *               duration:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Tạo thành công
 */
const create = async (req, res) => {
  try {
    const { course_id, title, chapter, order_in_chapter, description, video_url, duration, status } = req.body;
    const [result] = await createLesson(course_id, title, chapter, order_in_chapter, description, video_url, duration, status);
    res.json({ message: 'Tạo bài giảng thành công!', id: result.insertId });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/lessons/{id}:
 *   put:
 *     summary: Cập nhật bài giảng
 *     tags: [Lessons]
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
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 */
const update = async (req, res) => {
  try {
    const { title, chapter, order_in_chapter, description, video_url, duration, status } = req.body;
    await updateLesson(title, chapter, order_in_chapter, description, video_url, duration, status, req.params.id);
    res.json({ message: 'Cập nhật thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

/**
 * @swagger
 * /api/lessons/{id}:
 *   delete:
 *     summary: Xóa bài giảng
 *     tags: [Lessons]
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
    await deleteLesson(req.params.id);
    res.json({ message: 'Xóa bài giảng thành công!' });
  } catch (err) { res.status(500).json({ message: 'Lỗi server!', error: err.message }); }
};

module.exports = { getAll, getOne, create, update, remove };
