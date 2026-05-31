const AppError = require('../utils/AppError');

/**
 * Middleware Express de gestion d'erreurs globale.
 * Doit être appelé en DERNIER dans app.js (après toutes les routes).
 * Catpure toutes les erreurs passées via next(error).
 */
const errorHandler = (err, req, res, next) => {
    // Valeurs par défaut
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Erreur interne du serveur';

    // Erreur MySQL : doublon (ex: email déjà utilisé)
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = 'Cette valeur existe déjà en base de données.';
    }

    // Erreur MySQL : clé étrangère inexistante
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'La ressource référencée n\'existe pas.';
    }

    // Log de l'erreur (uniquement en développement pour les erreurs inattendues)
    if (!err.isOperational) {
        console.error('❌ ERREUR INATTENDUE:', err);
    }

    res.status(statusCode).json({
        success: false,
        message,
        // On n'expose la stack qu'en développement
        ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack })
    });
};

module.exports = errorHandler;
