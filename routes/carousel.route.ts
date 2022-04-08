import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
const router = express.Router();

import {
  createCarousel,
  getAllCarousels,
  getCarouselById,
  updateCarousel,
  deleteCarousel
} from 'controllers/carousel.controller';

router.post('/', authMiddleware, superviserMiddleware, createCarousel);
router.get('/', getAllCarousels);
router.get('/:id', getCarouselById);
router.patch('/:id', authMiddleware, superviserMiddleware, updateCarousel);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteCarousel);

export default router;
