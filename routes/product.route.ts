import express from 'express';
import {
  createProduct,
  getProductById,
  updateProduct,
  getAllProducts,
  deleteProduct
} from 'controllers/product.controller';

import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

router.post('/', authMiddleware, superviserMiddleware, createProduct);
router.get('/', authMiddleware, superviserMiddleware, getAllProducts);
router.get('/:id', authMiddleware, superviserMiddleware, getProductById);
router.patch('/:id', authMiddleware, superviserMiddleware, updateProduct);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteProduct);

export default router;
