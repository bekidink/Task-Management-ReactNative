// lib/services/dashboard.ts
import api from '@/lib/api';

export const getDashboardData = () => api.get('/dashboard/mobile'); // your real endpoint
