import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { commandes } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Panier() {
    const { items, total, updateQuantite, removeItem, clearCart } = useCart();
    const [adresse, setAdresse] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCommande = async (e) => {
        e.preventDefault();
        
        if (!user) {
            navigate('/connexion');
            return;
        }

        setLoading(true);
        setError('');

        if (items.length === 0) return;

        // Préparer le format attendu par le backend: [{ produit_id, quantite, prix_unitaire }]
        const panierFormatte = items.map(i => ({
            produit_id: i.id,
            quantite: i.quantite,
            prix_unitaire: i.prix
        }));

        try {
            await commandes.create({
                panier: panierFormatte,
                adresse_livraison: adresse || 'Retrait en clinique',
                notes
            });
            clearCart();
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la commande');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container section text-center">
                <span style={{ fontSize: '4rem' }}>✅</span>
                <h2>Commande confirmée !</h2>
                <p className="text-muted" style={{ margin: 'var(--space-4) 0' }}>
                    Merci pour votre commande. Vous pouvez suivre son statut dans votre espace client.
                </p>
                <button onClick={() => navigate('/espace-client/commandes')} className="btn btn-primary">
                    Voir mes commandes
                </button>
            </div>
        );
    }

    return (
        <div className="container section">
            <h1 style={{ marginBottom: 'var(--space-6)' }}>Votre Panier</h1>

            {items.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-icon">🛒</div>
                    <h3>Votre panier est vide</h3>
                    <p>Découvrez nos produits pour vos compagnons.</p>
                    <button onClick={() => navigate('/produits')} className="btn btn-primary">
                        Aller à la boutique
                    </button>
                </div>
            ) : (
                <div className="cart-grid">
                    {/* Liste des produits */}
                    <div className="card fade-in">
                        <div className="card-header">
                            <h3>Articles ({items.length})</h3>
                        </div>
                        <div className="card-body">
                            {items.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '20px', paddingBottom: '20px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {item.image_url ? <img src={item.image_url} alt={item.nom} style={{ maxHeight: '100%' }} /> : '🐾'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div className="flex-between">
                                            <h4 style={{ margin: 0 }}>{item.nom}</h4>
                                            <button onClick={() => removeItem(item.id)} className="btn btn-ghost btn-sm" style={{ padding: '4px', color: 'var(--danger)' }}>✕</button>
                                        </div>
                                        <p className="text-muted text-sm">{Number(item.prix).toFixed(2)} € / unité</p>
                                        
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                                                <button onClick={() => updateQuantite(item.id, item.quantite - 1)} style={{ border: 'none', background: 'transparent', padding: '5px 10px', cursor: 'pointer' }}>-</button>
                                                <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: '500' }}>{item.quantite}</span>
                                                <button onClick={() => updateQuantite(item.id, item.quantite + 1)} style={{ border: 'none', background: 'transparent', padding: '5px 10px', cursor: 'pointer' }}>+</button>
                                            </div>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                                                {(item.prix * item.quantite).toFixed(2)} €
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Résumé et formulaire */}
                    <div className="fade-in">
                        <form onSubmit={handleCommande} className="card" style={{ position: 'sticky', top: '90px' }}>
                            <div className="card-header">
                                <h3>Résumé</h3>
                            </div>
                            <div className="card-body">
                                <div className="flex-between" style={{ marginBottom: '10px' }}>
                                    <span className="text-muted">Sous-total</span>
                                    <span>{total.toFixed(2)} €</span>
                                </div>
                                <div className="flex-between" style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                                    <span className="text-muted">Livraison</span>
                                    <span>Gratuite</span>
                                </div>
                                <div className="flex-between" style={{ marginBottom: '30px', fontSize: '1.25rem', fontWeight: '800' }}>
                                    <span>Total</span>
                                    <span className="text-primary">{total.toFixed(2)} €</span>
                                </div>

                                {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label">Adresse de livraison</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Votre adresse complète. Laissez vide pour un retrait à la clinique."
                                        value={adresse}
                                        onChange={e => setAdresse(e.target.value)}
                                        rows="2"
                                    ></textarea>
                                </div>

                                <div className="form-group" style={{ marginBottom: '30px' }}>
                                    <label className="form-label">Notes (optionnel)</label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Instructions particulières"
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        rows="2"
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn btn-success btn-full btn-lg" disabled={loading}>
                                    {!user ? 'Se connecter pour commander' : loading ? 'Traitement...' : 'Confirmer la commande'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
