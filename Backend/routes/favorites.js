const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');
const { verifyToken, isStudent } = require('../middleware/auth');

router.get('/', verifyToken, isStudent, c.getFavorites);
router.post('/', verifyToken, isStudent, c.addFavorite);
router.delete('/', verifyToken, isStudent, c.removeFavorite);

module.exports = router;
