import React, { useState, useEffect } from 'react';
import { rendezvous as rdvApi } from '../../services/api';

export default function VetAgenda() {
    const [rdvs, setRdvs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const fetchRdvs = async () => {
        try {
            const res = await rdvApi.getVetRendezvous();
            setRdvs(res.data?.data || []);
        } catch (error) {
            console.error("Erreur avec les rdv", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRdvs();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await rdvApi.updateStatus(id, newStatus);
            fetchRdvs();
        } catch (error) {
            alert('Erreur lors de la mise à jour du statut.');
        }
    };

    const getStatusBadge = (status) => {
        return <span className={`badge badge-${status}`}>{status}</span>;
    };
// Compute filtered appointments based on search, status, and date filters
const filteredRdvs = rdvs.filter(r => {
  // Search query
  const q = searchQuery.trim().toLowerCase();
  const matchesQuery = !q ||
    (r.client_prenom?.toLowerCase().includes(q)) ||
    (r.client_nom?.toLowerCase().includes(q)) ||
    (r.animal_nom?.toLowerCase().includes(q)) ||
    (r.espece?.toLowerCase().includes(q)) ||
    (r.service_nom?.toLowerCase().includes(q));

  // Status filter
  const matchesStatus = statusFilter === 'all' || r.statut === statusFilter;

  // Date filter
  const apptDate = new Date(r.date_rendezvous);
  const today = new Date();
  let matchesDate = true;
  if (dateFilter === 'today') {
    matchesDate = apptDate.toDateString() === today.toDateString();
  } else if (dateFilter === 'week') {
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0,0,0,0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23,59,59,999);
    matchesDate = apptDate >= startOfWeek && apptDate <= endOfWeek;
  } else if (dateFilter === 'month') {
    matchesDate = apptDate.getMonth() === today.getMonth() && apptDate.getFullYear() === today.getFullYear();
  } else if (dateFilter === 'past') {
    const startToday = new Date(today);
    startToday.setHours(0,0,0,0);
    matchesDate = apptDate < startToday;
  } else if (dateFilter === 'upcoming') {
    const startToday = new Date(today);
    startToday.setHours(0,0,0,0);
    matchesDate = apptDate >= startToday;
  }
  return matchesQuery && matchesStatus && matchesDate;
});

    if (loading) return <div>Chargement de l'agenda...</div>;

    return (
        <div className="fade-in">
            <div className="admin-page-header">
                <div>
                    <h2>Mon Agenda</h2>
                    <p className="text-muted">Retrouvez tous vos rendez-vous prévus de la journée et de la semaine.</p>
                </div>
            </div>

            {/* Premium Search and Filter Controls */}
            <div className="search-filters-bar" style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Rechercher par client, animal, service..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="form-control"
                        style={{ paddingLeft: '40px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', height: '42px' }}
                    />
                    <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', pointerEvents: 'none', fontSize: '1rem' }}>
                        🔍
                    </span>
                </div>
                
                <div style={{ width: '180px' }}>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-control"
                        style={{ borderRadius: '8px', boxShadow: 'var(--shadow-sm)', height: '42px', cursor: 'pointer' }}
                    >
                        <option value="all">Tous les statuts</option>
                        <option value="planifie">Planifiés</option>
                        <option value="en_cours">En cours</option>
                        <option value="termine">Terminés</option>
                        <option value="annule">Annulés</option>
                    </select>
                </div>

                <div style={{ width: '180px' }}>
                    <select 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="form-control"
                        style={{ borderRadius: '8px', boxShadow: 'var(--shadow-sm)', height: '42px', cursor: 'pointer' }}
                    >
                        <option value="all">Toutes les dates</option>
                        <option value="today">Aujourd'hui</option>
                        <option value="week">Cette semaine</option>
                        <option value="month">Ce mois-ci</option>
                        <option value="upcoming">À venir</option>
                        <option value="past">Passés</option>
                    </select>
                </div>
            </div>

            <div className="admin-card">
                {rdvs.length === 0 ? (
                    <p>Vous n'avez aucun rendez-vous assigné.</p>
                ) : filteredRdvs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-muted)' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔍 Aucun résultat</p>
                        <p className="text-sm">Aucun rendez-vous ne correspond à vos filtres actuels.</p>
                    </div>
                ) : (
                    <div className="admin-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Client</th>
                                    <th>Animal</th>
                                    <th>Service</th>
                                    <th>Statut</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRdvs.map(r => (
                                    <tr key={r.id}>
                                        <td>
                                            <div style={{ fontWeight: 'bold' }}>{new Date(r.date_rendezvous).toLocaleDateString('fr-FR')}</div>
                                            <div className="text-xs text-muted">{new Date(r.date_rendezvous).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{r.client_prenom} {r.client_nom}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: '500' }}>{r.animal_nom}</div>
                                            <div className="text-xs text-muted">{r.espece}</div>
                                        </td>
                                        <td>
                                            <div>{r.service_nom}</div>
                                            <div className="text-xs text-muted">{r.prix} €</div>
                                        </td>
                                        <td>{getStatusBadge(r.statut)}</td>
                                        <td>
                                            <div className="actions-cell">
                                                {r.statut === 'planifie' && (
                                                    <button onClick={() => handleStatusChange(r.id, 'en_cours')} className="btn btn-primary btn-sm">Démarrer</button>
                                                )}
                                                {r.statut === 'en_cours' && (
                                                    <button onClick={() => handleStatusChange(r.id, 'termine')} className="btn btn-success btn-sm">Terminer</button>
                                                )}
                                                {(r.statut === 'planifie' || r.statut === 'en_cours') && (
                                                    <button onClick={() => handleStatusChange(r.id, 'annule')} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Annuler</button>
                                                )}
                                                {r.statut === 'termine' && (
                                                    <span className="text-success text-xs">✓ Consulté</span>
                                                )}
                                                {r.statut === 'annule' && (
                                                    <span className="text-muted text-xs">Annulé</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
