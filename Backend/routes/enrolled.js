const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');
const { verifyToken, isStudent } = require('../middleware/auth');

// GET public - ai cung xem duoc (de hien so hoc vien)
router.get('/', c.getEnrolled);

// Can dang nhap + la hoc vien
router.post('/', verifyToken, isStudent, c.enrollCourse);
router.delete('/', verifyToken, isStudent, c.unenrollCourse);

module.exports = router;