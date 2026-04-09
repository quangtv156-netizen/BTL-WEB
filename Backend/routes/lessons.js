const express = require('express');
const router = express.Router();
const { getAll, getOne, create, update, remove } = require('../controllers/lessonController');
const { verifyToken, isInstructor } = require('../middleware/auth');

// Public
router.get('/', getAll);
router.get('/:id', getOne);

// Can giang vien
router.post('/', verifyToken, isInstructor, create);
router.put('/:id', verifyToken, isInstructor, update);
router.delete('/:id', verifyToken, isInstructor, remove);

module.exports = router;
