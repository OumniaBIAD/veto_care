import React, { useState, useEffect } from 'react';
import { services } from '../../services/api';
const images = {
    'Consultation generale': "/images/consultation.png",
    'Vaccination': "https://cdn.vectorstock.com/i/1000v/19/29/pet-vaccine-icon-vector-51971929.jpg",
    'Chirurgie': "/images/chirurgie.png",
    'Dermatologie': "/images/dermatologie.png",
    'Toilettage': "https://img.freepik.com/vecteurs-premium/toilettage-pour-chien-logo-du-salon-toilettage-poils-animaux-coupes-cheveux-baignade_528132-577.jpg?w=2000"
};

export default function GestionServices() {
    const [liste, setListe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [form, setForm] = useState({ nom: '', description: '', prix: '', duree: '', image_url: '' });

    const loadData = async () => {
        try {
            const res = await services.getAll();
            setListe(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const openModal = (item = null) => {
        if (item) {
            setForm(item);
            setEditMode(true);
        } else {
            setForm({ nom: '', description: '', prix: '', duree: '' });
            setEditMode(false);
        }
        setShowModal(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) await services.update(form.id, form);
            else await services.create(form);
            setShowModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur API');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment retirer ce service du catalogue ?')) return;
        try {
            await services.delete(id);
            loadData();
        } catch (err) {
            alert('Impossible de supprimer ce service (peut-être lié à des RDV existants).');
        }
    };

    if (loading) return <div>Chargement...</div>;

    return (
        <div className="fade-in">
            <div className="admin-page-header">
                <h2>Services & Soins</h2>
                <button onClick={() => openModal()} className="btn btn-primary">+ Nouveau Service</button>
            </div>

            <div className="admin-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nom & Description</th>
                            <th>Image</th>
                            <th>Durée estimée</th>
                            <th>Tarif</th>
                            <th align="right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {liste.map(s => (
                            <tr key={s.id}>
                                <td>
                                    <strong>{s.nom}</strong>
                                    <p className="text-sm text-muted" style={{ margin: 0, marginTop: '4px', maxWidth: '400px' }}>{s.description}</p>
                                </td>
                                <td><img src={images[s.nom] || s.image_url} alt={s.nom} style={{ width: '80px', height: 'auto', marginTop: '5px' }} /></td>
                                <td>{s.duree} minutes</td>
                                <td><span className="font-semibold text-primary">{Number(s.prix).toFixed(2)} €</span></td>
                                <td>
                                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                        <button onClick={() => openModal(s)} className="btn btn-secondary btn-sm">Editer</button>
                                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">Retirer</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {hasModal(showModal, setShowModal, editMode, handleSubmit, form, handleChange)}
        </div>
    );
}

// Fonction utilitaire locale pour alléger le code
function hasModal(showModal, setShowModal, editMode, handleSubmit, form, handleChange) {
    if (!showModal) return null;
    return (
        <div className="modal-overlay">
            <div className="modal admin-modal fade-in">
                <div className="modal-header">
                    <h3>{editMode ? 'Modifier la prestation' : 'Créer une prestation'}</h3>
                    <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                    <form id="serviceForm" onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label className="form-label">Nom du service *</label>
                             <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} placeholder="Ex: Consultation, Vaccination..." required />
                             <label className="form-label">URL de l'image</label>
                             <input type="text" name="image_url" className="form-control" value={form.image_url} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label className="form-label">Description détailée</label>
                            <textarea name="description" className="form-control" value={form.description || ''} onChange={handleChange} rows="3"></textarea>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tarif (€) *</label>
                                <input type="number" step="0.01" name="prix" className="form-control" value={form.prix} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Durée (minutes) *</label>
                                <input type="number" name="duree" className="form-control" value={form.duree} onChange={handleChange} required />
                            </div>
                        </div>
                    </form>
                </div>
                <div className="modal-footer">
                    <button onClick={() => setShowModal(false)} className="btn btn-ghost">Annuler</button>
                    <button type="submit" form="serviceForm" className="btn btn-primary">{editMode ? 'Confirmer' : 'Créer le service'}</button>
                </div>
            </div>
        </div>
    );
}
