import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-grid">
                <div className="footer-brand">
                    <div className="footer-logo">
    
                        <span>VétoCare</span>
                    </div>
                    <p>Votre partenaire de confiance pour la santé et le bonheur de vos animaux.</p>
                    <div className="footer-social">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">📘</a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>
                        <a href="https://whatsapp.com" target="_blank" rel="noreferrer" aria-label="WhatsApp">💬</a>
                    </div>
                </div>

                <div className="footer-col">
                    <h4>Navigation</h4>
                    <Link to="/">Accueil</Link>
                    <Link to="/services">Nos Services</Link>
                    <Link to="/produits">Boutique</Link>
                    <Link to="/veterinaires">Vétérinaires</Link>
                </div>

                <div className="footer-col">
                    <h4>Espace client</h4>
                    <Link to="/connexion">Se connecter</Link>
                    <Link to="/inscription">S'inscrire</Link>
                    <Link to="/espace-client/rendez-vous">Mes rendez-vous</Link>
                    <Link to="/espace-client/commandes">Mes commandes</Link>
                </div>

                <div className="footer-col">
                    <h4>Contact</h4>
                    <p>📍 Maroc</p>
                    <p>📞 +212 555 123 456</p>
                    <p>📧 contact@vetocare.dz</p>
                    <p>🕐 Lun–Sam : 9h–18h</p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} VétoCare. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    );
}
