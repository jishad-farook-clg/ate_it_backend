import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ate-it-backend.vercel.app/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for Bearer token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;
