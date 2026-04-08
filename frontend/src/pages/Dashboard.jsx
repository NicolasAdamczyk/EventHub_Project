import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    events: [],
    participants: [],
    stats: {
      totalEvents: 0,
      totalParticipants: 0,
      avgParticipants: 0,
      upcomingCount: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, participantsRes] = await Promise.all([
          api.get('events/'),
          api.get('participants/')
        ]);

        const events = eventsRes.data;
        const participants = participantsRes.data;

        // --- CALCULS DES ANALYTICS ---
        
        // 1. Moyenne de participants par événement
        const totalRegistrations = events.reduce((sum, e) => sum + (e.participants?.length || 0), 0);
        const avg = events.length > 0 ? (totalRegistrations / events.length).toFixed(1) : 0;

        // 2. Compter les événements "à venir" (ou "upcoming")
        // Remplace l'ancien filtre par celui-ci
        const upcoming = events.filter(e => e.status === 'upcoming').length;

        // 3. Trier les 3 prochains événements (les plus proches dans le temps)
        const upcomingList = [...events]
          .filter(e => new Date(e.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 3);

        setData({
          events: upcomingList,
          participants: participants,
          stats: {
            totalEvents: events.length,
            totalParticipants: participants.length,
            avgParticipants: avg,
            upcomingCount: upcoming
          }
        });
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Error:", err);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    navigate('/');
  };

  if (loading) return <main className="container"><p>Loading analytics...</p></main>;

  return (
    <main className="container">
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1>Dashboard</h1>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-viewer'}`} style={{ 
              backgroundColor: isAdmin ? '#ffd700' : '#e0e0e0', 
              color: '#333', 
              fontSize: '0.7rem',
              padding: '4px 8px'
            }}>
              {isAdmin ? '🛡️ ADMINISTRATOR' : '👁️ VIEWER'}
            </span>
          </div>
          <p className="text-muted">Overview of your EventHub ecosystem.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
      </header>

      {/* --- SECTION 1 : LES CHIFFRES CLÉS --- */}
      <section className="stats-grid mb-4">
        <article className="stat-card">
          <span className="stat-icon">📅</span>
          <div>
            <h2>{data.stats.totalEvents}</h2>
            <p>Total Events</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <h2>{data.stats.totalParticipants}</h2>
            <p>Participants</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">📈</span>
          <div>
            <h2>{data.stats.avgParticipants}</h2>
            <p>Avg. Per Event</p>
          </div>
        </article>
        <article className="stat-card">
          <span className="stat-icon">🔔</span>
          <div>
            <h2>{data.stats.upcomingCount}</h2>
            <p>Upcoming</p>
          </div>
        </article>
      </section>

      <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        
        {/* --- SECTION 2 : PROCHAINS ÉVÉNEMENTS --- */}
        <section>
          <h2 className="section-title">Upcoming Schedule</h2>
          <div className="card">
            {data.events.length === 0 ? (
              <p className="text-muted">No upcoming events scheduled.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.events.map(e => (
                  <li key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <Link to={`/events/${e.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{e.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {new Date(e.date).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="text-muted">→</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/events" className="btn btn-secondary w-100" style={{ marginTop: '1rem', display: 'block', textAlign: 'center' }}>
              View all events
            </Link>
          </div>
        </section>

        {/* --- SECTION 3 : ACTIONS ET RAPPELS --- */}
        <section>
          <h2 className="section-title">Quick Actions</h2>
          <div className="flex-gap" style={{ flexDirection: 'column' }}>
            <Link to="/events" className="btn btn-primary" style={{ textAlign: 'center' }}>
              📁 Manage All Events
            </Link>
            <Link to="/participants" className="btn btn-secondary" style={{ textAlign: 'center' }}>
              👤 Manage All Participants
            </Link>
            {isAdmin && (
              <Link to="/events/new" className="btn btn-outline" style={{ 
                textAlign: 'center', 
                border: '1px dashed #007bff', 
                color: '#007bff', 
                padding: '10px' 
              }}>
                ✨ Create New Event
              </Link>
            )}
          </div>
          
          <article className="card mt-4" style={{ backgroundColor: '#f8f9fa' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>💡 System Tip</h3>
            <p style={{ fontSize: '0.85rem' }} className="text-muted">
              Use the search bar in each section to quickly find specific data among large volumes of entries.
            </p>
          </article>
        </section>

      </div>
    </main>
  );
}