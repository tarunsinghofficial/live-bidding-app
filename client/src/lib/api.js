import axios from 'axios';

const DEFAULT_API_BASE = "http://localhost:5000";

export const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || DEFAULT_API_BASE;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  let viewId = localStorage.getItem('viewId');
  if (!viewId) {
    viewId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('viewId', viewId);
  }
  config.headers['X-View-Id'] = viewId;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's not a network error or server error
    if (error.response?.status === 401 && error.config?.url?.includes('/auth/me')) {
      // Don't logout on profile validation failure, just log warning
      console.warn('Token validation failed, but keeping session');
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function fetchServerTime() {
  const res = await fetch(`${API_BASE}/api/time`);
  if (!res.ok) throw new Error(`Failed to fetch server time (${res.status})`);
  return res.json();
}

export async function fetchItems() {
  const res = await fetch(`${API_BASE}/api/items`);
  if (!res.ok) throw new Error(`Failed to fetch items (${res.status})`);
  return res.json();
}

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
};

export const auctionAPI = {
  getPublicAuctions: (params) => api.get('/api/auctions/public', { params }),
  getPublicAuction: (id) => api.get(`/api/bids/${id}`),
  getPublicAuctionBids: (id, params) => api.get(`/api/bids/${id}/bids`, { params }),
  getUserAuctions: () => api.get('/api/auctions/user/history'),
  getUserBidHistory: () => api.get('/api/bids/user/history'),
  getAuctions: (params) => api.get('/api/auctions', { params }),
  getAuctionStats: () => api.get('/api/auctions/stats/overview'),
  getAuction: (id) => api.get(`/api/auctions/${id}`),
  getAuctionBids: (id, params) => api.get(`/api/auctions/${id}/bids`, { params }),
  createAuction: (auctionData) => api.post('/api/auctions', auctionData),
  updateAuction: (id, auctionData) => api.put(`/api/auctions/${id}`, auctionData),
  deleteAuction: (id) => api.delete(`/api/auctions/${id}`),
  startAuction: (id) => api.post(`/api/auctions/${id}/start`),
  endAuction: (id) => api.post(`/api/auctions/${id}/end`),
  placeBid: (auctionId, amount) => api.post(`/api/bids/${auctionId}/bid`, { amount }),
};

export default api;
