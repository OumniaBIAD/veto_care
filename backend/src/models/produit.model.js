const { pool } = require('../config/db.config');

class Produit {
    // Récupérer tous les produits actifs
    static async findAll() {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM produits WHERE actif = true ORDER BY nom'
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer un produit par ID
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM produits WHERE id = ? AND actif = true',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Récupérer les produits par catégorie
    static async findByCategorie(categorie) {
        try {
            const [rows] = await pool.query(
                'SELECT * FROM produits WHERE categorie = ? AND actif = true ORDER BY nom',
                [categorie]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }

    // Créer un produit
    static async create(data) {
        const { nom, description, prix, stock, categorie, image_url } = data;
        try {
            const [result] = await pool.query(
                `INSERT INTO produits (nom, description, prix, stock, categorie, image_url, actif) 
                 VALUES (?, ?, ?, ?, ?, ?, true)`,
                [nom, description || null, prix, stock || 0, categorie || null, image_url || null]
            );
            return { id: result.insertId, ...data, actif: true };
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour un produit
    static async update(id, data) {
        const { nom, description, prix, stock, categorie, image_url, actif } = data;
        try {
            const [result] = await pool.query(
                `UPDATE produits 
                 SET nom = ?, description = ?, prix = ?, stock = ?, categorie = ?, image_url = ?, actif = ?
                 WHERE id = ?`,
                [nom, description, prix, stock, categorie, image_url, actif !== undefined ? actif : true, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Mettre à jour le stock
    static async updateStock(id, quantite) {
        try {
            const [result] = await pool.query(
                'UPDATE produits SET stock = stock - ? WHERE id = ? AND stock >= ?',
                [quantite, id, quantite]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // Supprimer (désactiver) un produit
    static async delete(id) {
        try {
            const [result] = await pool.query(
                'UPDATE produits SET actif = false WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Produit;