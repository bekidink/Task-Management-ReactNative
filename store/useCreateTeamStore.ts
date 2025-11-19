// stores/useCreateTeamStore.ts
import { create } from 'zustand';

type Member = {
  id: string;
  name: string;
  avatar: string | null;
};

type CreateTeamState = {
  name: string;
  avatar: string | null;
  privacy: 'private' | 'public';
  selectedMembers: Member[];
  setName: (name: string) => void;
  setAvatar: (uri: string | null) => void;
  setPrivacy: (privacy: 'private' | 'public') => void;
  addMember: (member: Member) => void;
  removeMember: (id: string) => void;
  reset: () => void;
};

export const useCreateTeamStore = create<CreateTeamState>((set) => ({
  name: '',
  avatar: null,
  privacy: 'private',
  selectedMembers: [],
  setName: (name) => set({ name }),
  setAvatar: (avatar) => set({ avatar }),
  setPrivacy: (privacy) => set({ privacy }),
  addMember: (member) =>
    set((state) => ({
      selectedMembers: [...state.selectedMembers.filter((m) => m.id !== member.id), member],
    })),
  removeMember: (id) =>
    set((state) => ({
      selectedMembers: state.selectedMembers.filter((m) => m.id !== id),
    })),
  reset: () => set({ name: '', avatar: null, privacy: 'private', selectedMembers: [] }),
}));
