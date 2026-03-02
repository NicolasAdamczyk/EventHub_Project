import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventDetails() {
  const { id } = useParams(); // Récupère le numéro de l'événement dans l'URL
  
  // Nos états pour stocker les données
  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fonction asynchrone pour récupérer toutes les données nécessaires
    const fetchEventData = async () => {
      try {
        // 1. On récupère les détails précis de cet événement
        const eventResponse = await api.get(`events/${id}/`);
        setEvent(eventResponse.data);

        // 2. On récupère TOUTES les inscriptions et TOUS les participants
        const registrationsResponse = await api.get('registrations/');
        const participantsResponse = await api.get('participants/');

        // 3. Logique de filtrage : on cherche les inscriptions liées à CET événement
        const eventRegistrations = registrationsResponse.data.filter(
          (reg) => reg.event === parseInt(id)
        );
        
        // On extrait les IDs des participants inscrits
        const participantIds = eventRegistrations.map((reg) => reg.participant);

        // 4. On récupère les vrais profils (nom, prénom) qui correspondent à ces IDs
        const registeredParticipants = participantsResponse.data.filter(
          (participant) => participantIds.includes(participant.id)
        );

        setAttendees(registeredParticipants);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les détails de l'événement.");
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  // Affichage pendant le chargement
  if (loading) return <p style={{ padding: '20px' }}>Chargement des détails...</p>;
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;
  if (!event) return <p style={{ padding: '20px' }}>Événement introuvable.</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/events">← Retour aux événements</Link>
      
      <div style={{ background: '#f9f9f9', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h1>{event.title}</h1>
        <p><strong>Date :</strong> {new Date(event.date).toLocaleString()}</p>
        <p><strong>Statut :</strong> <span style={{ color: 'blue' }}>{event.status}</span></p>
        <p><strong>Description :</strong></p>
        <p style={{ background: 'white', padding: '15px', border: '1px solid #eee' }}>
          {event.description}
        </p>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Participants inscrits ({attendees.length})</h2>
        {attendees.length === 0 ? (
          <p>Aucun participant n'est encore inscrit à cet événement.</p>
        ) : (
          <ul style={{ listStyleType: 'square' }}>
            {attendees.map(participant => (
              <li key={participant.id} style={{ margin: '10px 0' }}>
                <strong>{participant.first_name} {participant.last_name}</strong> - <em>{participant.email}</em>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}