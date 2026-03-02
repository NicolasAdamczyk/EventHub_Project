import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importation de nos pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Participants from './pages/Participants';

// Importation de notre gardien
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* La page Login est publique, pas de gardien ici */}
        <Route path="/" element={<Login />} />
        
        {/* Toutes les autres pages sont protégées ! */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/events" element={
          <ProtectedRoute>
            <Events />
          </ProtectedRoute>
        } />
        
        <Route path="/participants" element={
          <ProtectedRoute>
            <Participants />
          </ProtectedRoute>
        } />
        
        <Route path="/events/:id" element={
          <ProtectedRoute>
            <EventDetails />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;