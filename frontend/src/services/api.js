import axios from 'axios';

// Prioritize environment variables, falling back to the live Render backend
const rawApiUrl = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  'https://resqtrace-backend.onrender.com/api';

const formatApiUrl = (url) => {
  if (!url) return 'https://resqtrace-backend.onrender.com/api';
  const trimmed = url.trim().replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const API_URL = formatApiUrl(rawApiUrl);

const api = axios.create({
    baseURL: API_URL,
    timeout: 30000, // 30s timeout
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const getPhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    if (photoUrl.startsWith('http://') || photoUrl.startsWith('https://') || photoUrl.startsWith('blob:') || photoUrl.startsWith('data:')) {
        return photoUrl;
    }
    
    // Normalize path
    const normalized = photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`;
    
    // If baseURL is absolute (e.g. https://resqtrace-backend.onrender.com/api or http://localhost:8080/api)
    if (API_URL.startsWith('http://') || API_URL.startsWith('https://')) {
        try {
            const url = new URL(API_URL);
            return `${url.origin}${normalized.startsWith('/api') ? normalized : `/api${normalized}`}`;
        } catch (e) {
            // fallback
        }
    }
    
    // Relative URL fallback
    return normalized.startsWith('/api') ? normalized : `/api${normalized}`;
};

export const auth = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me')
};

export const casesAPI = {
    create: (formData) => api.post('/cases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getAll: (params) => api.get('/cases', { params }),
    getById: (id) => api.get(`/cases/${id}`),
    updateStatus: (id, status) => api.put(`/cases/${id}/status`, null, { params: { status } }),
    getStats: () => api.get('/cases/stats'),
    
    // Phase C
    verify: (id) => api.post(`/cases/${id}/verify`),
    reject: (id) => api.post(`/cases/${id}/reject`),
    getDuplicates: () => api.get('/duplicates'),
    confirmDuplicate: (id) => api.post(`/duplicates/${id}/confirm`),
    rejectDuplicate: (id) => api.post(`/duplicates/${id}/reject`),

    // Phase D
    getMapData: () => api.get('/dashboard/map'),
};

export const respondersAPI = {
    getAll: () => api.get('/responders'),
    getMe: () => api.get('/responders/me'),
    updateAvailability: (id, availability) => api.put(`/responders/${id}/availability`, null, { params: { availability } }),
};

export const tasksAPI = {
    create: (taskData) => api.post('/tasks', taskData),
    getAll: () => api.get('/tasks'),
    getById: (id) => api.get(`/tasks/${id}`),
    updateStatus: (id, status) => api.put(`/tasks/${id}/status`, null, { params: { status } }),
};

export const aiAPI = {
    getPendingMatches: () => api.get('/ai-matches/pending'),
    acceptMatch: (id) => api.post(`/ai-matches/${id}/accept`),
    rejectMatch: (id) => api.post(`/ai-matches/${id}/reject`)
};

export default api;
