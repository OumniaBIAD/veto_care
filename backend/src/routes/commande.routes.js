const express = require('express');
const router = express.Router();
const CommandeController = require('../controllers/commande.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes client
router.get('/mes-commandes', authenticateToken, CommandeController.getMyCommandes);
router.post('/', authenticateToken, CommandeController.create);
router.post('/:id/annuler', authenticateToken, CommandeController.annuler);
router.get('/:id', authenticateToken, CommandeController.getById);

// Routes admin
router.get('/', authenticateToken, isAdmin, CommandeController.getAll);
router.patch('/:id/status', authenticateToken, isAdmin, CommandeController.updateStatus);

module.exports = router;