import express from 'express';
import {
  createUser,
  loginUser,
  getUser,
  updateUser,
  getUserById,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
  getUsers,
  addContact,
  updateContact
} from 'controllers/user.controller';
import authMiddleware from 'middlewares/auth.middleware';
import adminMiddleware from 'middlewares/admin.middleware';
const router = express.Router();

router.post('/', createUser);
router.post('/admin', authMiddleware, adminMiddleware, createUserByAdmin);
router.post('/contact', authMiddleware, addContact);
router.patch('/contact/:id', authMiddleware, updateContact);
router.patch('/', authMiddleware, updateUser);
router.post('/login', loginUser);
router.get('/', authMiddleware, getUser);
router.get('/admin', authMiddleware, adminMiddleware, getUsers);
router.get('/:id', authMiddleware, adminMiddleware, getUserById);
router.patch('/:id', authMiddleware, adminMiddleware, updateUserByAdmin);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUserByAdmin);

export default router;
