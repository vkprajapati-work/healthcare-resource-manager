import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { changePassword, login, logout, me, refresh } from './auth.controller.js';
import { UserRole } from './auth.types.js';

const router = Router();

router.post('/login', asyncHandler(login));
router.post('/refresh', asyncHandler(refresh));
router.post('/logout', asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(me as never));
router.post('/change-password', authenticate, asyncHandler(changePassword as never));
router.get('/admin-check', authenticate, authorize(UserRole.ADMIN), (_req, res) => {
  res.status(200).json({ success: true, message: 'Authorized' });
});

export const authRoutes = router;
