"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const EmpDetails_controller_1 = require("../controllers/EmpDetails.controller");
const router = express_1.default.Router();
// Add or Update statutory details
router.post('/', EmpDetails_controller_1.createStatutoryDetails);
// Get statutory details by employeeId
router.get('/:employeeId', EmpDetails_controller_1.getStatutoryDetailsByEmployeeId);
router.get('/', EmpDetails_controller_1.getAllStatutoryDetails);
// update deatils 
router.put('/:employeeId', EmpDetails_controller_1.updateStatutoryDetails);
// Delete statutory details by employeeId
router.delete('/:employeeId', EmpDetails_controller_1.deleteStatutoryDetails);
exports.default = router;
