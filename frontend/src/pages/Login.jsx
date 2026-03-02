import { useState } from 'react'; // Utilisation des React Hooks 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  // Déclaration de nos "états" (variables qui mettront à jour l'affichage)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Loading and error state handling 
  
  const navigate = useNavigate(); // Outil pour rediriger l'utilisateur après connexion

  // Fonction déclenchée quand on clique sur "Se connecter"
  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche la page de se recharger
    setError(''); // On efface les anciennes erreurs

    try {
      // 1. On envoie les identifiants à l'API Django
        const response = await axios.post('https://nicolasadamczyk.pythonanywhere.com/api/login/', {
        username: username,
        password: password
      });

      // 2. Si ça marche, on récupère le Token et on le stocke dans le navigateur (Token storage )
      localStorage.setItem('token', response.data.token);
      
      // 3. On redirige l'utilisateur vers le Dashboard
      navigate('/dashboard');

    } catch (err) {
      // Si Django refuse (mauvais mot de passe), on affiche une erreur 
      setError('Identifiants incorrects. Veuillez réessayer.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h1>Connexion à EventHub</h1>
      
      {/* Affichage de l'erreur si elle existe */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Nom d'utilisateur (ex: admin)" 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Mot de passe" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}