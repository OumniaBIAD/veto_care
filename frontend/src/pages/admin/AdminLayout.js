import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

import AdminDashboard from './AdminDashboard';
import GestionProduits from './GestionProduits';
import GestionServices from './GestionServices';
import GestionVets from './GestionVets';
import GestionRdv from './GestionRdv';
import AdminProfil from './AdminProfil';

export default function AdminLayout() {
    const location = useLocation();
    const { user } = useAuth();
    const [isDark, setIsDark] = React.useState(localStorage.getItem('theme') === 'dark');

    React.useEffect(() => {
        const handleThemeChange = () => setIsDark(localStorage.getItem('theme') === 'dark');
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, []);
    const path = location.pathname;

    const navigateToClass = (target) => {
        if (target === '/admin' && path === '/admin') return 'admin-link active';
        if (target !== '/admin' && path.startsWith(target)) return 'admin-link active';
        return 'admin-link';
    };

    return (
        <div className={`admin-layout ${isDark ? 'dark-mode' : ''}`}>
            <aside className="admin-sidebar">
                <div style={{ padding: 'var(--space-6) var(--space-5)', borderBottom: '1px solid #1e293b' }}>
                    <h3 style={{ color: '#fff', margin: 0 }}>🛠️ VétoAdmin</h3>
                </div>

                <nav className="admin-sidebar-nav" style={{ flex: 1 }}>
                    <Link to="/admin" className={navigateToClass('/admin')}>
                        <span>📊</span> Tableau de bord
                    </Link>
                    <Link to="/admin/rendez-vous" className={navigateToClass('/admin/rendez-vous')}>
                        <span>📅</span> Tous les RDV
                    </Link>
                    <Link to="/admin/produits" className={navigateToClass('/admin/produits')}>
                        <span>🦴</span> Boutique & Produits
                    </Link>
                    <Link to="/admin/services" className={navigateToClass('/admin/services')}>
                        <span>💊</span> Services & Soins
                    </Link>
                    <Link to="/admin/veterinaires" className={navigateToClass('/admin/veterinaires')}>
                        <span>👨‍⚕️</span> Équipe Vétérinaire
                    </Link>
                </nav>

                <Link to="/admin/profil" style={{ textDecoration: 'none', color: 'inherit', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
                    <div style={{ padding: 'var(--space-5)', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: '15px' }} onMouseOver={e => e.currentTarget.style.background='#1e293b'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                        <div className="admin-avatar hover-scale" style={{ width: '40px', height: '40px', fontSize: '1.2rem', marginBottom: 0 }}>
                            {user?.prenom?.[0] || 'A'}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>{user?.prenom || 'Admin'} {user?.nom}</p>
                            <p className="text-xs" style={{ color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{user?.email}</p>
                        </div>
                        <span>⚙️</span>
                    </div>
                </Link>
            </aside>

            <main className="admin-main section">
                <div className="container-lg">
                    <Routes>
                        <Route path="/" element={<AdminDashboard />} />
                        <Route path="/rendez-vous" element={<GestionRdv />} />
                        <Route path="/produits" element={<GestionProduits />} />
                        <Route path="/services" element={<GestionServices />} />
                        <Route path="/veterinaires" element={<GestionVets />} />
                        <Route path="/profil" element={<AdminProfil />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}
