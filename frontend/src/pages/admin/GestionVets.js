import React, { useState, useEffect } from 'react';
import { veterinaires } from '../../services/api';

export default function GestionVets() {
    const [liste, setListe] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    
    const [form, setForm] = useState({ nom: '', prenom: '', specialite: '', telephone: '', email: '', actif: true, image_url: '' });

    const loadData = async () => {
        try {
            const res = await veterinaires.getAll();
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
            setForm({ nom: '', prenom: '', specialite: '', telephone: '', email: '', actif: true, image_url: '' });
            setEditMode(false);
        }
        setShowModal(true);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) await veterinaires.update(form.id, form);
            else await veterinaires.create(form);
            setShowModal(false);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur API');
        }
    };

    const handleToggleActive = async (id, current) => {
        try {
            await veterinaires.update(id, { actif: !current });
            // Update local state to keep the card visible instantly
            setListe(prev => prev.map(v => v.id === id ? { ...v, actif: !current } : v));
        } catch (err) {
            alert('Erreur lors de la mise à jour du statut.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer définitivement ce profil ?')) return;
        try {
            await veterinaires.delete(id);
            // Remove from local list
            setListe(prev => prev.filter(v => v.id !== id));
        } catch (err) {
            alert('Ce profil est lié à des rendez-vous et ne peut être supprimé pour le moment.');
        }
    };

    if (loading) return <div>Chargement de l'équipe...</div>;

    return (
        <div className="fade-in">
            <div className="admin-page-header">
                <h2>Équipe Vétérinaire</h2>
                <button onClick={() => openModal()} className="btn btn-primary">+ Ajouter un médecin</button>
            </div>

            <div className="grid-3">
                {liste.map(v => (
                    <div key={v.id} className="admin-card fade-in" style={{ textAlign: 'center', padding: '30px 20px' }}>
                        <div style={{ width: '80px', height: '80px', background: v.actif ? 'var(--primary-bg)' : 'var(--bg-secondary)', color: v.actif ? 'var(--primary-dark)' : 'var(--text-muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', margin: '0 auto 15px', position: 'relative' }}>
                            {v.prenom[0]}{v.nom[0]}
                            {!v.actif && <span style={{ position: 'absolute', bottom: 0, right: 0, fontSize: '18px' }}>🚫</span>}
                        </div>
                        <h3 style={{ margin: '0 0 5px 0', opacity: v.actif ? 1 : 0.6 }}>Dr {v.prenom} {v.nom}</h3>
                        <div style={{ marginBottom: '15px' }}>
                            <span className="badge badge-en_cours" style={{ marginRight: '5px' }}>{v.specialite || 'Généraliste'}</span>
                            <span className={`badge badge-${v.actif ? 'confirme' : 'annule'}`}>
                                {v.actif ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                        
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                            <p style={{ margin: '4px 0' }}>📞 {v.telephone || 'Non renseigné'}</p>
                            <p style={{ margin: '4px 0' }}>📧 {v.email || 'Non renseigné'}</p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => openModal(v)} className="btn btn-secondary btn-sm" style={{flex:1}}>Modifier</button>
                            <button onClick={() => handleToggleActive(v.id, v.actif)} className="btn btn-warning btn-sm" style={{flex:1}}>{v.actif ? 'Désactiver' : 'Activer'}</button>
                        </div>
                    </div>
                ))}
            </div>

            {hasModal(showModal, setShowModal, editMode, handleSubmit, form, handleChange, setForm)}
        </div>
    );
}

function hasModal(showModal, setShowModal, editMode, handleSubmit, form, handleChange, setForm) {
    if (!showModal) return null;
    return (
        <div className="modal-overlay">
            <div className="modal admin-modal fade-in">
                <div className="modal-header">
                    <h3>{editMode ? 'Modifier la fiche médecin' : 'Nouvelle recrue'}</h3>
                    <button onClick={() => setShowModal(false)} className="modal-close">✕</button>
                </div>
                <div className="modal-body">
                    <form id="vetForm" onSubmit={handleSubmit}>
                        <div className="form-row" style={{ marginBottom: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Prénom *</label>
                                <input type="text" name="prenom" className="form-control" value={form.prenom} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nom *</label>
                                <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label className="form-label">Spécialité (Optionnel)</label>
                            <input type="text" name="specialite" className="form-control" placeholder="Chirurgie, NAC, etc." value={form.specialite || ''} onChange={handleChange} />
                        </div>
                        <div className="form-row" style={{ marginBottom: '15px' }}>
                            <div className="form-group">
                                <label className="form-label">Email professionnel</label>
                                <input type="email" name="email" className="form-control" value={form.email || ''} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Téléphone</label>
                                <input type="tel" name="telephone" className="form-control" value={form.telephone || ''} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label className="form-label">URL de l'image</label>
                            <input type="text" name="image_url" className="form-control" value={form.image_url || ''} onChange={handleChange} placeholder="https://example.com/photo.jpg" />
                        </div>
                        {editMode && (
                             <div className="form-group" style={{ marginBottom: '15px' }}>
                                 <label className="flex-between" style={{ cursor: 'pointer' }}>
                                     <span className="form-label">Compte actif</span>
                                     <input type="checkbox" name="actif" checked={form.actif} onChange={(e) => setForm({...form, actif: e.target.checked})} style={{ transform: 'scale(1.2)' }} />
                                 </label>
                             </div>
                        )}
                    {form.image_url && (
                        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                            <img src={form.image_url} alt="Preview" style={{ maxWidth: '120px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
                        </div>
                    )}
                </form>
                </div>
                <div className="modal-footer">
                    <button onClick={() => setShowModal(false)} className="btn btn-ghost">Annuler</button>
                    <button type="submit" form="vetForm" className="btn btn-primary">{editMode ? 'Sauvegarder' : 'Ajouter à l\'équipe'}</button>
                </div>
            </div>
        </div>
    );
}
