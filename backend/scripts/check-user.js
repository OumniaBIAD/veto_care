const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion:', err);
        return;
    }

    console.log('✅ Connecté à MySQL');
    
    // Vérifier les utilisateurs
    connection.query('SELECT id, email, password, role FROM users', (error, users) => {
        if (error) {
            console.error('❌ Erreur:', error);
        } else {
            console.log('\n📋 Liste des utilisateurs:');
            users.forEach(user => {
                console.log(`   ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
                console.log(`   Password hash: ${user.password.substring(0, 30)}...`);
            });
        }
        
        connection.end();
    });
});