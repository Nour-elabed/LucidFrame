import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { getRecentMessages } from './chat.controller';

const router = Router();

router.get('/', authenticate, getRecentMessages);

export default router;
