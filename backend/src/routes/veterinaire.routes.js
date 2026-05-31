const express = require('express');
const router = express.Router();
const VeterinaireController = require('../controllers/veterinaire.controller');
const { authenticateToken, isAdmin, isVet } = require('../middlewares/auth.middleware');

// Routes accessibles publiquement
router.get('/', VeterinaireController.getAll);

// Routes pour le vétérinaire connecté (AVANT /:id)
router.get('/me', authenticateToken, isVet, VeterinaireController.getMyProfile);
router.put('/me', authenticateToken, isVet, VeterinaireController.updateMyProfile);

router.get('/:id', VeterinaireController.getById);

// Routes réservées à l'administrateur
router.post('/', authenticateToken, isAdmin, VeterinaireController.create);
router.put('/:id', authenticateToken, isAdmin, VeterinaireController.update);
router.delete('/:id', authenticateToken, isAdmin, VeterinaireController.delete);

module.exports = router;