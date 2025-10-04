import express from 'express';
// Add .js at the end for ESM module resolution in production
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteUser
} from '../controllers/Auth.controller';
import { verifyToken } from './auth.middleware';
import { authorizeRoles } from './role.middlewere.js';

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
