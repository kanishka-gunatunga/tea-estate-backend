import type { ExpenseCategory, ExpenseStatus } from '../../generated/prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { toNumber } from '../utils/decimal';
import { parseDateOnly } from '../utils/date';

const expenseInclude = {
  estate: { select: { id: true, name: true } },
  section: { select: { id: true, name: true } },
};

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatExpense(expense: {
  id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: { toNumber(): number };
  estateId: string;
  sectionId: string | null;
  status: ExpenseStatus;
  estate: { id: string; name: string };
  section: { id: string; name: string } | null;
}) {
  return {
    id: expense.id,
    date: formatDate(expense.date),
    category: expense.category,
    description: expense.description,
    amount: toNumber(expense.amount),
    estateId: expense.estateId,
    estateName: expense.estate.name,
    sectionId: expense.sectionId,
    sectionName: expense.section?.name ?? null,
    status: expense.status,
  };
}

async function validateExpenseRefs(estateId: string, sectionId?: string | null) {
  const estate = await prisma.estate.findUnique({ where: { id: estateId } });

  if (!estate) {
    throw new AppError(400, 'Estate not found');
  }

  if (sectionId) {
    const section = await prisma.section.findFirst({
      where: { id: sectionId, estateId },
    });

    if (!section) {
      throw new AppError(400, 'Section not found for this estate');
    }
  }
}

export async function listExpenses(filters: {
  date?: string;
  category?: ExpenseCategory;
  estateId?: string;
  status?: ExpenseStatus;
}) {
  const expenses = await prisma.expense.findMany({
    where: {
      category: filters.category,
      estateId: filters.estateId,
      status: filters.status,
      ...(filters.date ? { date: parseDateOnly(filters.date) } : {}),
    },
    include: expenseInclude,
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
  });

  return expenses.map(formatExpense);
}

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: expenseInclude,
  });

  if (!expense) {
    throw new AppError(404, 'Expense not found');
  }

  return formatExpense(expense);
}

export async function createExpense(data: {
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  estateId: string;
  sectionId?: string;
  status: ExpenseStatus;
}) {
  await validateExpenseRefs(data.estateId, data.sectionId);

  const expense = await prisma.expense.create({
    data: {
      date: parseDateOnly(data.date),
      category: data.category,
      description: data.description,
      amount: data.amount,
      estateId: data.estateId,
      sectionId: data.sectionId,
      status: data.status,
    },
    include: expenseInclude,
  });

  return formatExpense(expense);
}

export async function updateExpense(
  id: string,
  data: Partial<{
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    estateId: string;
    sectionId: string | null;
    status: ExpenseStatus;
  }>,
) {
  const existing = await prisma.expense.findUnique({ where: { id } });

  if (!existing) {
    throw new AppError(404, 'Expense not found');
  }

  const estateId = data.estateId ?? existing.estateId;
  const sectionId = data.sectionId !== undefined ? data.sectionId : existing.sectionId;

  await validateExpenseRefs(estateId, sectionId);

  const expense = await prisma.expense.update({
    where: { id },
    data: {
      category: data.category,
      description: data.description,
      amount: data.amount,
      estateId: data.estateId,
      sectionId: data.sectionId,
      status: data.status,
      ...(data.date ? { date: parseDateOnly(data.date) } : {}),
    },
    include: expenseInclude,
  });

  return formatExpense(expense);
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({
    where: { id },
    include: expenseInclude,
  });

  if (!existing) {
    throw new AppError(404, 'Expense not found');
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: { status: 'rejected' },
    include: expenseInclude,
  });

  return formatExpense(expense);
}
