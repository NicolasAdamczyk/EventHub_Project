import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true); 
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  
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
        setConfirmPassword(''); 
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
        
        {/* Classes CSS propres pour les messages */}
        {error && <p className="error-text error-text-center mb-2">{error}</p>}
        {successMsg && <p className="success-text-center mb-2">{successMsg}</p>}
        
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

          {/* Wrapper animé pour la transition du Confirm Password */}
          <div className={`confirm-password-wrapper ${isLoginMode ? 'hidden' : 'visible'}`}>
            <input 
              type="password" 
              className="input-field"
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required={!isLoginMode} // Le champ n'est requis qu'en mode signup
            />
          </div>

          <button type="submit" className="btn btn-primary">
            {isLoginMode ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="toggle-mode-wrapper">
          <button 
            type="button" 
            className="toggle-mode-btn"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setSuccessMsg('');
              setConfirmPassword(''); 
            }}
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </article>
    </main>
  );
}