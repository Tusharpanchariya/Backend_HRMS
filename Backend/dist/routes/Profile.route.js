"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Profile_controller_1 = require("../controllers/Profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
router.post("/create", auth_middleware_1.verifyToken, Profile_controller_1.createUserProfile);
router.put("/update-role", auth_middleware_1.verifyToken, Profile_controller_1.updateUserRole);
router.get("/me", auth_middleware_1.verifyToken, Profile_controller_1.getUserProfile);
exports.default = router;
