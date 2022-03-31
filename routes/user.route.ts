import express from 'express';
import { createUser, loginUser, getUser, updateUser } from 'controllers/user.controller';
import authMiddleware from 'middlewares/auth.middleware';
const router = express.Router();

router.post('/', createUser);
router.patch('/', authMiddleware, updateUser);
router.post('/login', loginUser);
router.get('/', authMiddleware, getUser);

export default router;
