import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (token && savedUser) {
            try { setUser(JSON.parse(savedUser)); }
            catch { localStorage.clear(); }
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const updateUser = (newUserData) => {
        const updated = { ...user, ...newUserData };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    const logout = () => {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Clear notes for veterinarian session
        localStorage.removeItem('vet_notes');
        // Clear cart from localStorage and notify CartContext via storage event
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-cleared'));
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            updateUser,
            logout,
            isAdmin: user?.role === 'admin',
            isVet: user?.role === 'veterinaire'
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
