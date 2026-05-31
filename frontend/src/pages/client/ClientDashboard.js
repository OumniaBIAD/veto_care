import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rendezvous, animaux, commandes } from '../../services/api';

export default function ClientDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ rdv: 0, animaux: 0, commandes: 0 });
    const [prochainRdv, setProchainRdv] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [resRdv, resAnims, resCmds] = await Promise.all([
                    rendezvous.getMyRendezVous(),
                    animaux.getMyAnimals(),
                    commandes.getMesCommandes()
                ]);

                const allRdv = resRdv.data.data || [];
                const futureRdv = allRdv.filter(r => new Date(r.date_rendezvous) > new Date() && r.statut !== 'annule')
                                        .sort((a,b) => new Date(a.date_rendezvous) - new Date(b.date_rendezvous));

                setStats({
                    rdv: futureRdv.length,
                    animaux: resAnims.data.data?.length || 0,
                    commandes: resCmds.data.data?.length || 0
                });

                if (futureRdv.length > 0) setProchainRdv(futureRdv[0]);
                
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return <div>Chargement de votre espace...</div>;

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '8px' }}>Bonjour, {user?.prenom} {user?.nom}</h1>
            <p className="text-muted" style={{ marginBottom: '32px' }}>Bienvenue dans votre espace personnel VétoCare.</p>

            <div className="grid-3" style={{ marginBottom: '40px' }}>
                <div className="card text-center" style={{ padding: '20px' }}>
                     <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
                     <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.rdv}</h3>
                     <p className="text-muted">RDV à venir</p>
                </div>
                <div className="card text-center" style={{ padding: '20px' }}>
                     <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🐕</div>
                     <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.animaux}</h3>
                     <p className="text-muted">Animaux inscrits</p>
                </div>
                <div className="card text-center" style={{ padding: '20px' }}>
                     <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
                     <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{stats.commandes}</h3>
                     <p className="text-muted">Commandes</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header flex-between">
                        <h3>Prochain rendez-vous</h3>
                    </div>
                    <div className="card-body">
                        {prochainRdv ? (
                            <div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
                                    <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                            {new Date(prochainRdv.date_rendezvous).toLocaleString('fr', {month: 'short'})}
                                        </span>
                                        <span style={{ fontSize: '22px', fontWeight: 'bold', lineHeight: 1 }}>
                                            {new Date(prochainRdv.date_rendezvous).getDate()}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0 }}>Consultation {prochainRdv.service_nom}</h4>
                                        <p className="text-sm text-muted" style={{ margin: '4px 0 0 0' }}>Pour <strong>{prochainRdv.animal_nom}</strong></p>
                                    </div>
                                </div>
                                <p className="text-sm">👨‍⚕️ Dr {prochainRdv.veterinaire_prenom} {prochainRdv.veterinaire_nom}</p>
                                <p className="text-sm">🕒 {new Date(prochainRdv.date_rendezvous).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        ) : (
                            <p className="text-muted">Vous n'avez aucun rendez-vous programmé.</p>
                        )}
                        <button onClick={() => navigate('/espace-client/prendre-rdv')} className="btn btn-primary btn-full" style={{ marginTop: '20px' }}>
                            Prendre un rendez-vous
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header flex-between">
                        <h3>Boutique rapide</h3>
                    </div>
                    <div className="card-body text-center">
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🦴</div>
                        <p style={{ marginBottom: '20px' }}>Découvrez nos nouveaux produits pour le bien-être de votre animal.</p>
                        <Link to="/produits" className="btn btn-secondary btn-full">
                            Visiter la boutique
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
