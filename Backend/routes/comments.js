const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');
const { verifyToken } = require('../middleware/auth');

router.get('/', c.getComments);                        // ai cung xem duoc
router.post('/', verifyToken, c.addComment);           // phai dang nhap moi comment
router.put('/:id', verifyToken, c.editComment);        // phai dang nhap moi sua
router.delete('/:id', verifyToken, c.removeComment);   // phai dang nhap moi xoa

module.exports = router;
