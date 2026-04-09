const express = require('express');
const router = express.Router();
const c = require('../controllers/otherControllers');

router.get('/', c.getActivity);
router.post('/', c.logActivity);

module.exports = router;
