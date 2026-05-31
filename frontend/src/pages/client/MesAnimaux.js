import React, { useState, useEffect } from 'react';
import { animaux } from '../../services/api';

export default function MesAnimaux() {
    const [mesAnimaux, setMesAnimaux] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    const [form, setForm] = useState({
        nom: '', espece: '', race: '', date_naissance: '', sexe: 'M', poids: '', notes_vaccinations: ''
    });

    const loadAnimaux = async () => {
        try {
            const res = await animaux.getMyAnimals();
            setMesAnimaux(res.data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadAnimaux(); }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await animaux.create(form);
            setShowForm(false);
            setForm({ nom: '', espece: '', race: '', date_naissance: '', sexe: 'M', poids: '', notes_vaccinations: '' });
            loadAnimaux();
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'ajout.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Voulez-vous vraiment supprimer ce carnet de santé ?")) return;
        try {
            await animaux.delete(id);
            loadAnimaux();
        } catch (err) {
            alert('Impossible de supprimer.');
        }
    };

    if (loading) return <div>Chargement de vos compagnons...</div>;

    return (
        <div className="fade-in">
            <div className="client-page-header">
                <h2>Mes Animaux</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                    {showForm ? 'Annuler' : '+ Ajouter un animal'}
                </button>
            </div>

            {showForm && (
                <div className="card fade-in" style={{ marginBottom: '30px' }}>
                    <div className="card-header">
                        <h3>Nouvelle fiche animal</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Nom *</label>
                                    <input type="text" name="nom" className="form-control" value={form.nom} onChange={handleChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Espèce *</label>
                                    <select name="espece" className="form-control" value={form.espece} onChange={handleChange} required>
                                        <option value="">Choisir</option>
                                        <option value="Chien">Chien</option>
                                        <option value="Chat">Chat</option>
                                        <option value="Oiseau">Oiseau</option>
                                        <option value="Rongeur">Rongeur</option>
                                        <option value="Reptile">Reptile</option>
                                        <option value="Autre">Autre</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Race</label>
                                    <input type="text" name="race" className="form-control" value={form.race} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sexe</label>
                                    <select name="sexe" className="form-control" value={form.sexe} onChange={handleChange}>
                                        <option value="M">Mâle</option>
                                        <option value="F">Femelle</option>
                                        <option value="Inconnu">Je ne sais pas</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row" style={{ marginTop: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Date de naissance</label>
                                    <input type="date" name="date_naissance" className="form-control" value={form.date_naissance} onChange={handleChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Poids (kg)</label>
                                    <input type="number" step="0.1" name="poids" className="form-control" value={form.poids} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '15px' }}>
                                <label className="form-label">Notes médicales ou vaccins à jour</label>
                                <textarea name="notes_vaccinations" className="form-control" value={form.notes_vaccinations} onChange={handleChange} rows="2" placeholder="Ex: Vaccin rage le 12/05/2025"></textarea>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost">Annuler</button>
                                <button type="submit" className="btn btn-success">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {mesAnimaux.length === 0 && !showForm ? (
                <div className="empty-state card">
                    <div className="empty-icon">🐕</div>
                    <h3>Vous n'avez pas encore ajouté d'animal</h3>
                    <p>Enregistrez vos compagnons pour faciliter la prise de rendez-vous.</p>
                </div>
            ) : (
                <div className="grid-2">
                    {mesAnimaux.map(animal => (
                        <div key={animal.id} className="card">
                            <div className="card-header flex-between">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {animal.espece === 'Chien' && '🐕'}
                                    {animal.espece === 'Chat' && '🐈'}
                                    {animal.espece === 'Oiseau' && '🦜'}
                                    {animal.nom}
                                </h3>
                                <button onClick={() => handleDelete(animal.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>
                                    Supprimer
                                </button>
                            </div>
                            <div className="card-body">
                                <p><strong>Espèce:</strong> {animal.espece}</p>
                                <p><strong>Race:</strong> {animal.race || 'Non spécifiée'}</p>
                                <p><strong>Sexe:</strong> {animal.sexe}</p>
                                {animal.date_naissance && (
                                    <p><strong>Naissance:</strong> {new Date(animal.date_naissance).toLocaleDateString()}</p>
                                )}
                                {animal.poids && <p><strong>Poids:</strong> {animal.poids} kg</p>}
                                
                                <div style={{ marginTop: '15px', padding: '10px', background: 'var(--primary-bg)', borderRadius: 'var(--radius-sm)' }}>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--primary-dark)', marginBottom: '4px' }}>💉 Carnet & Vaccinations</p>
                                    <p className="text-sm">{animal.notes_vaccinations || 'Aucune note'}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
