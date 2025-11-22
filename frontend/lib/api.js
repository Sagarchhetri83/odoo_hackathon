import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  requestResetOTP: (data) => api.post('/auth/request-reset-otp', data),
  verifyResetOTP: (data) => api.post('/auth/verify-reset-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Dashboard API
export const dashboardAPI = {
  getKPIs: (params) => api.get('/dashboard/kpis', { params }),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
};

// Receipts API
export const receiptsAPI = {
  getAll: () => api.get('/receipts'),
  getById: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  validate: (id) => api.put(`/receipts/${id}/validate`),
};

// Deliveries API
export const deliveriesAPI = {
  getAll: () => api.get('/deliveries'),
  getById: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  validate: (id) => api.put(`/deliveries/${id}/validate`),
};

// Transfers API
export const transfersAPI = {
  getAll: () => api.get('/transfers'),
  getById: (id) => api.get(`/transfers/${id}`),
  create: (data) => api.post('/transfers', data),
  complete: (id) => api.put(`/transfers/${id}/complete`),
};

// Adjustments API
export const adjustmentsAPI = {
  getAll: () => api.get('/adjustments'),
  getById: (id) => api.get(`/adjustments/${id}`),
  create: (data) => api.post('/adjustments', data),
};

// Ledger API
export const ledgerAPI = {
  getAll: (params) => api.get('/ledger', { params }),
};

// Warehouses API
export const warehousesAPI = {
  getAll: () => api.get('/warehouses'),
};

// Suppliers API
export const suppliersAPI = {
  getAll: () => api.get('/suppliers'),
};

export default api;



