import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventRes = await api.get(`events/${id}/`);
        setEvent(eventRes.data);

        const [regRes, partRes] = await Promise.all([
          api.get('registrations/'),
          api.get('participants/')
        ]);

        const eventRegistrations = regRes.data.filter(reg => reg.event === parseInt(id));
        const participantIds = eventRegistrations.map(reg => reg.participant);
        const registeredParticipants = partRes.data.filter(p => participantIds.includes(p.id));

        setAttendees(registeredParticipants);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger les détails de l'événement.");
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  if (loading) return <main className="container"><p>Chargement des détails...</p></main>;
  if (error) return <main className="container"><p style={{ color: 'var(--danger)' }}>{error}</p></main>;
  if (!event) return <main className="container"><p>Événement introuvable.</p></main>;

  return (
    <main className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/events">← Retour aux événements</Link>
      </div>
      
      <article className="card" style={{ marginBottom: '2rem' }}>
        <header style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>{event.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', color: 'var(--text-muted)' }}>
            <span>📅 {new Date(event.date).toLocaleString()}</span>
            <span className="badge">{event.status}</span>
          </div>
        </header>
        <section>
          <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{event.description}</p>
        </section>
      </article>

      <section aria-label="Liste des participants inscrits">
        <h2 style={{ marginBottom: '1rem' }}>Participants inscrits ({attendees.length})</h2>
        {attendees.length === 0 ? (
          <p className="card" style={{ background: 'transparent', borderStyle: 'dashed' }}>
            Aucun participant n'est encore inscrit à cet événement.
          </p>
        ) : (
          <ul className="grid">
            {attendees.map(participant => (
              <li key={participant.id} className="card" style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem' }}>{participant.first_name} {participant.last_name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>✉️ {participant.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}