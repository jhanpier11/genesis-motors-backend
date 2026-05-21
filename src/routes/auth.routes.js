const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/register-client', authController.registerClient);

// Rutas protegidas
router.get('/me', authMiddleware, authController.me);

module.exports = router;