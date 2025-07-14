//routes/authRoutes.js
const express = require('express');
const { signup, login, refreshToken, checkAuth, logout, forgotPassword, resetPassword, googleAuth, facebookAuth } = require('../controllers/authController');

const router = express.Router();

// Signup route
router.post('/signup', signup);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.get('/check', checkAuth);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);

module.exports = router;
