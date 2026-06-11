import type { AssignmentStatus } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { toNumber } from '../utils/decimal';
import { calcPayment } from '../utils/payroll';
import { parseDateOnly } from '../utils/date';

const assignmentInclude = {
  estate: { select: { id: true, name: true } },
  section: { select: { id: true, name: true, status: true } },
  service: { select: { id: true, name: true, rate: true, unitType: true, status: true } },
  workerAssignments: {
    include: {
      employee: { select: { id: true, name: true, status: true } },
    },
    orderBy: { employee: { name: 'asc' as const } },
  },
};

type AssignmentRecord = Awaited<ReturnType<typeof fetchAssignment>>;

async function fetchAssignment(id: string) {
  return prisma.dailyAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatAssignment(assignment: NonNullable<AssignmentRecord>) {
  return {
    id: assignment.id,
    date: formatDate(assignment.date),
    estateId: assignment.estateId,
    estateName: assignment.estate.name,
    sectionId: assignment.sectionId,
    sectionName: assignment.section.name,
    serviceId: assignment.serviceId,
    serviceName: assignment.service.name,
    rate: toNumber(assignment.service.rate),
    unitType: assignment.service.unitType,
    totalAmount: toNumber(assignment.totalAmount),
    status: assignment.status,
    workers: assignment.workerAssignments.map((worker) => ({
      employeeId: worker.employeeId,
      workerName: worker.employee.name,
      unitsCompleted: toNumber(worker.unitsCompleted),
      paymentAmount: toNumber(worker.paymentAmount),
    })),
  };
}

async function getAssignmentOrThrow(id: string) {
  const assignment = await fetchAssignment(id);

  if (!assignment) {
    throw new AppError(404, 'Assignment not found');
  }

  return assignment;
}

async function validateAssignmentRefs(data: {
  estateId: string;
  sectionId: string;
  serviceId: string;
}) {
  const [estate, section, service] = await Promise.all([
    prisma.estate.findUnique({ where: { id: data.estateId } }),
    prisma.section.findFirst({ where: { id: data.sectionId, estateId: data.estateId } }),
    prisma.service.findUnique({ where: { id: data.serviceId } }),
  ]);

  if (!estate || estate.status !== 'active') {
    throw new AppError(400, 'Estate not found or inactive');
  }

  if (!section || section.status !== 'active') {
    throw new AppError(400, 'Section not found or inactive for this estate');
  }

  if (!service || service.status !== 'active') {
    throw new AppError(400, 'Service not found or inactive');
  }

  return service;
}

async function recalculateTotalAmount(assignmentId: string, serviceRate: number) {
  const workers = await prisma.workerAssignment.findMany({
    where: { dailyAssignmentId: assignmentId },
  });

  let totalAmount = 0;

  for (const worker of workers) {
    const paymentAmount = calcPayment(toNumber(worker.unitsCompleted), serviceRate);
    totalAmount += paymentAmount;

    await prisma.workerAssignment.update({
      where: { id: worker.id },
      data: { paymentAmount },
    });
  }

  await prisma.dailyAssignment.update({
    where: { id: assignmentId },
    data: { totalAmount },
  });
}

async function validateWorkerEligibility(
  assignment: NonNullable<AssignmentRecord>,
  employeeId: string,
) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      serviceCategories: {
        include: { service: true },
      },
    },
  });

  if (!employee || employee.status !== 'active') {
    throw new AppError(400, 'Employee not found or inactive');
  }

  if (employee.estateId !== assignment.estateId) {
    throw new AppError(400, 'Employee does not belong to this estate');
  }

  const hasSkill = employee.serviceCategories.some(
    (category) => category.service.name === assignment.service.name,
  );

  if (!hasSkill) {
    throw new AppError(400, 'Employee is not skilled for this service');
  }

  const alreadyAssigned = assignment.workerAssignments.some(
    (worker) => worker.employeeId === employeeId,
  );

  if (alreadyAssigned) {
    throw new AppError(409, 'Employee is already assigned to this job');
  }

  return employee;
}

