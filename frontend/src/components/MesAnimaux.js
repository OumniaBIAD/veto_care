import React, { useState, useEffect } from 'react';
import { animaux } from '../services/api';
import './MesAnimaux.css';

function MesAnimaux() {
    const [animalList, setAnimalList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        espece: '',
        race: '',
        date_naissance: '',
        poids: '',
        couleur: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchAnimaux();
    }, []);

    const fetchAnimaux = async () => {
        try {
            const response = await animaux.getMyAnimals();
            setAnimalList(response.data.data);
        } catch (error) {
            console.error('Erreur chargement animaux:', error);
            setError('Erreur lors du chargement des animaux');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const today = new Date().toISOString().split('T')[0];
        if (formData.date_naissance && formData.date_naissance > today) {
            setError('La date de naissance ne peut pas être supérieure à la date actuelle');
            return;
        }
        try {
            await animaux.create(formData);
            setSuccess('Animal ajouté avec succès !');
            setShowForm(false);
            setFormData({
                nom: '',
                espece: '',
                race: '',
                date_naissance: '',
                poids: '',
                couleur: ''
            });
            fetchAnimaux();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de l\'ajout');
        }
    };

    const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
        try {
            console.log('Suppression de l\'animal ID:', id);
            const response = await animaux.delete(id);
            console.log('Réponse:', response);
            setSuccess('Animal supprimé avec succès');
            fetchAnimaux(); // Recharger la liste
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Erreur complète:', error);
            console.error('Réponse erreur:', error.response);
            setError(error.response?.data?.message || 'Erreur lors de la suppression');
            setTimeout(() => setError(''), 3000);
        }
    }
};

    if (loading) return <div className="loading">Chargement...</div>;

    return (
        <div className="mes-animaux">
            <div className="header">
                <h2>Mes Animaux</h2>
                <button onClick={() => setShowForm(!showForm)} className="btn-add">
                    {showForm ? 'Annuler' : '+ Ajouter un animal'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showForm && (
                <form onSubmit={handleSubmit} className="animal-form">
                    <h3>Nouvel animal</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Nom *</label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Espèce *</label>
                            <select
                                name="espece"
                                value={formData.espece}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner</option>
                                <option value="Chien">Chien</option>
                                <option value="Chat">Chat</option>
                                <option value="Oiseau">Oiseau</option>
                                <option value="Rongeur">Rongeur</option>
                                <option value="Reptile">Reptile</option>
                                <option value="Autre">Autre</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Race</label>
                            <input
                                type="text"
                                name="race"
                                value={formData.race}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date de naissance</label>
                            <input
                                type="date"
                                name="date_naissance"
                                value={formData.date_naissance}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Poids (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                name="poids"
                                value={formData.poids}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Couleur</label>
                            <input
                                type="text"
                                name="couleur"
                                value={formData.couleur}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-submit">Ajouter</button>
                </form>
            )}

            <div className="animaux-grid">
                {animalList.length === 0 ? (
                    <p className="no-data">Aucun animal enregistré</p>
                ) : (
                    animalList.map(animal => (
                        <div key={animal.id} className="animal-card">
                            <div className="animal-icon">
                                {animal.espece === 'Chien' && '🐕'}
                                {animal.espece === 'Chat' && '🐈'}
                                {animal.espece === 'Oiseau' && '🐦'}
                                {!['Chien', 'Chat', 'Oiseau'].includes(animal.espece) && '🐾'}
                            </div>
                            <div className="animal-info">
                                <h3>{animal.nom}</h3>
                                <p><strong>Espèce:</strong> {animal.espece}</p>
                                {animal.race && <p><strong>Race:</strong> {animal.race}</p>}
                                {animal.date_naissance && (
                                    <p><strong>Âge:</strong> {new Date().getFullYear() - new Date(animal.date_naissance).getFullYear()} ans</p>
                                )}
                                {animal.poids && <p><strong>Poids:</strong> {animal.poids} kg</p>}
                                {animal.couleur && <p><strong>Couleur:</strong> {animal.couleur}</p>}
                            </div>
                            <button onClick={() => handleDelete(animal.id)} className="btn-delete">
                                Supprimer
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default MesAnimaux;