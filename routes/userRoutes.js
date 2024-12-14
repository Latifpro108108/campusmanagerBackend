const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', protect, userController.getProfile);

module.exports = router;