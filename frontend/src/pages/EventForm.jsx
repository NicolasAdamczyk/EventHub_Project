import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function EventForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    status: 'upcoming' // Valeur par défaut
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Calcul de la date minimale pour interdire le passé à la création
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0, 16);

  useEffect(() => {
    if (isEditMode) {
      const fetchEvent = async () => {
        try {
          const response = await api.get(`events/${id}/`);
          const eventData = response.data;
          const formattedDate = eventData.date
            ? new Date(eventData.date).toISOString().slice(0, 16)
            : '';

          setFormData({
            title: eventData.title,
            date: formattedDate,
            description: eventData.description || '',
            status: eventData.status // On garde le statut actuel lors de l'édition
          });
          setFetching(false);
        } catch (err) {
          setError('Failed to load event data.');
          setFetching(false);
        }
      };
      fetchEvent();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // LOGIQUE AUTOMATIQUE (Uniquement pour la création)
    let finalStatus = formData.status;
    
    if (!isEditMode) {
      const eventDate = new Date(formData.date);
      const currentDate = new Date();
      
      if (eventDate < currentDate) {
        finalStatus = "completed";
      } else if (eventDate.toDateString() === currentDate.toDateString()) {
        finalStatus = "in_progress";
      } else {
        finalStatus = "upcoming";
      }
    }

    const finalData = {
      ...formData,
      status: finalStatus
    };

    try {
      if (isEditMode) {
        // En édition, on envoie les modifs (titre, date, desc) sans changer le statut
        await api.put(`events/${id}/`, finalData);
      } else {
        await api.post('events/', finalData);
      }
      navigate('/events');
    } catch (err) {
      setError("Error saving event. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <main className="container"><p>Loading event data...</p></main>;

  return (
    <main className="container">
      <div className="back-link">
        <Link to="/events">← Back to events</Link>
      </div>

      <header className="page-header">
        <div>
          <h1 className="mb-1">{isEditMode ? 'Edit Event' : 'Create New Event'}</h1>
          <p className="text-muted">
            {isEditMode ? 'Update event details.' : 'Fill in the details to add a new event.'}
          </p>
        </div>
      </header>

      <article className="card">
        {error && <p className="error-text mb-2" style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label htmlFor="title" className="font-medium">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="input-field"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="font-medium">Date & Time *</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              className="input-field"
              min={isEditMode ? "" : minDateTime}
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          {/* LE SELECTEUR DE STATUT A ÉTÉ SUPPRIMÉ ICI */}

          <div>
            <label htmlFor="description" className="font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              className="input-field"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary mt-auto" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
          </button>
        </form>
      </article>
    </main>
  );
}