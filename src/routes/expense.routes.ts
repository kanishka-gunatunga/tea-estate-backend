import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpense,
  listExpenses,
  updateExpense,
} from '../controllers/expense.controller';
import { authenticate } from '../middleware/auth.middleware';
import { enforceEstateScope } from '../middleware/rbac.middleware';

const router = Router();

router.use(authenticate, enforceEstateScope);

router.get('/', listExpenses);
router.get('/:id', getExpense);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
