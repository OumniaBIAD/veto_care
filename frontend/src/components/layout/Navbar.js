import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const { t, i18n } = useTranslation();
    const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        const handleThemeChange = () => setIsDark(localStorage.getItem('theme') === 'dark');
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDark;
        setIsDark(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        window.dispatchEvent(new Event('themeChanged'));
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <header className="navbar">
            <div className="container navbar-inner">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <img src="/logo-clinique.png" alt="logo" style={{ borderRadius: '50%', width: '40px', height: '40px', objectFit: 'cover' }} />
                    <div>
                        <span className="logo-name">VétoCare</span>
                        <span className="logo-tagline">Clinique & Animalerie</span>
                    </div>
                </Link>

                {/* Navigation principale */}
                <nav className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
                    <Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>{t('navbar.home')}</Link>
                    <Link to="/services" className={isActive('/services')} onClick={() => setMenuOpen(false)}>{t('navbar.services')}</Link>
                    <Link to="/produits" className={isActive('/produits')} onClick={() => setMenuOpen(false)}>{t('navbar.products')}</Link>
                    <Link to="/veterinaires" className={isActive('/veterinaires')} onClick={() => setMenuOpen(false)}>{t('navbar.vets')}</Link>
                </nav>

                {/* Actions */}
                <div className="navbar-actions">
                    {/* Panier */}
                    {!isAdmin && (
                        <Link to="/panier" className="cart-btn">
                            🛒
                            {count > 0 && <span className="cart-badge">{count}</span>}
                        </Link>
                    )}

                    {user ? (
                        <div className="user-menu">
                            <Link
                                to={isAdmin ? '/admin' : '/espace-client'}
                                className="btn btn-primary btn-sm"
                            >
                                {isAdmin ? '⚙️ Admin' : t('navbar.dashboard')}
                            </Link>
                            <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                {t('navbar.logout')}
                            </button>
                        </div>
                    ) : (
                        <div className="auth-btns">
                            <Link to="/connexion" className="btn btn-ghost btn-sm">{t('navbar.login')}</Link>
                            <Link to="/inscription" className="btn btn-primary btn-sm">{t('navbar.register')}</Link>
                        </div>
                    )}

                    {/* Bouton Dark Mode */}
                    <button 
                        onClick={toggleTheme} 
                        className="theme-toggle-btn"
                        title={isDark ? "Passer au mode clair" : "Passer au mode sombre"}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '6px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text)'
                        }}
                    >
                        {isDark ? '☀️' : '🌙'}
                    </button>

                    {/* Sélecteur de langue */}
                    <div className="lang-switcher" style={{ display: 'flex', gap: '5px' }}>
                        <button 
                            onClick={() => changeLanguage('fr')} 
                            className={`btn-lang ${i18n.language === 'fr' ? 'active' : ''}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i18n.language === 'fr' ? 1 : 0.5 }}
                        >
                            🇫🇷
                        </button>
                        <button 
                            onClick={() => changeLanguage('en')} 
                            className={`btn-lang ${i18n.language === 'en' ? 'active' : ''}`}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: i18n.language === 'en' ? 1 : 0.5 }}
                        >
                            🇬🇧
                        </button>
                    </div>

                    {/* Burger */}
                    <button className="burger" onClick={() => setMenuOpen(!menuOpen)}>
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
