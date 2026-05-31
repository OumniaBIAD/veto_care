const { pool } = require('../config/db.config');

class Service {
    // Récupérer tous les services actifs
    static async findAll() {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM services WHERE actif = true ORDER BY nom'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer un service par ID
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM services WHERE id = ? AND actif = true',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Créer un service
    static async create(data) {
        const { nom, description, duree, prix } = data;
        try {
            const [result] = await pool.query(
                `INSERT INTO services (nom, description, duree, prix, actif) 
                 VALUES (?, ?, ?, ?, true)`,
                [nom, description || null, duree, prix]
            );
            return { id: result.insertId, ...data, actif: true };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour un service
    static async update(id, data) {
        const { nom, description, duree, prix, actif } = data;
        try {
            const [result] = await pool.query(
                `UPDATE services 
                 SET nom = ?, description = ?, duree = ?, prix = ?, actif = ?
                 WHERE id = ?`,
                [nom, description, duree, prix, actif !== undefined ? actif : true, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Supprimer (désactiver) un service
    static async delete(id) {
        try {
            const [result] = await pool.query(
                'UPDATE services SET actif = false WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Service;