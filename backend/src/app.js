const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth.routes');
const veterinaireRoutes = require('./routes/veterinaire.routes');
const serviceRoutes = require('./routes/service.routes');
const rendezvousRoutes = require('./routes/rendezvous.routes');
const animalRoutes = require('./routes/animal.routes');
const produitRoutes = require('./routes/produit.routes');
const commandeRoutes = require('./routes/commande.routes');
const clientRoutes = require('./routes/client.routes');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Logging
app.use((req, res, next) => {
    console.log(`\n📡 ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('   Body:', req.body);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/veterinaires', veterinaireRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/rendezvous', rendezvousRoutes);
app.use('/api/animaux', animalRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/clients', clientRoutes);

// Route de santé
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'API Clinique Vétérinaire' });
});

// Gestionnaire d'erreurs global — DOIT être en dernier
app.use(errorHandler);

module.exports = app;