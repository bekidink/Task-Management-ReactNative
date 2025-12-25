// lib/services/teams.ts
import api from '@/lib/api';
import * as SecureStore from 'expo-secure-store';
// GET /teams → returns your exact structure
export const getTeams = () => api.get('/teams');

// POST /teams → create team with avatar + members
export const createTeam = async (data: {
  name: string;
  avatar?: string;
  privacy: 'private' | 'public';
  memberIds: string[];
}) => {
  const formData = new FormData();
  const token = await SecureStore.getItemAsync('tasker_backend_jwt');
  formData.append('name', data.name);
  formData.append('privacy', data.privacy);

  data.memberIds.forEach((id) => formData.append('memberIds[]', id));

  if (data.avatar) {
    const filename = data.avatar.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('avatar', {
      uri: data.avatar,
      name: filename,
      type,
    } as any);
  }
  console.log(formData);
  return api.post('/teams', formData, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
  });
};
export const getTeamById = (id: string) => api.get(`/teams/${id}`);
export const updateTeam = (id: string, data: any) => api.patch(`/teams/${id}`, data);
export const deleteTeam = (id: string) => api.delete(`/teams/${id}`);

export const inviteMemeber = (id: string, data: any) => api.post(`/invites/team/${id}`,data);
