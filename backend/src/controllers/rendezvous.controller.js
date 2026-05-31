const RendezVous = require('../models/rendezvous.model');
const Animal = require('../models/animal.model');
const Service = require('../models/service.model');
const Client = require('../models/client.model');
const AppError = require('../utils/AppError');

class RendezVousController {
    // GET - Tous les rendez-vous (admin)
    static async getAll(req, res, next) {
        try {
            const rendezvous = await RendezVous.findAll();
            res.json({ success: true, data: rendezvous });
        } catch (error) {
            next(error);
        }
    }

    // GET - Rendez-vous par client
    static async getByClient(req, res, next) {
        try {
            let clientId;

            if (req.params.clientId && (req.user.role === 'admin' || req.user.role === 'veterinaire')) {
                clientId = req.params.clientId;
            } else {
                const client = await Client.findByUserId(req.user.id);
                clientId = client?.id;
            }

            if (!clientId) {
                throw new AppError('Client non trouvé', 404);
            }

            const rendezvous = await RendezVous.findByClient(clientId);
            res.json({ success: true, data: rendezvous });
        } catch (error) {
            next(error);
        }
    }

    // GET - Rendez-vous par vétérinaire
    static async getByVeterinaire(req, res, next) {
        try {
            let vetId;

            if (req.user && req.user.role === 'veterinaire') {
                const vet = await require('../models/veterinaire.model').findByUserId(req.user.id);
                if (!vet) throw new AppError('Profil vétérinaire introuvable', 404);
                vetId = vet.id;
            } else if (req.params.id) {
                vetId = req.params.id;
            }

            if (!vetId) throw new AppError('Vétérinaire non spécifié', 400);

            const { date } = req.query;
            const rendezvous = await RendezVous.findByVeterinaire(vetId, date);
            res.json({ success: true, data: rendezvous });
        } catch (error) {
            next(error);
        }
    }

    // GET - Rendez-vous par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const rendezvous = await RendezVous.findById(id);
            if (!rendezvous) {
                throw new AppError('Rendez-vous non trouvé', 404);
            }
            res.json({ success: true, data: rendezvous });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer un rendez-vous
    static async create(req, res, next) {
        try {
            const { animal_id, veterinaire_id, service_id, date_rendezvous, notes } = req.body;

            if (!animal_id || !veterinaire_id || !service_id || !date_rendezvous) {
                throw new AppError('Tous les champs sont requis', 400);
            }

            // Vérifier que l'animal existe
            const animal = await Animal.findById(animal_id);
            if (!animal) {
                throw new AppError('Animal non trouvé', 404);
            }

            // --- CORRECTION DU BUG D'OWNERSHIP ---
            // animal.client_id référence la table `clients`
            // req.user.id référence la table `users`
            // On doit donc récupérer le client_id depuis le user connecté
            if (req.user.role !== 'admin') {
                const client = await Client.findByUserId(req.user.id);
                if (!client || animal.client_id !== client.id) {
                    throw new AppError('Vous n\'êtes pas autorisé à créer un rendez-vous pour cet animal', 403);
                }
            }

            // Vérifier la disponibilité du vétérinaire
            const service = await Service.findById(service_id);
            const disponible = await RendezVous.checkDisponibilite(
                veterinaire_id,
                date_rendezvous,
                service?.duree || 30
            );

            if (!disponible) {
                throw new AppError('Ce créneau n\'est pas disponible', 409);
            }

            const newRendezVous = await RendezVous.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Rendez-vous créé avec succès',
                data: newRendezVous
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour un rendez-vous
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await RendezVous.update(id, req.body);
            if (!updated) {
                throw new AppError('Rendez-vous non trouvé', 404);
            }
            res.json({ success: true, message: 'Rendez-vous mis à jour avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // PATCH - Changer le statut
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { statut } = req.body;

            const validStatus = ['planifie', 'confirme', 'en_cours', 'termine', 'annule'];
            if (!statut || !validStatus.includes(statut)) {
                throw new AppError(`Statut invalide. Valeurs acceptées : ${validStatus.join(', ')}`, 400);
            }

            const updated = await RendezVous.updateStatus(id, statut);
            if (!updated) {
                throw new AppError('Rendez-vous non trouvé', 404);
            }

            res.json({ success: true, message: `Rendez-vous ${statut} avec succès` });
        } catch (error) {
            next(error);
        }
    }

    // DELETE - Supprimer un rendez-vous
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await RendezVous.delete(id);
            if (!deleted) {
                throw new AppError('Rendez-vous non trouvé', 404);
            }
            res.json({ success: true, message: 'Rendez-vous supprimé avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RendezVousController;