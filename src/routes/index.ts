import { Router } from 'express';
import assignmentRoutes from './assignment.routes';
import authRoutes from './auth.routes';
import backupRoutes from './backup.routes';
import dashboardRoutes from './dashboard.routes';
import employeeRoutes from './employee.routes';
import estateRoutes from './estate.routes';
import eventRoutes from './event.routes';
import expenseRoutes from './expense.routes';
import healthRoutes from './health.routes';
import serviceRoutes from './service.routes';
import tvRoutes from './tv.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/estates', estateRoutes);
router.use('/services', serviceRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/expenses', expenseRoutes);
router.use('/events', eventRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tv', tvRoutes);
router.use('/backups', backupRoutes);

export default router;
