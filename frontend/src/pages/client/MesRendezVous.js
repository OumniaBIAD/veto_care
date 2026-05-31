import React, { useState, useEffect } from 'react';
import { rendezvous } from '../../services/api';
import { Link } from 'react-router-dom';

export default function MesRendezVous() {
    const [rdvList, setRdvList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRdv = async () => {
        try {
            const res = await rendezvous.getMyRendezVous();
            // Trier du plus récent au plus ancien, ou plus proche au plus lointain
            const sorted = (res.data.data || []).sort((a,b) => new Date(b.date_rendezvous) - new Date(a.date_rendezvous));
            setRdvList(sorted);
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRdv(); }, []);

    const annulerRdv = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler ce rendez-vous ?")) return;
        try {
            await rendezvous.updateStatus(id, 'annule');
            fetchRdv();
        } catch (err) {
            alert('Impossible d\'annuler ce rendez-vous.');
        }
    };

    const getStatusText = (status) => {
         const dict = { 'planifie': 'Planifié', 'confirme': 'Confirmé', 'termine': 'Terminé', 'annule': 'Annulé', 'en_cours': 'En cours' };
         return dict[status] || status;
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="fade-in">
            <div className="client-page-header">
                <h2>Mes Rendez-vous</h2>
                <Link to="/espace-client/prendre-rdv" className="btn btn-primary">
                    + Nouveau RDV
                </Link>
            </div>

            {rdvList.length === 0 ? (
                <div className="empty-state card">
                    <div className="empty-icon">📅</div>
                    <h3>Aucun historique</h3>
                    <p>Vous n'avez pas encore pris de rendez-vous pour vos animaux.</p>
                </div>
            ) : (
                <div className="cards" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {rdvList.map(rdv => {
                        const isPast = new Date(rdv.date_rendezvous) < new Date();
                        const canCancel = !isPast && rdv.statut !== 'annule' && rdv.statut !== 'termine';
                        
                        return (
                            <div key={rdv.id} className="card">
                                <div className="card-header flex-between">
                                    <h4 style={{ margin: 0 }}>
                                        {new Date(rdv.date_rendezvous).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})} à {new Date(rdv.date_rendezvous).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                                    </h4>
                                    <span className={`badge badge-${rdv.statut}`}>
                                        {getStatusText(rdv.statut)}
                                    </span>
                                </div>
                                <div className="card-body">
                                    <div className="grid-3" style={{ gap: '15px' }}>
                                        <div>
                                            <p className="text-muted text-sm">Animal</p>
                                            <p className="font-semibold">🐕 {rdv.animal_nom}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted text-sm">Vétérinaire</p>
                                            <p className="font-semibold">👨‍⚕️ Dr {rdv.veterinaire_nom}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted text-sm">Prestation</p>
                                            <p className="font-semibold">💊 {rdv.service_nom}</p>
                                        </div>
                                    </div>
                                    {rdv.notes && (
                                        <div style={{ marginTop: '15px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                                            <p className="text-sm"><strong>Notes: </strong>{rdv.notes}</p>
                                        </div>
                                    )}
                                </div>
                                {canCancel && (
                                    <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => annulerRdv(rdv.id)} className="btn btn-danger btn-sm">
                                            Annuler le rendez-vous
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
