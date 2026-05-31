const { pool } = require('../config/db.config');

class Animal {
    static async findAll() {
        try {
            const [rows] = await pool.query(`
                SELECT a.*, c.nom as client_nom, c.prenom as client_prenom
                FROM animaux a
                JOIN clients c ON a.client_id = c.id
                ORDER BY a.nom
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT a.*, c.nom as client_nom, c.prenom as client_prenom, c.user_id
                FROM animaux a
                JOIN clients c ON a.client_id = c.id
                WHERE a.id = ?
            `, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    static async findByClient(clientId) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM animaux WHERE client_id = ? ORDER BY nom',
                [clientId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    static async create(data) {
        const { client_id, nom, espece, race, date_naissance, poids, couleur, numero_identification } = data;
        try {
            const [result] = await pool.query(`
                INSERT INTO animaux 
                (client_id, nom, espece, race, date_naissance, poids, couleur, numero_identification) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [client_id, nom, espece, race, date_naissance, poids, couleur, numero_identification]);
            return { id: result.insertId, ...data };
        } catch (error) {
            throw error;
        }
    }
    // Supprimer un animal
    static async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM animaux WHERE id = ?',
                [id]
            );
            console.log('Résultat suppression:', result); // Ajoute ce log
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erreur delete model:', error);
            throw error;
        }
    }
}

module.exports = Animal;