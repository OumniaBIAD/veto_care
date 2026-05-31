const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/produit.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth.middleware');

// Routes accessibles publiquement
router.get('/', ProduitController.getAll);
router.get('/categorie/:categorie', ProduitController.getByCategorie);
router.get('/:id', ProduitController.getById);

// Routes réservées à l'administrateur
router.post('/', authenticateToken, isAdmin, ProduitController.create);
router.put('/:id', authenticateToken, isAdmin, ProduitController.update);
router.delete('/:id', authenticateToken, isAdmin, ProduitController.delete);

module.exports = router;