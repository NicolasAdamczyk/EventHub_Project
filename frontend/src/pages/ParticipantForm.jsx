import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function ParticipantForm() {
  const navigate = useNavigate();
  const { id } = useParams(); // Détection de l'ID dans l'URL
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  // Chargement des données existantes si on est en mode édition
  useEffect(() => {
    if (isEditMode) {
      const fetchParticipant = async () => {
        try {
          const response = await api.get(`participants/${id}/`);
          setFormData({
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            email: response.data.email
          });
          setFetching(false);
        } catch (err) {
          setError('Failed to load participant data.');
          setFetching(false);
        }
      };
      fetchParticipant();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode) {
        // Mode ÉDITION : requête PUT
        await api.put(`participants/${id}/`, formData);
      } else {
        // Mode CRÉATION : requête POST
        await api.post('participants/', formData);
      }
      setLoading(false);
      navigate('/participants');
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} participant. Please verify the email is unique.`);
      setLoading(false);
    }
  };

  if (fetching) return <main className="container"><p>Loading participant data...</p></main>;

  return (
    <main className="container">
      <div className="back-link">
        <Link to="/participants">← Back to directory</Link>
      </div>

      <header className="page-header">
        <div>
          <h1 className="mb-1">{isEditMode ? 'Edit Participant' : 'Add New Participant'}</h1>
          <p className="text-muted">
            {isEditMode ? 'Update the details of the participant below.' : 'Register a new person in the database.'}
          </p>
        </div>
      </header>

      <article className="card">
        {error && <p className="error-text mb-2">{error}</p>}

        <form onSubmit={handleSubmit} className="form-group">
          <div>
            <label htmlFor="first_name" className="font-medium">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              className="input-field"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="last_name" className="font-medium">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              className="input-field"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="font-medium">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="input-field"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary mt-auto" disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Participant' : 'Save Participant')}
          </button>
        </form>
      </article>
    </main>
  );
}