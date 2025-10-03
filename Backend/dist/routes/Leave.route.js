"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leave_Controller_1 = require("../controllers/leave.Controller");
const router = (0, express_1.Router)();
// Create a new leave request
router.post("/", leave_Controller_1.createLeaveRequest);
// Get all leaves of logged-in employee
router.get("/:employeeId", leave_Controller_1.getEmployeeLeaves);
router.get("/", leave_Controller_1.getAllLeaves);
// Approve / Reject a leave request
router.put("/status/:leaveId", leave_Controller_1.updateLeaveStatus);
// Cancel a leave request
router.delete("/:leaveId", leave_Controller_1.deleteLeave);
exports.default = router;
