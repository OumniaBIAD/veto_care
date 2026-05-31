import React, { useState, useEffect } from 'react';
import { clients, animaux, rendezvous } from '../../services/api';

export default function VetClients() {
  const [clientList, setClientList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal details state
  const [activeClient, setActiveClient] = useState(null);
  const [activeHistory, setActiveHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Load clients and their animals
  const fetchData = async () => {
    try {
      const clientRes = await clients.getAll();
      const clientsData = clientRes.data?.data || [];

      // Parallel fetch of animals for each client
      const enhanced = await Promise.all(
        clientsData.map(async (c) => {
          const animalsRes = await animaux.getByClient(c.id);
          const animals = animalsRes.data?.data || [];
          return { ...c, animals };
        })
      );
      setClientList(enhanced);
    } catch (err) {
      console.error('Erreur lors du chargement des clients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch history for a specific client on-demand
  const handleViewHistory = async (client) => {
    setActiveClient(client);
    setLoadingHistory(true);
    setShowModal(true);
    try {
      const res = await rendezvous.getByClient(client.id);
      setActiveHistory(res.data?.data || []);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique', err);
      alert('Impossible de charger l\'historique des rendez-vous.');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Filter clients based on search query
  const filteredClients = clientList.filter(c => {
    const query = searchQuery.toLowerCase().trim();
    return !query || 
      (c.prenom && c.prenom.toLowerCase().includes(query)) ||
      (c.nom && c.nom.toLowerCase().includes(query)) ||
      (c.email && c.email.toLowerCase().includes(query)) ||
      (c.telephone && c.telephone.includes(query));
  });

  const getStatusBadge = (status) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };

  if (loading) return <div>Chargement des clients…</div>;

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <h2>Clients &amp; Animaux</h2>
          <p className="text-muted">Consultez la liste des clients inscrits, leurs compagnons, et leur historique médical.</p>
        </div>
      </div>

      {/* Modern Search Controls */}
      <div className="search-filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="Rechercher un client par nom, email, téléphone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ paddingLeft: '40px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', height: '42px' }}
          />
          <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none', fontSize: '1rem' }}>
            🔍
          </span>
        </div>
      </div>

      {/* Grid of Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: 'var(--space-10) 0' }}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔍 Aucun client trouvé</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredClients.map((c) => (
            <div 
              key={c.id} 
              className="admin-card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              {/* Header: User Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                  <div 
                    style={{ 
                      width: '45px', 
                      height: '45px', 
                      borderRadius: '50%', 
                      background: 'var(--primary-bg)', 
                      color: 'var(--primary)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      border: '1.5px solid var(--primary-border)'
                    }}
                  >
                    {c.prenom?.[0]?.toUpperCase()}{c.nom?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                      {c.prenom} {c.nom}
                    </h3>
                    <span className="text-xs text-muted">{c.email}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', marginBottom: '15px', color: 'var(--text-muted)' }}>
                  {c.telephone && <div style={{ marginBottom: '4px' }}>📞 {c.telephone}</div>}
                  {c.adresse && <div>📍 {c.adresse}, {c.ville}</div>}
                </div>

                {/* Animals Sub-list */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Compagnons ({c.animals.length})
                  </h4>
                  {c.animals.length === 0 ? (
                    <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>Aucun animal associé</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {c.animals.map((a) => (
                        <span 
                          key={a.id} 
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '3px 8px', 
                            background: 'var(--bg-secondary)', 
                            border: '1px solid var(--border)',
                            borderRadius: '20px', 
                            color: 'var(--text)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🐾 {a.nom} <span className="text-muted">({a.espece})</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action: View History */}
              <button 
                onClick={() => handleViewHistory(c)}
                className="btn btn-primary btn-full btn-sm"
                style={{ borderRadius: '8px', padding: '8px 0' }}
              >
                📜 Historique Médical &amp; RDV
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sliding Drawer / Modern History Modal */}
      {showModal && activeClient && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal" 
            style={{ maxWidth: '750px', borderRadius: '16px', animation: 'fadeIn 0.3s ease' }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 style={{ margin: 0 }}>Historique de {activeClient.prenom} {activeClient.nom}</h3>
                <span className="text-xs text-muted">{activeClient.email}</span>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="spinner" style={{ margin: '0 auto 15px auto' }}></div>
                  <p className="text-muted text-sm">Chargement de l'historique...</p>
                </div>
              ) : activeHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-light)' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '5px' }}>📅 Aucun historique</p>
                  <p className="text-xs">Ce client n'a aucun rendez-vous passé ou programmé.</p>
                </div>
              ) : (
                <div className="admin-table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Date</th>
                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Animal</th>
                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Service</th>
                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Statut</th>
                        <th style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)', zIndex: 1 }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeHistory.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontWeight: '500' }}>
                            <div>{new Date(r.date_rendezvous).toLocaleDateString('fr-FR')}</div>
                            <div className="text-xs text-muted">
                              {new Date(r.date_rendezvous).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td style={{ fontWeight: '500' }}>{r.animal_nom} <span className="text-muted">({r.espece})</span></td>
                          <td>
                            <div>{r.service_nom}</div>
                            <div className="text-xs text-muted">{r.prix} €</div>
                          </td>
                          <td>{getStatusBadge(r.statut)}</td>
                          <td className="text-xs" style={{ maxWidth: '180px', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-muted)' }}>
                            {r.notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: '15px 20px' }}>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ borderRadius: '6px' }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
