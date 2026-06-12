import { Router } from 'express';
import {
  createBackup,
  deleteBackup,
  downloadBackup,
  listBackups,
} from '../controllers/backup.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, requireRoles('Administrator'));

router.get('/', listBackups);
router.post('/', createBackup);
router.get('/:id/download', downloadBackup);
router.delete('/:id', deleteBackup);

export default router;
