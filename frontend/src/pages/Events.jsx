import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api'; // On importe notre outil configuré à l'étape 1

export default function Events() {
  // Déclaration de nos états avec les React Hooks
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // État pour le filtrage demandé par le professeur
  const [statusFilter, setStatusFilter] = useState(''); 

  // Le hook useEffect se déclenche automatiquement au chargement de la page
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // On demande la liste des événements à Django
      const response = await api.get('events/');
      setEvents(response.data);
      setLoading(false); // On arrête le chargement
    } catch (err) {
      console.error(err);
      setError('Impossible de charger les événements. Vérifiez votre connexion.');
      setLoading(false);
    }
  };

  // Logique de filtrage : on garde les événements qui correspondent au statut choisi
  const filteredEvents = events.filter(event => {
    if (statusFilter === '') return true; // Si pas de filtre, on affiche tout
    return event.status.toLowerCase() === statusFilter.toLowerCase();
  });

  // Affichage pendant le chargement
  if (loading) return <p style={{ padding: '20px' }}>Chargement des événements...</p>;
  
  // Affichage en cas d'erreur
  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;

  // Affichage principal
  return (
    <div style={{ padding: '20px' }}>
      <h1>Liste des Événements</h1>
      
      {/* Zone de filtrage */}
      <div style={{ marginBottom: '20px', padding: '10px', background: '#f0f0f0' }}>
        <label htmlFor="status-filter">Filtrer par statut : </label>
        <select 
          id="status-filter" 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Tous</option>
          <option value="à venir">À venir</option>
          <option value="en cours">En cours</option>
          <option value="terminé">Terminé</option>
        </select>
      </div>

      {/* Liste des événements */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredEvents.map(event => (
          <li key={event.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px' }}>
            <h2>{event.title}</h2>
            <p><strong>Date :</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Statut :</strong> {event.status}</p>
            
            {/* Lien vers la page de détails (que l'on fera ensuite) */}
            <Link to={`/events/${event.id}`}>
              <button style={{ marginTop: '10px' }}>Voir les détails</button>
            </Link>
          </li>
        ))}
        
        {/* Message si aucun événement ne correspond au filtre */}
        {filteredEvents.length === 0 && <p>Aucun événement trouvé pour ce statut.</p>}
      </ul>
    </div>
  );
}