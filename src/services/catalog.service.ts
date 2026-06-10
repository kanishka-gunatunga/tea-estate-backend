import type { ServiceStatus } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { toNumber } from '../utils/decimal';

function formatService(service: {
  id: string;
  name: string;
  description: string | null;
  status: ServiceStatus;
  rate: { toNumber(): number };
  unitType: string;
}) {
  return {
    id: service.id,
    name: service.name,
    description: service.description,
    status: service.status,
    rate: toNumber(service.rate),
    unitType: service.unitType,
  };
}

export async function listServices(filters: { status?: ServiceStatus; search?: string }) {
  const services = await prisma.service.findMany({
    where: {
      status: filters.status,
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search } },
              { description: { contains: filters.search } },
            ],
          }
        : {}),
    },
    orderBy: { name: 'asc' },
  });

  return services.map(formatService);
}

export async function getServiceById(id: string) {
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) {
    throw new AppError(404, 'Service not found');
  }

  return formatService(service);
}

export async function createService(data: {
  name: string;
  description?: string;
  status: ServiceStatus;
  rate: number;
  unitType: 'Hours' | 'Acres' | 'Units' | 'KG';
}) {
  const service = await prisma.service.create({ data });

  return formatService(service);
}

export async function updateService(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    status: ServiceStatus;
    rate: number;
    unitType: 'Hours' | 'Acres' | 'Units' | 'KG';
  }>,
) {
  const existing = await prisma.service.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Service not found');
  }

  const service = await prisma.service.update({
    where: { id },
    data,
  });

  return formatService(service);
}

export async function deleteService(id: string) {
  const existing = await prisma.service.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Service not found');
  }

  const service = await prisma.service.update({
    where: { id },
    data: { status: 'inactive' },
  });

  return formatService(service);
}
