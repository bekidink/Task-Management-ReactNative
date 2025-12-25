export type Team = {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  privacy: 'public' | 'private';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  members: Array<{
    id: string;
    role: 'admin' | 'manager' | 'member';
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string | null;
    };
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    flag: 'NORMAL' | 'URGENT' | 'CRITICAL';
    startDate: string | null;
    endDate: string | null;
    createdAt: string;
  }>;
};