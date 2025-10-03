import express from 'express';
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteUser
} from '../controllers/Auth.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/role.middlewere';

const router = express.Router();

// Register API
router.post('/register', register);

// Delete user (protected)
router.delete('/:id', verifyToken, deleteUser);

// Login & Password APIs
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/change-password', verifyToken, changePassword);
router.post('/reset-password', resetPassword);

export default router;
