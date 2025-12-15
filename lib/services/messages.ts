// lib/services/messages.ts
import api from '@/lib/api';
export type MessageFile = {
  url: string;
  name: string;
  size: number;
  mimeType: string;
};

export type SendMessagePayload = {
  type: 'team' | 'dm';
  teamId?: string;
  receiverId?: string;
  content: string;
  files?: MessageFile[];
  replyToId?: string;
};

// Send message — 100% matches your backend
export const sendMessage = async (payload: SendMessagePayload) => {
  const { type, teamId, receiverId, content, files, replyToId } = payload;

  if (!content?.trim() && (!files || files.length === 0)) {
    throw new Error('Message cannot be empty');
  }

  if (type === 'team' && !teamId) {
    throw new Error('Team ID is required');
  }
  if (type === 'dm' && !receiverId) {
    throw new Error('Receiver ID is required');
  }

  return api.post('/messages', {
    type,
    teamId,
    
    content: content.trim(),
    files,
    replyToId,
  });
};
export const getMessages = () => api.get('/messages/my-chats'); // your real endpoint
export const getChatMessages = (chatRoomId: string) => api.get(`/messages/channel/${chatRoomId}`);
