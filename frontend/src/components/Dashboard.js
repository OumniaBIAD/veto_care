import React, { useState, useEffect } from 'react';
import { veterinaires, services, rendezvous, animaux } from '../services/api';
import MesAnimaux from './MesAnimaux';
import './Dashboard.css';

function Dashboard({ user, onLogout }) {
    const [veterinairesList, setVeterinairesList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [rendezvousList, setRendezVousList] = useState([]);
    const [allRendezVousList, setAllRendezVousList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rendezvous');
    const [showRdvForm, setShowRdvForm] = useState(false);
    const [rdvFormData, setRdvFormData] = useState({
        animal_id: '',
        veterinaire_id: '',
        service_id: '',
        date_rendezvous: '',
        notes: ''
    });
    const [userAnimals, setUserAnimals] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Récupérer vétérinaires et services (toujours)
            const [vets, servs] = await Promise.all([
                veterinaires.getAll(),
                services.getAll()
            ]);
            setVeterinairesList(vets.data.data);
            setServicesList(servs.data.data);

            // Récupérer les rendez-vous selon le rôle
            if (isAdmin) {
                const rdvs = await rendezvous.getAll();
                setAllRendezVousList(rdvs.data.data);
            } else {
                const rdvs = await rendezvous.getMyRendezVous();
                setRendezVousList(rdvs.data.data);
                // Récupérer les animaux du client pour le formulaire
                const anims = await animaux.getMyAnimals();
                setUserAnimals(anims.data.data);
            }
        } catch (error) {
            console.error('Erreur chargement:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
    };

    const handleRdvChange = (e) => {
        setRdvFormData({
            ...rdvFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleCreateRendezVous = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        
        try {
            await rendezvous.create(rdvFormData);
            setSuccess('Rendez-vous créé avec succès !');
            setShowRdvForm(false);
            setRdvFormData({
                animal_id: '',
                veterinaire_id: '',
                service_id: '',
                date_rendezvous: '',
                notes: ''
            });
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Erreur lors de la création');
        }
    };

    const getStatusBadge = (statut) => {
        const statusConfig = {
            'planifie': { class: 'status-planifie', text: 'Planifié' },
            'confirme': { class: 'status-confirme', text: 'Confirmé' },
            'en_cours': { class: 'status-en-cours', text: 'En cours' },
            'termine': { class: 'status-termine', text: 'Terminé' },
            'annule': { class: 'status-annule', text: 'Annulé' }
        };
        const config = statusConfig[statut] || { class: 'status-planifie', text: statut };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    if (loading) {
        return <div className="loading">Chargement...</div>;
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <h1>🐾 Clinique Vétérinaire</h1>
                <div className="user-info">
                    <span>👋 {user.email} {isAdmin && '(Admin)'}</span>
                    <button onClick={handleLogout} className="logout-btn">
                        Déconnexion
                    </button>
                </div>
            </nav>

            <div className="tabs">
                <button 
                    className={activeTab === 'rendezvous' ? 'active' : ''}
                    onClick={() => setActiveTab('rendezvous')}
                >
                    📅 Rendez-vous
                </button>
                {!isAdmin && (
                    <>
                        <button 
                            className={activeTab === 'animaux' ? 'active' : ''}
                            onClick={() => setActiveTab('animaux')}
                        >
                            🐕 Mes Animaux
                        </button>
                        <button 
                            className={activeTab === 'prendre-rdv' ? 'active' : ''}
                            onClick={() => setActiveTab('prendre-rdv')}
                        >
                            📝 Prendre RDV
                        </button>
                    </>
                )}
                <button 
                    className={activeTab === 'veterinaires' ? 'active' : ''}
                    onClick={() => setActiveTab('veterinaires')}
                >
                    👨‍⚕️ Vétérinaires
                </button>
                <button 
                    className={activeTab === 'services' ? 'active' : ''}
                    onClick={() => setActiveTab('services')}
                >
                    💊 Services
                </button>
            </div>

            <div className="content">
                {/* Rendez-vous */}
                {activeTab === 'rendezvous' && (
                    <div className="rendezvous-list">
                        <h2>{isAdmin ? 'Tous les rendez-vous' : 'Mes Rendez-vous'}</h2>
                        {!isAdmin && (
                            <button 
                                onClick={() => setShowRdvForm(!showRdvForm)} 
                                className="btn-add"
                                style={{ marginBottom: '20px' }}
                            >
                                + Prendre un rendez-vous
                            </button>
                        )}
                        
                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}
                        
                        {showRdvForm && !isAdmin && (
                            <form onSubmit={handleCreateRendezVous} className="rdv-form">
                                <h3>Nouveau rendez-vous</h3>
                                <div className="form-group">
                                    <label>Animal *</label>
                                    <select
                                        name="animal_id"
                                        value={rdvFormData.animal_id}
                                        onChange={handleRdvChange}
                                        required
                                    >
                                        <option value="">Sélectionner un animal</option>
                                        {userAnimals.map(animal => (
                                            <option key={animal.id} value={animal.id}>
                                                {animal.nom} ({animal.espece})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Vétérinaire *</label>
                                    <select
                                        name="veterinaire_id"
                                        value={rdvFormData.veterinaire_id}
                                        onChange={handleRdvChange}
                                        required
                                    >
                                        <option value="">Sélectionner un vétérinaire</option>
                                        {veterinairesList.map(vet => (
                                            <option key={vet.id} value={vet.id}>
                                                Dr {vet.prenom} {vet.nom} - {vet.specialite || 'Généraliste'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Service *</label>
                                    <select
                                        name="service_id"
                                        value={rdvFormData.service_id}
                                        onChange={handleRdvChange}
                                        required
                                    >
                                        <option value="">Sélectionner un service</option>
                                        {servicesList.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.nom} - {service.prix}€ ({service.duree} min)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date et heure *</label>
                                    <input
                                        type="datetime-local"
                                        name="date_rendezvous"
                                        value={rdvFormData.date_rendezvous}
                                        onChange={handleRdvChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        name="notes"
                                        value={rdvFormData.notes}
                                        onChange={handleRdvChange}
                                        rows="3"
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn-submit">Prendre rendez-vous</button>
                            </form>
                        )}
                        
                        {!isAdmin && rendezvousList.length === 0 && !showRdvForm ? (
                            <p className="no-data">Aucun rendez-vous programmé</p>
                        ) : !isAdmin && rendezvousList.length > 0 && (
                            <div className="cards">
                                {rendezvousList.map(rdv => (
                                    <div key={rdv.id} className="card">
                                        <div className="card-header">
                                            <h3>Rendez-vous du {new Date(rdv.date_rendezvous).toLocaleDateString()}</h3>
                                            {getStatusBadge(rdv.statut)}
                                        </div>
                                        <div className="card-body">
                                            <p><strong>🐕 Animal:</strong> {rdv.animal_nom} ({rdv.espece})</p>
                                            <p><strong>👨‍⚕️ Vétérinaire:</strong> Dr {rdv.veterinaire_prenom} {rdv.veterinaire_nom}</p>
                                            <p><strong>💊 Service:</strong> {rdv.service_nom}</p>
                                            <p><strong>⏰ Heure:</strong> {new Date(rdv.date_rendezvous).toLocaleTimeString()}</p>
                                            <p><strong>💰 Prix:</strong> {rdv.prix} €</p>
                                            {rdv.notes && <p><strong>📝 Notes:</strong> {rdv.notes}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {isAdmin && allRendezVousList.length === 0 ? (
                            <p className="no-data">Aucun rendez-vous</p>
                        ) : isAdmin && (
                            <div className="cards">
                                {allRendezVousList.map(rdv => (
                                    <div key={rdv.id} className="card">
                                        <div className="card-header">
                                            <h3>Rendez-vous du {new Date(rdv.date_rendezvous).toLocaleDateString()}</h3>
                                            {getStatusBadge(rdv.statut)}
                                        </div>
                                        <div className="card-body">
                                            <p><strong>🐕 Animal:</strong> {rdv.animal_nom} ({rdv.espece})</p>
                                            <p><strong>👤 Client:</strong> {rdv.client_nom} {rdv.client_prenom}</p>
                                            <p><strong>👨‍⚕️ Vétérinaire:</strong> Dr {rdv.veterinaire_prenom} {rdv.veterinaire_nom}</p>
                                            <p><strong>💊 Service:</strong> {rdv.service_nom}</p>
                                            <p><strong>⏰ Heure:</strong> {new Date(rdv.date_rendezvous).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Mes Animaux (client seulement) */}
                {activeTab === 'animaux' && !isAdmin && <MesAnimaux />}

                {/* Formulaire de prise de RDV (client) */}
                {activeTab === 'prendre-rdv' && !isAdmin && (
                    <div className="prendre-rdv">
                        <h2>Prendre un rendez-vous</h2>
                        <form onSubmit={handleCreateRendezVous} className="rdv-form">
                            <div className="form-group">
                                <label>Animal *</label>
                                <select
                                    name="animal_id"
                                    value={rdvFormData.animal_id}
                                    onChange={handleRdvChange}
                                    required
                                >
                                    <option value="">Sélectionner un animal</option>
                                    {userAnimals.map(animal => (
                                        <option key={animal.id} value={animal.id}>
                                            {animal.nom} ({animal.espece})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Vétérinaire *</label>
                                <select
                                    name="veterinaire_id"
                                    value={rdvFormData.veterinaire_id}
                                    onChange={handleRdvChange}
                                    required
                                >
                                    <option value="">Sélectionner un vétérinaire</option>
                                    {veterinairesList.map(vet => (
                                        <option key={vet.id} value={vet.id}>
                                            Dr {vet.prenom} {vet.nom} - {vet.specialite || 'Généraliste'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Service *</label>
                                <select
                                    name="service_id"
                                    value={rdvFormData.service_id}
                                    onChange={handleRdvChange}
                                    required
                                >
                                    <option value="">Sélectionner un service</option>
                                    {servicesList.map(service => (
                                        <option key={service.id} value={service.id}>
                                            {service.nom} - {service.prix}€ ({service.duree} min)
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date et heure *</label>
                                <input
                                    type="datetime-local"
                                    name="date_rendezvous"
                                    value={rdvFormData.date_rendezvous}
                                    onChange={handleRdvChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={rdvFormData.notes}
                                    onChange={handleRdvChange}
                                    rows="3"
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-submit">Prendre rendez-vous</button>
                        </form>
                    </div>
                )}

                {/* Vétérinaires */}
                {activeTab === 'veterinaires' && (
                    <div className="veterinaires-list">
                        <h2>Nos Vétérinaires</h2>
                        {veterinairesList.length === 0 ? (
                            <p className="no-data">Aucun vétérinaire</p>
                        ) : (
                            <div className="cards">
                                {veterinairesList.map(vet => (
                                    <div key={vet.id} className="card">
                                        <h3>Dr {vet.prenom} {vet.nom}</h3>
                                        <p><strong>Spécialité:</strong> {vet.specialite || 'Généraliste'}</p>
                                        <p><strong>Téléphone:</strong> {vet.telephone || 'Non renseigné'}</p>
                                        <p><strong>Email:</strong> {vet.email || 'Non renseigné'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Services */}
                {activeTab === 'services' && (
                    <div className="services-list">
                        <h2>Nos Services</h2>
                        {servicesList.length === 0 ? (
                            <p className="no-data">Aucun service</p>
                        ) : (
                            <div className="cards">
                                {servicesList.map(service => (
                                    <div key={service.id} className="card">
                                        <h3>{service.nom}</h3>
                                        <p>{service.description || 'Description non disponible'}</p>
                                        <p><strong>Durée:</strong> {service.duree} minutes</p>
                                        <p><strong>Prix:</strong> {service.prix} €</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;