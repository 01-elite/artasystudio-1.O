const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');

router.get('/stats', adminController.getAdminStats);
router.delete('/user/:id', adminController.banUser); 

module.exports = router;