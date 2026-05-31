const express = require('express');
const router = express.Router();
const AnimalController = require('../controllers/animal.controller');
const { authenticateToken, isAdmin, isVet } = require('../middlewares/auth.middleware');

// Routes accessibles à tous les utilisateurs authentifiés
router.get('/mes-animaux', authenticateToken, AnimalController.getMyAnimals);
router.get('/:id', authenticateToken, AnimalController.getById);
router.post('/', authenticateToken, AnimalController.create);
router.put('/:id', authenticateToken, AnimalController.update);
router.delete('/:id', authenticateToken, AnimalController.delete);

// Routes réservées à l'administrateur et vétérinaires
router.get('/', authenticateToken, isAdmin, AnimalController.getAll);
router.get('/client/:clientId', authenticateToken, isVet, AnimalController.getByClient);

module.exports = router;