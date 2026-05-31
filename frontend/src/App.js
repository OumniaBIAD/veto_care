import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts publics
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages Publiques
import HomePage from './pages/public/HomePage';
import ProduitsPage from './pages/public/ProduitsPage';
import ServicesPage from './pages/public/ServicesPage';
import VeterinairesPage from './pages/public/VeterinairesPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import Panier from './pages/client/Panier';

import ClientLayout from './pages/client/ClientLayout';
import AdminLayout from './pages/admin/AdminLayout';
import VetLayout from './pages/vet/VetLayout';

const ProtectedRoute = ({ children, requireAdmin = false, requireVet = false }) => {
    const { user, loading, isAdmin, isVet } = useAuth();
    if (loading) return <div className="loading-screen">Chargement...</div>;
    if (!user) return <Navigate to="/connexion" />;
    
    if (requireAdmin && !isAdmin) return <Navigate to="/espace-client" />;
    if (requireVet && !isVet && !isAdmin) return <Navigate to="/espace-client" />;
    
    return children;
};

// Application
function AppContent() {
    useEffect(() => {
        const handleThemeChange = () => {
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        };
        handleThemeChange();
        window.addEventListener('themeChanged', handleThemeChange);
        return () => window.removeEventListener('themeChanged', handleThemeChange);
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
                <Routes>
                    {/* Routes Publiques */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/produits" element={<ProduitsPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/veterinaires" element={<VeterinairesPage />} />
                    
                    {/* Auth */}
                    <Route path="/connexion" element={<LoginPage />} />
                    <Route path="/inscription" element={<RegisterPage />} />
                    
                    {/* Panier public */}
                    <Route path="/panier" element={<Panier />} />
                    
                    {/* Espace Client */}
                    <Route path="/espace-client/*" element={
                        <ProtectedRoute>
                            <ClientLayout />
                        </ProtectedRoute>
                    } />

                    {/* Espace Vet */}
                    <Route path="/espace-vet/*" element={
                        <ProtectedRoute requireVet={true}>
                            <VetLayout />
                        </ProtectedRoute>
                    } />

                    {/* Espace Admin */}
                    <Route path="/admin/*" element={
                        <ProtectedRoute requireAdmin={true}>
                            <AdminLayout />
                        </ProtectedRoute>
                    } />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <AppContent />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;