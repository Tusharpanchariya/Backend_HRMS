"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Employee_controller_1 = require("../controllers/Employee.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Validate_middlewere_1 = require("../middleware/Validate.middlewere");
const employee_validation_1 = require("../validations/employee.validation");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.verifyToken, 
// REMOVED: upload.single("photo"), // <-- Removed Multer middleware
(0, Validate_middlewere_1.validateRequest)(employee_validation_1.createEmployeeSchema), Employee_controller_1.createEmployee);
router.get("/", Employee_controller_1.getAllEmployees);
router.get("/:id", auth_middleware_1.verifyToken, (0, Validate_middlewere_1.validateRequest)(employee_validation_1.employeeIdSchema), Employee_controller_1.getEmployeeById);
router.put("/:id", auth_middleware_1.verifyToken, 
// validateRequest(updateEmployeeSchema),
Employee_controller_1.updateEmployee);
router.delete("/:id", auth_middleware_1.verifyToken, (0, Validate_middlewere_1.validateRequest)(employee_validation_1.employeeIdSchema), Employee_controller_1.deleteEmployee);
router.get("/:id/idcard", auth_middleware_1.verifyToken, (0, Validate_middlewere_1.validateRequest)(employee_validation_1.employeeIdSchema), Employee_controller_1.generateEmployeeIdCard);
exports.default = router;
