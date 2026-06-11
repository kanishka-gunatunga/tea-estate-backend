import type { Request, Response } from 'express';
import * as expenseService from '../services/expense.service';
import { getParam } from '../utils/params';
import {
  createExpenseSchema,
  expenseQuerySchema,
  updateExpenseSchema,
} from '../validators/expense.validator';

export async function listExpenses(req: Request, res: Response): Promise<void> {
  const query = expenseQuerySchema.parse(req.query);
  const expenses = await expenseService.listExpenses(query);

  res.status(200).json({ success: true, data: expenses });
}

export async function getExpense(req: Request, res: Response): Promise<void> {
  const expense = await expenseService.getExpenseById(getParam(req.params.id));

  res.status(200).json({ success: true, data: expense });
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  const body = createExpenseSchema.parse(req.body);
  const expense = await expenseService.createExpense(body);

  res.status(201).json({ success: true, data: expense });
}

export async function updateExpense(req: Request, res: Response): Promise<void> {
  const body = updateExpenseSchema.parse(req.body);
  const expense = await expenseService.updateExpense(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: expense });
}

export async function deleteExpense(req: Request, res: Response): Promise<void> {
  const expense = await expenseService.deleteExpense(getParam(req.params.id));

  res.status(200).json({ success: true, data: expense });
}
