import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ClientLayout.css';

import ClientDashboard from './ClientDashboard';
import MesRendezVous from './MesRendezVous';
import PrendreRdv from './PrendreRdv';
import MesAnimaux from './MesAnimaux';
import MesCommandes from './MesCommandes';
import Panier from './Panier';
import ClientProfil from './ClientProfil';

export default function ClientLayout() {
    const location = useLocation();
    const { user } = useAuth();
    
    // Le chemin courant
    const path = location.pathname;

    const navigateToClass = (target) => {
        if (target === '/espace-client' && path === '/espace-client') return 'sidebar-link active';
        if (target !== '/espace-client' && path.startsWith(target)) return 'sidebar-link active';
        return 'sidebar-link';
    };

    return (
        <div className="client-layout container section" style={{ paddingTop: '40px' }}>
            {/* Sidebar Client */}
            <aside className="client-sidebar card">
                <div className="sidebar-header">
                    <div className="avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {user?.prenom?.[0] || 'U'}
                    </div>
                    <Link to="/espace-client/profil" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>Mon profil</Link>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/espace-client" className={navigateToClass('/espace-client')}>
                        <span>📊</span> Vue d'ensemble
                    </Link>
                    <Link to="/espace-client/rendez-vous" className={navigateToClass('/espace-client/rendez-vous')}>
                        <span>📅</span> Mes rendez-vous
                    </Link>
                    <Link to="/espace-client/prendre-rdv" className={navigateToClass('/espace-client/prendre-rdv')}>
                        <span>➕</span> Prendre un RDV
                    </Link>
                    <Link to="/espace-client/animaux" className={navigateToClass('/espace-client/animaux')}>
                        <span>🐕</span> Mes animaux
                    </Link>
                    <Link to="/espace-client/commandes" className={navigateToClass('/espace-client/commandes')}>
                        <span>📦</span> Mes commandes
                    </Link>
                    
                    <Link to="/espace-client/panier" className={navigateToClass('/espace-client/panier')}>
                        <span>🛒</span> Mon panier
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="client-main">
                <Routes>
                    <Route path="/" element={<ClientDashboard />} />
                    <Route path="/rendez-vous" element={<MesRendezVous />} />
                    <Route path="/prendre-rdv" element={<PrendreRdv />} />
                    <Route path="/animaux" element={<MesAnimaux />} />
                    <Route path="/commandes" element={<MesCommandes />} />
                    <Route path="/profil" element={<ClientProfil />} />
                    <Route path="/panier" element={<Panier />} />
                </Routes>
            </main>
        </div>
    );
}
