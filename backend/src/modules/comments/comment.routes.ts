import { Router } from 'express';
import * as CommentController from './comment.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', CommentController.getComments);
router.post('/', authenticate, CommentController.addComment);
router.delete(
  '/:postId/comments/:commentId',
  authenticate,
  CommentController.deleteComment
);


export default router;
