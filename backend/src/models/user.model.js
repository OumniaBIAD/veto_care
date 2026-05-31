const { pool } = require('../config/db.config');
const bcrypt = require('bcrypt');

class User {
    // Trouver un utilisateur par email
    static async findByEmail(email) {
        try {
            console.log('📧 Recherche utilisateur par email:', email);
            const [rows] = await pool.query(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            console.log('📊 Résultat de la requête:', rows);
            return rows[0] || null;
        } catch (error) {
            console.error('❌ Erreur dans findByEmail:', error);
            throw error;
        }
    }

    // Trouver un utilisateur par ID
    static async findById(id) {
        try {
            const [rows] = await pool.query(
                'SELECT id, email, role, created_at FROM users WHERE id = ?',
                [id]
            );
            return rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Créer un nouvel utilisateur
    static async create(userData) {
        const { email, password, role = 'client' } = userData;
        
        try {
            // Hasher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const [result] = await pool.query(
                'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
                [email, hashedPassword, role]
            );
            
            return { id: result.insertId, email, role };
        } catch (error) {
            throw error;
        }
    }

    // Vérifier le mot de passe
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            console.log('🔐 Comparaison mot de passe...');
            const result = await bcrypt.compare(plainPassword, hashedPassword);
            console.log('🔐 Résultat comparaison:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur dans verifyPassword:', error);
            throw error;
        }
    }

    // Mettre à jour l'utilisateur (Admin Profile)
    static async update(id, updateData) {
        try {
            const { email, password } = updateData;
            
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                await pool.query('UPDATE users SET email = ?, password = ? WHERE id = ?', [email, hashedPassword, id]);
            } else {
                await pool.query('UPDATE users SET email = ? WHERE id = ?', [email, id]);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;