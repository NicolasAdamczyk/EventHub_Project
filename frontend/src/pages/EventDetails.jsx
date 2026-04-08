import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [allParticipants, setAllParticipants] = useState([]);
  
  const [attendeeSearch, setAttendeeSearch] = useState('');
  const [selectedParticipantId, setSelectedParticipantId] = useState('');
  
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
      await api.patch(`events/${id}/`, { status: 'completed' });
      await fetchData(); 
      alert("Status updated to Completed!");
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setRegLoading(false);
    }
  };

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

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

  const isPast = new Date(event.date) < new Date();

  const formatStatus = (statusKey) => {
    const statusMap = {
      'upcoming': 'Upcoming',
      'in_progress': 'In Progress',
      'completed': 'Finished'
    };
    return statusMap[statusKey] || statusKey;
  };

  return (
    <main className="container">
      <Link to="/events" className="back-link">Back to events list</Link>
      
      <article className="card mb-4">
        <header className="event-details-header">
          <div>
            <h1 className="mb-1">{event.title}</h1>
            <div className="event-meta">
              <span>📅 {new Date(event.date).toLocaleDateString()} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <span className="badge">{formatStatus(event.status)}</span>
            </div>
          </div>

          {isAdmin && isPast && event.status !== 'completed' && (
            <button 
              onClick={handleMarkAsCompleted}
              className="btn btn-success btn-completed"
              disabled={regLoading}
            >
              {regLoading ? 'Updating...' : 'Mark as Completed'}
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
          <div className="live-search-wrapper">
            <input 
              type="text"
              className="input-field live-search-input"
              placeholder="🔍 Type a name or email (searches entries)..."
              value={attendeeSearch}
              onChange={(e) => {
                setAttendeeSearch(e.target.value);
                setSelectedParticipantId('');
              }}
            />

            {attendeeSearch && (
              <div className="live-search-dropdown">
                {availableParticipants.length === 0 ? (
                  <p className="text-muted text-center live-search-empty">
                    No matching participants found.
                  </p>
                ) : (
                  <>
                    <p className="text-muted live-search-info">
                      Showing {availableParticipants.length > 50 ? 'first 50 results' : `${availableParticipants.length} results`}.
                    </p>
                    <ul className="live-search-list">
                      {availableParticipants.slice(0, 50).map(p => (
                        <li key={p.id} className="live-search-item">
                          <button 
                            type="button"
                            onClick={() => handleRegister(p.id)}
                            className="live-search-btn"
                          >
                            <div>
                              <strong className="live-search-name">{p.first_name} {p.last_name}</strong>
                              <span className="text-muted live-search-email">{p.email}</span>
                            </div>
                            <span className="live-search-add">Add +</span>
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
        <div className="participants-header-flex">
          <h2 className="section-title participants-title">Registered Participants</h2>
          
          {event.participants && event.participants.length > 0 && (
            <input
              type="text"
              className="input-field participants-search-input"
              placeholder="🔍 Search in participants..."
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
                    <article className="card participant-card participant-card-flex">
                      <div className="participant-info-flex">
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
                          className="btn btn-danger btn-remove-participant"
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