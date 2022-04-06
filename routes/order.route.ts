import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import { placeOrder, getAnOrder } from 'controllers/order.controller';

router.post('/', placeOrder);
router.get('/:id', authMiddleware, superviserMiddleware, getAnOrder);

export default router;
