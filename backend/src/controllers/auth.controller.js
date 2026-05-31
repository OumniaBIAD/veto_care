const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { pool } = require('../config/db.config');
const AppError = require('../utils/AppError');

class AuthController {
    // Inscription d'un nouvel utilisateur
    static async register(req, res, next) {
        try {
            const { email, password, nom, prenom, telephone, adresse, ville, code_postal } = req.body;

            console.log('📝 Tentative d\'inscription:', { email, nom, prenom });

            // Vérifier que les champs obligatoires sont remplis
            if (!email || !password || !nom || !prenom) {
                throw new AppError('Email, mot de passe, nom et prénom sont requis.', 400);
            }

            // Vérifier le format de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new AppError('Format d\'email invalide.', 400);
            }

            // Vérifier la longueur du mot de passe
            if (password.length < 6) {
                throw new AppError('Le mot de passe doit contenir au moins 6 caractères.', 400);
            }

            // Vérifier si l'utilisateur existe déjà
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                throw new AppError('Cet email est déjà utilisé.', 400);
            }

            // --- TRANSACTION SQL ---
            // Si la création du User réussit mais que le Client échoue,
            // le ROLLBACK annule tout pour éviter les données orphelines.
            const connection = await pool.getConnection();
            try {
                await connection.beginTransaction();

                // 1. Créer l'utilisateur
                const newUser = await User.create({ email, password, role: 'client' });

                // 2. Créer le client associé
                await connection.query(
                    `INSERT INTO clients (user_id, nom, prenom, telephone, adresse, ville, code_postal)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [newUser.id, nom, prenom, telephone || null, adresse || null, ville || null, code_postal || null]
                );

                await connection.commit();

                // Générer un token JWT pour connecter automatiquement l'utilisateur
                const secret = process.env.JWT_SECRET || 'devsecretkey';
                const token = jwt.sign(
                    { id: newUser.id, email: newUser.email, role: newUser.role },
                    secret,
                    { expiresIn: '24h' }
                );

                console.log('✅ Inscription réussie pour:', email);
                return res.status(201).json({
                    success: true,
                    message: 'Inscription réussie !',
                    token,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        role: newUser.role
                    }
                });

            } catch (transactionError) {
                await connection.rollback();
                throw transactionError; // Relancer pour que le gestionnaire global le capte
            } finally {
                connection.release();
            }

        } catch (error) {
            console.error('❌ Erreur inscription:', error);
            next(error);
        }
    }

    // Connexion
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            console.log('🔐 Tentative de connexion:', { email });

            if (!email || !password) {
                throw new AppError('Email et mot de passe requis.', 400);
            }

            // Rechercher l'utilisateur
            const user = await User.findByEmail(email);
            if (!user) {
                throw new AppError('Email ou mot de passe incorrect.', 401);
            }

            // Vérifier le mot de passe
            const isValidPassword = await User.verifyPassword(password, user.password);
            if (!isValidPassword) {
                throw new AppError('Email ou mot de passe incorrect.', 401);
            }

            // Générer le token JWT
            const secret = process.env.JWT_SECRET || 'devsecretkey';
            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                secret,
                { expiresIn: '24h' }
            );

            // Récupérer les détails supplémentaires selon le rôle
            let profileDetails = {};
            if (user.role === 'client') {
                const [clients] = await pool.query('SELECT nom, prenom, photo_url FROM clients WHERE user_id = ?', [user.id]);
                if (clients[0]) profileDetails = clients[0];
            } else if (user.role === 'veterinaire') {
                const [vets] = await pool.query('SELECT id AS veterinaire_id, nom, prenom, specialite, telephone FROM veterinaires WHERE user_id = ?', [user.id]);
                if (vets[0]) profileDetails = vets[0];
            }

            console.log('✅ Connexion réussie pour:', user.email);
            res.json({
                success: true,
                message: 'Connexion réussie.',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at,
                    ...profileDetails
                }
            });

        } catch (error) {
            console.error('❌ Erreur login:', error);
            next(error);
        }
    }

    // Vérifier le token et récupérer les infos utilisateur
    static async verifyToken(req, res, next) {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                throw new AppError('Utilisateur non trouvé.', 404);
            }

            // Récupérer les détails supplémentaires selon le rôle
            let profileDetails = {};
            if (user.role === 'client') {
                const [clients] = await pool.query('SELECT nom, prenom, photo_url FROM clients WHERE user_id = ?', [user.id]);
                if (clients[0]) profileDetails = clients[0];
            } else if (user.role === 'veterinaire') {
                const [vets] = await pool.query('SELECT nom, prenom FROM veterinaires WHERE user_id = ?', [user.id]);
                if (vets[0]) profileDetails = vets[0];
            }

            res.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    createdAt: user.created_at,
                    ...profileDetails
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Déconnexion (côté client, il suffit de supprimer le token)
    static async logout(req, res) {
        res.json({
            success: true,
            message: 'Déconnexion réussie.'
        });
    }

    // Mise à jour du profil de l'utilisateur actif
    static async updateProfile(req, res, next) {
        try {
            const { email, password } = req.body;
            const userId = req.user.id;

            if (!email) {
                throw new AppError('Email requis', 400);
            }

            // Vérifier que le nouvel email n'est pas déjà pris par un autre
            const existingUser = await User.findByEmail(email);
            if (existingUser && existingUser.id !== userId) {
                throw new AppError('Cet email est déjà utilisé par un autre compte.', 400);
            }

            await User.update(userId, { email, password });

            res.json({ success: true, message: 'Profil mis à jour' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;