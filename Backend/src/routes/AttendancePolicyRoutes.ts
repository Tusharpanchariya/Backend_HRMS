import { Router } from 'express';
import {
  createAttendancePolicy,
  getAllAttendancePolicies,
  getAttendancePolicyById,
  updateAttendancePolicy,
  deleteAttendancePolicy
} from '../controllers/attendancePolicyController';

const router = Router();

// Create a new attendance policy
router.post('/', createAttendancePolicy);

// Get all policies
router.get('/', getAllAttendancePolicies);

// Get single policy by ID
router.get('/:id', getAttendancePolicyById);

// Update policy by ID
router.put('/:id', updateAttendancePolicy);

// Delete policy by ID
router.delete('/:id', deleteAttendancePolicy);

export default router;
