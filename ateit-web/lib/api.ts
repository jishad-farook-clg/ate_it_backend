import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://ate-it-backend.vercel.app/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for Bearer token
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Basic ${token}`;
        }
    }
    return config;
});

export default api;
