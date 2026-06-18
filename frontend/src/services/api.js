import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:4500/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hr_token');
      localStorage.removeItem('hr_account');
      if (!window.location.pathname.includes('/sign-in')) {
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(err);
  }
);

export const identityService = {
  signup: (data) => API.post('/identity/signup', data),
  signin: (data) => API.post('/identity/signin', data),
  whoAmI: () => API.get('/identity/me'),
  forgotPasscode: (data) => API.post('/identity/forgot-passcode', data),
  resetPasscode: (code, data) => API.put(`/identity/reset-passcode/${code}`, data),
  changePasscode: (data) => API.put('/identity/change-passcode', data),
};

export const listingService = {
  fetchAll: (params) => API.get('/listings', { params }),
  fetchOne: (id) => API.get(`/listings/${id}`),
  create: (formData) => API.post('/listings', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  revise: (id, formData) => API.put(`/listings/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove: (id) => API.delete(`/listings/${id}`),
};

export const stayService = {
  create: (listingId, data) => API.post(`/stays/${listingId}`, data),
  fetchMy: () => API.get('/stays/my'),
  fetchOwner: () => API.get('/stays/owner'),
  changeState: (id, data) => API.put(`/stays/${id}/state`, data),
  drop: (id, data) => API.put(`/stays/${id}/drop`, data),
};

export const petitionService = {
  create: (listingId, data) => API.post(`/petitions/${listingId}`, data),
  fetchMy: () => API.get('/petitions/my'),
  fetchOwner: () => API.get('/petitions/owner'),
  changeState: (id, data) => API.put(`/petitions/${id}/state`, data),
};

export const wishlistService = {
  toggle: (listingId) => API.post(`/wishlist/${listingId}`),
  fetchAll: () => API.get('/wishlist'),
  check: (listingId) => API.get(`/wishlist/${listingId}/check`),
};

export const chatService = {
  fetchThreads: () => API.get('/chat/threads'),
  fetchLines: (threadTag) => API.get(`/chat/${threadTag}`),
  send: (data) => API.post('/chat', data),
};

export const alertService = {
  fetchAll: () => API.get('/alerts'),
  clearAll: () => API.put('/alerts/clear-all'),
};

export const accountService = {
  editProfile: (formData) => API.put('/account/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  fetchById: (id) => API.get(`/account/${id}`),
  ownerConsole: () => API.get('/account/console/owner'),
  seekerConsole: () => API.get('/account/console/seeker'),
};

export const managerService = {
  figures: () => API.get('/manager/figures'),
  accounts: (params) => API.get('/manager/accounts', { params }),
  toggleSuspend: (id) => API.put(`/manager/accounts/${id}/suspend`),
  pendingListings: () => API.get('/manager/listings/pending'),
  allListings: (params) => API.get('/manager/listings', { params }),
  moderateListing: (id, data) => API.put(`/manager/listings/${id}/moderate`, data),
  removeListing: (id) => API.delete(`/manager/listings/${id}`),
  allStays: () => API.get('/manager/stays'),
};

export default API;
