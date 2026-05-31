const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
    // Récupérer le token du header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Accès non autorisé. Token manquant.' 
        });
    }

    try {
        // Vérifier le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Récupérer l'utilisateur
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non trouvé.' 
            });
        }

        // Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token invalide.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expiré.' 
            });
        }
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de l\'authentification.' 
        });
    }
};

// Middleware pour vérifier le rôle administrateur
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Accès refusé. Droits administrateur requis.' 
        });
    }
};

// Middleware optionnel pour vérifier le rôle client
const isClient = (req, res, next) => {
    if (req.user && (req.user.role === 'client' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Accès refusé. Compte client requis.' 
        });
    }
};

const isVet = (req, res, next) => {
    if (req.user && (req.user.role === 'veterinaire' || req.user.role === 'admin')) {
        next();
    } else {
        return res.status(403).json({ 
            success: false, 
            message: 'Accès refusé. Compte vétérinaire requis.' 
        });
    }
};

module.exports = {
    authenticateToken,
    isAdmin,
    isClient,
    isVet
};