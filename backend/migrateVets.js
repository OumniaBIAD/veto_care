const { pool } = require('./src/config/db.config');
const bcrypt = require('bcrypt');

async function migrate() {
    try {
        console.log("Modification de la table users...");
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'client', 'veterinaire') DEFAULT 'client'");
        
        console.log("Modification de la table veterinaires...");
        // On check si la colonne existe
        const [columns] = await pool.query("SHOW COLUMNS FROM veterinaires LIKE 'user_id'");
        if (columns.length === 0) {
            await pool.query("ALTER TABLE veterinaires ADD COLUMN user_id INT UNIQUE");
            await pool.query("ALTER TABLE veterinaires ADD CONSTRAINT fk_vet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
        }

        console.log("Création de comptes users pour les vétérinaires existants...");
        const [vets] = await pool.query("SELECT * FROM veterinaires WHERE user_id IS NULL");
        for (let vet of vets) {
            console.log(`Création compte pour ${vet.email}...`);
            const pwd = await bcrypt.hash('veto123', 10);
            const [res] = await pool.query(
                "INSERT INTO users (email, password, role) VALUES (?, ?, 'veterinaire')",
                [vet.email, pwd]
            );
            await pool.query("UPDATE veterinaires SET user_id = ? WHERE id = ?", [res.insertId, vet.id]);
        }

        console.log("Migration terminée avec succès !");
        process.exit(0);
    } catch (error) {
        console.error("Erreur lors de la migration:", error);
        process.exit(1);
    }
}
migrate();
