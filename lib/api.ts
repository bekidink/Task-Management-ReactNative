// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://your-api.et',
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('tasker_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
