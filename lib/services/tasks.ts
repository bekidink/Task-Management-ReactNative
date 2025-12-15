// lib/services/tasks.ts
import api from '@/lib/api';

export const getTasks = () => api.get('/tasks');
export const getMyAssignedTasks = () => api.get('/tasks/my/assigned');
export const getMyCreatedTasks = () => api.get('/tasks/my/created');
export const createTask = (data: {
  title: string;
  description?: string | null;
  projectId: string;
  priority?: string;
}) => api.post('/tasks', data);

export const updateTaskStatus = (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') =>
  api.patch(`/tasks/${id}`, { status });

export const updateTaskFlag = (id: string, flagged: boolean) =>
  api.patch(`/tasks/${id}`, { flag: flagged ? 'FLAGGED' : 'NORMAL' });
export const getTaskById = (id: string) => api.get(`/tasks/${id}`);

export const createComment = ({ taskId, content }: { taskId: string; content: string }) =>
  api.post(`/tasks/${taskId}/comments`, { taskId, content });
export const uploadCommentFile = ({ taskId, content }: { taskId: string; content: string }) =>
  api.post(`/tasks/${taskId}/comments`, { taskId, content });