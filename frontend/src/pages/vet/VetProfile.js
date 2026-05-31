import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { veterinaires as vetApi, auth as authApi } from '../../services/api';

export default function VetProfile() {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password edit states
  const [showPasswordCard, setShowPasswordCard] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  // Form states
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    specialite: '',
    telephone: ''
  });

  // Fetch complete profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await vetApi.getMyProfile();
        if (res.data?.success && res.data?.data) {
          const p = res.data.data;
          setForm({
            nom: p.nom || '',
            prenom: p.prenom || '',
            email: p.email || '',
            specialite: p.specialite || '',
            telephone: p.telephone || ''
          });
          // Sync with AuthContext in case it was modified elsewhere
          updateUser({
            nom: p.nom,
            prenom: p.prenom,
            specialite: p.specialite,
            telephone: p.telephone
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setMessage({
          type: 'danger',
          text: 'Impossible de charger les données du profil depuis le serveur.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [updateUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await vetApi.updateMyProfile({
        nom: form.nom,
        prenom: form.prenom,
        specialite: form.specialite,
        telephone: form.telephone
      });

      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Votre profil a été mis à jour avec succès !' });
        // Update auth state so layouts (sidebar, navbar) refresh automatically
        updateUser({
          nom: form.nom,
          prenom: form.prenom,
          specialite: form.specialite,
          telephone: form.telephone
        });
      } else {
        setMessage({ type: 'danger', text: res.data?.message || 'Une erreur est survenue.' });
      }
    } catch (error) {
      console.error('Erreur de mise à jour du profil:', error);
      setMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur réseau lors de la mise à jour.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPwdMessage({ type: 'danger', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'danger', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setPwdSaving(true);
    try {
      const res = await authApi.updateProfile({
        email: form.email,
        password: newPassword
      });

      if (res.data?.success || res.status === 200) {
        setPwdMessage({ type: 'success', text: 'Votre mot de passe a été mis à jour avec succès !' });
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordCard(false);
          setPwdMessage({ type: '', text: '' });
        }, 3000);
      } else {
        setPwdMessage({ type: 'danger', text: res.data?.message || 'Une erreur est survenue.' });
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setPwdMessage({
        type: 'danger',
        text: error.response?.data?.message || 'Erreur lors de la mise à jour.'
      });
    } finally {
      setPwdSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div style={{ color: 'var(--primary)', fontWeight: '600' }}>Chargement du profil...</div>
      </div>
    );
  }

  const firstInitial = form.prenom?.[0] || form.email?.[0]?.toUpperCase() || 'V';
  const fullName = `${form.prenom} ${form.nom}`.trim() || 'Vétérinaire';

  return (
    <div className="vet-profile" style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-6) 0' }}>
      
      {/* Profil Header Card */}
      <div className="admin-card mb-6" style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background circle */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.1)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <div className="admin-avatar" style={{
            width: '90px',
            height: '90px',
            fontSize: '2.5rem',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-full)',
            border: '3px solid rgba(255, 255, 255, 0.15)',
            boxShadow: 'var(--shadow-md)',
            margin: 0
          }}>
            {firstInitial}
          </div>
          <div>
            <h2 style={{ margin: 0, color: '#ffffff', fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>{fullName}</h2>
            <p style={{ margin: '4px 0 8px 0', color: 'var(--primary-light)', fontWeight: '500' }}>
              🩺 Vétérinaire {form.specialite && `• Spécialité : ${form.specialite}`}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-sm)', color: '#94a3b8' }}>
              <span>✉️ {form.email}</span>
              {form.telephone && <span>📞 {form.telephone}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="admin-card" style={{ padding: 'var(--space-6)' }}>
        <h3 className="mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)', color: 'var(--text)' }}>
          Modifier mes informations
        </h3>

        {message.text && (
          <div className={`alert alert-${message.type} mb-5`} style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: '500',
            backgroundColor: message.type === 'success' ? 'var(--primary-bg)' : 'var(--danger-light)',
            color: message.type === 'success' ? 'var(--primary-dark)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'var(--primary-border)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
            
            {/* Prénom */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="prenom" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Prénom *</label>
              <input
                type="text"
                id="prenom"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>

            {/* Nom */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="nom" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Nom *</label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>

            {/* Spécialité */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="specialite" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Spécialité</label>
              <input
                type="text"
                id="specialite"
                name="specialite"
                value={form.specialite}
                onChange={handleChange}
                placeholder="Ex: Chirurgie, Cardiologie, NAC..."
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>

            {/* Téléphone */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="telephone" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Téléphone</label>
              <input
                type="tel"
                id="telephone"
                name="telephone"
                value={form.telephone}
                onChange={handleChange}
                placeholder="Ex: +33 6 12 34 56 78"
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  outline: 'none',
                  transition: 'var(--transition)'
                }}
              />
            </div>

            {/* Email (Lecture seule) */}
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <label htmlFor="email" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Adresse Email (Non modifiable)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                readOnly
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-muted)',
                  cursor: 'not-allowed',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowPasswordCard(!showPasswordCard)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              🔑 {showPasswordCard ? 'Masquer' : 'Changer le mot de passe'}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.8 : 1
              }}
            >
              {saving ? 'Enregistrement...' : '💾 Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      {showPasswordCard && (
        <div className="admin-card mt-6" style={{
          padding: 'var(--space-6)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <h3 className="mb-4" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)', color: 'var(--text)' }}>
            🔒 Changer mon mot de passe
          </h3>

          {pwdMessage.text && (
            <div className={`alert alert-${pwdMessage.type} mb-5`} style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              backgroundColor: pwdMessage.type === 'success' ? 'var(--primary-bg)' : 'var(--danger-light)',
              color: pwdMessage.type === 'success' ? 'var(--primary-dark)' : 'var(--danger)',
              border: `1px solid ${pwdMessage.type === 'success' ? 'var(--primary-border)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {pwdMessage.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              
              {/* Nouveau Mot de Passe */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label htmlFor="newPassword" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Nouveau mot de passe *</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min. 6 caractères"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'var(--transition)'
                  }}
                />
              </div>

              {/* Confirmer Nouveau Mot de Passe */}
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <label htmlFor="confirmPassword" style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', color: 'var(--text-muted)' }}>Confirmer le mot de passe *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Ressaisir le mot de passe"
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    outline: 'none',
                    transition: 'var(--transition)'
                  }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={pwdSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: pwdSaving ? 'not-allowed' : 'pointer',
                  opacity: pwdSaving ? 0.8 : 1
                }}
              >
                {pwdSaving ? 'Modification...' : '✔️ Mettre à jour le mot de passe'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
