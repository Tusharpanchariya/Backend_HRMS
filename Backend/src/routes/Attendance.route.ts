import express from 'express';
import { 
  createManualAttendance,
  getAllAttendances,
  getAttendanceById,
  updateAttendance,
  // createBulkAttendance,
  uploadAttendanceFromExcel,
  deleteAttendance,
  biometricAttendance,
} from '../controllers/Attendance.controller';
import { verifyToken } from '../middleware/auth.middleware';
import upload from '../middleware/upload';

const router = express.Router();

// Manual attendance creation
router.post('/manual', verifyToken, createManualAttendance);

// router.post("/bulk", createBulkAttendance);

// Get all attendances with pagination and filters
router.get('/', verifyToken, getAllAttendances);

router.post("/upload", upload.single("file"), uploadAttendanceFromExcel);
// Get single attendance by ID
router.get('/:id', verifyToken, getAttendanceById);

// Delete attendance
router.delete('/:id', verifyToken, deleteAttendance);

router.post('/biometric', verifyToken, biometricAttendance);

router.put('/:id', verifyToken, updateAttendance);

export default router;