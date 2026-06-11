import { Router } from 'express';
import {
  createService,
  deleteService,
  getService,
  listServices,
  updateService,
} from '../controllers/catalog.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listServices);
router.get('/:id', getService);
router.post('/', requireRoles('Administrator'), createService);
router.put('/:id', requireRoles('Administrator'), updateService);
router.delete('/:id', requireRoles('Administrator'), deleteService);

export default router;
