const express = require('express');
const router = express.Router();
const ServiceController = require('../controllers/service.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes accessibles publiquement
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Routes réservées à l'administrateur
router.post('/', authenticateToken, isAdmin, ServiceController.create);
router.put('/:id', authenticateToken, isAdmin, ServiceController.update);
router.delete('/:id', authenticateToken, isAdmin, ServiceController.delete);

module.exports = router;