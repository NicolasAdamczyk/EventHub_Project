import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('https://nicolasadamczyk.pythonanywhere.com/api/login/', {
        username, password
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <main className="container" style={{ maxWidth: '450px', marginTop: '10vh' }}>
      <article className="card">
        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1>Bienvenue sur EventHub</h1>
          <p className="text-muted">Veuillez vous connecter pour continuer</p>
        </header>
        
        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
        <form onSubmit={handleLogin} className="form-group">
          <input 
            type="text" 
            className="input-field"
            placeholder="Nom d'utilisateur" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="input-field"
            placeholder="Mot de passe" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </form>
      </article>
    </main>
  );
}