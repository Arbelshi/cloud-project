const express = require('express');
const router  = express.Router();

const authController = require('../Controllers/authController');
const { requireLogin } = require('../middleware/auth');

// Login form
router.get('/login', authController.showLogin);
// Submit entry form
router.post('/login', authController.postLogin);

// Registration form
router.get('/register', authController.showRegister);
// Submit a registration form
router.post('/register', authController.postRegister);

// Logout (only for logged in users)
router.post('/logout', requireLogin, authController.logout);

module.exports = router;
