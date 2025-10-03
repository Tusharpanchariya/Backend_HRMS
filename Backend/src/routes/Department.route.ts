import express from "express";
import {
  createDepartment,
  getAllDepartments,
  updateDepartment,
  deleteDepartment,
} from "../controllers/Department.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/Validate.middlewere"; 
import { 
  createDepartmentSchema,
  updateDepartmentSchema,
} from "../validations/department.validation";
import { authorizeRoles } from "../middleware/role.middlewere"

const router = express.Router();

// Create Department → Admin + HR
router.post(
  "/",
  verifyToken,
  // authorizeRoles("Admin", "HR"), // Added RBAC
  validateRequest(createDepartmentSchema),
  createDepartment
);

// Get All Departments → All roles
router.get("/", verifyToken, //authorizeRoles("Admin", "HR", "Manager", "Employee")//
  getAllDepartments);

// Update Department → Admin + HR
router.put(
  "/:id",
  verifyToken,
  // authorizeRoles("Admin", "HR"), // Added RBAC
  validateRequest(updateDepartmentSchema),
  updateDepartment
);

// Delete Department → Admin only
router.delete(
  "/:id",
  verifyToken,
  // authorizeRoles("Admin"), // Added RBAC
  deleteDepartment
);

export default router;
