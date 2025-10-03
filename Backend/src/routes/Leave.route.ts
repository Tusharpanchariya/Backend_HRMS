import { Router } from "express";
import {
  createLeaveRequest,
  getEmployeeLeaves,
  updateLeaveStatus,
  deleteLeave,
  getAllLeaves
} from "../controllers/leave.Controller";

const router = Router();

// Create a new leave request
router.post("/", createLeaveRequest);

// Get all leaves of logged-in employee
router.get("/:employeeId", getEmployeeLeaves);
router.get("/", getAllLeaves);

// Approve / Reject a leave request
router.put("/status/:leaveId", updateLeaveStatus);

// Cancel a leave request
router.delete("/:leaveId", deleteLeave);

export default router;
