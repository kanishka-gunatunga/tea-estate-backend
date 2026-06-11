import type { Request, Response } from 'express';
import * as assignmentService from '../services/assignment.service';
import { getParam } from '../utils/params';
import {
  addWorkerSchema,
  assignmentQuerySchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  updateAssignmentStatusSchema,
  updateWorkerSchema,
} from '../validators/assignment.validator';

export async function listAssignments(req: Request, res: Response): Promise<void> {
  const query = assignmentQuerySchema.parse(req.query);
  const assignments = await assignmentService.listAssignments(query);

  res.status(200).json({ success: true, data: assignments });
}

export async function getAssignment(req: Request, res: Response): Promise<void> {
  const assignment = await assignmentService.getAssignmentById(getParam(req.params.id));

  res.status(200).json({ success: true, data: assignment });
}

export async function createAssignment(req: Request, res: Response): Promise<void> {
  const body = createAssignmentSchema.parse(req.body);
  const assignment = await assignmentService.createAssignment(body);

  res.status(201).json({ success: true, data: assignment });
}

export async function updateAssignment(req: Request, res: Response): Promise<void> {
  const body = updateAssignmentSchema.parse(req.body);
  const assignment = await assignmentService.updateAssignment(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: assignment });
}

export async function deleteAssignment(req: Request, res: Response): Promise<void> {
  const result = await assignmentService.deleteAssignment(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}

export async function updateAssignmentStatus(req: Request, res: Response): Promise<void> {
  const body = updateAssignmentStatusSchema.parse(req.body);
  const assignment = await assignmentService.updateAssignmentStatus(
    getParam(req.params.id),
    body.status,
  );

  res.status(200).json({ success: true, data: assignment });
}

export async function addWorker(req: Request, res: Response): Promise<void> {
  const body = addWorkerSchema.parse(req.body);
  const assignment = await assignmentService.addWorker(getParam(req.params.id), body);

  res.status(201).json({ success: true, data: assignment });
}

export async function updateWorker(req: Request, res: Response): Promise<void> {
  const body = updateWorkerSchema.parse(req.body);
  const assignment = await assignmentService.updateWorker(
    getParam(req.params.id),
    getParam(req.params.employeeId),
    body.unitsCompleted,
  );

  res.status(200).json({ success: true, data: assignment });
}

export async function removeWorker(req: Request, res: Response): Promise<void> {
  const assignment = await assignmentService.removeWorker(
    getParam(req.params.id),
    getParam(req.params.employeeId),
  );

  res.status(200).json({ success: true, data: assignment });
}
