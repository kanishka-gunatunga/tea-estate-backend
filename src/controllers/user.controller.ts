import type { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { getParam } from '../utils/params';
import { createUserSchema, updateUserSchema, userQuerySchema } from '../validators/user.validator';

export async function listUsers(req: Request, res: Response): Promise<void> {
  const query = userQuerySchema.parse(req.query);
  const users = await userService.listUsers(query);

  res.status(200).json({ success: true, data: users });
}

export async function getUser(req: Request, res: Response): Promise<void> {
  const user = await userService.getUserById(getParam(req.params.id));

  res.status(200).json({ success: true, data: user });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const body = createUserSchema.parse(req.body);
  const user = await userService.createUser(body);

  res.status(201).json({ success: true, data: user });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const body = updateUserSchema.parse(req.body);
  const user = await userService.updateUser(getParam(req.params.id), body);

  res.status(200).json({ success: true, data: user });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const result = await userService.deleteUser(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}
