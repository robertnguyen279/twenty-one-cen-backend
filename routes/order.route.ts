import express from 'express';
// import authMiddleware from 'middlewares/auth.middleware';
// import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import { placeOrder } from 'controllers/order.controller';

router.post('/', placeOrder);

export default router;
