import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // On vérifie si un token est présent dans le stockage du navigateur
  const token = localStorage.getItem('token');

  // Si aucun token n'est trouvé, on redirige de force vers la page de Login ("/")
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si le token est là, on laisse l'utilisateur accéder à la page demandée (les "children")
  return children;
}