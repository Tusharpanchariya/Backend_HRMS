"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Attendance_controller_1 = require("../controllers/Attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
// Manual attendance creation
router.post('/manual', auth_middleware_1.verifyToken, Attendance_controller_1.createManualAttendance);
// router.post("/bulk", createBulkAttendance);
// Get all attendances with pagination and filters
router.get('/', auth_middleware_1.verifyToken, Attendance_controller_1.getAllAttendances);
router.post("/upload", upload_1.default.single("file"), Attendance_controller_1.uploadAttendanceFromExcel);
// Get single attendance by ID
router.get('/:id', auth_middleware_1.verifyToken, Attendance_controller_1.getAttendanceById);
// Delete attendance
router.delete('/:id', auth_middleware_1.verifyToken, Attendance_controller_1.deleteAttendance);
router.post('/biometric', auth_middleware_1.verifyToken, Attendance_controller_1.biometricAttendance);
router.put('/:id', auth_middleware_1.verifyToken, Attendance_controller_1.updateAttendance);
exports.default = router;
