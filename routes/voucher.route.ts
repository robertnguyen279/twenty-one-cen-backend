import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import {
  createVoucher,
  getVoucherById,
  getAllVouchers,
  updateVoucher,
  deleteVoucher,
  getPublicVouchers
} from 'controllers/voucher.controller';

router.post('/', authMiddleware, superviserMiddleware, createVoucher);
router.get('/', authMiddleware, superviserMiddleware, getAllVouchers);
router.get('/public', getPublicVouchers);
router.get('/:id', authMiddleware, superviserMiddleware, getVoucherById);
router.patch('/:id', authMiddleware, superviserMiddleware, updateVoucher);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteVoucher);

export default router;
