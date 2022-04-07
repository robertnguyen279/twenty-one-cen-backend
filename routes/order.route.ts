import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import { placeOrder, getAnOrder, getOrders, updateOrderStatus, deleteOrder } from 'controllers/order.controller';

router.post('/', placeOrder);
router.get('/', authMiddleware, superviserMiddleware, getOrders);
router.get('/:id', authMiddleware, superviserMiddleware, getAnOrder);
router.patch('/:id', authMiddleware, superviserMiddleware, updateOrderStatus);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteOrder);

export default router;
