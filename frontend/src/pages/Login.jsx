import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Nouveau state
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (isLoginMode) {
      // ---------------- MODE CONNEXION ----------------
      try {
        const response = await axios.post('https://nicolasadamczyk.pythonanywhere.com/api/login/', {
          username, password
        });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', response.data.is_staff); 
        navigate('/dashboard');
      } catch (err) {
        setError('Invalid credentials. Please try again.');
      }
    } else {
      // ---------------- MODE INSCRIPTION ----------------
      
      // Vérification locale du mot de passe
      if (password !== confirmPassword) {
        setError("Passwords do not match!");
        return;
      }

      try {
        await axios.post('https://nicolasadamczyk.pythonanywhere.com/api/register/', {
          username, password
        });
        
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsLoginMode(true); 
        setPassword('');
        setConfirmPassword(''); // On reset aussi le confirm
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred during registration.');
      }
    }
  };

  return (
    <main className="container login-container">
      <article className="card">
        <header className="login-header">
          <h1>{isLoginMode ? 'Welcome to EventHub' : 'Create an Account'}</h1>
          <p className="text-muted">
            {isLoginMode ? 'Please log in to continue' : 'Sign up to become a viewer'}
          </p>
        </header>
        
        {error && <p className="error-text mb-2" style={{ textAlign: 'center', color: 'red' }}>{error}</p>}
        {successMsg && <p className="mb-2" style={{ color: 'green', textAlign: 'center' }}>{successMsg}</p>}
        
        <form onSubmit={handleSubmit} className="form-group">
          <input 
            type="text" 
            className="input-field"
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input 
            type="password" 
            className="input-field"
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* 👇 CHAMP AFFICHÉ UNIQUEMENT EN MODE SIGNUP 👇 */}
          {!isLoginMode && (
            <input 
              type="password" 
              className="input-field"
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}

          <button type="submit" className="btn btn-primary">
            {isLoginMode ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button 
            type="button" 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setSuccessMsg('');
              setConfirmPassword(''); // On vide le champ si on change de mode
            }}
            style={{ background: 'none', border: 'none', color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </article>
    </main>
  );
}