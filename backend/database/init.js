const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('\x1b[36m%s\x1b[0m', '🚀 Initialisation de la base de données...');

// Connexion sans base de données spécifique
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Permet d'exécuter plusieurs requêtes
});

// Lire le fichier SQL
const sqlFile = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');

connection.connect((err) => {
    if (err) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Erreur de connexion:', err.message);
        process.exit(1);
    }

    console.log('\x1b[32m%s\x1b[0m', '✅ Connecté à MySQL');

    // Exécuter le script SQL
    connection.query(sqlFile, (error, results) => {
        if (error) {
            console.error('\x1b[31m%s\x1b[0m', '❌ Erreur lors de l\'exécution du script:', error.message);
            console.error('\x1b[33m%s\x1b[0m', 'Détail:', error.sql);
            process.exit(1);
        }

        console.log('\x1b[32m%s\x1b[0m', '✅ Base de données créée avec succès !');
        console.log('\x1b[36m%s\x1b[0m', '📊 Tables créées :');
        console.log('   - users');
        console.log('   - clients');
        console.log('   - animaux');
        console.log('   - veterinaires');
        console.log('   - services');
        console.log('   - rendez_vous');
        console.log('   - horaires_travail');
        console.log('   - produits');
        console.log('   - commandes');
        console.log('   - commande_produit');
        
        // Vérifier les tables créées
        connection.query('USE clinique_veto; SHOW TABLES;', (err, tables) => {
            if (!err && tables[1]) {
                console.log('\n\x1b[36m%s\x1b[0m', '📋 Liste des tables créées :');
                tables[1].forEach(table => {
                    const tableName = Object.values(table)[0];
                    console.log(`   - ${tableName}`);
                });
            }
            
            connection.end();
            console.log('\n\x1b[32m%s\x1b[0m', '✨ Initialisation terminée !');
        });
    });
});