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
        console.error(err);
        setError('Impossible de charger la liste des participants.');
        setLoading(false);
      }
    };

    fetchParticipants();
  }, []);

  if (loading) return <p style={{ padding: '20px' }}>Chargement des participants...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/dashboard">← Retour au Dashboard</Link>
      <h1>Liste des Participants</h1>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {participants.length === 0 ? (
          <p>Aucun participant trouvé.</p>
        ) : (
          participants.map(participant => (
            <div key={participant.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
              <h3>{participant.first_name} {participant.last_name}</h3>
              <p>Email: {participant.email}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}