import express from 'express';
import {
  createProduct,
  getProductById,
  updateProduct,
  getAllProducts,
  deleteProduct,
  getProducts
} from 'controllers/product.controller';

import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

router.post('/', authMiddleware, superviserMiddleware, createProduct);
router.get('/', getAllProducts);
router.get('/find', getProducts);
router.get('/:id', getProductById);
router.patch('/:id', authMiddleware, superviserMiddleware, updateProduct);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteProduct);

export default router;
