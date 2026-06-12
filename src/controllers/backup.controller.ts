import type { Request, Response } from 'express';
import * as backupService from '../services/backup.service';
import { getParam } from '../utils/params';
import { createBackupSchema } from '../validators/backup.validator';

export async function listBackups(_req: Request, res: Response): Promise<void> {
  const backups = await backupService.listBackups();

  res.status(200).json({ success: true, data: backups });
}

export async function createBackup(req: Request, res: Response): Promise<void> {
  const body = createBackupSchema.parse(req.body ?? {});
  const backup = await backupService.createBackup(body.type);

  res.status(201).json({ success: true, data: backup });
}

export async function downloadBackup(req: Request, res: Response): Promise<void> {
  const backup = await backupService.getBackupFilePath(getParam(req.params.id));

  res.download(backup.filePath, backup.filename);
}

export async function deleteBackup(req: Request, res: Response): Promise<void> {
  const result = await backupService.deleteBackup(getParam(req.params.id));

  res.status(200).json({ success: true, data: result });
}
