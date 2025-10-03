"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendancePolicyController_1 = require("../controllers/attendancePolicyController");
const router = (0, express_1.Router)();
// Create a new attendance policy
router.post('/', attendancePolicyController_1.createAttendancePolicy);
// Get all policies
router.get('/', attendancePolicyController_1.getAllAttendancePolicies);
// Get single policy by ID
router.get('/:id', attendancePolicyController_1.getAttendancePolicyById);
// Update policy by ID
router.put('/:id', attendancePolicyController_1.updateAttendancePolicy);
// Delete policy by ID
router.delete('/:id', attendancePolicyController_1.deleteAttendancePolicy);
exports.default = router;
