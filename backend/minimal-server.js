const express = require('express');
const app = express();

app.use(express.json());

app.post('/api/auth/login', (req, res) => {
    console.log('Body reçu:', req.body);
    res.json({ 
        success: true, 
        body: req.body,
        message: 'Serveur minimal fonctionne'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = 5003;
app.listen(PORT, () => {
    console.log(`✅ Serveur minimal sur http://localhost:${PORT}`);
    console.log(`Test: POST http://localhost:${PORT}/api/auth/login`);
});
