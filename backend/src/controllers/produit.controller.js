const Produit = require('../models/produit.model');
const AppError = require('../utils/AppError');

class ProduitController {
    // GET - Tous les produits
    static async getAll(req, res, next) {
        try {
            const produits = await Produit.findAll();
            res.json({ success: true, data: produits });
        } catch (error) {
            next(error);
        }
    }

    // GET - Produit par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const produit = await Produit.findById(id);
            if (!produit) {
                throw new AppError('Produit non trouvé', 404);
            }
            res.json({ success: true, data: produit });
        } catch (error) {
            next(error);
        }
    }

    // GET - Produits par catégorie
    static async getByCategorie(req, res, next) {
        try {
            const { categorie } = req.params;
            const produits = await Produit.findByCategorie(categorie);
            res.json({ success: true, data: produits });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer un produit (admin)
    static async create(req, res, next) {
        try {
            const { nom, prix } = req.body;
            if (!nom || !prix) {
                throw new AppError('Le nom et le prix sont requis', 400);
            }
            const newProduit = await Produit.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Produit créé avec succès',
                data: newProduit
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour un produit (admin)
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await Produit.update(id, req.body);
            if (!updated) {
                throw new AppError('Produit non trouvé', 404);
            }
            res.json({ success: true, message: 'Produit mis à jour avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE - Supprimer un produit (admin)
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Produit.delete(id);
            if (!deleted) {
                throw new AppError('Produit non trouvé', 404);
            }
            res.json({ success: true, message: 'Produit désactivé avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProduitController;