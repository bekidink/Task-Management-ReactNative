// stores/useCreateGroupStore.ts
import { create } from 'zustand';

type Member = {
  id: number;
  name: string;
  role: string;
  status: string;
  avatar: string;
};

type CreateGroupState = {
  selectedMembers: Member[];
  groupName: string;

  // Actions
  toggleMember: (member: Member) => void;
  setGroupName: (name: string) => void;
  reset: () => void;
};

export const useCreateGroupStore = create<CreateGroupState>((set) => ({
  selectedMembers: [],
  groupName: '',

  toggleMember: (member) =>
    set((state) => {
      const exists = state.selectedMembers.find((m) => m.id === member.id);
      if (exists) {
        return {
          selectedMembers: state.selectedMembers.filter((m) => m.id !== member.id),
        };
      }
      return { selectedMembers: [...state.selectedMembers, member] };
    }),

  setGroupName: (name) => set({ groupName: name }),

  reset: () => set({ selectedMembers: [], groupName: '' }),
}));
