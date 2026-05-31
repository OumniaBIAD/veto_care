const { pool } = require('../config/db.config');

class RendezVous {
    // Récupérer tous les rendez-vous avec détails
    static async findAll() {
        try {
            const [rows] = await pool.query(`
                SELECT rv.*, 
                       a.nom as animal_nom, a.espece,
                       v.nom as veterinaire_nom, v.prenom as veterinaire_prenom,
                       s.nom as service_nom, s.prix
                FROM rendez_vous rv
                JOIN animaux a ON rv.animal_id = a.id
                JOIN veterinaires v ON rv.veterinaire_id = v.id
                JOIN services s ON rv.service_id = s.id
                ORDER BY rv.date_rendezvous DESC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les rendez-vous par client
    static async findByClient(clientId) {
        try {
            const [rows] = await pool.query(`
                SELECT rv.*, 
                       a.nom as animal_nom, a.espece,
                       v.nom as veterinaire_nom, v.prenom as veterinaire_prenom,
                       s.nom as service_nom, s.prix
                FROM rendez_vous rv
                JOIN animaux a ON rv.animal_id = a.id
                JOIN veterinaires v ON rv.veterinaire_id = v.id
                JOIN services s ON rv.service_id = s.id
                WHERE a.client_id = ?
                ORDER BY rv.date_rendezvous DESC
            `, [clientId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les rendez-vous par vétérinaire
    static async findByVeterinaire(veterinaireId, date = null) {
        try {
            let query = `
                SELECT rv.*, 
                       a.nom as animal_nom, a.espece,
                       v.nom as veterinaire_nom, v.prenom as veterinaire_prenom,
                       s.nom as service_nom, s.prix,
                       c.nom as client_nom, c.prenom as client_prenom
                FROM rendez_vous rv
                JOIN animaux a ON rv.animal_id = a.id
                JOIN clients c ON a.client_id = c.id
                JOIN veterinaires v ON rv.veterinaire_id = v.id
                JOIN services s ON rv.service_id = s.id
                WHERE rv.veterinaire_id = ?
            `;
            const params = [veterinaireId];
            
            if (date) {
                query += ` AND DATE(rv.date_rendezvous) = ?`;
                params.push(date);
            }
            
            query += ` ORDER BY rv.date_rendezvous ASC`;
            
            const [rows] = await pool.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer un rendez-vous par ID
    static async findById(id) {
        try {
            const [rows] = await pool.query(`
                SELECT rv.*, 
                       a.nom as animal_nom, a.espece, a.client_id,
                       v.nom as veterinaire_nom, v.prenom as veterinaire_prenom,
                       s.nom as service_nom, s.prix, s.duree
                FROM rendez_vous rv
                JOIN animaux a ON rv.animal_id = a.id
                JOIN veterinaires v ON rv.veterinaire_id = v.id
                JOIN services s ON rv.service_id = s.id
                WHERE rv.id = ?
            `, [id]);
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Créer un rendez-vous
    static async create(data) {
        const { animal_id, veterinaire_id, service_id, date_rendezvous, notes } = data;
        try {
            // Récupérer la durée du service
            const [service] = await pool.query(
                'SELECT duree FROM services WHERE id = ?',
                [service_id]
            );
            const duree = service[0]?.duree || 30;
            
            const [result] = await pool.query(`
                INSERT INTO rendez_vous 
                (animal_id, veterinaire_id, service_id, date_rendezvous, duree, notes, statut) 
                VALUES (?, ?, ?, ?, ?, ?, 'planifie')
            `, [animal_id, veterinaire_id, service_id, date_rendezvous, duree, notes || null]);
            
            return { id: result.insertId, ...data, duree, statut: 'planifie' };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour un rendez-vous
    static async update(id, data) {
        const { animal_id, veterinaire_id, service_id, date_rendezvous, statut, notes } = data;
        try {
            const [result] = await pool.query(`
                UPDATE rendez_vous 
                SET animal_id = ?, veterinaire_id = ?, service_id = ?, 
                    date_rendezvous = ?, statut = ?, notes = ?
                WHERE id = ?
            `, [animal_id, veterinaire_id, service_id, date_rendezvous, statut, notes, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour le statut
    static async updateStatus(id, statut) {
        try {
            const [result] = await pool.query(
                'UPDATE rendez_vous SET statut = ? WHERE id = ?',
                [statut, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Supprimer un rendez-vous
    static async delete(id) {
        try {
            const [result] = await pool.query(
                'DELETE FROM rendez_vous WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Vérifier les disponibilités
    static async checkDisponibilite(veterinaireId, dateRendezVous, duree) {
        try {
            const [rows] = await pool.query(`
                SELECT COUNT(*) as count 
                FROM rendez_vous 
                WHERE veterinaire_id = ? 
                AND date_rendezvous BETWEEN ? AND DATE_ADD(?, INTERVAL ? MINUTE)
                AND statut NOT IN ('annule', 'termine')
            `, [veterinaireId, dateRendezVous, dateRendezVous, duree]);
            return rows[0].count === 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = RendezVous;