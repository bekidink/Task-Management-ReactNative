// lib/services/projects.ts
import api from '../api';

export const createProject = (data: any) => api.post('/projects', data);

export const getProjects = () => api.get('/projects');

export const updateProject = (id: string, data: any) => api.patch(`/projects/${id}`, data);
