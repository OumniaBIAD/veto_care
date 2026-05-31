import React, { useState, useEffect } from 'react';
import { produits as produitsApi } from '../../services/api';
import { useCart } from '../../context/CartContext';

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

export default function ProduitsPage() {
    const [produitsList, setProduitsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addItem } = useCart();
    const [added, setAdded] = useState(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('');
    const [sortBy, setSortBy] = useState('');

    useEffect(() => {
        produitsApi.getAll()
            .then(res => {
                setProduitsList(res.data.data || []);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleAddToCart = (p) => {
        addItem(p);
        setAdded(p.id);
        setTimeout(() => setAdded(null), 1500);
    };

    // Calculate unique categories from loaded products
    const categories = [...new Set(produitsList.map(p => p.categorie).filter(Boolean))];

    // Filter and sort products
    const filteredAndSortedProducts = produitsList
        .filter(p => {
            const matchesSearch = p.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = !category || p.categorie === category;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'price-asc') return Number(a.prix) - Number(b.prix);
            if (sortBy === 'price-desc') return Number(b.prix) - Number(a.prix);
            if (sortBy === 'name-asc') return a.nom.localeCompare(b.nom);
            if (sortBy === 'name-desc') return b.nom.localeCompare(a.nom);
            return 0; // Default ordering
        });

    if (loading) return <div className="loading-screen">Chargement...</div>;

    return (
        <div>
            <div className="page-header">
                <div className="container">
                    <h1>Notre Boutique</h1>
                    <p>Qualité et bien-être pour vos compagnons. Commandez en ligne.</p>
                </div>
            </div>

            <section className="section bg-light" style={{ minHeight: '60vh' }}>
                <div className="container">
                    {/* Filters Toolbar */}
                    <div className="filters-wrapper" style={{
                        display: 'flex',
                        gap: '20px',
                        flexWrap: 'wrap',
                        marginBottom: '40px',
                        background: 'var(--white)',
                        padding: '20px',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border)',
                        alignItems: 'center'
                    }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <input 
                                type="text" 
                                placeholder="Rechercher un produit (croquettes, litière...)..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="form-control"
                            />
                        </div>
                        
                        <div style={{ flex: '1 1 200px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Catégorie :</label>
                            <select 
                                value={category} 
                                onChange={e => setCategory(e.target.value)}
                                className="form-control"
                                style={{ minWidth: '150px' }}
                            >
                                <option value="">Toutes</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div style={{ flex: '1 1 200px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <label className="form-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Trier par :</label>
                            <select 
                                value={sortBy} 
                                onChange={e => setSortBy(e.target.value)}
                                className="form-control"
                                style={{ minWidth: '150px' }}
                            >
                                <option value="">Par défaut</option>
                                <option value="price-asc">Prix croissant</option>
                                <option value="price-desc">Prix décroissant</option>
                                <option value="name-asc">Nom (A-Z)</option>
                                <option value="name-desc">Nom (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    {filteredAndSortedProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>Aucun produit ne correspond à vos critères</h3>
                            <p>Essayez de modifier vos filtres ou termes de recherche.</p>
                        </div>
                    ) : (
                        <div className="grid-4">
                            {filteredAndSortedProducts.map(p => (
                                <div key={p.id} className="product-card card fade-in">
                                    <div className="product-image" style={{ height: '300px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={getProductImage(p)} alt={p.nom} style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="card-body">
                                        <span className="product-category">{p.categorie || 'Général'}</span>
                                        <h4>{p.nom}</h4>
                                        <p className="product-desc">{p.description}</p>
                                        <div className="product-footer">
                                            <span className="product-price">{Number(p.prix).toFixed(2)} €</span>
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
                    )}
                </div>
            </section>
        </div>
    );
}
