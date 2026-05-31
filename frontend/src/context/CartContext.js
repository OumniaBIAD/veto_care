import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { clients } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState(() => {
        try { return JSON.parse(localStorage.getItem('cart')) || []; }
        catch { return []; }
    });

    // 1. Charger le panier depuis la DB après la connexion
    useEffect(() => {
        if (user && user.role === 'client') {
            const loadCart = async () => {
                try {
                    const res = await clients.getCart();
                    const dbItems = res.data.data || [];
                    
                    setItems(prev => {
                        // Fusionner le panier local avec le panier DB
                        const merged = [...dbItems];
                        prev.forEach(localItem => {
                            const existing = merged.find(i => i.id === localItem.id);
                            if (existing) {
                                // Conserver la quantité maximale
                                existing.quantite = Math.max(existing.quantite, localItem.quantite);
                            } else {
                                merged.push(localItem);
                            }
                        });
                        return merged;
                    });
                } catch (err) {
                    console.error("Erreur lors du chargement du panier depuis la DB:", err);
                }
            };
            loadCart();
        }
    }, [user]);

    // 2. Synchroniser le panier avec localStorage et la DB
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
        
        if (user && user.role === 'client') {
            clients.saveCart(items).catch(err => {
                console.error("Erreur de synchronisation du panier avec la DB:", err);
            });
        }
    }, [items, user]);

    // 3. Écouter l'événement pour vider le panier lors du logout
    useEffect(() => {
        const handleClear = () => {
            setItems([]);
        };
        window.addEventListener('cart-cleared', handleClear);
        return () => window.removeEventListener('cart-cleared', handleClear);
    }, []);

    const addItem = (product) => {
        setItems(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                return prev.map(i => i.id === product.id
                    ? { ...i, quantite: i.quantite + 1 }
                    : i
                );
            }
            return [...prev, { ...product, quantite: 1 }];
        });
    };

    const removeItem = (productId) => {
        setItems(prev => prev.filter(i => i.id !== productId));
    };

    const updateQuantite = (productId, quantite) => {
        if (quantite <= 0) return removeItem(productId);
        setItems(prev => prev.map(i => i.id === productId ? { ...i, quantite } : i));
    };

    const clearCart = () => setItems([]);

    const total = items.reduce((sum, i) => sum + Number(i.prix) * i.quantite, 0);
    const count = items.reduce((sum, i) => sum + i.quantite, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantite, clearCart, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
};