export async function listAssignments(filters: {
  date?: string;
  estateId?: string;
  status?: AssignmentStatus;
}) {
  const assignments = await prisma.dailyAssignment.findMany({
    where: {
      estateId: filters.estateId,
      status: filters.status,
      ...(filters.date ? { date: parseDateOnly(filters.date) } : {}),
    },
    include: assignmentInclude,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return assignments.map(formatAssignment);
}

export async function getAssignmentById(id: string) {
  const assignment = await getAssignmentOrThrow(id);
  return formatAssignment(assignment);
}

export async function createAssignment(data: {
  date: string;
  estateId: string;
  sectionId: string;
  serviceId: string;
}) {
  await validateAssignmentRefs(data);

  const assignment = await prisma.dailyAssignment.create({
    data: {
      date: parseDateOnly(data.date),
      estateId: data.estateId,
      sectionId: data.sectionId,
      serviceId: data.serviceId,
      status: 'pending',
      totalAmount: 0,
    },
    include: assignmentInclude,
  });

  return formatAssignment(assignment);
}

export async function updateAssignment(
  id: string,
  data: Partial<{
    date: string;
    estateId: string;
    sectionId: string;
    serviceId: string;
  }>,
) {
  const existing = await getAssignmentOrThrow(id);

  const next = {
    date: data.date ?? formatDate(existing.date),
    estateId: data.estateId ?? existing.estateId,
    sectionId: data.sectionId ?? existing.sectionId,
    serviceId: data.serviceId ?? existing.serviceId,
  };

  const service = await validateAssignmentRefs(next);

  await prisma.dailyAssignment.update({
    where: { id },
    data: {
      date: parseDateOnly(next.date),
      estateId: next.estateId,
      sectionId: next.sectionId,
      serviceId: next.serviceId,
    },
  });

  if (existing.workerAssignments.length > 0) {
    await recalculateTotalAmount(id, toNumber(service.rate));
  }

  return getAssignmentById(id);
}

export async function deleteAssignment(id: string) {
  await getAssignmentOrThrow(id);

  await prisma.dailyAssignment.delete({ where: { id } });

  return { id };
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus) {
  await getAssignmentOrThrow(id);

  await prisma.dailyAssignment.update({
    where: { id },
    data: { status },
  });

  return getAssignmentById(id);
}

export async function addWorker(
  assignmentId: string,
  data: { employeeId: string; unitsCompleted: number },
) {
  const assignment = await getAssignmentOrThrow(assignmentId);
  await validateWorkerEligibility(assignment, data.employeeId);

  const rate = toNumber(assignment.service.rate);
  const paymentAmount = calcPayment(data.unitsCompleted, rate);

  await prisma.workerAssignment.create({
    data: {
      dailyAssignmentId: assignmentId,
      employeeId: data.employeeId,
      unitsCompleted: data.unitsCompleted,
      paymentAmount,
    },
  });

  const workers = await prisma.workerAssignment.findMany({
    where: { dailyAssignmentId: assignmentId },
  });
  const totalAmount = workers.reduce((sum, worker) => sum + toNumber(worker.paymentAmount), 0);

  await prisma.dailyAssignment.update({
    where: { id: assignmentId },
    data: { totalAmount },
  });

  return getAssignmentById(assignmentId);
}

export async function updateWorker(
  assignmentId: string,
  employeeId: string,
  unitsCompleted: number,
) {
  const assignment = await getAssignmentOrThrow(assignmentId);

  const worker = assignment.workerAssignments.find(
    (item) => item.employeeId === employeeId,
  );

  if (!worker) {
    throw new AppError(404, 'Worker assignment not found');
  }

  const rate = toNumber(assignment.service.rate);
  const paymentAmount = calcPayment(unitsCompleted, rate);

  await prisma.workerAssignment.update({
    where: { id: worker.id },
    data: { unitsCompleted, paymentAmount },
  });

  const workers = await prisma.workerAssignment.findMany({
    where: { dailyAssignmentId: assignmentId },
  });
  const totalAmount = workers.reduce((sum, item) => sum + toNumber(item.paymentAmount), 0);

  await prisma.dailyAssignment.update({
    where: { id: assignmentId },
    data: { totalAmount },
  });

  return getAssignmentById(assignmentId);
}

export async function removeWorker(assignmentId: string, employeeId: string) {
  const assignment = await getAssignmentOrThrow(assignmentId);

  const worker = assignment.workerAssignments.find(
    (item) => item.employeeId === employeeId,
  );

  if (!worker) {
    throw new AppError(404, 'Worker assignment not found');
  }

  await prisma.workerAssignment.delete({ where: { id: worker.id } });

  const workers = await prisma.workerAssignment.findMany({
    where: { dailyAssignmentId: assignmentId },
  });
  const totalAmount = workers.reduce((sum, item) => sum + toNumber(item.paymentAmount), 0);

  await prisma.dailyAssignment.update({
    where: { id: assignmentId },
    data: { totalAmount },
  });

  return getAssignmentById(assignmentId);
}
