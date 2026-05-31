const { pool } = require('../config/db.config');

class Commande {
    // Récupérer toutes les commandes (admin)
    static async findAll() {
        try {
            const [rows] = await pool.query(`
                SELECT c.*, 
                       cl.nom as client_nom, cl.prenom as client_prenom,
                       COUNT(cp.produit_id) as nombre_articles
                FROM commandes c
                JOIN clients cl ON c.client_id = cl.id
                LEFT JOIN commande_produit cp ON c.id = cp.commande_id
                GROUP BY c.id
                ORDER BY c.date_commande DESC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les commandes d'un client
    static async findByClient(clientId) {
        try {
            const [rows] = await pool.query(`
                SELECT c.*, 
                       COUNT(cp.produit_id) as nombre_articles
                FROM commandes c
                LEFT JOIN commande_produit cp ON c.id = cp.commande_id
                WHERE c.client_id = ?
                GROUP BY c.id
                ORDER BY c.date_commande DESC
            `, [clientId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer une commande avec ses détails
    static async findById(id) {
        try {
            const [commandes] = await pool.query(`
                SELECT c.*, 
                       cl.nom as client_nom, cl.prenom as client_prenom,
                       cl.adresse, cl.ville, cl.code_postal
                FROM commandes c
                JOIN clients cl ON c.client_id = cl.id
                WHERE c.id = ?
            `, [id]);
            
            if (commandes.length === 0) return null;
            
            const [produits] = await pool.query(`
                SELECT cp.*, p.nom, p.description, p.image_url
                FROM commande_produit cp
                JOIN produits p ON cp.produit_id = p.id
                WHERE cp.commande_id = ?
            `, [id]);
            
            return {
                ...commandes[0],
                produits
            };
        } catch (error) {
            throw error;
        }
    }

    // Créer une commande
    static async create(clientId, panier, adresseLivraison = null, notes = null) {
        try {
            await pool.query('START TRANSACTION');
            
            // Calculer le montant total
            let montantTotal = 0;
            for (const item of panier) {
                const [produit] = await pool.query(
                    'SELECT prix FROM produits WHERE id = ?',
                    [item.produit_id]
                );
                montantTotal += produit[0].prix * item.quantite;
            }
            
            // Créer la commande
            const [commande] = await pool.query(`
                INSERT INTO commandes (client_id, montant_total, adresse_livraison, notes, statut)
                VALUES (?, ?, ?, ?, 'en_attente')
            `, [clientId, montantTotal, adresseLivraison, notes]);
            
            const commandeId = commande.insertId;
            
            // Ajouter les produits à la commande
            for (const item of panier) {
                const [produit] = await pool.query(
                    'SELECT prix FROM produits WHERE id = ?',
                    [item.produit_id]
                );
                
                await pool.query(`
                    INSERT INTO commande_produit (commande_id, produit_id, quantite, prix_unitaire)
                    VALUES (?, ?, ?, ?)
                `, [commandeId, item.produit_id, item.quantite, produit[0].prix]);
                
                // Mettre à jour le stock
                await pool.query(
                    'UPDATE produits SET stock = stock - ? WHERE id = ?',
                    [item.quantite, item.produit_id]
                );
            }
            
            await pool.query('COMMIT');
            
            return { id: commandeId, client_id: clientId, montant_total: montantTotal };
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }

    // Mettre à jour le statut d'une commande
    static async updateStatus(id, statut) {
        const validStatus = ['en_attente', 'confirmee', 'expediee', 'livree', 'annulee'];
        if (!validStatus.includes(statut)) {
            throw new Error('Statut invalide');
        }
        
        try {
            const [result] = await pool.query(
                'UPDATE commandes SET statut = ? WHERE id = ?',
                [statut, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Annuler une commande (remet les stocks)
    static async annuler(id) {
        try {
            await pool.query('START TRANSACTION');
            
            // Récupérer les produits de la commande
            const [produits] = await pool.query(
                'SELECT produit_id, quantite FROM commande_produit WHERE commande_id = ?',
                [id]
            );
            
            // Remettre les stocks
            for (const item of produits) {
                await pool.query(
                    'UPDATE produits SET stock = stock + ? WHERE id = ?',
                    [item.quantite, item.produit_id]
                );
            }
            
            // Changer le statut
            const [result] = await pool.query(
                'UPDATE commandes SET statut = "annulee" WHERE id = ?',
                [id]
            );
            
            await pool.query('COMMIT');
            return result.affectedRows > 0;
        } catch (error) {
            await pool.query('ROLLBACK');
            throw error;
        }
    }
}

module.exports = Commande;
