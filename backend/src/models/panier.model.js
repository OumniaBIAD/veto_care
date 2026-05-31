const { pool } = require('../config/db.config');

class Panier {
    /**
     * Récupère le panier d'un client.
     */
    static async getCartByClientId(clientId) {
        const [rows] = await pool.query(
            `SELECT p.produit_id AS id, pr.nom, pr.prix, pr.image_url, p.quantite 
             FROM panier p
             JOIN produits pr ON p.produit_id = pr.id
             WHERE p.client_id = ?`,
            [clientId]
        );
        return rows;
    }

    /**
     * Sauvegarde le panier d'un client (remplace l'existant).
     */
    static async saveCart(clientId, items) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Supprimer l'ancien panier
            await connection.query('DELETE FROM panier WHERE client_id = ?', [clientId]);

            // 2. Insérer les nouveaux items s'il y en a
            if (items && items.length > 0) {
                const values = items.map(item => [clientId, item.id, item.quantite]);
                await connection.query(
                    'INSERT INTO panier (client_id, produit_id, quantite) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = Panier;
