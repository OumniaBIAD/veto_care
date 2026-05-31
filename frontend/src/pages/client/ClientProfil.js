import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { auth as authApi, clients as clientApi } from '../../services/api';

export default function ClientProfil() {
    const { user, login } = useAuth();

    const [clientData, setClientData] = useState({
        nom: '',
        prenom: '',
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        photo_url: ''
    });

    const [authData, setAuthData] = useState({
        email: user?.email || '',
        password: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    
    // Profile photo upload state
    const [previewUrl, setPreviewUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                setPreviewUrl(dataUrl);
                // Store the data URL in clientData so it gets persisted on save
                setClientData(prev => ({ ...prev, photo_url: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await clientApi.getProfile();
                const data = res.data.data;
                setClientData(data);
                if (data.photo_url) {
                    setPreviewUrl(data.photo_url);
                }
            } catch (err) {
                console.error('Erreur profile:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleClientChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleAuthChange = (e) => {
        setAuthData({ ...authData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSuccess('');
        setError('');

        try {
            // Build the data to save without photo handling
            const dataToSave = clientData;

            // Save personal info
            await clientApi.updateProfile(dataToSave);

            // Save auth info if changed
            if (authData.email !== user.email || authData.password) {
                if (authData.password && authData.password !== authData.confirmPassword) {
                    throw new Error('Les mots de passe ne correspondent pas');
                }
                await authApi.updateProfile({
                    email: authData.email,
                    password: authData.password || undefined
                });
            }

            // Update auth context so the rest of the app reflects changes
            const updatedUser = {
                ...user,
                email: authData.email,
                nom: dataToSave.nom,
                prenom: dataToSave.prenom,
                photo_url: dataToSave.photo_url
            };
            login(updatedUser, localStorage.getItem('token'));

            setSuccess('Profil mis à jour avec succès !');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Chargement de votre profil...
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div className="client-page-header">
                <h2>Mon Profil</h2>
                <p className="text-muted">Gérez vos informations personnelles et vos accès.</p>
            </div>

            <div className="card">
                <form className="card-body" onSubmit={handleSaveProfile}>
                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

                            {/* ── Photo de profil ── */}
                            <div style={{ flex: '0 0 160px', textAlign: 'center' }}>
                                {/* Preview circle */}
                                <div style={{
                                    width: '130px',
                                    height: '130px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-bg)',
                                    border: '3px dashed var(--primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px',
                                    overflow: 'hidden',
                                    cursor: 'pointer'
                                }}>
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={() => setPreviewUrl('')}
                                        />
                                    ) : (
                                        <span style={{ fontSize: '3.5rem' }}>{user?.prenom?.[0] || 'U'}</span>
                                    )}
                                </div>

                                {/* File input */}
                                <label style={{
                                    display: 'inline-block',
                                    padding: '8px 14px',
                                    background: 'var(--primary)',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.82rem',
                                    fontWeight: '600'
                                }}>
                                    📷 Éditer photo
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                {selectedFile && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>

                        {/* ── Informations personnelles ── */}
                        <div style={{ flex: '1 1 400px' }}>
                            <h3 style={{ marginBottom: '20px' }}>Informations personnelles</h3>

                            <div className="form-row" style={{ marginBottom: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Prénom</label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        className="form-control"
                                        value={clientData.prenom}
                                        onChange={handleClientChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Nom</label>
                                    <input
                                        type="text"
                                        name="nom"
                                        className="form-control"
                                        value={clientData.nom}
                                        onChange={handleClientChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Téléphone</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    className="form-control"
                                    value={clientData.telephone || ''}
                                    onChange={handleClientChange}
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Adresse</label>
                                <textarea
                                    name="adresse"
                                    className="form-control"
                                    value={clientData.adresse || ''}
                                    onChange={handleClientChange}
                                    rows={2}
                                />
                            </div>

                            <div className="form-row" style={{ marginBottom: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Ville</label>
                                    <input
                                        type="text"
                                        name="ville"
                                        className="form-control"
                                        value={clientData.ville || ''}
                                        onChange={handleClientChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Code Postal</label>
                                    <input
                                        type="text"
                                        name="code_postal"
                                        className="form-control"
                                        value={clientData.code_postal || ''}
                                        onChange={handleClientChange}
                                    />
                                </div>
                            </div>

                            <hr style={{ margin: '25px 0', border: 'none', borderTop: '1px solid var(--border)' }} />

                            <h3 style={{ marginBottom: '20px' }}>Sécurité & Accès</h3>

                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label className="form-label">Email de connexion</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    value={authData.email}
                                    onChange={handleAuthChange}
                                    required
                                />
                            </div>

                            <div className="form-row" style={{ marginBottom: '15px' }}>
                                <div className="form-group">
                                    <label className="form-label">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        value={authData.password}
                                        onChange={handleAuthChange}
                                        placeholder="Laisser vide pour ne pas changer"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirmer</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="form-control"
                                        value={authData.confirmPassword}
                                        onChange={handleAuthChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                        {success && <div className="alert alert-success" style={{ margin: 0 }}>{success}</div>}
                        {error   && <div className="alert alert-error"   style={{ margin: 0 }}>{error}</div>}
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
