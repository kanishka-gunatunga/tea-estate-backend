import type { EmployeeStatus, Gender } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { generateEmployeeId } from '../utils/employee-id';

const employeeInclude = {
  serviceCategories: {
    include: { service: true },
  },
};

function formatEmployee(employee: {
  id: string;
  name: string;
  gender: Gender;
  phone: string | null;
  nic: string;
  estateId: string;
  status: EmployeeStatus;
  serviceCategories: Array<{ service: { name: string } }>;
}) {
  return {
    id: employee.id,
    name: employee.name,
    gender: employee.gender,
    phone: employee.phone,
    nic: employee.nic,
    estateId: employee.estateId,
    serviceCategories: employee.serviceCategories.map((item) => item.service.name),
    status: employee.status,
  };
}

async function resolveServiceIds(serviceNames: string[]): Promise<string[]> {
  const services = await prisma.service.findMany({
    where: { name: { in: serviceNames } },
    select: { id: true, name: true },
  });

  if (services.length !== serviceNames.length) {
    const found = new Set(services.map((service) => service.name));
    const missing = serviceNames.filter((name) => !found.has(name));
    throw new AppError(400, `Unknown service categories: ${missing.join(', ')}`);
  }

  return services.map((service) => service.id);
}

export async function listEmployees(filters: {
  estateId?: string;
  category?: string;
  status?: EmployeeStatus;
  search?: string;
}) {
  const employees = await prisma.employee.findMany({
    where: {
      estateId: filters.estateId,
      status: filters.status,
      ...(filters.category
        ? {
            serviceCategories: {
              some: { service: { name: filters.category } },
            },
          }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { name: { contains: filters.search } },
              { nic: { contains: filters.search } },
              { phone: { contains: filters.search } },
            ],
          }
        : {}),
    },
    include: employeeInclude,
    orderBy: { id: 'asc' },
  });

  return employees.map(formatEmployee);
}

export async function getEmployeeById(id: string) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: employeeInclude,
  });

  if (!employee) {
    throw new AppError(404, 'Employee not found');
  }

  return formatEmployee(employee);
}

export async function createEmployee(data: {
  name: string;
  gender: Gender;
  phone?: string;
  nic: string;
  estateId: string;
  serviceCategories: string[];
  status: EmployeeStatus;
}) {
  const estate = await prisma.estate.findUnique({ where: { id: data.estateId } });

  if (!estate) {
    throw new AppError(400, 'Estate not found');
  }

  const nicTaken = await prisma.employee.findUnique({ where: { nic: data.nic } });

  if (nicTaken) {
    throw new AppError(409, 'NIC is already registered');
  }

  const serviceIds = await resolveServiceIds(data.serviceCategories);
  const id = await generateEmployeeId();

  const employee = await prisma.employee.create({
    data: {
      id,
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      nic: data.nic,
      estateId: data.estateId,
      status: data.status,
      serviceCategories: {
        create: serviceIds.map((serviceId) => ({ serviceId })),
      },
    },
    include: employeeInclude,
  });

  return formatEmployee(employee);
}

export async function updateEmployee(
  id: string,
  data: Partial<{
    name: string;
    gender: Gender;
    phone: string;
    nic: string;
    estateId: string;
    serviceCategories: string[];
    status: EmployeeStatus;
  }>,
) {
  const existing = await prisma.employee.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Employee not found');
  }

  if (data.nic && data.nic !== existing.nic) {
    const nicTaken = await prisma.employee.findUnique({ where: { nic: data.nic } });

    if (nicTaken) {
      throw new AppError(409, 'NIC is already registered');
    }
  }

  if (data.estateId) {
    const estate = await prisma.estate.findUnique({ where: { id: data.estateId } });

    if (!estate) {
      throw new AppError(400, 'Estate not found');
    }
  }

  if (data.serviceCategories) {
    const serviceIds = await resolveServiceIds(data.serviceCategories);

    await prisma.employeeService.deleteMany({ where: { employeeId: id } });
    await prisma.employeeService.createMany({
      data: serviceIds.map((serviceId) => ({ employeeId: id, serviceId })),
    });
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: {
      name: data.name,
      gender: data.gender,
      phone: data.phone,
      nic: data.nic,
      estateId: data.estateId,
      status: data.status,
    },
    include: employeeInclude,
  });

  return formatEmployee(employee);
}

export async function deleteEmployee(id: string) {
  const existing = await prisma.employee.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Employee not found');
  }

  const employee = await prisma.employee.update({
    where: { id },
    data: { status: 'inactive' },
    include: employeeInclude,
  });

  return formatEmployee(employee);
}
