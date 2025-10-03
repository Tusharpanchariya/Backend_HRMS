import express from "express";
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  generateEmployeeIdCard,
  deleteEmployee
} from "../controllers/Employee.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/Validate.middlewere";
import { 
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeIdSchema
} from "../validations/employee.validation";
import upload from "../middleware/upload"; 

const router = express.Router();
router.post(
  "/",
  verifyToken,
  // REMOVED: upload.single("photo"), // <-- Removed Multer middleware
  validateRequest(createEmployeeSchema),
  createEmployee
);

router.get("/", getAllEmployees);

router.get(
  "/:id",
  verifyToken,
  validateRequest(employeeIdSchema),
  getEmployeeById
);

router.put(
  "/:id",
  verifyToken,
  // validateRequest(updateEmployeeSchema),
  updateEmployee
);

router.delete(
  "/:id",
  verifyToken,
  validateRequest(employeeIdSchema),
  deleteEmployee
);

router.get(
  "/:id/idcard",
  verifyToken,
  validateRequest(employeeIdSchema),
  generateEmployeeIdCard
);
export default router;