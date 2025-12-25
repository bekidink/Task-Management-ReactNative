// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
const BASEURL = process.env.EXPO_PUBLIC_API!;
const api = axios.create({
  baseURL: BASEURL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('tasker_backend_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
