import axios from 'axios';

// On crée une instance d'Axios préconfigurée avec l'adresse de notre API Django
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

// On ajoute un "intercepteur" : avant chaque requête, on glisse le token dans l'en-tête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;