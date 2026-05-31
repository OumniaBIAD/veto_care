import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { rendezvous as rdvApi } from '../../services/api';

export default function VetDashboard() {
  const { user } = useAuth();
  const [rdvs, setRdvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayRdvs = async () => {
      try {
        const res = await rdvApi.getVetRendezvous();
        setRdvs(res.data?.data || []);
      } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodayRdvs();
  }, []);

  const todayStr = new Date().toDateString();
  const todayRdvs = rdvs.filter(r => new Date(r.date_rendezvous).toDateString() === todayStr);

  const stats = {
    total: todayRdvs.length,
    planifie: todayRdvs.filter(r => r.statut === 'planifie').length,
    enCours: todayRdvs.filter(r => r.statut === 'en_cours').length,
    termine: todayRdvs.filter(r => r.statut === 'termine').length,
  };

  const getStatusBadge = (status) => {
    let className = 'badge-planifie';
    let label = 'Planifié';
    if (status === 'en_cours') {
      className = 'badge-en_cours';
      label = 'En cours';
    } else if (status === 'termine') {
      className = 'badge-termine';
      label = 'Terminé';
    } else if (status === 'annule') {
      className = 'badge-annule';
      label = 'Annulé';
    }
    return <span className={`badge ${className}`} style={{ textTransform: 'capitalize' }}>{label}</span>;
  };

  return (
    <div className="vet-dashboard" style={{ padding: 'var(--space-6) 0' }}>
      
      {/* Welcome Banner Card */}
      <div className="admin-card mb-6" style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
        color: '#ffffff',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Abstract shapes */}
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          right: '-30px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '30%',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{
            fontSize: 'var(--font-size-xs)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: '600'
          }}>
            👋 Tableau de Bord
          </span>
          <h2 className="mt-3 mb-2" style={{ color: '#ffffff', fontSize: 'var(--font-size-3xl)', fontWeight: '700' }}>
            Bonjour, Dr. {user?.prenom || ''} {user?.nom || ''} !
          </h2>
          <p style={{ margin: 0, opacity: 0.9, fontSize: 'var(--font-size-base)' }}>
            Voici un aperçu de vos consultations et de votre journée pour aujourd'hui, <strong>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
          </p>
        </div>
      </div>

      {/* Grid: Statistics & Quick Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        
        {/* Card 1: Total Appointments */}
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '2.5rem', background: 'var(--primary-bg)', color: 'var(--primary)', padding: '12px', borderRadius: 'var(--radius)' }}>
            📅
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>Rendez-vous aujourd'hui</p>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>{stats.total}</h3>
          </div>
        </div>

        {/* Card 2: Planned */}
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', borderLeft: '4px solid var(--blue)' }}>
          <div style={{ fontSize: '2.5rem', background: 'var(--blue-light)', color: 'var(--blue)', padding: '12px', borderRadius: 'var(--radius)' }}>
            ⏱️
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>Consultations planifiées</p>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>{stats.planifie}</h3>
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '2.5rem', background: 'var(--accent-light)', color: 'var(--accent)', padding: '12px', borderRadius: 'var(--radius)' }}>
            ⚡
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>En cours</p>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>{stats.enCours}</h3>
          </div>
        </div>

        {/* Card 4: Terminated */}
        <div className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', borderLeft: '4px solid var(--success)' }}>
          <div style={{ fontSize: '2.5rem', background: '#e8f5e9', color: 'var(--success)', padding: '12px', borderRadius: 'var(--radius)' }}>
            ✅
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', fontWeight: '600' }}>Terminées</p>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-2xl)', fontWeight: '700' }}>{stats.termine}</h3>
          </div>
        </div>

      </div>

      {/* Main Section Grid: Today's list & Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.2fr', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        
        {/* Left Side: Schedule */}
        <div className="admin-card" style={{ minWidth: '300px' }}>
          <h3 className="mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🕒 Agenda d'aujourd'hui</span>
            <Link to="/espace-vet/agenda" className="btn btn-ghost btn-sm" style={{ fontSize: 'var(--font-size-xs)' }}>
              Voir l'agenda complet →
            </Link>
          </h3>

          {loading ? (
            <p>Chargement des rendez-vous...</p>
          ) : todayRdvs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>☕</div>
              <h4 style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Aucun rendez-vous planifié aujourd'hui.</h4>
              <p style={{ color: 'var(--text-light)', fontSize: 'var(--font-size-sm)' }}>Profitez-en pour mettre à jour vos fiches médicales ou votre profil.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Heure</th>
                    <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Patient</th>
                    <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Propriétaire</th>
                    <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Prestation</th>
                    <th style={{ padding: '12px var(--space-4)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRdvs.map((r, index) => {
                    const time = new Date(r.date_rendezvous).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    return (
                      <tr key={r.id || index} style={{ borderBottom: index < todayRdvs.length - 1 ? '1px solid var(--border)' : 'none', transition: 'var(--transition)' }}>
                        <td style={{ padding: '14px var(--space-4)', fontWeight: '600' }}>{time}</td>
                        <td style={{ padding: '14px var(--space-4)' }}>
                          <span style={{ fontWeight: '500' }}>{r.animal_nom || 'Inconnu'}</span>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginLeft: '6px' }}>({r.espece || 'N/A'})</span>
                        </td>
                        <td style={{ padding: '14px var(--space-4)' }}>
                          {r.client_prenom} {r.client_nom}
                        </td>
                        <td style={{ padding: '14px var(--space-4)', color: 'var(--primary)', fontWeight: '500' }}>
                          {r.service_nom || 'Consultation'}
                        </td>
                        <td style={{ padding: '14px var(--space-4)' }}>
                          {getStatusBadge(r.statut)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Links Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h4 style={{ margin: '0 0 6px 0', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-2)' }}>⚡ Actions Rapides</h4>
            
            <Link to="/espace-vet/agenda" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              📅 Ouvrir l'agenda complet
            </Link>
            
            <Link to="/espace-vet/clients" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              🐾 Parcourir les dossiers clients
            </Link>

            <Link to="/espace-vet/notes" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              🗒️ Prendre des notes
            </Link>

            <Link to="/espace-vet/profile" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
              👤 Modifier mon profil
            </Link>
          </div>

          <div className="admin-card" style={{ background: '#f8fafc', border: '1px dashed var(--border)' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: 'var(--font-size-base)' }}>💡 Astuce de navigation</h4>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              Vous pouvez masquer la barre latérale gauche à tout moment en cliquant sur le bouton menu (☰) pour avoir plus d'espace sur l'agenda.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
