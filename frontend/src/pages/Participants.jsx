import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Participants() {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 👇 1. AJOUTE CE NOUVEAU STATE POUR LA RECHERCHE
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

  // 👇 2. LOGIQUE DE FILTRAGE
  // On crée une liste filtrée basée sur le nom, prénom ou email
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
          <Link to="/dashboard" className="text-muted">← Back to Dashboard</Link>
        </div>
        {isAdmin && (
          <Link to="/participants/new" className="btn btn-primary">+ Add Participant</Link>
        )}
      </header>

      {/* 👇 3. AJOUTE LA BARRE DE RECHERCHE ICI 👇 */}
      <section className="filter-bar">
        <div className="search-container" style={{ width: '100%', maxWidth: '400px' }}>
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
        {/* 👇 4. ON UTILISE filteredParticipants AU LIEU DE participants 👇 */}
        {filteredParticipants.length === 0 ? (
          <p className="text-center py-2">No participants found matching your search.</p>
        ) : (
          <ul className="grid">
            {filteredParticipants.map(participant => (
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link 
                        to={`/participants/edit/${participant.id}`} 
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(participant.id)} 
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
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