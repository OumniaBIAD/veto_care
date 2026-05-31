const { pool } = require('./src/config/db.config');

async function updateAll() {
    try {
        console.log("Updating Produits...");
        await pool.query("UPDATE produits SET image_url = '/images/dog_food.png' WHERE nom LIKE '%Croquettes%' OR categorie = 'Alimentation'");
        await pool.query("UPDATE produits SET image_url = '/images/cat_toy.png' WHERE nom LIKE '%Jouet%' OR categorie = 'Accessoires'");
        
        console.log("Updating Veterinaires...");
        // Wait, vaccinators don't have an image_url in DB, let's ignore vets DB update and just use UI for vet images if needed, or I won't touch vets DB.
        
        console.log("Database update complete.\n");
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}
updateAll();
