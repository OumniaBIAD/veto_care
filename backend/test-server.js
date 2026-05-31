const express = require('express');
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test simple
app.post('/test', (req, res) => {
    console.log('Body reçu dans /test:', req.body);
    res.json({ 
        success: true, 
        body: req.body,
        headers: req.headers
    });
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🧪 Test server démarré sur http://localhost:${PORT}`);
    console.log(`Testez avec: POST http://localhost:${PORT}/test`);
    console.log(`Body JSON: {"email": "test@test.com", "password": "123"}`);
});