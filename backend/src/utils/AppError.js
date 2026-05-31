/**
 * Classe d'erreur personnalisée pour l'API.
 * Permet d'associer un code HTTP à une erreur métier.
 * Usage dans un contrôleur: throw new AppError('Message', 400);
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Erreur attendue (pas un bug)
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
