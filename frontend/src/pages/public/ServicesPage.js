import React, { useState, useEffect } from 'react';
import { services as servicesApi } from '../../services/api';
import { Link } from 'react-router-dom';



const getServiceImage = (nom) => {
    const images = {
        'Consultation generale': "/images/consultation.png",
        'Vaccination': "https://cdn.vectorstock.com/i/1000v/19/29/pet-vaccine-icon-vector-51971929.jpg",
        'Chirurgie': "/images/chirurgie.png",
        'Dermatologie': "/images/dermatologie.png",
        'Toilettage': "https://img.freepik.com/vecteurs-premium/toilettage-pour-chien-logo-du-salon-toilettage-poils-animaux-coupes-cheveux-baignade_528132-577.jpg?w=2000"
    };
    return images[nom] || "/logo-clinique.png";
};

export default function ServicesPage() {
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        servicesApi.getAll()
            .then(res => {
                setServicesList(res.data.data || []);
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
                    <h1>Nos Prestations</h1>
                    <p>Découvrez tous les soins et services proposés par notre clinique.</p>
                </div>
            </div>

            <section className="section bg-light" style={{ minHeight: '60vh' }}>
                <div className="container">
                    {servicesList.length === 0 ? (
                        <div className="empty-state">
<div className="empty-icon"><img src="https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=60&h=60" alt="Clinic" style={{borderRadius:'50%',marginRight:'8px'}}/></div>
                            <h3>Aucun service pour le moment</h3>
                        </div>
                    ) : (
                        <div className="grid-3">
                            {servicesList.map(s => (
                                <div key={s.id} className="service-card card fade-in hover-scale" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={getServiceImage(s.nom)} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                                        <div>
                                            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem' }}>{s.nom}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px' }}>{s.description || 'Service professionnel pour votre animal'}</p>
                                        </div>
                                        <div className="service-meta" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                            <span className="service-duration" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏱ {s.duree} min</span>
                                            <span className="service-price" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{s.prix} €</span>
                                        </div>
                                    </div>
                                    <div className="card-footer" style={{ padding: '15px 20px', background: 'var(--bg-secondary)' }}>
                                         <Link to="/espace-client/prendre-rdv" className="btn btn-ghost btn-full">Prendre RDV</Link>
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
