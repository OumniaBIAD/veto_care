const Service = require('../models/service.model');
const AppError = require('../utils/AppError');

class ServiceController {
    // GET - Récupérer tous les services
    static async getAll(req, res, next) {
        try {
            const services = await Service.findAll();
            res.json({ success: true, data: services });
        } catch (error) {
            next(error);
        }
    }

    // GET - Récupérer un service par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const service = await Service.findById(id);
            if (!service) {
                throw new AppError('Service non trouvé', 404);
            }
            res.json({ success: true, data: service });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer un service (admin)
    static async create(req, res, next) {
        try {
            const { nom, duree, prix } = req.body;
            if (!nom || !duree || !prix) {
                throw new AppError('Le nom, la durée et le prix sont requis', 400);
            }
            const newService = await Service.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Service créé avec succès',
                data: newService
            });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour un service (admin)
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await Service.update(id, req.body);
            if (!updated) {
                throw new AppError('Service non trouvé', 404);
            }
            res.json({ success: true, message: 'Service mis à jour avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE - Supprimer un service (admin)
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Service.delete(id);
            if (!deleted) {
                throw new AppError('Service non trouvé', 404);
            }
            res.json({ success: true, message: 'Service désactivé avec succès' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ServiceController;