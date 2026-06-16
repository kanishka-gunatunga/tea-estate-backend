import { Router } from 'express';
import multer from 'multer';
import {
  changePassword,
  getMe,
  login,
  logout,
  updateProfile,
  updateProfilePhoto,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.patch('/profile/photo', authenticate, upload.single('photo'), updateProfilePhoto);
router.post('/change-password', authenticate, changePassword);

export default router;
