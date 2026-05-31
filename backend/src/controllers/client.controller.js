const Client = require('../models/client.model');
const Panier = require('../models/panier.model');
const AppError = require('../utils/AppError');

class ClientController {
    // GET - Récupérer le profil du client connecté
    static async getProfile(req, res, next) {
        try {
            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Profil client non trouvé', 404);
            }
            res.json({ success: true, data: client });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour le profil du client
    // PUT - Mettre à jour le profil du client
    static async updateProfile(req, res, next) {
        console.log('UpdateProfile payload:', req.body);
        const updated = await Client.update(req.user.id, req.body);
        if (!updated) {
            throw new AppError('Mise à jour échouée', 400);
        }
        res.json({ success: true, message: 'Profil mis à jour avec succès' });
    }

    // GET - Récupérer le panier du client connecté
    static async getCart(req, res, next) {
        try {
            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Profil client non trouvé', 404);
            }
            const cartItems = await Panier.getCartByClientId(client.id);
            res.json({ success: true, data: cartItems });
        } catch (error) {
            next(error);
        }
    }

    // POST - Sauvegarder/synchroniser le panier du client connecté
    static async saveCart(req, res, next) {
        try {
            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Profil client non trouvé', 404);
            }
            const { items } = req.body;
            await Panier.saveCart(client.id, items || []);
            res.json({ success: true, message: 'Panier sauvegardé avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // GET - Récupérer tous les clients (admin/vet)
    static async getAll(req, res, next) {
        try {
            const list = await Client.findAll();
            res.json({ success: true, data: list });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ClientController;
