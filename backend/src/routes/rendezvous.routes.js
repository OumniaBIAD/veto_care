const express = require('express');
const router = express.Router();
const RendezVousController = require('../controllers/rendezvous.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/', authenticateToken, isAdmin, RendezVousController.getAll);

// Route pour les rendez-vous par client (sans paramètre optionnel)
router.get('/client', authenticateToken, RendezVousController.getByClient);
router.get('/client/:clientId', authenticateToken, RendezVousController.getByClient);

router.get('/veterinaire/:id', authenticateToken, RendezVousController.getByVeterinaire);
router.get('/veterinaire', authenticateToken, RendezVousController.getByVeterinaire);
router.get('/:id', authenticateToken, RendezVousController.getById);
router.post('/', authenticateToken, RendezVousController.create);
router.put('/:id', authenticateToken, isAdmin, RendezVousController.update);
router.patch('/:id/status', authenticateToken, isAdmin, RendezVousController.updateStatus);
router.delete('/:id', authenticateToken, isAdmin, RendezVousController.delete);

module.exports = router;