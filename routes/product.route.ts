import express from 'express';
import { createProduct } from 'controllers/product.controller';

import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

router.post('/', authMiddleware, superviserMiddleware, createProduct);

export default router;
