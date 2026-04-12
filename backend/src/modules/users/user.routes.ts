import { Router } from 'express';
import * as UserController from './user.controller';
import { authenticate, authorizeAdmin } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticate, UserController.getMyStats);
router.get('/admin/stats', authenticate, authorizeAdmin, UserController.getAdminStats);

export default router;
