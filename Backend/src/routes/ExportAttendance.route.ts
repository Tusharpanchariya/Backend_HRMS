import express from 'express';
import { exportAttendanceToExcel } from '../controllers/ExportAttendance.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', verifyToken, exportAttendanceToExcel);

export default router;