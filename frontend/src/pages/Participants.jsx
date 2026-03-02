import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const response = await api.get('participants/');
        setParticipants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Impossible de charger la liste des participants.');
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  if (loading) return <main className="container"><p>Chargement des participants...</p></main>;
  if (error) return <main className="container"><p style={{ color: 'var(--danger)' }}>{error}</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <h1>Annuaire des Participants</h1>
        <Link to="/dashboard">← Retour au Dashboard</Link>
      </header>
      
      <section aria-label="Grille des participants">
        {participants.length === 0 ? (
          <p>Aucun participant trouvé dans la base de données.</p>
        ) : (
          <ul className="grid">
            {participants.map(participant => (
              <li key={participant.id}>
                <article className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{participant.first_name} {participant.last_name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{participant.email}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}