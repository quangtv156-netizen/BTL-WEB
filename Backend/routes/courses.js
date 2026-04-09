const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/courseController');
const { verifyToken, isInstructor } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Quan ly khoa hoc
 */

// Public - ai cung xem duoc
router.get('/', getAll);
router.get('/:id', getOne);

// Can dang nhap + la giang vien
router.post('/', verifyToken, isInstructor, create);
router.put('/:id', verifyToken, isInstructor, update);
router.delete('/:id', verifyToken, isInstructor, remove);

module.exports = router;
