require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db.config');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(` Serveur démarré sur http://localhost:${PORT}`);
  console.log(` ${new Date().toLocaleString()}`);
  await testConnection();
});