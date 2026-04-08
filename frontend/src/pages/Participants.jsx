import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await api.get('participants/');
      setParticipants(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch participants.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) return;
    try {
      await api.delete(`participants/${id}/`);
      setParticipants(participants.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting participant.');
    }
  };

  const filteredParticipants = participants.filter(p => {
    const search = searchTerm.toLowerCase();
    return (
      p.first_name.toLowerCase().includes(search) ||
      p.last_name.toLowerCase().includes(search) ||
      p.email.toLowerCase().includes(search)
    );
  });

  if (loading) return <main className="container"><p>Loading participants...</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Participants Directory</h1>
          <Link to="/dashboard" className="text-muted">Back to Dashboard</Link>
        </div>
        {isAdmin && (
          <Link to="/participants/new" className="btn btn-primary">Add Participant</Link>
        )}
      </header>

      {/* Barre de recherche avec des classes propres */}
      <section className="filter-bar">
        <div className="participant-search-wrapper">
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </section>

      <section aria-label="Participants grid">
        {filteredParticipants.length === 0 ? (
          <p className="text-center py-2">No participants found matching your search.</p>
        ) : (
          <ul className="grid">
            {filteredParticipants.map(participant => (
              <li key={participant.id}>
                {/* On réutilise la classe participant-card-flex d'EventDetails */}
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
                    <div className="participant-actions">
                      <Link 
                        to={`/participants/edit/${participant.id}`} 
                        className="btn btn-secondary btn-sm"
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(participant.id)} 
                        className="btn btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}