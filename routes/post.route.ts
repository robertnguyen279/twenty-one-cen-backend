import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import { createPost, getPosts, getPostByUrlString, updatePost, deletePost } from 'controllers/post.controller';

router.post('/', authMiddleware, superviserMiddleware, createPost);
router.get('/', authMiddleware, superviserMiddleware, getPosts);
router.get('/:urlString', authMiddleware, superviserMiddleware, getPostByUrlString);
router.patch('/:id', authMiddleware, superviserMiddleware, updatePost);
router.delete('/:id', authMiddleware, superviserMiddleware, deletePost);

export default router;
