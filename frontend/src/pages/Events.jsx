import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  
  // 👇 1. AJOUTE LE STATE POUR LA RECHERCHE
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('events/');
      setEvents(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events.');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`events/${id}/`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      alert('Error deleting event.');
    }
  };

  // 👇 2. LOGIQUE DE FILTRAGE COMBINÉE (Status + Recherche)
  const filteredEvents = events.filter(event => {
    const matchesStatus = statusFilter === '' || event.status === statusFilter;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) return <main className="container"><p>Loading events...</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <h1>Events List</h1>
          <Link to="/dashboard" className="text-muted">← Back to Dashboard</Link>
        </div>
        {isAdmin && (
          <Link to="/events/new" className="btn btn-primary">+ Create Event</Link>
        )}
      </header>
      
      {/* 👇 3. BARRE DE RECHERCHE ET FILTRE CÔTE À CÔTE 👇 */}
      <section className="filter-bar" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Search by event title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="status-filter" className="font-medium">Status:</label>
          <select 
            id="status-filter" 
            className="input-field w-auto"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </section>

      <section aria-label="Events grid">
        {filteredEvents.length === 0 ? (
          <p className="text-center py-2">No events match your criteria.</p>
        ) : (
          <ul className="grid">
            {filteredEvents.map(event => (
              <li key={event.id}>
                <article className="card event-card-content">
                  <h2 className="event-title">{event.title}</h2>
                  <p className="text-muted mb-1">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </p>
                  <p className="mb-3">
                    <span className="badge">{event.status}</span>
                  </p>
                  
                  <div className="flex-gap mt-auto">
                    <Link to={`/events/${event.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                    
                    {isAdmin && (
                      <>
                        <Link to={`/events/edit/${event.id}`} className="btn btn-secondary">
                          Edit
                        </Link>
                        <button 
                          onClick={() => handleDelete(event.id)} 
                          className="btn btn-danger"
                        >
                          Delete
                        </button>
                      </>
                    )}
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