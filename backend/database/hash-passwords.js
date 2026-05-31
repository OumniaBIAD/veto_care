const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function hashPasswords() {
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME
    });

    connection.connect(async (err) => {
        if (err) {
            console.error('Erreur de connexion:', err);
            return;
        }

        console.log('✅ Connecté à la base de données');
        console.log('🔄 Hashage des mots de passe...');

        // Récupérer tous les utilisateurs
        connection.query('SELECT id, password FROM users', async (error, users) => {
            if (error) {
                console.error('Erreur:', error);
                connection.end();
                return;
            }

            for (const user of users) {
                // Vérifier si le mot de passe n'est pas déjà hashé
                if (!user.password.startsWith('$2b$')) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    
                    connection.query(
                        'UPDATE users SET password = ? WHERE id = ?',
                        [hashedPassword, user.id],
                        (updateError) => {
                            if (updateError) {
                                console.error(`Erreur pour l'utilisateur ${user.id}:`, updateError);
                            } else {
                                console.log(`✅ Utilisateur ${user.id} mis à jour`);
                            }
                        }
                    );
                } else {
                    console.log(`⏭️ Utilisateur ${user.id} déjà hashé`);
                }
            }

            setTimeout(() => {
                connection.end();
                console.log('✨ Hashage terminé !');
            }, 1000);
        });
    });
}

hashPasswords();