import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// Add request interceptor to include profile in all requests
api.interceptors.request.use((config) => {
  // Get profile from localStorage if available
  const profile = localStorage.getItem("profile");
  if (profile && !config.params) {
    config.params = { profile };
  } else if (profile && config.params) {
    config.params.profile = profile;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const getConversations = (profile) => 
  api.get("/api/conversations", { params: { profile } }).then(r => r.data);

export const getMessages = (wa_id, profile) => 
  api.get(`/api/conversations/${encodeURIComponent(wa_id)}/messages`, { 
    params: { profile } 
  }).then(r => r.data);

export const sendMessage = (wa_id, payload) => 
  api.post(`/api/conversations/${encodeURIComponent(wa_id)}/messages`, payload).then(r => r.data);

export const getAvailableContacts = (profile) => 
  api.get("/api/contacts", { params: { profile } }).then(r => r.data);

export default {
  getConversations,
  getMessages,
  sendMessage,
  getAvailableContacts
};