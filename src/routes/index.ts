import { Router } from 'express';
import authRoutes from './auth.routes';
import employeeRoutes from './employee.routes';
import estateRoutes from './estate.routes';
import healthRoutes from './health.routes';
import serviceRoutes from './service.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/estates', estateRoutes);
router.use('/services', serviceRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);

export default router;
