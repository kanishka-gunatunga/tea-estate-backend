import { Router } from 'express';
import { getTvDashboard } from '../controllers/tv.controller';
import { authenticate } from '../middleware/auth.middleware';
import { enforceEstateScope } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, enforceEstateScope);

router.get('/dashboard', getTvDashboard);

export default router;
