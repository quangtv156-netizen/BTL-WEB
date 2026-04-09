const m = require('../models/otherModels');

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Lấy bình luận theo khóa học
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 */
const getComments = async (req, res) => {
  try { const [rows] = await m.getComments(req.query.courseId); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Thêm bình luận
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - userId
 *               - text
 *             properties:
 *               courseId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               text:
 *                 type: string
 *               parentId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã thêm bình luận
 */
const addComment = async (req, res) => {
  try { const { courseId, userId, text, parentId } = req.body; const [r] = await m.createComment(courseId, userId, text, parentId); res.json({ id: r.insertId, message: 'Đã thêm bình luận' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Sửa bình luận
 *     tags: [Comments]
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
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật
 */
const editComment = async (req, res) => {
  try { await m.updateComment(req.body.text, req.params.id); res.json({ message: 'Đã cập nhật' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Xóa bình luận và tất cả reply
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Đã xóa
 */
const removeComment = async (req, res) => {
  try { await m.deleteComment(req.params.id); res.json({ message: 'Đã xóa' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     summary: Lấy đánh giá theo khóa học
 *     tags: [Reviews]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 */
const getReviews = async (req, res) => {
  try { const [rows] = await m.getReviews(req.query.courseId); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Thêm hoặc cập nhật đánh giá sao
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *               - userId
 *               - rating
 *             properties:
 *               courseId:
 *                 type: integer
 *               userId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Đã đánh giá
 */
const addReview = async (req, res) => {
  try { const { courseId, userId, rating } = req.body; await m.upsertReview(courseId, userId, rating); res.json({ message: 'Đã đánh giá' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/enrolled:
 *   get:
 *     summary: Lấy danh sách đăng ký
 *     tags: [Enrolled]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách enrolled
 */
const getEnrolled = async (req, res) => {
  try { const [rows] = await m.getEnrolled(req.query.userId, req.query.courseId); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/enrolled:
 *   post:
 *     summary: Đăng ký khóa học
 *     tags: [Enrolled]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 */
const enrollCourse = async (req, res) => {
  try { await m.enroll(req.body.userId, req.body.courseId); res.json({ message: 'Đăng ký thành công' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/enrolled:
 *   delete:
 *     summary: Hủy đăng ký khóa học
 *     tags: [Enrolled]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã hủy đăng ký
 */
const unenrollCourse = async (req, res) => {
  try { await m.unenroll(req.body.userId, req.body.courseId); res.json({ message: 'Đã hủy đăng ký' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Lấy danh sách yêu thích
 *     tags: [Favorites]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách favorites
 */
const getFavorites = async (req, res) => {
  try { const [rows] = await m.getFavorites(req.query.userId, req.query.courseId); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/favorites:
 *   post:
 *     summary: Thêm vào yêu thích
 *     tags: [Favorites]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã thêm yêu thích
 */
const addFavorite = async (req, res) => {
  try { await m.addFavorite(req.body.userId, req.body.courseId); res.json({ message: 'Đã thêm yêu thích' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/favorites:
 *   delete:
 *     summary: Xóa khỏi yêu thích
 *     tags: [Favorites]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã xóa yêu thích
 */
const removeFavorite = async (req, res) => {
  try { await m.removeFavorite(req.body.userId, req.body.courseId); res.json({ message: 'Đã xóa yêu thích' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/progress:
 *   get:
 *     summary: Lấy tiến độ học
 *     tags: [Progress]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Danh sách bài đã hoàn thành
 */
const getProgress = async (req, res) => {
  try { const [rows] = await m.getProgress(req.query.userId, req.query.courseId); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/progress:
 *   post:
 *     summary: Lưu tiến độ bài học đã xem
 *     tags: [Progress]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - courseId
 *               - lessonId
 *             properties:
 *               userId:
 *                 type: integer
 *               courseId:
 *                 type: integer
 *               lessonId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Đã lưu tiến độ
 */
const saveProgress = async (req, res) => {
  try { const { userId, courseId, lessonId } = req.body; await m.saveProgress(userId, courseId, lessonId); res.json({ message: 'Đã lưu tiến độ' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/activity:
 *   get:
 *     summary: Lấy nhật ký hoạt động (20 dòng gần nhất)
 *     tags: [Activity]
 *     responses:
 *       200:
 *         description: Danh sách activity log
 */
const getActivity = async (req, res) => {
  try { const [rows] = await m.getActivity(); res.json(rows); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

/**
 * @swagger
 * /api/activity:
 *   post:
 *     summary: Ghi nhật ký hoạt động
 *     tags: [Activity]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - action
 *               - target
 *             properties:
 *               userId:
 *                 type: integer
 *               action:
 *                 type: string
 *                 example: login
 *               target:
 *                 type: string
 *                 example: system
 *     responses:
 *       200:
 *         description: Đã ghi log
 */
const logActivity = async (req, res) => {
  try { const { userId, action, target } = req.body; await m.logActivity(userId, action, target); res.json({ message: 'Đã ghi log' }); }
  catch (err) { res.status(500).json({ message: 'Lỗi server', error: err.message }); }
};

module.exports = {
  getComments, addComment, editComment, removeComment,
  getReviews, addReview,
  getEnrolled, enrollCourse, unenrollCourse,
  getFavorites, addFavorite, removeFavorite,
  getProgress, saveProgress,
  getActivity, logActivity
};
