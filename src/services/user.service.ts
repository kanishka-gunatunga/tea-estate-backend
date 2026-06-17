import bcrypt from 'bcrypt';
import type { UserRole, UserStatus } from '../../generated/prisma';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

function formatUser(user: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  registeredDate: Date;
  status: UserStatus;
  assignedEstateId: string | null;
  profilePhoto: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    registeredDate: user.registeredDate.toISOString().split('T')[0],
    status: user.status,
    assignedEstateId: user.assignedEstateId,
    profilePhoto: user.profilePhoto,
  };
}

export async function listUsers(filters: { role?: UserRole; search?: string; status?: UserStatus }) {
  const users = await prisma.user.findMany({
    where: {
      status: filters.status,
      role: filters.role,
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search } },
              { email: { contains: filters.search } },
              { phone: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });

  return users.map(formatUser);
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return formatUser(user);
}

async function validateAssignedEstate(assignedEstateId?: string | null) {
  if (!assignedEstateId) {
    return;
  }

  const estate = await prisma.estate.findUnique({ where: { id: assignedEstateId } });

  if (!estate) {
    throw new AppError(400, 'Assigned estate not found');
  }
}

export async function createUser(data: {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  assignedEstateId?: string;
  status: UserStatus;
  password: string;
}) {
  const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });

  if (emailTaken) {
    throw new AppError(409, 'Email is already in use');
  }

  await validateAssignedEstate(data.assignedEstateId);

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      assignedEstateId: data.assignedEstateId,
      status: data.status,
      passwordHash,
    },
  });

  return formatUser(user);
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    assignedEstateId: string | null;
    status: UserStatus;
    profilePhoto: string | null;
  }>,
) {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });

    if (emailTaken) {
      throw new AppError(409, 'Email is already in use');
    }
  }

  if (data.assignedEstateId !== undefined) {
    await validateAssignedEstate(data.assignedEstateId);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return formatUser(user);
}

export async function deleteUser(id: string) {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'User not found');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status: 'inactive' },
  });

  return formatUser(user);
}
