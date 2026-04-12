import axios from 'axios';

// 1. On définit l'URL de base (Render en prod, localhost en test)
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// 2. On crée l'instance unique
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// 3. L'intercepteur pour ajouter le Token automatiquement
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;