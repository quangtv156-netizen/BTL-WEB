const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');
const { verifyToken, isStudent } = require('../middleware/auth');

router.get('/', c.getReviews);
router.post('/', verifyToken, isStudent, c.addReview);  // chi hoc vien danh gia

module.exports = router;
