const express = require('express');
const router = express.Router();
const ClientController = require('../controllers/client.controller');
const { authenticateToken, isClient, isVet } = require('../middlewares/auth.middleware');

router.get('/', authenticateToken, isVet, ClientController.getAll);
router.get('/me', authenticateToken, isClient, ClientController.getProfile);
router.put('/me', authenticateToken, isClient, ClientController.updateProfile);
router.get('/me/cart', authenticateToken, isClient, ClientController.getCart);
router.post('/me/cart', authenticateToken, isClient, ClientController.saveCart);

module.exports = router;
