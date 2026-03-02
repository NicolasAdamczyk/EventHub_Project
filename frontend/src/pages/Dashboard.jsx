import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ eventsCount: 0, participantsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [eventsRes, participantsRes] = await Promise.all([
          api.get('events/'),
          api.get('participants/')
        ]);
        setStats({
          eventsCount: eventsRes.data.length,
          participantsCount: participantsRes.data.length
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Vue d'ensemble</h1>
          <p style={{ color: 'var(--text-muted)' }}>Bienvenue dans votre espace sécurisé EventHub.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">Se déconnecter</button>
      </header>

      <section aria-label="Statistiques">
        {loading ? (
          <p>Calcul des statistiques en cours...</p>
        ) : (
          <div className="stats-grid">
            <article className="stat-card">
              <h2>{stats.eventsCount}</h2>
              <p>Événements créés</p>
            </article>
            <article className="stat-card">
              <h2>{stats.participantsCount}</h2>
              <p>Participants inscrits</p>
            </article>
          </div>
        )}
      </section>

      <nav aria-label="Navigation principale" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Actions rapides</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/events" className="btn btn-primary">Gérer les Événements</Link>
          <Link to="/participants" className="btn btn-primary" style={{ background: '#0ea5e9' }}>Gérer les Participants</Link>
        </div>
      </nav>
    </main>
  );
}