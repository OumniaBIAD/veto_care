import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/api';
import '../../components/Auth.css';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        nom: '', prenom: '', email: '', password: '',
        telephone: '', adresse: '', ville: '', code_postal: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password.length < 6) {
            setError('Le mot de passe doit faire au moins 6 caractères');
            setLoading(false);
            return;
        }

        try {
            const res = await auth.register(formData);
            login(res.data.user, res.data.token);
            navigate('/espace-client');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
          <div className="container-sm">
            <div className="auth-card">
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2>Créer votre espace</h2>
                        <p className="text-muted">Rejoignez VétoCare pour gérer la santé de vos animaux</p>
                    </div>

                    {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Prénom *</label>
                                <input type="text" name="prenom" className="form-control" value={formData.prenom} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Nom *</label>
                                <input type="text" name="nom" className="form-control" value={formData.nom} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email *</label>
                            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mot de passe *</label>
                            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} placeholder="6 caractères minimum" required />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Téléphone</label>
                            <input type="tel" name="telephone" className="form-control" value={formData.telephone} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Adresse postale</label>
                            <input type="text" name="adresse" className="form-control" value={formData.adresse} onChange={handleChange} />
                            <div className="form-row" style={{ marginTop: '10px' }}>
                                <input type="text" name="code_postal" className="form-control" placeholder="Code postal" value={formData.code_postal} onChange={handleChange} />
                                <input type="text" name="ville" className="form-control" placeholder="Ville" value={formData.ville} onChange={handleChange} />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: '10px' }}>
                            {loading ? 'Création en cours...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                        <p className="text-muted">
                            Déjà inscrit ? <Link to="/connexion" className="text-primary font-bold">Connectez-vous</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
