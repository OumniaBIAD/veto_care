import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/api';

export default function AdminProfil() {
    const { user, verifyAuth } = useAuth();
    
    // Pour l'admin, on expose simplement email et password
    const [form, setForm] = useState({
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    
    // Nouvelles fonctionnalités
    const [themeSombre, setThemeSombre] = useState(localStorage.getItem('theme') === 'dark');
    const [notifs, setNotifs] = useState(true);

    const toggleTheme = () => {
        const newTheme = !themeSombre;
        setThemeSombre(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        // On déclenche un event global pour avertir AdminLayout
        window.dispatchEvent(new Event('themeChanged'));
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (form.password && form.password !== form.confirmPassword) {
            setErrorMsg('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            await auth.updateProfile({ 
                email: form.email, 
                password: form.password || undefined 
            });
            
            // Re-valider le context d'auth pour que user.email se mette à jour partout !
            await verifyAuth();

            setSuccessMsg('Votre profil a été mis à jour avec succès.');
            setForm({ ...form, password: '', confirmPassword: '' });
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Erreur lors de la mise à jour du profil.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="admin-page-header">
                <h2>Votre Profil Administrateur</h2>
            </div>

            <div className="admin-card">
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div className="admin-avatar hover-scale" style={{ margin: '0 auto', width: '80px', height: '80px', fontSize: '2rem' }}>
                        {user?.prenom?.[0] || 'A'}
                    </div>
                    <p className="text-muted text-sm" style={{ marginTop: '10px' }}>Gestionnaire de la plateforme</p>
                </div>

                {successMsg && <div className="alert alert-success" style={{ marginBottom: '20px' }}>{successMsg}</div>}
                {errorMsg && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{errorMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label className="form-label">Adresse Email Professionnelle *</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-control" 
                            value={form.email} 
                            onChange={handleChange} 
                            required 
                        />
                        <p className="text-xs text-muted" style={{ marginTop: '5px' }}>
                            Sera utilisée pour votre prochaine connexion.
                        </p>
                    </div>

                    <div className="form-row" style={{ marginTop: '30px' }}>
                        <div className="form-group">
                            <label className="form-label">Nouveau mot de passe</label>
                            <input 
                                type="password" 
                                name="password" 
                                className="form-control" 
                                placeholder="Laisser vide pour ne pas modifier" 
                                value={form.password} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirmer le nouveau mot de passe</label>
                            <input 
                                type="password" 
                                name="confirmPassword" 
                                className="form-control" 
                                placeholder="Confirmez" 
                                value={form.confirmPassword} 
                                onChange={handleChange} 
                                disabled={!form.password}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <p className="text-xs text-muted" style={{ marginRight: '15px', color: 'var(--warning)' }}>⚠️ Conservez bien vos accès.</p>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>

                <hr style={{ margin: '40px 0', border: 'none', borderBottom: '1px solid var(--border)' }} />

                <h3 style={{ marginBottom: '20px' }}>⚙️ Préférences</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="flex-between" style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Mode Sombre Global</h4>
                            <p className="text-sm text-muted" style={{ margin: 0 }}>Activez le mode nuit pour réduire la fatigue visuelle.</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="checkbox" checked={themeSombre} onChange={toggleTheme} style={{ transform: 'scale(1.5)', accentColor: 'var(--primary)' }} />
                            <span style={{ marginLeft: '10px' }}>{themeSombre ? 'Activé' : 'Désactivé'}</span>
                        </label>
                    </div>

                    <div className="flex-between" style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                        <div>
                            <h4 style={{ margin: 0 }}>Notifications par E-mail</h4>
                            <p className="text-sm text-muted" style={{ margin: 0 }}>Recevoir une alerte à chaque nouvelle commande ou RDV.</p>
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <input type="checkbox" checked={notifs} onChange={() => setNotifs(!notifs)} style={{ transform: 'scale(1.5)', accentColor: 'var(--primary)' }} />
                            <span style={{ marginLeft: '10px' }}>{notifs ? 'Activé' : 'Désactivé'}</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
