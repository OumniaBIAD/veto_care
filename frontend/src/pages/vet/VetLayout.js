// VetLayout.js - Veterinary dashboard layout
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import VetAgenda from './VetAgenda';
import VetClients from './VetClients';
import VetNotes from './VetNotes';
import VetProfile from './VetProfile';
import VetDashboard from './VetDashboard';
import '../admin/AdminLayout.css';

export default function VetLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Apply dark mode setting
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    const handleThemeChange = () => setIsDark(localStorage.getItem('theme') === 'dark');
    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const [collapsed, setCollapsed] = useState(false);
  const path = location.pathname;

  const navigateToClass = (target) => {
    if (target === '/espace-vet' && path === '/espace-vet') return 'admin-link active';
    if (target !== '/espace-vet' && path.startsWith(target)) return 'admin-link active';
    return 'admin-link';
  };

  return (
    <div className={`admin-layout ${isDark ? 'dark-mode' : ''} ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="sidebar-toggle-btn"
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>
      <aside className="admin-sidebar">
        <div style={{ padding: 'var(--space-6) var(--space-5)', borderBottom: '1px solid #1e293b' }}>
          <h3 style={{ color: '#fff', margin: 0 }}>🩺 Panel Vétérinaire</h3>
        </div>
        <nav className="admin-sidebar-nav" style={{ flex: 1, marginTop: 'var(--space-3)' }}>
          <Link to="/espace-vet" className={navigateToClass('/espace-vet')}>🏠 Accueil</Link>
          <Link to="/espace-vet/agenda" className={navigateToClass('/espace-vet/agenda')}>📅 Mon Agenda</Link>
          <Link to="/espace-vet/clients" className={navigateToClass('/espace-vet/clients')}>🐾 Clients</Link>
          <Link to="/espace-vet/notes" className={navigateToClass('/espace-vet/notes')}>🗒️ Carnet de notes</Link>
          <Link to="/espace-vet/profile" className={navigateToClass('/espace-vet/profile')}>👤 Mon Profil</Link>
        </nav>
        <div style={{ padding: 'var(--space-5)', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="admin-avatar" style={{ width: '40px', height: '40px', fontSize: '1.2rem', marginBottom: 0 }}>
              {user?.prenom?.[0] || user?.email?.charAt(0).toUpperCase() || 'V'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, color: '#fff', fontWeight: 'bold' }}>
                Dr. {user?.prenom || ''} {user?.nom || ''}
              </p>
              <p className="text-xs" style={{ color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={logout} className="btn btn-danger btn-full btn-sm" style={{ marginTop: '15px' }}>
            Se déconnecter
          </button>
        </div>
      </aside>
      <main className="admin-main section">
        <div className="container-lg">
          <Routes>
            <Route path="/" element={<VetDashboard />} />
            <Route path="agenda" element={<VetAgenda />} />
            <Route path="clients/*" element={<VetClients />} />
            <Route path="notes" element={<VetNotes />} />
            <Route path="profile" element={<VetProfile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
