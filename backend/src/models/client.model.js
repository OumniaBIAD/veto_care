const { pool } = require('../config/db.config');

/**
 * Modèle Client.
 * Regroupe toutes les requêtes SQL liées à la table `clients`.
 * Ce modèle évite la duplication de requêtes dans les contrôleurs.
 */
class Client {
    /**
     * Trouve le profil client à partir de l'ID de l'utilisateur connecté (table users).
     * @param {number} userId - L'ID de la table `users`
     * @returns {object|null} Le profil client ou null
     */
    static async findByUserId(userId) {
        const [rows] = await pool.query(
            'SELECT * FROM clients WHERE user_id = ?',
            [userId]
        );
        return rows[0] || null;
    }

    /**
     * Trouve un client par son ID (table clients).
     * @param {number} id - L'ID de la table `clients`
     */
    static async findById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM clients WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    /**
     * Récupère tous les clients.
     */
    static async findAll() {
        const [rows] = await pool.query(
            `SELECT c.*, u.email, u.role, u.created_at as user_created_at
             FROM clients c
             JOIN users u ON c.user_id = u.id
             ORDER BY c.created_at DESC`
        );
        return rows;
    }

    /**
     * Met à jour les informations d'un client.
     */
    static async update(userId, data) {
        const { nom, prenom, telephone, adresse, ville, code_postal, photo_url } = data;
        const [result] = await pool.query(
            `UPDATE clients 
             SET nom = ?, prenom = ?, telephone = ?, adresse = ?, ville = ?, code_postal = ?, photo_url = ?
             WHERE user_id = ?`,
            [nom, prenom, telephone, adresse, ville, code_postal, photo_url, userId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = Client;
