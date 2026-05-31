import React, { useState, useEffect } from 'react';
import { produits } from '../../services/api';

export default function GestionProduits() {
    const [liste, setListe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [form, setForm] = useState({ nom: '', description: '', prix: '', stock: '', categorie: '', image_url: '' });

    const loadData = async () => {
        try {
            const res = await produits.getAll();
            setListe(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openModal = (product = null) => {
        if (product) {
            setForm(product);
            setEditMode(true);
        } else {
            setForm({ nom: '', description: '', prix: '', stock: '', categorie: '', image_url: '' });
            setEditMode(false);
        }
        setShowModal(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await produits.update(form.id, form);
            } else {
                await produits.create(form);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur API');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Verrouiller la suppression de ce produit ?')) return;
        try {
            await produits.delete(id);
            loadData();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="fade-in">
            <div className="admin-page-header">
                <h2>Gestion de la Boutique</h2>
                <button onClick={() => openModal()} className="btn btn-primary">+ Nouveau Produit</button>
            </div>

            <div className="admin-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Nom & Catégorie</th>
                            <th>Prix</th>
                            <th>Stock</th>
                            <th align="right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {liste.map(p => (
                            <tr key={p.id}>
                                <td style={{ width: '60px' }}>
                                    <div style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                                        {p.image_url ? <img src={p.image_url} alt="" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : '🐾'}
                                    </div>
                                </td>
                                <td>
                                    <strong>{p.nom}</strong>
                                    <div className="text-xs text-muted">{p.categorie}</div>
                                </td>
                                <td>{Number(p.prix).toFixed(2)} €</td>
                                <td>
                                    <span className={`badge ${p.stock <= 5 ? 'badge-annule' : 'badge-active'}`}>
                                        {p.stock} restant(s)
                                    </span>
                                </td>
                                <td>
                                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                        <button onClick={() => openModal(p)} className="btn btn-secondary btn-sm">Editer</button>
                                        <button onClick={() => handleDelete(p.id)} className="btn btn-danger btn-sm">Supprimer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {liste.length === 0 && (
                            <tr><td colSpan="5" className="text-center" style={{ padding: '20px' }}>La boutique est vide.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal admin-modal fade-in">
                        <div className="modal-header">
                            <h3>{editMode ? 'Modifier le produit' : 'Ajouter un produit'}</h3>
                            <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
                        </div>
                        <div className="modal-body">
                            <form id="productForm" onSubmit={handleSubmit}>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label">Nom du produit *</label>
                                    <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
                                </div>
                                <div className="form-row" style={{ marginBottom: '15px' }}>
                                    <div className="form-group">
                                        <label className="form-label">Prix (€) *</label>
                                        <input type="number" step="0.01" name="prix" className="form-control" value={form.prix} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock de départ *</label>
                                        <input type="number" name="stock" className="form-control" value={form.stock} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label">Catégorie</label>
                                    <input type="text" name="categorie" className="form-control" placeholder="Ex: Alimentation, Jouet, Soin..." value={form.categorie || ''} onChange={handleChange} />
                                </div>
                                <div className="form-group" style={{ marginBottom: '15px' }}>
                                    <label className="form-label">Description détaillée</label>
                                    <textarea name="description" className="form-control" value={form.description || ''} onChange={handleChange} rows="3"></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL de l'image</label>
                                    <input type="url" name="image_url" className="form-control" placeholder="https://..." value={form.image_url || ''} onChange={handleChange} />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowModal(false)} className="btn btn-ghost">Annuler</button>
                            <button type="submit" form="productForm" className="btn btn-primary">{editMode ? 'Mettre à jour' : 'Enregistrer'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
