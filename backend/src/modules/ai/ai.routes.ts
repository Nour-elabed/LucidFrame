import { Router } from 'express';
import * as AIController from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { aiGenerationLimiter } from '../../middlewares/rateLimiter.middleware';
import { upload } from '../../utils/upload.utils';

const router = Router();

router.post('/generate', authenticate, aiGenerationLimiter, upload.single('image'), AIController.generate);
router.get('/my-generations', authenticate, AIController.getMyGenerations);

export default router;
