import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(''); 

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('events/');
        setEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger les événements.');
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event => {
    if (statusFilter === '') return true;
    return event.status.toLowerCase() === statusFilter.toLowerCase();
  });

  if (loading) return <main className="container"><p>Chargement des événements...</p></main>;
  if (error) return <main className="container"><p style={{ color: 'var(--danger)' }}>{error}</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <h1>Liste des Événements</h1>
        <Link to="/dashboard">← Retour au Dashboard</Link>
      </header>
      
      <section className="filter-bar" aria-label="Filtrage des événements">
        <label htmlFor="status-filter" style={{ fontWeight: '500' }}>Filtrer par statut : </label>
        <select 
          id="status-filter" 
          className="input-field"
          style={{ width: 'auto' }}
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="à venir">À venir</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
        </select>
      </section>

      <section aria-label="Grille des événements">
        {filteredEvents.length === 0 ? (
          <p>Aucun événement trouvé pour ce statut.</p>
        ) : (
          <ul className="grid">
            {filteredEvents.map(event => (
              <li key={event.id}>
                <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h2 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{event.title}</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p style={{ marginBottom: '1.5rem' }}>
                    <span className="badge">{event.status}</span>
                  </p>
                  <Link to={`/events/${event.id}`} className="btn btn-primary" style={{ marginTop: 'auto' }}>
                    Voir les détails
                  </Link>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}