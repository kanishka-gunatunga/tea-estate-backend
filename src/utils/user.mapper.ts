import type { User } from '../../generated/prisma';
import type { UserProfile } from '../types/user.types';

export function toUserProfile(user: User): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    memberSince: user.registeredDate.toISOString().split('T')[0],
    assignedEstateId: user.assignedEstateId,
    profilePhoto: user.profilePhoto,
  };
}
