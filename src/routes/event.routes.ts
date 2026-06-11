import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../controllers/event.controller';
import { authenticate } from '../middleware/auth.middleware';
import { enforceEstateScope } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, enforceEstateScope);

router.get('/', listEvents);
router.get('/:id', getEvent);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
