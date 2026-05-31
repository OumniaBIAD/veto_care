const { pool } = require('../config/db.config');

class Veterinaire {
    // Récupérer tous les vétérinaires actifs
    static async findAll() {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM veterinaires WHERE actif = true ORDER BY nom, prenom'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer un vétérinaire par ID
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM veterinaires WHERE id = ? AND actif = true',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer un vétérinaire par user_id
    static async findByUserId(user_id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM veterinaires WHERE user_id = ? AND actif = true',
                [user_id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Créer un vétérinaire
    static async create(data) {
        const { nom, prenom, specialite, telephone, email, user_id } = data;
        try {
            const [result] = await pool.query(
                `INSERT INTO veterinaires (nom, prenom, specialite, telephone, email, user_id, actif) 
                 VALUES (?, ?, ?, ?, ?, ?, true)`,
                [nom, prenom, specialite || null, telephone || null, email || null, user_id || null]
            );
            return { id: result.insertId, ...data, actif: true };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour un vétérinaire
    static async update(id, data) {
        const { nom, prenom, specialite, telephone, email, actif } = data;
        try {
            const [result] = await pool.query(
                `UPDATE veterinaires 
                 SET nom = ?, prenom = ?, specialite = ?, telephone = ?, email = ?, actif = ?
                 WHERE id = ?`,
                [nom, prenom, specialite, telephone, email, actif !== undefined ? actif : true, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Supprimer (désactiver) un vétérinaire
    static async delete(id) {
        try {
            const [result] = await pool.query(
                'UPDATE veterinaires SET actif = false WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Veterinaire;