import { prisma } from '../config/database';
import { toNumber } from '../utils/decimal';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function buildDataExport() {
  const [
    estates,
    sections,
    users,
    employees,
    services,
    expenses,
    assignments,
    workerAssignments,
    events,
    backupRecords,
    backupSettings,
  ] = await Promise.all([
    prisma.estate.findMany({ include: { sections: true } }),
    prisma.section.findMany(),
    prisma.user.findMany(),
    prisma.employee.findMany({
      include: {
        serviceCategories: {
          include: { service: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.service.findMany(),
    prisma.expense.findMany(),
    prisma.dailyAssignment.findMany(),
    prisma.workerAssignment.findMany(),
    prisma.calendarEvent.findMany(),
    prisma.backupRecord.findMany(),
    prisma.backupSettings.findMany(),
  ]);

  const recordCounts = {
    estates: estates.length,
    sections: sections.length,
    users: users.length,
    employees: employees.length,
    services: services.length,
    expenses: expenses.length,
    assignments: assignments.length,
    workerAssignments: workerAssignments.length,
    events: events.length,
    backupRecords: backupRecords.length,
    backupSettings: backupSettings.length,
  };

  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    recordCounts,
    estates: estates.map((estate) => ({
      ...estate,
      createdAt: estate.createdAt.toISOString(),
      updatedAt: estate.updatedAt.toISOString(),
      sections: estate.sections.map((section) => ({
        ...section,
        createdAt: section.createdAt.toISOString(),
        updatedAt: section.updatedAt.toISOString(),
      })),
    })),
    users: users.map(({ passwordHash: _passwordHash, ...user }) => ({
      ...user,
      registeredDate: formatDate(user.registeredDate),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })),
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      gender: employee.gender,
      phone: employee.phone,
      nic: employee.nic,
      estateId: employee.estateId,
      status: employee.status,
      serviceCategories: employee.serviceCategories.map((item) => item.service.name),
      createdAt: employee.createdAt.toISOString(),
      updatedAt: employee.updatedAt.toISOString(),
    })),
    services: services.map((service) => ({
      ...service,
      rate: toNumber(service.rate),
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    })),
    expenses: expenses.map((expense) => ({
      ...expense,
      date: formatDate(expense.date),
      amount: toNumber(expense.amount),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString(),
    })),
    assignments: assignments.map((assignment) => ({
      ...assignment,
      date: formatDate(assignment.date),
      totalAmount: toNumber(assignment.totalAmount),
      createdAt: assignment.createdAt.toISOString(),
      updatedAt: assignment.updatedAt.toISOString(),
    })),
    workerAssignments: workerAssignments.map((worker) => ({
      ...worker,
      unitsCompleted: toNumber(worker.unitsCompleted),
      paymentAmount: toNumber(worker.paymentAmount),
      createdAt: worker.createdAt.toISOString(),
      updatedAt: worker.updatedAt.toISOString(),
    })),
    events: events.map((event) => ({
      ...event,
      startDate: formatDate(event.startDate),
      endDate: event.endDate ? formatDate(event.endDate) : null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    })),
  };

  const manifest = {
    exportedAt: data.exportedAt,
    version: data.version,
    format: 'tea-estate-backup-v1',
    recordCounts,
    contents: ['database.sql', 'data.json', 'manifest.json'],
  };

  return { data, manifest, totalRecords: Object.values(recordCounts).reduce((a, b) => a + b, 0) };
}
