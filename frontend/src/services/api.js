import axios from 'axios';

const api = axios.create({ baseURL: process.env.REACT_APP_API_URL || '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const fetchAll = (resource, search) => api.get(`/${resource}`, { params: { search } });
export const fetchOne = (resource, id) => api.get(`/${resource}/${id}`);
export const createItem = (resource, data) => api.post(`/${resource}`, data);
export const updateItem = (resource, id, data) => api.put(`/${resource}/${id}`, data);
export const deleteItem = (resource, id) => api.delete(`/${resource}/${id}`);
export const callAI = (endpoint, data) => api.post(`/ai/${endpoint}`, data);
export const login = (email, password) => api.post('/auth/login', { email, password });
export const register = (name, email, password) => api.post('/auth/register', { name, email, password });

export default api;
