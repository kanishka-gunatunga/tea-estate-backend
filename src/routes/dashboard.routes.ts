import { Router } from 'express';
import {
  getExpenseBreakdown,
  getKpis,
  getMonthlyTrends,
  getSectionHarvest,
  getUpcomingEvents,
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { enforceEstateScope } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, enforceEstateScope);

router.get('/kpis', getKpis);
router.get('/expense-breakdown', getExpenseBreakdown);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/section-harvest', getSectionHarvest);
router.get('/upcoming-events', getUpcomingEvents);

export default router;
