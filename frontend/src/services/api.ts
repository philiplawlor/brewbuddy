import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (data: { username: string; email: string; password: string; displayName?: string }) =>
    api.post('/auth/register', data),
  
  getMe: () => api.get('/auth/me'),
};

// Recipe API
export const recipeAPI = {
  getRecipes: (params?: { page?: number; limit?: number; sort?: string }) =>
    api.get('/recipes', { params }),
  
  getRecipeById: (id: string) =>
    api.get(`/recipes/${id}`),
  
  createRecipe: (data: Partial<import('../types').Recipe>) =>
    api.post('/recipes', data),
  
  updateRecipe: (id: string, data: Partial<import('../types').Recipe>) =>
    api.put(`/recipes/${id}`, data),
  
  deleteRecipe: (id: string) =>
    api.delete(`/recipes/${id}`),
};

// Brew Session API
export const brewSessionAPI = {
  getSessions: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('/brew-sessions', { params }),

  getSessionById: (id: string) =>
    api.get(`/brew-sessions/${id}`),

  createSession: (data: {
    recipeId: string;
    sessionName?: string;
    brewDate?: string;
    batchNumber?: string;
    method?: string;
    batchSize?: number;
    batchSizeUnit?: string;
    notes?: string;
  }) => api.post('/brew-sessions', data),

  updateSession: (id: string, data: Record<string, any>) =>
    api.put(`/brew-sessions/${id}`, data),

  deleteSession: (id: string) =>
    api.delete(`/brew-sessions/${id}`),

  logEvent: (sessionId: string, data: {
    eventType: string;
    temperature?: number;
    gravityReading?: number;
    notes?: string;
    durationMinutes?: number;
    hopName?: string;
    hopWeight?: number;
    hopWeightUnit?: string;
    hopAlphaAcid?: number;
    hopBoilMinutes?: number;
    mashStepName?: string;
    targetTemp?: number;
    actualTemp?: number;
  }) => api.post(`/brew-sessions/${sessionId}/events`, data),

  getEvents: (sessionId: string) =>
    api.get(`/brew-sessions/${sessionId}/events`),
};

export default api;
