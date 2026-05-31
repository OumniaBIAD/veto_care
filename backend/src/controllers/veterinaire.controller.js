const Veterinaire = require('../models/veterinaire.model');
const AppError = require('../utils/AppError');

const User = require('../models/user.model');
const { pool } = require('../config/db.config');

class VeterinaireController {
    // GET - Récupérer tous les vétérinaires
    static async getAll(req, res, next) {
        try {
            // Récupère aussi les désactivés s'ils sont appelés par l'admin ?
            // Le modèle Veterinaire.findAll() ne récupère que les actifs. Ajoutons paramètre ou on change le modèle.
            // Pour l'admin, on veut voir tout le monde :
            let veterinaires;
            if (req.user && req.user.role === 'admin') {
                const [rows] = await pool.query('SELECT * FROM veterinaires ORDER BY nom, prenom');
                veterinaires = rows;
            } else {
                veterinaires = await Veterinaire.findAll();
            }
            res.json({ success: true, data: veterinaires });
        } catch (error) {
            next(error);
        }
    }

    // GET - Récupérer un vétérinaire par ID
    static async getById(req, res, next) {
        try {
            const { id } = req.params;
            const veterinaire = await Veterinaire.findById(id);
            if (!veterinaire) {
                throw new AppError('Vétérinaire non trouvé', 404);
            }
            res.json({ success: true, data: veterinaire });
        } catch (error) {
            next(error);
        }
    }

    // POST - Créer un vétérinaire (admin)
    static async create(req, res, next) {
        const connection = await pool.getConnection();
        try {
            const { nom, prenom, email, specialite, telephone } = req.body;
            if (!nom || !prenom || !email) {
                throw new AppError('Le nom, le prénom et l\'email sont requis', 400);
            }

            await connection.beginTransaction();

            // Création de l'utilisateur pour le vétérinaire (mot de passe par défaut: veto123)
            const newUser = await User.create({ email, password: 'veto123', role: 'veterinaire' });

            // Création du profil vétérinaire associé
            const newVeterinaire = await Veterinaire.create({
                nom, prenom, email, specialite, telephone, user_id: newUser.id
            });

            await connection.commit();

            res.status(201).json({
                success: true,
                message: 'Vétérinaire et compte créés (Mot de passe: veto123)',
                data: newVeterinaire
            });
        } catch (error) {
            await connection.rollback();
            next(error);
        } finally {
            connection.release();
        }
    }

    // PUT - Mettre à jour un vétérinaire (admin)
    static async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await Veterinaire.update(id, req.body);
            if (!updated) {
                throw new AppError('Vétérinaire non trouvé', 404);
            }
            res.json({ success: true, message: 'Vétérinaire mis à jour avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // DELETE - Désactiver un vétérinaire (admin)
    static async delete(req, res, next) {
        try {
            const { id } = req.params;
            const deleted = await Veterinaire.delete(id);
            if (!deleted) {
                throw new AppError('Vétérinaire non trouvé', 404);
            }
            res.json({ success: true, message: 'Vétérinaire désactivé avec succès' });
        } catch (error) {
            next(error);
        }
    }

    // GET - Récupérer le profil du vétérinaire connecté
    static async getMyProfile(req, res, next) {
        try {
            const vet = await Veterinaire.findByUserId(req.user.id);
            if (!vet) {
                throw new AppError('Profil vétérinaire non trouvé', 404);
            }
            res.json({ success: true, data: vet });
        } catch (error) {
            next(error);
        }
    }

    // PUT - Mettre à jour son propre profil (vétérinaire connecté)
    static async updateMyProfile(req, res, next) {
        try {
            const vet = await Veterinaire.findByUserId(req.user.id);
            if (!vet) {
                throw new AppError('Profil vétérinaire non trouvé', 404);
            }

            // Champs autorisés pour modification
            const { nom, prenom, specialite, telephone } = req.body;
            const updateData = {
                nom: nom || vet.nom,
                prenom: prenom || vet.prenom,
                specialite: specialite !== undefined ? specialite : vet.specialite,
                telephone: telephone !== undefined ? telephone : vet.telephone,
                email: vet.email,  // email ne change pas côté vet
                actif: vet.actif
            };

            await Veterinaire.update(vet.id, updateData);

            // Retourner le profil mis à jour
            const updatedVet = await Veterinaire.findByUserId(req.user.id);
            res.json({ success: true, message: 'Profil mis à jour avec succès', data: updatedVet });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = VeterinaireController;