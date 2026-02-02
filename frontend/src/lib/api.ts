import axios from 'axios';

const getApiBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return 'http://localhost:8000';
        }
    }
    return 'https://winn-yearly-budget.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();
console.log('Using API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.message);
        console.dir(error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return Promise.reject(error);
    }
);

export const settingsApi = {
    get: () => api.get('/settings/'),
    create: (data: any) => api.post('/settings/', data),
};

export const budgetApi = {
    getAll: () => api.get('/budget-items/'),
    create: (data: any) => api.post('/budget-items/', data),
    delete: (id: number) => api.delete(`/budget-items/${id}`),
};

export const monthlyValuesApi = {
    getAll: () => api.get('/monthly-values/'),
    create: (data: any) => api.post('/monthly-values/', data),
};

export const transactionsApi = {
    getAll: () => api.get('/transactions/'),
    create: (data: any) => api.post('/transactions/', data),
    delete: (id: number) => api.delete(`/transactions/${id}`),
};

export const dashboardApi = {
    getSummary: () => api.get('/dashboard/summary'),
};

export default api;
