import { Router } from 'express';
import {
  addWorker,
  createAssignment,
  deleteAssignment,
  getAssignment,
  listAssignments,
  removeWorker,
  updateAssignment,
  updateAssignmentStatus,
  updateWorker,
} from '../controllers/assignment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { enforceEstateScope } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, enforceEstateScope);

router.get('/', listAssignments);
router.get('/:id', getAssignment);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);
router.patch('/:id/status', updateAssignmentStatus);

router.post('/:id/workers', addWorker);
router.put('/:id/workers/:employeeId', updateWorker);
router.delete('/:id/workers/:employeeId', removeWorker);

export default router;
