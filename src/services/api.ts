import axios from 'axios';

// Configuração base do axios
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5211/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            localStorage.removeItem('accessToken');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
