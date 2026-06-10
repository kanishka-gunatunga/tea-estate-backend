import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import type { UserProfile } from '../types/user.types';
import { signToken } from '../utils/jwt';
import { toUserProfile } from '../utils/user.mapper';

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.status !== 'active') {
    throw new AppError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError(401, 'Invalid email or password');
  }

  const profile = toUserProfile(user);
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { token, user: profile };
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return toUserProfile(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string; phone?: string; address?: string },
): Promise<UserProfile> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });

  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });

    if (emailTaken) {
      throw new AppError(409, 'Email is already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
    },
  });

  return toUserProfile(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!passwordMatch) {
    throw new AppError(400, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
}
