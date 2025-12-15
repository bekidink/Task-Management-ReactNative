// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://10.168.174.157:3000',
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('tasker_backend_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
