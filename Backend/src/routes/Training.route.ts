import { Router } from 'express';
import {
  createTraining,
  getTrainingById,
  getAllTrainings,
  updateTraining,
  deleteTraining
} from '../controllers/Training.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Create a training record
router.post('/', verifyToken, createTraining);

// Get a single training by ID
router.get('/:trainingId', verifyToken, getTrainingById);

// Get all trainings
router.get('/', verifyToken, getAllTrainings);

// Update a training record
router.put('/:trainingId', verifyToken, updateTraining);

// Delete a training record
router.delete('/:trainingId', verifyToken, deleteTraining);

export default router;
