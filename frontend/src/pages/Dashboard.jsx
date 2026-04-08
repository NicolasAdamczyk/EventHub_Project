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
        const totalRegistrations = events.reduce((sum, e) => sum + (e.participants?.length || 0), 0);
        const avg = events.length > 0 ? (totalRegistrations / events.length).toFixed(1) : 0;
        const upcoming = events.filter(e => e.status === 'upcoming').length;

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
          <div className="dashboard-header-title">
            <h1>Dashboard</h1>
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-viewer'}`}>
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
          <div>
            <h2>{data.stats.totalEvents}</h2>
            <p>Total Events</p>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <h2>{data.stats.totalParticipants}</h2>
            <p>Participants</p>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <h2>{data.stats.avgParticipants}</h2>
            <p>Avg. Per Event</p>
          </div>
        </article>
        <article className="stat-card">
          <div>
            <h2>{data.stats.upcomingCount}</h2>
            <p>Upcoming</p>
          </div>
        </article>
      </section>

      <div className="dashboard-main-grid">
        
        {/* --- SECTION 2 : PROCHAINS ÉVÉNEMENTS --- */}
        <section>
          <h2 className="section-title">Upcoming Schedule</h2>
          <div className="card">
            {data.events.length === 0 ? (
              <p className="text-muted">No upcoming events scheduled.</p>
            ) : (
              <ul className="upcoming-list">
                {data.events.map(e => (
                  <li key={e.id} className="upcoming-list-item">
                    <Link to={`/events/${e.id}`} className="upcoming-list-link">
                      <div className="upcoming-item-content">
                        <div>
                          <strong>{e.title}</strong>
                          <div className="upcoming-item-date">
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
            <Link to="/events" className="btn btn-secondary w-100 dashboard-view-all-btn">
              View all events
            </Link>
          </div>
        </section>

        {/* --- SECTION 3 : ACTIONS ET RAPPELS --- */}
        <section>
          <h2 className="section-title">Quick Actions</h2>
          <div className="flex-gap quick-actions-container">
            <Link to="/events" className="btn btn-primary btn-action-block">
              Manage All Events
            </Link>
            <Link to="/participants" className="btn btn-secondary btn-action-block">
              Manage All Participants
            </Link>
            {isAdmin && (
              <Link to="/events/new" className="btn btn-outline btn-outline-dashed btn-action-block">
                Create New Event
              </Link>
            )}
          </div>
          
          <article className="card mt-1 system-tip-card">
            <h3 className="system-tip-title">💡 System Tip</h3>
            <p className="system-tip-text text-muted">
              Use the search bar in each section to quickly find specific data among large volumes of entries.
            </p>
          </article>
        </section>

      </div>
    </main>
  );
}