import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

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
