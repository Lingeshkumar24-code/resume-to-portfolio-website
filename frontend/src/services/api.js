import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT tokens to private routes
API.interceptors.request.use(
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

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password) => {
    const response = await API.post('/auth/register', { name, email, password });
    return response.data;
  },
  getMe: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },
};

export const resumeService = {
  uploadResume: async (formData) => {
    const response = await API.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getMyResumes: async () => {
    const response = await API.get('/resumes');
    return response.data;
  },
  deleteResume: async (id) => {
    const response = await API.delete(`/resumes/${id}`);
    return response.data;
  },
};

export const portfolioService = {
  generatePortfolio: async (resumeId) => {
    const response = await API.post('/portfolios/generate', { resumeId });
    return response.data;
  },
  getMyPortfolios: async () => {
    const response = await API.get('/portfolios');
    return response.data;
  },
  getPortfolioById: async (id) => {
    const response = await API.get(`/portfolios/${id}`);
    return response.data;
  },
  updatePortfolio: async (id, updatedData) => {
    const response = await API.put(`/portfolios/${id}`, updatedData);
    return response.data;
  },
  customizePortfolioWithAI: async (id, message) => {
    const response = await API.post(`/portfolios/${id}/customize`, { message });
    return response.data;
  },
  deployPortfolio: async (id) => {
    const response = await API.post(`/portfolios/${id}/deploy`);
    return response.data;
  },
  downloadSourceUrl: (id) => {
    const token = localStorage.getItem('token');
    return `${API_BASE_URL}/portfolios/${id}/download?token=${token}`;
  },
  getMyDeployments: async () => {
    const response = await API.get('/portfolios/deploys');
    return response.data;
  },
  deletePortfolio: async (id) => {
    const response = await API.delete(`/portfolios/${id}`);
    return response.data;
  },
};

export const adminService = {
  getStats: async () => {
    const response = await API.get('/admin/stats');
    return response.data;
  },
};

export default API;
