const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Route d'inscription
router.post('/register', AuthController.register);

// Route de connexion
router.post('/login', AuthController.login);

// Route de vérification du token (protégée)
router.get('/verify', authenticateToken, AuthController.verifyToken);

// Route de déconnexion
router.post('/logout', AuthController.logout);

// Route de mise à jour du profil
router.put('/update-profile', authenticateToken, AuthController.updateProfile);

module.exports = router;