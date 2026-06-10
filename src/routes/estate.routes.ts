import { Router } from 'express';
import {
  createEstate,
  createSection,
  deleteEstate,
  deleteSection,
  getEstate,
  listEstates,
  updateEstate,
  updateSection,
} from '../controllers/estate.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listEstates);
router.get('/:id', getEstate);
router.post('/', createEstate);
router.put('/:id', updateEstate);
router.delete('/:id', deleteEstate);

router.post('/:estateId/sections', createSection);
router.put('/:estateId/sections/:sectionId', updateSection);
router.delete('/:estateId/sections/:sectionId', deleteSection);

export default router;
