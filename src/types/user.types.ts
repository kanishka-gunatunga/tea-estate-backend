import type { UserRole } from '../../generated/prisma';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  memberSince: string;
  assignedEstateId: string | null;
  profilePhoto: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}
