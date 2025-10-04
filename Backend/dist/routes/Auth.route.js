"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Auth_controller_1 = require("../controllers/Auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Register API
router.post('/register', Auth_controller_1.register);
// Delete user (protected)
router.delete('/:id', auth_middleware_1.verifyToken, Auth_controller_1.deleteUser);
// Login & Password APIs
router.post('/login', Auth_controller_1.login);
router.post('/forgot-password', Auth_controller_1.forgotPassword);
router.post('/change-password', auth_middleware_1.verifyToken, Auth_controller_1.changePassword);
router.post('/reset-password', Auth_controller_1.resetPassword);
exports.default = router;
