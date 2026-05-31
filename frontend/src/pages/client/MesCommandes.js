import React, { useState, useEffect } from 'react';
import { commandes } from '../../services/api';

export default function MesCommandes() {
    const [mesCommandes, setMesCommandes] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCommandes = async () => {
        try {
            const res = await commandes.getMesCommandes();
            const sorted = (res.data.data || []).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
            setMesCommandes(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCommandes(); }, []);

    const annulerCommande = async (id) => {
        if(!window.confirm('Voulez-vous annuler cette commande ?')) return;
        try {
            await commandes.annuler(id);
            loadCommandes();
        } catch (err) {
            alert('Erreur lors de l\'annulation');
        }
    }

    const getStatusText = (status) => {
         const dict = { 'en_attente': 'En attente', 'confirmee': 'Confirmée', 'expediee': 'Expédiée', 'livree': 'Livrée', 'annulee': 'Annulée' };
         return dict[status] || status;
    };

    if (loading) return <div>Chargement des commandes...</div>;

    return (
        <div className="fade-in">
            <div className="client-page-header">
                <h2>Mes Commandes</h2>
            </div>

            {mesCommandes.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-icon">📦</div>
                    <h3>Vous n'avez passé aucune commande</h3>
                    <p>Rendez-vous dans la boutique pour commander des produits.</p>
                </div>
            ) : (
                <div className="cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {mesCommandes.map(cmd => {
                        let total = 0;
                        try {
                            const details = typeof cmd.items === 'string' ? JSON.parse(cmd.items) : cmd.items;
                            if (Array.isArray(details)) {
                                total = details.reduce((sum, item) => sum + (item.prix_unitaire * item.quantite), 0);
                            }
                        } catch { total = cmd.total_prix || 0; }

                        const canCancel = cmd.statut === 'en_attente';

                        return (
                            <div key={cmd.id} className="card">
                                <div className="card-header flex-between" style={{ background: 'var(--bg-secondary)' }}>
                                    <div>
                                        <p className="text-sm text-muted" style={{ marginBottom: '4px' }}>Commande N° {cmd.id}</p>
                                        <h4 style={{ margin: 0 }}>Passée le {new Date(cmd.created_at).toLocaleDateString('fr-FR')}</h4>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge badge-${cmd.statut}`} style={{ marginBottom: '6px' }}>
                                            {getStatusText(cmd.statut)}
                                        </span>
                                        <p style={{ margin: 0, fontWeight: '700', fontSize: '1.1rem' }}>{Number(cmd.total_prix || total).toFixed(2)} €</p>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="grid-2">
                                        <div>
                                            <p className="text-sm font-semibold">📍 Adresse de livraison</p>
                                            <p className="text-sm text-muted">{cmd.adresse_livraison}</p>
                                        </div>
                                        {cmd.notes && (
                                            <div>
                                                <p className="text-sm font-semibold">📝 Notes</p>
                                                <p className="text-sm text-muted">{cmd.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {canCancel && (
                                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => annulerCommande(cmd.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                                            Annuler cette commande
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
