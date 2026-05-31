import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { services, produits, veterinaires as vetsApi } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useTranslation } from 'react-i18next';
import './HomePage.css';

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

const getProductImage = (p) => {
    const images = {
        'Anti-puces pipettes': "https://www.chevaleo.com/5694-thickbox_default/pipettes-anti-puces-et-tiques-petits-chiens-moins-de-15kg-trixie-3-x-15ml.jpg",
        'Brosse demelante': "https://media.adeo.com/mkp/b43ddeca2210087da0adfe7dbed7bd34/media.jpeg",
        'Croquettes Premium 2kg': "https://botanic-botanic-storage.omn.proximis.com/Imagestorage/images/0/0/68888fa69a464_740326.png",
        'Jouet corde': "https://www.hemandboo.co.uk/wp-content/uploads/2025/01/0001081_extreme-rope-dog-toys.jpeg",
        'Litiere agglomerante 10L': "https://media.os.fressnapf.com/products-v2/7/5/c/d/75cd1ea0f0bf1aa0bdda25f205065b3900ea9db1_7f496adac84a8b921365e0196670461a75f52d4f.jpg"
    };

    if (images[p.nom]) return images[p.nom];

    if (p.image_url && !p.image_url.startsWith('/images/placeholder') && !p.image_url.startsWith('/images/dog_food') && !p.image_url.startsWith('/images/cat_toy')) {
        return p.image_url;
    }
    if (p.nom.toLowerCase().includes('croquettes') || p.categorie === 'Alimentation') {
        return "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=500&h=500";
    }
    if (p.nom.toLowerCase().includes('litiere') || p.categorie === 'Hygiene') {
        return "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&q=80&w=500&h=500";
    }
    if (p.nom.toLowerCase().includes('puces') || p.categorie === 'Traitement') {
        return "https://images.unsplash.com/photo-1608454509000-19cfe93616a7?auto=format&fit=crop&q=80&w=500&h=500";
    }
    if (p.nom.toLowerCase().includes('jouet') || p.categorie === 'Accessoires') {
        return "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=500&h=500";
    }
    if (p.nom.toLowerCase().includes('brosse') || p.categorie === 'Toilettage') {
        return "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=500&h=500";
    }
    return "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=500&h=500";
};

const getVetImage = (id) => {
    const images = {
        1: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400&h=400", // Dr Sophie Martin
        2: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400&h=400", // Dr Thomas Bernard
        3: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400&h=400"  // Dr Julie Petit
    };
    return images[id] || "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=400&h=400";
};

