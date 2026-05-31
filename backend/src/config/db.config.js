const mysql = require('mysql2');
require('dotenv').config();

// Configuration du pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Promisify pour utiliser async/await
const promisePool = pool.promise();

// Fonction pour tester la connexion
const testConnection = async () => {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
        console.log('\x1b[32m%s\x1b[0m', '✅ Connexion MySQL réussie !');
        console.log('\x1b[36m%s\x1b[0m', '📊 Base de données :', process.env.DB_NAME);
        console.log('\x1b[36m%s\x1b[0m', '🔌 Port :', process.env.DB_PORT || 3306);

        // Créer la table panier si elle n'existe pas
        await promisePool.query(`
            CREATE TABLE IF NOT EXISTS panier (
                id INT PRIMARY KEY AUTO_INCREMENT,
                client_id INT NOT NULL,
                produit_id INT NOT NULL,
                quantite INT NOT NULL,
                UNIQUE KEY unique_client_produit (client_id, produit_id),
                FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE
            )
        `);
        console.log('\x1b[32m%s\x1b[0m', '✅ Table `panier` vérifiée/créée avec succès !');

        // S'assurer que la colonne photo_url existe et a le type LONGTEXT dans la table clients
        try {
            await promisePool.query('ALTER TABLE clients ADD COLUMN photo_url LONGTEXT');
            console.log('\x1b[32m%s\x1b[0m', '✅ Colonne `photo_url` ajoutée à la table `clients` !');
        } catch (err) {
            // Si la colonne existe déjà, on s'assure qu'elle est de type LONGTEXT
            if (err.errno === 1060 || err.code === 'ER_DUP_FIELDNAME') {
                try {
                    await promisePool.query('ALTER TABLE clients MODIFY COLUMN photo_url LONGTEXT');
                    console.log('\x1b[32m%s\x1b[0m', '✅ Type de la colonne `photo_url` modifié en LONGTEXT !');
                } catch (modifyErr) {
                    console.error('⚠️ Erreur lors de la modification de la colonne photo_url:', modifyErr.message);
                }
            } else {
                console.error('⚠️ Erreur lors de l\'ajout de la colonne photo_url:', err.message);
            }
        }

        return true;
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Erreur de connexion MySQL :', error.message);
        console.error('\x1b[33m%s\x1b[0m', '💡 Vérifie :');
        console.error('   - MySQL est-il démarré ?');
        console.error('   - Host/Port :', process.env.DB_HOST + ':' + (process.env.DB_PORT || 3306));
        console.error('   - Utilisateur :', process.env.DB_USER);
        console.error('   - Mot de passe :', process.env.DB_PASSWORD ? '****' : '(vide)');
        console.error('   - Base de données :', process.env.DB_NAME);
        return false;
    }
};

module.exports = {
    pool: promisePool,
    testConnection
};