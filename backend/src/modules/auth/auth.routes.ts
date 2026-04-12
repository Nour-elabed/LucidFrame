import { Router } from 'express';
import * as AuthController from './auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';


const router = Router();

router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.get('/me', authenticate, AuthController.getMe);


export default router;
