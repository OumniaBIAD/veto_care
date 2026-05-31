import React, { useEffect, useState } from 'react';
import { rendezvous, commandes, animaux, veterinaires, services, produits } from '../../services/api';
import StatsChart from './StatsChart';

const KpiCard = ({ icon, label, value, color, sub }) => (
  <div className="db-kpi-card admin-card">
    <div className="db-kpi-icon" style={{ background: color }}>{icon}</div>
    <div className="db-kpi-body">
      <span className="db-kpi-value">{value}</span>
      <span className="db-kpi-label">{label}</span>
      {sub && <span className="db-kpi-sub">{sub}</span>}
    </div>
  </div>
);

const EntityCard = ({ icon, title, count, detail, color }) => (
  <div className="db-entity-card admin-card">
    <div className="db-entity-top">
      <span className="db-entity-icon" style={{ color }}>{icon}</span>
      <span className="db-entity-title">{title}</span>
    </div>
    <div className="db-entity-count" style={{ color }}>{count}</div>
    {detail && <div className="db-entity-detail">{detail}</div>}
  </div>
);

export default function AdminDashboard() {
  const [globalStats, setGlobalStats] = useState({ rdvJour: 0, rdvTotal: 0, cmdAttente: 0, clients: 0 });
  const [entityStats, setEntityStats] = useState({ vets: 0, services: 0, produits: 0, rdv: 0, activeVets: 0, inactiveVets: 0 });
  const [rdvDuJour, setRdvDuJour] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting('Bonjour');
    else if (h < 18) setGreeting('Bon après‑midi');
    else setGreeting('Bonsoir');
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [resRdv, resCmds, resAnims, resVets, resSrv, resProd] = await Promise.all([
          rendezvous.getAll(),
          commandes.getAll(),
          animaux.getAll(),
          veterinaires.getAll(),
          services.getAll(),
          produits.getAll()
        ]);

        const tousRdv    = resRdv.data.data   || [];
        const toutesCmds = resCmds.data.data  || [];
        const tousAnims  = resAnims.data.data  || [];
        const tousVets   = resVets.data.data   || [];
        const tousSrv    = resSrv.data.data    || [];
        const tousProd   = resProd.data.data   || [];

        const aujourdhuiStr  = new Date().toISOString().split('T')[0];
        const rdvsAujourdhui = tousRdv.filter(r => r.date_rendezvous && r.date_rendezvous.startsWith(aujourdhuiStr));
        const enAttente      = toutesCmds.filter(c => c.statut === 'en_attente').length;
        const clientsUniques = new Set(tousAnims.map(a => a.client_id)).size;
        const activeVets     = tousVets.filter(v => v.actif).length;

        setGlobalStats({ rdvJour: rdvsAujourdhui.length, rdvTotal: tousRdv.length, cmdAttente: enAttente, clients: clientsUniques });
        setEntityStats({ vets: tousVets.length, services: tousSrv.length, produits: tousProd.length, rdv: tousRdv.length, activeVets, inactiveVets: tousVets.length - activeVets });
        setRdvDuJour(rdvsAujourdhui.sort((a, b) => new Date(a.date_rendezvous) - new Date(b.date_rendezvous)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const statusMeta = {
    planifie:  { label: 'Planifié',  cls: 'badge-planifie' },
    en_cours:  { label: 'En cours',  cls: 'badge-en_cours' },
    termine:   { label: 'Terminé',   cls: 'badge-termine'  },
    annule:    { label: 'Annulé',    cls: 'badge-annule'   },
  };

  const getStatusBadge = (statut) => {
    const meta = statusMeta[statut] || { label: statut, cls: 'badge-planifie' };
    return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
  };

  if (loading) return (
    <div className="db-loading">
      <div className="db-spinner" />
      <p>Chargement du tableau de bord…</p>
    </div>
  );

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fade-in db-root">

      {/* ── Header ── */}
      <div className="db-header">
        <div>
          <h1 className="db-title">{greeting} 👋</h1>
          <p className="db-subtitle">Voici un aperçu de la clinique aujourd'hui — <span className="db-date">{today}</span></p>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="db-kpi-grid">
        <KpiCard icon="📅" label="RDV aujourd'hui"        value={globalStats.rdvJour}    color="linear-gradient(135deg,#6366f1,#818cf8)" />
        <KpiCard icon="📦" label="Commandes à traiter"    value={globalStats.cmdAttente}  color="linear-gradient(135deg,#f59e0b,#fbbf24)" />
        <KpiCard icon="📝" label="Rendez‑vous programmés" value={globalStats.rdvTotal}     color="linear-gradient(135deg,#3b82f6,#60a5fa)" />
        <KpiCard icon="👥" label="Propriétaires"          value={globalStats.clients}      color="linear-gradient(135deg,#10b981,#34d399)" />
      </div>

      {/* ── Entity cards ── */}
      <div className="db-entity-grid">
        <EntityCard icon="🩺" title="Vétérinaires" count={entityStats.vets}     color="#6366f1"
          detail={`${entityStats.activeVets} actifs · ${entityStats.inactiveVets} inactifs`} />
        <EntityCard icon="💉" title="Services"     count={entityStats.services}  color="#10b981" />
        <EntityCard icon="🛍️" title="Produits"     count={entityStats.produits}  color="#f59e0b" />
        <EntityCard icon="📋" title="Rendez‑vous"  count={entityStats.rdv}       color="#3b82f6" />
      </div>

      {/* ── Charts ── */}
      <StatsChart stats={entityStats} />

      {/* ── Today's appointments ── */}
      <div className="admin-card db-rdv-card">
        <div className="db-section-header">
          <h3>🗓️ Consultations du jour</h3>
          <span className="db-badge-count">{rdvDuJour.length}</span>
        </div>
        {rdvDuJour.length === 0 ? (
          <div className="db-empty">
            <span>🌿</span>
            <p>Aucun rendez‑vous programmé pour aujourd'hui</p>
          </div>
        ) : (
          <div className="db-rdv-list">
            {rdvDuJour.map(rdv => (
              <div key={rdv.id} className="db-rdv-item">
                <div className="db-rdv-time">
                  {new Date(rdv.date_rendezvous).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="db-rdv-info">
                  <strong>{rdv.animal_nom}</strong>
                  <span>Dr {rdv.veterinaire_nom} · {rdv.service_nom}</span>
                </div>
                {getStatusBadge(rdv.statut)}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
