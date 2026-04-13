import { Router } from 'express';
import * as PostController from './post.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/upload.utils';

const router = Router();

router.get('/', PostController.getFeed);
router.get('/:id', PostController.getPost);
router.post('/', authenticate, upload.single('image'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('[Upload Middleware] Error:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Upload failed: ' + err.message 
      });
    }
    next();
  });
}, PostController.createPost);
router.post('/:id/like', authenticate, PostController.likePost);
router.delete('/:id', authenticate, PostController.deletePost);

export default router;
