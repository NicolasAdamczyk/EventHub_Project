import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ eventsCount: 0, participantsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère les données pour faire nos statistiques
    const fetchSummary = async () => {
      try {
        const eventsRes = await api.get('events/');
        const participantsRes = await api.get('participants/');
        
        setStats({
          eventsCount: eventsRes.data.length,
          participantsCount: participantsRes.data.length
        });
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement des statistiques", err);
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard EventHub</h1>
        <button onClick={handleLogout} style={{ background: '#ff4d4d', color: 'white', padding: '10px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Se déconnecter
        </button>
      </div>

      <p>Bienvenue dans la vue d'ensemble de votre application.</p>

      {/* Section des statistiques */}
      {loading ? (
        <p>Calcul des statistiques en cours...</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', margin: '30px 0' }}>
          <div style={{ background: '#e6f7ff', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
            <h2>{stats.eventsCount}</h2>
            <p>Événements créés</p>
          </div>
          <div style={{ background: '#f6ffed', padding: '20px', borderRadius: '8px', flex: 1, textAlign: 'center' }}>
            <h2>{stats.participantsCount}</h2>
            <p>Participants inscrits</p>
          </div>
        </div>
      )}

      {/* Menu de navigation */}
      <h2>Navigation Rapide</h2>
      <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '15px' }}>
        <li>
          <Link to="/events" style={{ textDecoration: 'none', padding: '15px 30px', background: '#007bff', color: 'white', borderRadius: '5px', display: 'inline-block' }}>
            Gérer les Événements
          </Link>
        </li>
        <li>
          <Link to="/participants" style={{ textDecoration: 'none', padding: '15px 30px', background: '#28a745', color: 'white', borderRadius: '5px', display: 'inline-block' }}>
            Gérer les Participants
          </Link>
        </li>
      </ul>
    </div>
  );
}