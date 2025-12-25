// lib/services/tasks.ts
import api from '@/lib/api';

export const getTasks = () => api.get('/tasks');
export const getMyAssignedTasks = () => api.get('/tasks/my/assigned');
export const getMyCreatedTasks = () => api.get('/tasks/my/created');
export const createTask = (data: FormData) => {
  console.log("asd",data)
  return api.post('/tasks', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const updateTask = (
  id: string,
  data: {
    title?: string;
    description?: string;
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assigneeId?: string | null;
    startDate?: string;
    endDate?: string;
  },
  files?: File[]
) => {
  const formData = new FormData();

  // Append JSON data
  if (data) {
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
  }

  // Append files
  if (files && files.length > 0) {
    files.forEach((file) => {
      formData.append('files', file);
    });
  }
console.log("dfg",formData)
  return api.patch(`/tasks/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const updateTaskStatus = (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') =>
  api.patch(`/tasks/${id}`, { status });

export const deleteTask = (id: string) => api.delete(`/tasks/${id}`);

export const updateTaskFlag = (id: string, flagged: boolean) =>
  api.patch(`/tasks/${id}`, { flag: flagged ? 'FLAGGED' : 'NORMAL' });
export const getTaskById = (id: string) => api.get(`/tasks/${id}`);

export const createComment = ({ taskId, content }: { taskId: string; content: string }) =>
  api.post(`/tasks/${taskId}/comments`, { taskId, content });
export const uploadCommentFile = ({ taskId, content }: { taskId: string; content: string }) =>
  api.post(`/tasks/${taskId}/comments`, { taskId, content });

export const completeTask = (id: string) => api.post(`/tasks/complete/${id}`);

// Task reassignment
export const reassignTask = (id: string, assigneeId: string) =>
  api.patch(`/tasks/reassign/${id}`, { assigneeId });

// Task priorities
export const updateTaskPriority = (id: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') =>
  api.patch(`/tasks/priority/${id}`, { priority });

// Task deadlines
export const updateTaskDeadline = (id: string, endDate: string) =>
  api.patch(`/tasks/deadline/${id}`, { endDate });

// Task bulk operations
export const bulkUpdateTasks = (
  taskIds: string[],
  updates: Partial<{
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assigneeId: string | null;
  }>
) => api.post('/tasks/bulk/update', { taskIds, updates });

export const deleteTasks = (taskIds: string[]) => api.post('/tasks/bulk/delete', { taskIds });

// Task search
export const searchTasks = (
  query: string,
  filters?: {
    projectId?: string;
    status?: string;
    priority?: string;
  }
) => {
  const params = new URLSearchParams();
  params.append('q', query);
  if (filters?.projectId) params.append('projectId', filters.projectId);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);

  return api.get(`/tasks/search/${query}?${params.toString()}`);
};

// Task statistics
export const getTaskStats = (timeframe?: 'day' | 'week' | 'month' | 'year') => {
  const params = new URLSearchParams();
  if (timeframe) params.append('timeframe', timeframe);
  return api.get(`/tasks/stats/all?${params.toString()}`);
};

export const getMyTaskStats = () => api.get('/tasks/stats/my');

// Task templates
export const createTaskTemplate = (data: {
  title: string;
  description?: string;
  priority?: string;
  estimatedTime?: number;
  category?: string;
}) => api.post('/tasks/templates', data);

export const getTaskTemplates = () => api.get('/tasks/templates');
export const applyTaskTemplate = (templateId: string, projectId: string) =>
  api.post(`/tasks/templates/${templateId}/apply`, { projectId });

// Add attachments to existing task
export const addTaskAttachments = (taskId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  return api.post(`/tasks/${taskId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};