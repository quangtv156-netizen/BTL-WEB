const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');
const { verifyToken } = require('../middleware/auth');

// Ca giang vien va hoc vien deu xem duoc progress
router.get('/', verifyToken, c.getProgress);
router.post('/', verifyToken, c.saveProgress);

module.exports = router;