export default function HomePage() {
    const [servicesList, setServicesList] = useState([]);
    const [produitsList, setProduitsList] = useState([]);
    const [vetsList, setVetsList] = useState([]);
    const { addItem } = useCart();
    const [added, setAdded] = useState(null);
    const { t } = useTranslation();

    useEffect(() => {
        services.getAll().then(r => setServicesList(r.data.data?.slice(0, 3) || [])).catch(() => {});
        produits.getAll().then(r => setProduitsList(r.data.data?.slice(0, 4) || [])).catch(() => {});
        vetsApi.getAll().then(r => setVetsList(r.data.data?.slice(0, 3) || [])).catch(() => {});
    }, []);

    const handleAddToCart = (p) => {
        addItem(p);
        setAdded(p.id);
        setTimeout(() => setAdded(null), 1500);
    };

    return (
        <div className="home">
            {/* ===== HERO ===== */}
            <section className="hero" role="banner">
                <div className="container hero-content">
                    <div className="hero-text fade-in">
                        
                        <h1>{t('home.hero_title')}</h1>
                        <p>{t('home.hero_subtitle')}</p>
                        <div className="hero-actions">
                            <Link to="/inscription" className="btn btn-primary btn-lg">
                                {t('home.cta_rdv')}
                            </Link>
                            <Link to="/services" className="btn btn-secondary btn-lg">
                                {t('home.cta_services')}
                            </Link>
                        </div>
            <hr className="hero-divider" />
                        <div className="hero-stats">
                            <div className="stat"><strong>500+</strong><span>Clients satisfaits</span></div>
                            <div className="stat"><strong>15+</strong><span>Années d'expérience</span></div>
                            <div className="stat"><strong>3</strong><span>Vétérinaires experts</span></div>
                        </div>
                    </div>
                    <div className="floating-card card1" style={{ position: 'absolute', top: '10%', left: '-10%' }}>
    <span>Rendez-vous confirmé</span>
</div>
<div className="floating-card card2" style={{ position: 'absolute', bottom: '10%', right: '-10%' }}>
    <span>4.9/5 avis clients</span>
</div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="features section-sm">
                <div className="container">
                    <div className="features-grid">
                        {[
                            { icon: <img src="https://hm6.ma/wp-content/uploads/2020/04/rendez-vous.jpg" alt="Rendez-vous" style={{width:'80px',height:'80px',marginRight:'8px'}}/>, title: 'Rendez-vous en ligne', desc: 'Réservez 24h/24 depuis votre espace client' },
                            { icon: <img src="https://99designs-blog.imgix.net/blog/wp-content/uploads/2020/08/How_to_start_an_online_store__the_ultimate_guide_jpg_P8BknsPh-700x410.jpg" alt="Boutique" style={{width:'80px',height:'80px',marginRight:'8px'}}/>, title: 'Boutique en ligne', desc: 'Produits et accessoires livrés à domicile' },
                            { icon: <img src="https://storage.letudiant.fr/mediatheque/letudiant/7/3/2747473-le-veterinaire-diagnostique-et-traite-les-maladies-des-animaux-632x421.jpg" alt="Vétérinaires" style={{width:'80px',height:'80px',marginRight:'8px'}}/>, title: 'Médecins expérimentés', desc: 'Vétérinaires certifiés et spécialisés' },
                            { icon: <img src="https://www.gentletouchanimalhospital.com/blog/images/shutterstock_1919277032.jpg" alt="Vaccinations" style={{width:'80px',height:'80px',marginRight:'8px'}}/>, title: 'Suivi vaccinations', desc: 'Historique complet de santé de votre animal' },
                        ].map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== SERVICES ===== */}
            {servicesList.length > 0 && (
                <section className="section bg-light">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Nos Prestations</span>
                            <h2>{t('home.services_title')}</h2>
                            <p>{t('home.services_subtitle')}</p>
                        </div>
                        <div className="grid-3">
                            {servicesList.map(s => (
                                <div key={s.id} className="service-card card hover-scale" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                    <div style={{ height: '300px', overflow: 'hidden', position: 'relative' }}>
                                        <img src={getServiceImage(s.nom)} alt={s.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
                                        <div>
                                            <h3 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem' }}>{s.nom}</h3>
                                            <p className="text-muted" style={{ fontSize: '0.875rem', marginBottom: '16px', minHeight: '40px' }}>{s.description || 'Service professionnel pour votre animal'}</p>
                                        </div>
                                        <div className="service-meta" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                                            <span className="service-duration" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>⏱ {s.duree} min</span>
                                            <span className="service-price" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{s.prix} €</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="section-cta">
                            <Link to="/services" className="btn btn-secondary">Voir tous les services →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== PRODUITS ===== */}
            {produitsList.length > 0 && (
                <section className="section">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Boutique</span>
                            <h2>Produits populaires</h2>
                            <p>Alimentation, accessoires et soins, sélectionnés par nos vétérinaires</p>
                        </div>
                        <div className="grid-4">
                            {produitsList.map(p => (
                                <div key={p.id} className="product-card card hover-scale">
                                    <div className="product-image" style={{ height: '300px', overflow: 'hidden' }}>
                                        <img src={getProductImage(p)} alt={p.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="card-body" style={{ padding: '16px' }}>
                                        <span className="product-category">{p.categorie || 'Général'}</span>
                                        <h4 style={{ fontSize: '1.05rem', margin: '4px 0 8px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</h4>
                                        <p className="product-desc" style={{ fontSize: '0.85rem', minHeight: '36px', margin: '8px 0' }}>{p.description?.slice(0, 50)}...</p>
                                        <div className="product-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                            <span className="product-price" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{Number(p.prix).toFixed(2)} €</span>
                                            <button
                                                onClick={() => handleAddToCart(p)}
                                                className={`btn btn-sm ${added === p.id ? 'btn-success' : 'btn-primary'}`}
                                            >
                                                {added === p.id ? '✓ Ajouté' : '+ Panier'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="section-cta">
                            <Link to="/produits" className="btn btn-secondary">Voir la boutique →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== VETERINAIRES ===== */}
            {vetsList.length > 0 && (
                <section className="section bg-light">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-badge">Notre équipe</span>
                            <h2>{t('home.vets_title')}</h2>
                            <p>{t('home.vets_subtitle')}</p>
                        </div>
                        <div className="grid-3">
                            {vetsList.map(v => (
                                <div key={v.id} className="vet-card card hover-scale">
                                    <div className="card-body" style={{ textAlign: 'center', padding: '30px var(--space-5)' }}>
                                        <div className="vet-avatar" style={{ margin: '0 auto 20px', width: '100px', height: '100px', overflow: 'hidden', borderRadius: '50%', boxShadow: 'var(--shadow)' }}>
                                            <img src={getVetImage(v.id)} alt={`Dr ${v.prenom} ${v.nom}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <h3 style={{ marginBottom: '4px', fontSize: '1.25rem' }}>Dr {v.prenom} {v.nom}</h3>
                                        <span className="vet-specialty" style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--bg-secondary)', borderRadius: '99px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                            {v.specialite || 'Médecine générale'}
                                        </span>
                                        <p className="text-sm text-muted" style={{ margin: '8px 0 0 0', fontSize: '0.85rem' }}>📧 {v.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="section-cta">
                            <Link to="/veterinaires" className="btn btn-secondary">Rencontrer l'équipe →</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ===== CTA FINAL ===== */}
            <section className="cta-section" style={{ padding: '60px 0', background: 'linear-gradient(135deg, var(--primary-bg) 0%, #d1fae5 100%)', borderTop: '1px solid var(--primary-border)', textAlign: 'center' }}>
                <div className="container">
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Prêt à prendre soin de votre animal ?</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '8px', maxWidth: '600px', margin: '8px auto 24px' }}>Inscrivez-vous gratuitement et réservez votre premier rendez-vous dès aujourd'hui.</p>
                    <div className="hero-actions" style={{ justifyContent: 'center', gap: '16px', display: 'flex' }}>
                        <Link to="/inscription" className="btn btn-primary btn-lg">Créer mon espace</Link>
                        <Link to="/connexion" className="btn btn-secondary btn-lg">J'ai déjà un compte</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
