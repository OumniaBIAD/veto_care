import React, { useState, useEffect } from 'react';
import { veterinaires as vetsApi } from '../../services/api';

// Image Mapper for premium stock photography from the web
const getVetImage = (id) => {
    const images = {
        1: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400", // Dr Sophie Martin
        2: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400", // Dr Thomas Bernard
        3: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400"  // Dr Julie Petit
    };
    return images[id] || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400&h=400";
};

export default function VeterinairesPage() {
    const [vetsList, setVetsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        vetsApi.getAll()
            .then(res => {
                setVetsList(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading-screen">Chargement...</div>;

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>L'équipe de Vétérinaires</h1>
                    <p>Des experts passionnés par le bien-être de vos animaux.</p>
                </div>
            </div>

            <section className="section bg-light" style={{ minHeight: '60vh' }}>
                <div className="container">
                    {vetsList.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍⚕️</div>
                            <h3>Notre équipe est en cours de constitution</h3>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {vetsList.map(v => (
                                <div key={v.id} className="vet-card card fade-in hover-scale">
                                    <div className="card-body" style={{ textAlign: 'center', padding: '30px var(--space-5)' }}>
                                        <div className="vet-avatar" style={{ margin: '0 auto 20px', width: '120px', height: '120px', overflow: 'hidden', borderRadius: '50%', boxShadow: 'var(--shadow-md)', border: '3px solid var(--white)' }}>
                                            <img src={getVetImage(v.id)} alt={`Dr ${v.prenom} ${v.nom}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Dr {v.prenom} {v.nom}</h3>
                                        <span className="vet-specialty" style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--bg-secondary)', borderRadius: '99px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', marginBottom: '20px' }}>
                                            {v.specialite || 'Médecine générale'}
                                        </span>
                                        <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <span>📞</span> {v.telephone || 'Non renseigné'}
                                            </p>
                                            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                <span>📧</span> {v.email || 'Non renseigné'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
