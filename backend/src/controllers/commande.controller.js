const Commande = require('../models/commande.model');
const Client = require('../models/client.model');
const AppError = require('../utils/AppError');

const STATUTS_VALIDES = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];

class CommandeController {
    // GET - Toutes les commandes (admin)
    static async getAll(req, res, next) {
        try {
            const commandes = await Commande.findAll();
            res.json({ success: true, data: commandes });
        } catch (error) {
            next(error);
        }
    }

    // GET - Mes commandes (client connecté)
    static async getMyCommandes(req, res, next) {
        try {
            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Client non trouvé', 404);
            }
            const commandes = await Commande.findByClient(client.id);
            res.json({ success: true, data: commandes });
        } catch (error) {
            next(error);
        }
    }

    // GET - Commande par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const commande = await Commande.findById(id);
            if (!commande) {
                throw new AppError('Commande non trouvée', 404);
            }
            res.json({ success: true, data: commande });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer une commande (panier)
    static async create(req, res, next) {
        try {
            const { panier, adresse_livraison, notes } = req.body;

            if (!panier || panier.length === 0) {
                throw new AppError('Le panier est vide', 400);
            }

            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Client non trouvé', 404);
            }

            const nouvelleCommande = await Commande.create(
                client.id,
                panier,
                adresse_livraison,
                notes
            );

            res.status(201).json({
                success: true,
                message: 'Commande créée avec succès',
                data: nouvelleCommande
            });
        } catch (error) {
            next(error);
        }
    }

    // PATCH - Mettre à jour le statut (admin)
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { statut } = req.body;

            // Validation du statut (manquait dans la version précédente)
            if (!statut || !STATUTS_VALIDES.includes(statut)) {
                throw new AppError(`Statut invalide. Valeurs acceptées : ${STATUTS_VALIDES.join(', ')}`, 400);
            }

            const updated = await Commande.updateStatus(id, statut);
            if (!updated) {
                throw new AppError('Commande non trouvée', 404);
            }

            res.json({ success: true, message: `Statut de la commande mis à jour : ${statut}` });
        } catch (error) {
            next(error);
        }
    }

    // POST - Annuler une commande
    static async annuler(req, res, next) {
        try {
            const { id } = req.params;
            const annule = await Commande.annuler(id);
            if (!annule) {
                throw new AppError('Commande non trouvée', 404);
            }
            res.json({ success: true, message: 'Commande annulée avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CommandeController;