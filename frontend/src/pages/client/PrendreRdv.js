import React, { useState, useEffect } from 'react';
import { rendezvous, animaux, veterinaires, services } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function PrendreRdv() {
    const navigate = useNavigate();
    
    const [mesAnimaux, setMesAnimaux] = useState([]);
    const [vetsList, setVetsList] = useState([]);
    const [servicesList, setServicesList] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        animal_id: '',
        veterinaire_id: '',
        service_id: '',
        date_rendezvous: '',
        notes: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                const [vets, servs, anims] = await Promise.all([
                    veterinaires.getAll(),
                    services.getAll(),
                    animaux.getMyAnimals()
                ]);
                setVetsList(vets.data.data || []);
                setServicesList(servs.data.data || []);
                setMesAnimaux(anims.data.data || []);
            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des données. Veuillez réessayer.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        const selectedDate = new Date(form.date_rendezvous);
        const now = new Date();
        
        // 1. Validation de la date dans le passé
        if (selectedDate <= now) {
            setError("La date du rendez-vous doit être dans le futur.");
            setSubmitting(false);
            return;
        }

        // 2. Validation du jour de la semaine (0 = Dimanche, le cabinet est fermé le dimanche)
        const day = selectedDate.getDay();
        if (day === 0) {
            setError("La clinique est fermée le dimanche. Veuillez choisir un autre jour.");
            setSubmitting(false);
            return;
        }

        // 3. Validation des heures d'ouverture (8:00 à 19:00)
        const hours = selectedDate.getHours();
        const minutes = selectedDate.getMinutes();
        if (hours < 8 || hours > 19 || (hours === 19 && minutes > 0)) {
            setError("Les rendez-vous doivent être pris pendant les heures d'ouverture (de 08:00 à 19:00).");
            setSubmitting(false);
            return;
        }
        
        try {
            await rendezvous.create(form);
            setSuccess('Votre rendez-vous a bien été enregistré !');
            setTimeout(() => {
                navigate('/espace-client/rendez-vous');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la réservation.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Chargement du formulaire...</div>;

    if (mesAnimaux.length === 0) {
        return (
            <div className="fade-in">
                <div className="client-page-header">
                    <h2>Prendre un rendez-vous</h2>
                </div>
                <div className="alert alert-warning card" style={{ padding: 'var(--space-6)', display: 'block' }}>
                    <h3 style={{ marginBottom: '10px' }}>Vous n'avez pas encore ajouté d'animal !</h3>
                    <p style={{ marginBottom: '20px' }}>Pour prendre un rendez-vous, vous devez d'abord créer la fiche de votre compagnon.</p>
                    <button onClick={() => navigate('/espace-client/animaux')} className="btn btn-warning">
                        Créer une fiche animal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="client-page-header">
                <h2>Prendre un rendez-vous</h2>
            </div>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-body">
                    {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{success}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Pour quel animal ? *</label>
                            <select className="form-control" name="animal_id" value={form.animal_id} onChange={handleChange} required>
                                <option value="">Choisir un animal</option>
                                {mesAnimaux.map(a => (
                                    <option key={a.id} value={a.id}>{a.nom} ({a.espece})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Prestation souhaitée *</label>
                            <select className="form-control" name="service_id" value={form.service_id} onChange={handleChange} required>
                                <option value="">Choisir un service</option>
                                {servicesList.map(s => (
                                    <option key={s.id} value={s.id}>{s.nom} - {s.prix}€ ({s.duree} min)</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Vétérinaire préférentiel *</label>
                            <select className="form-control" name="veterinaire_id" value={form.veterinaire_id} onChange={handleChange} required>
                                <option value="">Peu importe / Choisir un médecin</option>
                                {vetsList.map(v => (
                                    <option key={v.id} value={v.id}>Dr {v.prenom} {v.nom} ({v.specialite || 'Généraliste'})</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '20px' }}>
                            <label className="form-label">Date et heure souhaitées *</label>
                            <input 
                                type="datetime-local" 
                                className="form-control" 
                                name="date_rendezvous" 
                                value={form.date_rendezvous} 
                                onChange={handleChange} 
                                min={new Date().toISOString().slice(0, 16)}
                                required 
                            />
                            <small className="text-muted text-xs" style={{ marginTop: '4px' }}>
                                Horaires d'ouverture : Lundi au Samedi, de 08:00 à 19:00.
                            </small>
                        </div>

                        <div className="form-group" style={{ marginBottom: '30px' }}>
                            <label className="form-label">Notes ou symptômes (optionnel)</label>
                            <textarea 
                                className="form-control" 
                                name="notes" 
                                rows="3"
                                placeholder="Décrivez la raison de la consultation..."
                                value={form.notes} 
                                onChange={handleChange} 
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={submitting || success}>
                            {submitting ? 'Validation en cours...' : 'Confirmer le rendez-vous'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
