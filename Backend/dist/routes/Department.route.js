"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Department_controller_1 = require("../controllers/Department.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Validate_middlewere_1 = require("../middleware/Validate.middlewere");
const department_validation_1 = require("../validations/department.validation");
const router = express_1.default.Router();
// Create Department → Admin + HR
router.post("/", auth_middleware_1.verifyToken, 
// authorizeRoles("Admin", "HR"), // Added RBAC
(0, Validate_middlewere_1.validateRequest)(department_validation_1.createDepartmentSchema), Department_controller_1.createDepartment);
// Get All Departments → All roles
router.get("/", auth_middleware_1.verifyToken, //authorizeRoles("Admin", "HR", "Manager", "Employee")//
Department_controller_1.getAllDepartments);
// Update Department → Admin + HR
router.put("/:id", auth_middleware_1.verifyToken, 
// authorizeRoles("Admin", "HR"), // Added RBAC
(0, Validate_middlewere_1.validateRequest)(department_validation_1.updateDepartmentSchema), Department_controller_1.updateDepartment);
// Delete Department → Admin only
router.delete("/:id", auth_middleware_1.verifyToken, 
// authorizeRoles("Admin"), // Added RBAC
Department_controller_1.deleteDepartment);
exports.default = router;
