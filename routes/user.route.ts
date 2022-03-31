import express from 'express';
import {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getUserById,
  createUserByAdmin,
  updateUserBySuperviser,
  deleteUserBySuperviser,
  getUsers,
  addContact,
  updateContact,
  deleteContact,
  getAccessToken,
  logoutUser
} from 'controllers/user.controller';
import authMiddleware from 'middlewares/auth.middleware';
import superviserMiddleware from 'middlewares/superviser.middleware';
import adminMiddleware from 'middlewares/admin.middleware';
const router = express.Router();

router.post('/', createUser);
router.post('/admin', authMiddleware, superviserMiddleware, adminMiddleware, createUserByAdmin);
router.post('/contact', authMiddleware, addContact);
router.post('/token', getAccessToken);
router.patch('/contact/:id', authMiddleware, updateContact);
router.delete('/contact/:id', authMiddleware, deleteContact);
router.delete('/logout', authMiddleware, logoutUser);
router.patch('/', authMiddleware, updateUser);
router.post('/login', loginUser);
router.get('/', authMiddleware, getUser);
router.get('/admin', authMiddleware, superviserMiddleware, getUsers);
router.get('/:id', authMiddleware, superviserMiddleware, getUserById);
router.patch('/:id', authMiddleware, superviserMiddleware, updateUserBySuperviser);
router.delete('/:id', authMiddleware, superviserMiddleware, deleteUserBySuperviser);

export default router;
