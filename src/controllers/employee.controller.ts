import type { Request, Response } from 'express';
import * as employeeService from '../services/employee.service';
import { getParam } from '../utils/params';
import {
  createEmployeeSchema,
  employeeQuerySchema,
  updateEmployeeSchema,
} from '../validators/employee.validator';

export async function listEmployees(req: Request, res: Response): Promise<void> {
  const query = employeeQuerySchema.parse(req.query);
  const employees = await employeeService.listEmployees(query);

  res.status(200).json({ success: true, data: employees });
}

export async function getEmployee(req: Request, res: Response): Promise<void> {
  const employee = await employeeService.getEmployeeById(getParam(req.params.id));

  res.status(200).json({ success: true, data: employee });
}

export async function createEmployee(req: Request, res: Response): Promise<void> {
  const body = createEmployeeSchema.parse(req.body);
  const employee = await employeeService.createEmployee(body);

  res.status(201).json({ success: true, data: employee });
}

export async function updateEmployee(req: Request, res: Response): Promise<void> {
  const body = updateEmployeeSchema.parse(req.body);
  const employee = await employeeService.updateEmployee(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: employee });
}

export async function deleteEmployee(req: Request, res: Response): Promise<void> {
  const result = await employeeService.deleteEmployee(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}
