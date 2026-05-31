import React, { useState, useEffect } from 'react';
import { rendezvous } from '../../services/api';

export default function GestionRdv() {
    const [liste, setListe] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const res = await rendezvous.getAll();
            // On tri par date la plus récente à venir en premier
            const sorted = (res.data.data || []).sort((a,b) => new Date(b.date_rendezvous) - new Date(a.date_rendezvous));
            setListe(sorted);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleChangeStatus = async (id, nouveauStatut) => {
        try {
            await rendezvous.updateStatus(id, nouveauStatut);
            loadData();
        } catch (err) {
            alert('Impossible de changer le statut');
        }
    };

    const getStatusBadge = (statut) => {
        const classMap = { 'planifie': 'badge-planifie', 'confirme': 'badge-confirme', 'en_cours': 'badge-en_cours', 'termine': 'badge-termine', 'annule': 'badge-annule' };
        return <span className={`badge ${classMap[statut] || 'badge-planifie'}`}>{statut}</span>;
    };

    if (loading) return <div>Chargement de l'agenda...</div>;

    return (
        <div className="fade-in">
            <div className="admin-page-header">
                <h2>Agenda complet</h2>
            </div>

            <div className="admin-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date & Heure</th>
                            <th>Propriétaire</th>
                            <th>Animal & Service</th>
                            <th>Intervenant</th>
                            <th>Statut courant</th>
                            <th align="right">Contrôle d'accès</th>
                        </tr>
                    </thead>
                    <tbody>
                        {liste.map(r => (
                            <tr key={r.id}>
                                <td>
                                    <div className="font-semibold">{new Date(r.date_rendezvous).toLocaleDateString('fr-FR')}</div>
                                    <div className="text-sm text-muted">{new Date(r.date_rendezvous).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</div>
                                </td>
                                <td>
                                    {r.client_prenom} {r.client_nom}
                                </td>
                                <td>
                                    <div className="font-semibold">🐕 {r.animal_nom}</div>
                                    <div className="text-sm text-muted">💊 {r.service_nom}</div>
                                </td>
                                <td>Dr {r.veterinaire_nom}</td>
                                <td>{getStatusBadge(r.statut)}</td>
                                <td>
                                    <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                                        <select 
                                            className="form-control" 
                                            style={{ width: 'auto', padding: '4px 8px' }}
                                            value={r.statut}
                                            onChange={(e) => handleChangeStatus(r.id, e.target.value)}
                                        >
                                            <option value="planifie">Planifié</option>
                                            <option value="confirme">Confirmé</option>
                                            <option value="en_cours">En cours (Salle d'attente)</option>
                                            <option value="termine">Terminé (Facturable)</option>
                                            <option value="annule">Annulé</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
