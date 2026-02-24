const express = require('express');
const router = express.Router();
const { getAdminStats, banUser } = require('../controller/adminController');

router.get('/stats', getAdminStats);
router.delete('/user/:id', banUser); // New delete route

module.exports = router;