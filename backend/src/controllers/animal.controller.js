const Animal = require('../models/animal.model');
const Client = require('../models/client.model');
const AppError = require('../utils/AppError');

class AnimalController {
    // GET - Tous les animaux (admin)
    static async getAll(req, res, next) {
        try {
            const animaux = await Animal.findAll();
            res.json({ success: true, data: animaux });
        } catch (error) {
            next(error);
        }
    }

    // GET - Animaux du client connecté
    static async getMyAnimals(req, res, next) {
        try {
            const client = await Client.findByUserId(req.user.id);
            if (!client) {
                throw new AppError('Profil client non trouvé', 404);
            }
            const animaux = await Animal.findByClient(client.id);
            res.json({ success: true, data: animaux });
        } catch (error) {
            next(error);
        }
    }

    // GET - Animaux d'un client spécifique (admin)
    static async getByClient(req, res, next) {
        try {
            const { clientId } = req.params;
            const animaux = await Animal.findByClient(clientId);
            res.json({ success: true, data: animaux });
        } catch (error) {
            next(error);
        }
    }

    // GET - Animal par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const animal = await Animal.findById(id);
            if (!animal) {
                throw new AppError('Animal non trouvé', 404);
            }
            res.json({ success: true, data: animal });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer un animal
    static async create(req, res, next) {
        try {
            const { nom, espece } = req.body;

            if (!nom || !espece) {
                throw new AppError('Le nom et l\'espèce sont requis', 400);
            }

            // Récupérer l'ID du client
            let clientId = req.body.client_id;

            if (!clientId && req.user.role !== 'admin') {
                const client = await Client.findByUserId(req.user.id);
                clientId = client?.id;
            }

            if (!clientId) {
                throw new AppError('Client non trouvé', 404);
            }

            const newAnimal = await Animal.create({ ...req.body, client_id: clientId });
            res.status(201).json({
                success: true,
                message: 'Animal créé avec succès',
                data: newAnimal
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour un animal
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await Animal.update(id, req.body);
            if (!updated) {
                throw new AppError('Animal non trouvé', 404);
            }
            res.json({ success: true, message: 'Animal mis à jour avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE - Supprimer un animal
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Animal.delete(id);
            if (!deleted) {
                throw new AppError('Animal non trouvé', 404);
            }
            res.json({ success: true, message: 'Animal supprimé avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AnimalController;