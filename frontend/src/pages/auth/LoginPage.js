import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/api';
import '../../components/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await auth.login(email, password);
      login(res.data.user, res.data.token);
      const role = res.data.user.role;
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'veterinaire') {
        navigate('/espace-vet');
      } else {
        navigate('/espace-client');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container-sm">
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2>Bienvenue !</h2>
            <p className="text-muted">Connectez-vous à votre espace VétoCare</p>
          </div>
          {error && <div className="alert alert-error" style={{ marginBottom: '20px' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={!email || !password || loading}
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p className="text-muted">
              Nouveau chez nous ? <Link to="/inscription" className="text-primary font-bold">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
