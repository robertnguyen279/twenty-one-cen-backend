import express from 'express';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
import adminMiddleware from 'middlewares/admin.middleware';
const router = express.Router();
import { createSiteInfo, getSiteInfo, updateSiteInfo } from 'controllers/site.controller';

router.post('/', authMiddleware, superviserMiddleware, adminMiddleware, createSiteInfo);
router.get('/', getSiteInfo);
router.patch('/', authMiddleware, superviserMiddleware, updateSiteInfo);

export default router;
