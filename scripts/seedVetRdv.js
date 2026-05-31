// seedVetRdv.js – script to seed sample past appointments for the veterinarian Sophie Martin
// This script runs directly against the MySQL database using the project's DB pool.
// It creates four appointments with different statuses (planifie, en_cours, termine, annule).

const { pool } = require('../backend/src/config/db.config'); // promise pool

(async () => {
  try {
    // 1️⃣ Find Sophie Martin (veterinaire) by email
    const [vetRows] = await pool.query(
      "SELECT id FROM veterinaires WHERE email = ? AND actif = true",
      ["sophie.martin@clinique.com"]
    );
    if (!vetRows.length) {
      console.error('❌  Aucun vétérinaire trouvé avec cet e‑mail.');
      process.exit(1);
    }
    const vetId = vetRows[0].id;

    // 2️⃣ Grab three animals (any client) and three services
    const [animalRows] = await pool.query(
      "SELECT id FROM animaux LIMIT 3"
    );
    const [serviceRows] = await pool.query(
      "SELECT id FROM services WHERE actif = true LIMIT 3"
    );
    if (animalRows.length < 3 || serviceRows.length < 3) {
      console.error('❌  Pas assez d’animaux ou de services actifs.');
      process.exit(1);
    }
    const animalIds = animalRows.map(r => r.id);
    const serviceIds = serviceRows.map(r => r.id);

    // 3️⃣ Define past dates (5, 2, 1 day(s) ago) and one future date for the cancelled example
    const now = new Date();
    const dates = [
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 9, 30),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 11, 0),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 14, 15),
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0) // future for cancelled
    ];

    const statuses = ['planifie', 'en_cours', 'termine', 'annule'];

    // 4️⃣ Insert appointments
    for (let i = 0; i < 4; i++) {
      const animalId = animalIds[i % animalIds.length];
      const serviceId = serviceIds[i % serviceIds.length];
      const date = dates[i].toISOString().slice(0, 19).replace('T', ' ');
      const statut = statuses[i];
      await pool.query(
        `INSERT INTO rendez_vous (animal_id, veterinaire_id, service_id, date_rendezvous, duree, notes, statut) ` +
        `VALUES (?, ?, ?, ?, (SELECT duree FROM services WHERE id = ?), ?, ? )`,
        [animalId, vetId, serviceId, date, serviceId, `Rendez‑vous de démonstration (${statut})`, statut]
      );
      console.log(`✅  Rendez‑vous ${i + 1} (${statut}) créé.`);
    }

    console.log('🎉  Tous les rendez‑vous de test ont été insérés avec succès.');
    process.exit(0);
  } catch (err) {
    console.error('❌  Erreur lors du seed :', err.message);
    process.exit(1);
  }
})();
