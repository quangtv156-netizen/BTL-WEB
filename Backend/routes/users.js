const express = require('express');
const router = express.Router();
const { getAll, getOne, update, changePassword, remove } = require('../controllers/userController');
const { verifyToken, isInstructor } = require('../middleware/auth');

router.get('/', verifyToken, getAll);
router.get('/:id', verifyToken, getOne);
router.put('/:id/password', verifyToken, changePassword);
router.put('/:id', verifyToken, update);
router.delete('/:id', verifyToken, isInstructor, remove);

module.exports = router;