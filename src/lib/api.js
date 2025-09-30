import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const conversationApi = {
  create: (data) => api.post('/conversations', data),
  getAll: () => api.get('/conversations'),
  getById: (id) => api.get(`/conversations/${id}`),
  getMessages: (id) => api.get(`/conversations/${id}/messages`),
  sendMessage: (id, data) => api.post(`/conversations/${id}/chat`, data),
  delete: (id) => api.delete(`/conversations/${id}`), 
}

export const documentApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => api.get('/documents'),
  delete: (id) => api.delete(`/documents/${id}`),
};


export const createWebSocket = (conversationId) => {
  const wsUrl = API_BASE_URL.replace('http', 'ws').replace('/api', '') + `/ws/${conversationId}`;
  return new WebSocket(wsUrl);
};

export default api;