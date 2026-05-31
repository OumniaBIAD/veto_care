import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function StatsChart({ stats }) {
  const barRef = useRef(null);
  const donutRef = useRef(null);
  const barChart = useRef(null);
  const donutChart = useRef(null);

  useEffect(() => {
    if (!barRef.current || !donutRef.current) return;

    // Destroy previous instances
    if (barChart.current) barChart.current.destroy();
    if (donutChart.current) donutChart.current.destroy();

    // ── Bar chart: activité globale ──
    barChart.current = new Chart(barRef.current.getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Vétérinaires', 'Services', 'Produits', 'Rendez‑vous'],
        datasets: [{
          label: 'Total',
          data: [stats.vets, stats.services, stats.produits, stats.rdv],
          backgroundColor: [
            'rgba(99, 102, 241, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(59, 130, 246, 0.75)',
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(59, 130, 246, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { stepSize: 1 } }
        }
      }
    });

    // ── Donut chart: vétérinaires actifs/inactifs ──
    donutChart.current = new Chart(donutRef.current.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Actifs', 'Inactifs'],
        datasets: [{
          data: [stats.activeVets || 0, stats.inactiveVets || 0],
          backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.7)'],
          borderColor: ['rgba(16, 185, 129, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 2,
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 16, font: { size: 12 } }
          }
        }
      }
    });

    return () => {
      if (barChart.current) barChart.current.destroy();
      if (donutChart.current) donutChart.current.destroy();
    };
  }, [stats]);

  return (
    <div className="db-charts-row">
      <div className="admin-card db-chart-card">
        <h4 className="db-chart-title">📊 Activité globale</h4>
        <canvas ref={barRef} height="200" />
      </div>
      <div className="admin-card db-chart-card">
        <h4 className="db-chart-title">🩺 Vétérinaires</h4>
        <canvas ref={donutRef} height="200" />
      </div>
    </div>
  );
}
