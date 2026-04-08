import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  
  // States pour la recherche globale (pour inscrire)
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  
  // State pour la recherche locale (parmi les inscrits)
  const [searchTerm, setSearchTerm] = useState('');
  
  const [regLoading, setRegLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const eventRes = await api.get(`events/${id}/`);
      const participantsRes = await api.get('participants/');
      setEvent(eventRes.data);
      setAllParticipants(participantsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load event details.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRegister = async (participantId) => {
    if (!participantId) return;
    setRegLoading(true);
    try {
      await api.post('registrations/', {
        event: id,
        participant: participantId
      });
      await fetchData();
      setAttendeeSearch(''); 
      setSelectedParticipantId('');
      setRegLoading(false);
      alert("Participant successfully registered!");
    } catch (err) {
      alert("Error: Participant might already be registered.");
      setRegLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const regsRes = await api.get('registrations/');
      const targetRegistration = regsRes.data.find(
        (reg) => String(reg.event) === String(id) && String(reg.participant) === String(participantId)
      );
      if (targetRegistration) {
        await api.delete(`registrations/${targetRegistration.id}/`);
        await fetchData();
      } else {
        alert("Error: Registration link not found.");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Could not remove participant.");
    }
  };

  const handleMarkAsCompleted = async () => {
    if (!window.confirm("Mark this event as completed?")) return;
    try {
      setRegLoading(true);
      
      // On utilise PATCH ici pour ne modifier QUE le statut
      await api.patch(`events/${id}/`, { status: 'completed' });
      
      // On rafraîchit les données pour voir le badge changer
      await fetchData(); 
      alert("Status updated to Completed!");
    } catch (err) {
      console.error("Détails de l'erreur 400 :", err.response?.data);
      alert("Error: Check the console to see why Django rejected the update.");
    } finally {
      setRegLoading(false);
    }
  };

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // Filtrer les participants DISPONIBLES
  const availableParticipants = allParticipants.filter(p => {
    if (!attendeeSearch) return false;
    const isAlreadyRegistered = event?.participants?.some(ep => 
      (typeof ep === 'object' ? ep.id : ep) === p.id
    );
    if (isAlreadyRegistered) return false;
    const search = attendeeSearch.toLowerCase();
    const fullName = (p.first_name + " " + p.last_name).toLowerCase();
    return fullName.includes(search) || p.email.toLowerCase().includes(search);
  });

  if (loading) return <main className="container"><p>Loading details...</p></main>;
  if (error) return <main className="container"><p className="error-text">{error}</p></main>;
  if (!event) return null;

  // Logique de temps pour le bouton
  const isPast = new Date(event.date) < new Date();

  return (
    <main className="container">
      <Link to="/events" className="back-link">← Back to events list</Link>
      
      <article className="card mb-4">
        <header className="event-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="mb-1">{event.title}</h1>
            <div className="event-meta">
              <span>📅 {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="badge">{event.status}</span>
            </div>
          </div>

          {/* BOUTON MARK AS COMPLETED : Apparaît si Admin + Date passée + Pas déjà completed */}
          {isAdmin && isPast && event.status !== 'completed' && (
            <button 
              onClick={handleMarkAsCompleted}
              className="btn btn-success"
              disabled={regLoading}
              style={{ backgroundColor: '#28a745', border: 'none', color: 'white', padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer' }}
            >
              {regLoading ? 'Updating...' : '✅ Mark as Completed'}
            </button>
          )}
        </header>
        
        <div className="p-1">
          <h2 className="font-md mb-1">Description</h2>
          <p className="description-text mb-3">{event.description || "No description provided."}</p>
        </div>
      </article>

      {isAdmin && (
        <section className="card mb-4">
          <h2 className="section-title">Register a Participant</h2>
          <div className="registration-live-search" style={{ position: 'relative' }}>
            <input 
              type="text"
              className="input-field"
              placeholder="🔍 Type a name or email (searches entries)..."
              value={attendeeSearch}
              onChange={(e) => {
                setAttendeeSearch(e.target.value);
                setSelectedParticipantId('');
              }}
              style={{ marginBottom: '0.5rem' }}
            />

            {attendeeSearch && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 100,
                padding: '0.5rem'
              }}>
                {availableParticipants.length === 0 ? (
                  <p className="text-muted text-center" style={{ fontSize: '0.9rem', padding: '1rem' }}>
                    No matching participants found.
                  </p>
                ) : (
                  <>
                    <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.2rem' }}>
                      Showing {availableParticipants.length > 50 ? 'first 50 results' : `${availableParticipants.length} results`}.
                    </p>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {availableParticipants.slice(0, 50).map(p => (
                        <li key={p.id} style={{ marginBottom: '0.3rem' }}>
                          <button 
                            type="button"
                            onClick={() => handleRegister(p.id)}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              background: 'none',
                              border: '1px solid transparent',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                          >
                            <div>
                              <strong style={{ display: 'block' }}>{p.first_name} {p.last_name}</strong>
                              <span className="text-muted" style={{ fontSize: '0.8rem' }}>{p.email}</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#007bff' }}>Add +</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Registered Participants</h2>
          
          {event.participants && event.participants.length > 0 && (
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Search in participants..."
              style={{ maxWidth: '300px', margin: 0 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
        
        {!event.participants || event.participants.length === 0 ? (
          <div className="card text-center p-1 empty-state">
            <p>No participants registered yet.</p>
          </div>
        ) : (
          <ul className="grid">
            {event.participants
              .map(participantItem => {
                return typeof participantItem === 'object' 
                  ? participantItem 
                  : allParticipants.find(p => p.id === participantItem);
              })
              .filter(participant => {
                if (!participant) return false;
                const search = searchTerm.toLowerCase();
                return (
                  participant.first_name.toLowerCase().includes(search) ||
                  participant.last_name.toLowerCase().includes(search) ||
                  participant.email.toLowerCase().includes(search)
                );
              })
              .map(participant => {
                if (!participant || !participant.first_name) return null;
                return (
                  <li key={participant.id}>
                    <article className="card participant-card" style={{ justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="avatar">
                          {participant.first_name.charAt(0)}{participant.last_name.charAt(0)}
                        </div>
                        <div className="participant-info">
                          <h3>{participant.first_name} {participant.last_name}</h3>
                          <p>{participant.email}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <button 
                          onClick={() => handleRemoveParticipant(participant.id)} 
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        >
                          Remove
                        </button>
                      )}
                    </article>
                  </li>
                );
              })}
          </ul>
        )}
      </section>
    </main>
  );
}