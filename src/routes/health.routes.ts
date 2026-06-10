import { Router } from 'express';
import { getHealth, getHealthDb, getHealthStats } from '../controllers/health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/db', getHealthDb);
router.get('/stats', getHealthStats);

export default router;
