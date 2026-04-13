import { Router } from 'express';
import * as PostController from './post.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/upload.utils';

const router = Router();

router.get('/', PostController.getFeed);
router.get('/:id', PostController.getPost);
router.post('/', authenticate, upload.single('image'), PostController.createPost);
router.post('/:id/like', authenticate, PostController.likePost);
router.delete('/:id', authenticate, PostController.deletePost);

export default router;
